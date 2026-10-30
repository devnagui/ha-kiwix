# Home Assistant ingress routing

Kiwix emits root-relative URLs. Home Assistant ingress adds a session prefix in
the browser and strips it before forwarding requests to the add-on. Nginx keeps
these two views consistent without a custom Home Assistant panel.

## Route model

- The native ingress entry and direct `/` both serve the landing page.
- `/wiki/` proxies Kiwix on container loopback port 8080.
- `/manage/` and `/api/` proxy management on loopback port 8081.
- Port 8111 is the only nginx, ingress, and direct-access container port.

Nginx derives the public ingress prefix from `X-Ingress-Path` or the incoming
URI. Text responses have root-relative `href`, `src`, `action`, root metadata,
and redirects rewritten under the ingress `/wiki` base. Binary catalogue
illustrations bypass response filtering. Home Assistant-forwarded asset,
catalogue, content, search, suggestion, no-JavaScript, viewer, management, and
upload routes are proxied directly. Direct requests retain their `/wiki` and
`/manage` bases.

## Regression check

Against a running container, use Node.js 20 or newer:

```text
node --test tests/ingress.test.mjs
```

Set `KIWIX_TEST_BASE_URL` when port 8111 is not on localhost. The regression
test checks direct access, ingress asset containment, catalogue links, content
redirects, search, suggestions, no-JavaScript mode, and the viewer.

