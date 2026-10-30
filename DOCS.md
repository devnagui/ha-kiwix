# Home Assistant Add-on: Kiwix

Kiwix serves an offline ZIM library through Home Assistant ingress and through
port 8111 on the Home Assistant host.

## Configuration

```yaml
zim_storage_path: /media/torrent_disk/project-nomad/storage/zim
max_upload_size: 10000
enable_management: true
log_level: info
```

- `zim_storage_path` must be an existing absolute directory that the add-on can
  read, write, and search. The add-on does not create, clear, or replace this
  directory.
- `max_upload_size` is the maximum management upload size in MB.
- `enable_management` starts the upload, download, and delete interface.
- `log_level` is `debug`, `info`, `warning`, or `error`.

The public and ingress container port is fixed at 8111. If direct access is
needed, keep `8111/tcp` mapped in the add-on **Network** section.

## Storage ownership

Home Assistant mounts `/media` into the add-on. Create the configured directory
on the host before startup. Its owner or ACL must allow the add-on to read and
write files and traverse every parent directory. The add-on deliberately does
not recursively run `chown` or `chmod`, because removable filesystems and
existing libraries may have ownership managed outside the container.

Startup stops with an actionable log message when the directory is missing,
relative, not a directory, or inaccessible. An existing `library.xml` is never
replaced. If it is empty, not a regular file, or invalid XML, startup stops and
leaves it unchanged.

## Access and service binding

- **Ingress:** enable **Show in sidebar** on the add-on Info page, then open
  **Kiwix**. The landing page links the library and management interface.
- **Direct:** open `http://HOME_ASSISTANT_IP:8111/`.
- **Library:** `/wiki/`
- **Management:** `/manage/` when enabled.

Nginx listens on container port 8111. Kiwix and the management API bind only to
container loopback ports 8080 and 8081, so they are not separately published.
Ingress and direct access use the same nginx routes.

Direct port 8111 is a local-network service and does not add authentication to
the management interface. Do not forward it to the internet. Disable management
when uploads, downloads, and deletion are not needed.

## Backups

Stop the add-on or otherwise quiesce writes, then back up the entire configured
storage directory, including `library.xml` and every `.zim` file. Home Assistant
configuration backups may not include external `/media` contents, so verify the
ZIM directory is covered by a separate backup. Test that the backup can be read
before relying on it.

## In-place upgrade

1. Back up the configured storage directory and current add-on options.
2. Verify free space and that `library.xml` is non-empty, regular, and valid.
3. Update the add-on without changing `zim_storage_path`.
4. Start it and verify the landing page, catalogue, search, one article, and
   management (if enabled) through both ingress and direct access.

The add-on does not migrate or replace a non-empty storage directory at startup.

## Storage migration: copy, verify, switch

1. Keep the current path unchanged and stop the add-on.
2. Copy the complete directory to the new location without deleting the source.
3. Compare file counts and sizes; checksum important ZIM files and
   `library.xml`.
4. Give the add-on read/write/traverse access to the destination.
5. Change only `zim_storage_path`, start the add-on, and verify catalogue,
   search, content, and management.
6. Retain the source until the new location has passed normal use and backup
   checks.

## Rollback

Stop the add-on, restore the previous add-on version if necessary, set
`zim_storage_path` back to the verified original directory, and start again.
Do not delete either storage copy during rollback. If `library.xml` is reported
invalid, restore that file from backup rather than allowing automation to
replace it.

## Troubleshooting

- **Startup fails:** use the exact dependency, path, permission, or XML error in
  the add-on log. Correct the host storage; do not empty it.
- **Ingress asset or navigation failure:** compare `/wiki/`, catalogue, search,
  viewer, and article behavior with direct port 8111 and report the failing URL.
- **Upload rejected:** check `max_upload_size`, free disk space, write access,
  and the `.zim` filename extension.
- **Management unavailable:** confirm `enable_management` is true and use
  `/manage/` through ingress or port 8111.
