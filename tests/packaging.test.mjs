import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

async function text(path) {
    return readFile(new URL(path, root), 'utf8');
}

test('Home Assistant metadata exposes only the hardened native integration', async () => {
    const config = await text('config.yaml');
    assert.match(config, /^name: "Kiwix"$/m);
    assert.match(config, /^slug: "naguimar_kiwix"$/m);
    assert.match(config, /^  8111\/tcp: 8111$/m);
    assert.match(config, /^ingress: true$/m);
    assert.match(config, /^ingress_port: 8111$/m);
    assert.doesNotMatch(config, /^ingress_entry:/m);
    assert.match(config, /^ingress_stream: true$/m);
    assert.match(config, /^protected: true$/m);
    assert.match(config, /^panel_admin: false$/m);
    assert.match(config, /^  zim_storage_path: "\/media\/torrent_disk\/project-nomad\/storage\/zim"$/m);
    assert.doesNotMatch(config, /^\s+(?:port|management_port):/m);
    assert.doesNotMatch(config, /^(?:docker_api|full_access|host_network: true|apparmor: false)/m);
    assert.match(config, /^host_network: false$/m);
    assert.match(config, /^privileged: \[\]$/m);

    const optionKeys = [...config.matchAll(/^  ([a-z_]+):/gm)]
        .map((match) => match[1])
        .filter((key, index, keys) => keys.indexOf(key) === index)
        .filter((key) => ['zim_storage_path', 'max_upload_size', 'enable_management', 'log_level'].includes(key));
    assert.deepEqual(optionKeys.sort(), [
        'enable_management',
        'log_level',
        'max_upload_size',
        'zim_storage_path',
    ]);
});

test('Home Assistant store artwork is present with standard dimensions', async () => {
    for (const [file, width, height] of [
        ['icon.png', 128, 128],
        ['logo.png', 250, 100],
    ]) {
        const image = await readFile(new URL(file, root));
        assert.deepEqual([...image.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
        assert.equal(image.readUInt32BE(16), width);
        assert.equal(image.readUInt32BE(20), height);
    }
});

test('startup validates storage and dependencies without recreating storage', async () => {
    const requirements = await text('rootfs/etc/cont-init.d/10-requirements.sh');
    for (const dependency of ['kiwix-serve', 'kiwix-manage', 'nginx', 'curl', 'find']) {
        assert.match(requirements, new RegExp(`\\b${dependency}\\b`));
    }
    assert.match(requirements, /does not exist/);
    assert.match(requirements, /readable, writable, and searchable/);

    const configure = await text('rootfs/etc/cont-init.d/20-kiwix-config.sh');
    const run = await text('rootfs/etc/services.d/kiwix/run');
    assert.doesNotMatch(`${configure}\n${run}`, /mkdir -p "\$\{ZIM_STORAGE_PATH\}"/);
    assert.doesNotMatch(`${configure}\n${run}`, /chown .*ZIM_STORAGE_PATH/);
    assert.match(run, /^PORT=8111$/m);
    assert.doesNotMatch(run, /bashio::config 'port'/);
    assert.match(run, /Existing library\.xml .* left unchanged/);
    assert.match(run, /--address=127\.0\.0\.1/);
    assert.match(run, /--host 127\.0\.0\.1/);
    assert.match(run, /--max-upload-size "\$\{MAX_UPLOAD_SIZE\}"/);
    assert.match(run, /--log-level "\$\{LOG_LEVEL\}"/);
    assert.match(run, /kiwix-management-disabled/);
});

test('proxy and documentation cover ingress, direct access, management, and recovery', async () => {
    const nginx = await text('rootfs/etc/nginx/nginx.conf');
    for (const route of ['skin', 'search', 'suggest', 'content', 'catalog', 'viewer', 'manage', 'api']) {
        assert.match(nginx, new RegExp(route));
    }
    assert.match(nginx, /listen 8111;/);
    assert.match(nginx, /api\/hassio_ingress\/\[A-Za-z0-9_-\]\+/);
    assert.doesNotMatch(nginx, /ingress_path_from_header[\s\S]*?\(\?<path>\.\*\)/);
    assert.match(nginx, /client_max_body_size 0;/);
    assert.doesNotMatch(nginx, /client_max_body_size 10G/);
    assert.match(nginx, /location = \/management-status/);
    assert.match(nginx, /-f \/tmp\/kiwix-management-disabled/);

    const landing = await text('rootfs/usr/share/nginx/html/index.html');
    assert.match(landing, /\/management-status/);

    const docs = (await text('DOCS.md')).toLowerCase();
    for (const subject of [
        'storage ownership',
        'service binding',
        'backups',
        'in-place upgrade',
        'copy, verify, switch',
        'rollback',
        'ingress',
        'direct',
    ]) {
        assert.match(docs, new RegExp(subject));
    }

    const translations = await text('translations/en.yaml');
    assert.doesNotMatch(translations, /^  (?:port|management_port):/m);
    for (const option of ['zim_storage_path', 'max_upload_size', 'enable_management', 'log_level']) {
        assert.match(translations, new RegExp(`^  ${option}:`, 'm'));
    }
});
