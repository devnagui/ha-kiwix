import assert from 'node:assert/strict';
import test from 'node:test';

const server = new URL(process.env.KIWIX_TEST_BASE_URL ?? 'http://127.0.0.1:8111');
const prefix = '/api/hassio_ingress/ingress-regression';
const browserPage = new URL(`https://homeassistant.invalid${prefix}/wiki/`);
const ingressHeaders = {
    'X-Ingress-Path': prefix,
    Referer: browserPage.href,
};

async function get(path, headers = {}) {
    const response = await fetch(new URL(path, server), {
        headers,
        redirect: 'manual',
        signal: AbortSignal.timeout(5000),
    });
    assert.equal(
        response.status,
        200,
        `${path} returned ${response.status}; Location: ${response.headers.get('location')}`,
    );
    assert.equal(response.headers.get('location'), null, `${path} unexpectedly redirects`);
    return response;
}

test('direct access still serves the library and stylesheet', async () => {
    const library = await get('/wiki/');
    assert.match(library.headers.get('content-type'), /text\/html/);
    const stylesheet = await get('/skin/index.css');
    assert.match(stylesheet.headers.get('content-type'), /text\/css/);
    assert.ok((await stylesheet.text()).length > 0);
});

test('forwarded stylesheet with an ingress Referer does not redirect to HTTP', async () => {
    const response = await get('/skin/index.css', ingressHeaders);
    assert.match(response.headers.get('content-type'), /text\/css/);
    assert.ok((await response.text()).length > 0);
});

test('all library assets stay inside ingress and load with the real Referer', async () => {
    const library = await get('/wiki/', ingressHeaders);
    const html = await library.text();
    const references = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)]
        .map((match) => match[1])
        .filter((path) => path.includes('/skin/') && !/^https?:\/\//.test(path));
    const assets = [...new Set(references)];
    assert.ok(assets.some((path) => path.includes('.css')), 'Library has no stylesheet');
    assert.ok(assets.some((path) => path.includes('.js')), 'Library has no script');
    assert.ok(assets.some((path) => path.includes('.svg')), 'Library has no SVG icon');

    for (const asset of assets) {
        const resolved = new URL(asset, browserPage);
        assert.equal(resolved.origin, browserPage.origin, `${asset} changes origin`);
        assert.ok(resolved.pathname.startsWith(`${prefix}/`), `${asset} escapes ingress`);
        // Home Assistant removes the ingress prefix before forwarding the request.
        const forwarded = `${resolved.pathname}${resolved.search}`.slice(prefix.length);
        const response = await get(forwarded, ingressHeaders);
        assert.ok((await response.arrayBuffer()).byteLength > 0, `${asset} is empty`);
    }
});
