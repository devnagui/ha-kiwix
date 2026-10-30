# Home Assistant Add-on: Kiwix

Kiwix serves Wikipedia and other ZIM content offline from Home Assistant.

![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]
![Supports armhf Architecture][armhf-shield]
![Supports armv7 Architecture][armv7-shield]
![Supports i386 Architecture][i386-shield]

## Features

- Native Home Assistant ingress with the normal **Show in sidebar** control
- Direct local-network access on mapped port 8111
- Catalogue, search, viewer, content, and static assets through either route
- Optional upload, download, and delete management interface
- Existing external ZIM storage; startup does not replace a non-empty library

## Install and use

1. Add `https://github.com/MichalTorma/ha-repository` to the Home Assistant
   add-on store and install **Kiwix**.
2. Create and permission the configured storage directory.
3. Review the options and start the add-on.
4. Enable **Show in sidebar** for ingress, or open
   `http://HOME_ASSISTANT_IP:8111/` for direct access.

The default storage path is
`/media/torrent_disk/project-nomad/storage/zim`. The only options are the storage
path, upload limit, management toggle, and log level. Port 8111 is fixed for
both the container ingress endpoint and the Home Assistant Network mapping.

See [DOCS.md](DOCS.md) for configuration, ownership, service binding, backup,
upgrade, migration, rollback, access, and troubleshooting instructions.

## Security

Internal Kiwix and management services bind only to container loopback. Nginx
is the single service on port 8111. Direct access does not add authentication,
so keep that mapping on a trusted local network and disable management when it
is not required.

## Support and license

Use [GitHub Issues][issues] for support. This add-on is licensed under the
[MIT License][license].

Package artwork and attribution are documented in
[ARTWORK.md](ARTWORK.md).

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-green.svg
[amd64-shield]: https://img.shields.io/badge/amd64-yes-green.svg
[armhf-shield]: https://img.shields.io/badge/armhf-yes-green.svg
[armv7-shield]: https://img.shields.io/badge/armv7-yes-green.svg
[i386-shield]: https://img.shields.io/badge/i386-yes-green.svg
[issues]: https://github.com/MichalTorma/ha-kiwix/issues
[license]: LICENSE
