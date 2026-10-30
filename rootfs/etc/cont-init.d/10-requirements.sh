#!/usr/bin/with-contenv bashio
# ==============================================================================
# Home Assistant Community Add-on: Kiwix
# This files check if all user configuration requirements are met
# ==============================================================================

bashio::log.info "Checking add-on requirements..."

for dependency in kiwix-serve kiwix-manage nginx curl find; do
    if ! command -v "${dependency}" >/dev/null 2>&1; then
        bashio::exit.nok "Required dependency '${dependency}' is not installed."
    fi
done

if [[ ! -x /opt/venv/bin/python ]]; then
    bashio::exit.nok "Management Python runtime is missing or not executable: /opt/venv/bin/python"
fi

if [[ ! -r /usr/local/bin/kiwix-manager.py ]]; then
    bashio::exit.nok "Management service is missing or unreadable: /usr/local/bin/kiwix-manager.py"
fi

ZIM_STORAGE_PATH="$(bashio::config 'zim_storage_path')"
if bashio::var.is_empty "${ZIM_STORAGE_PATH}"; then
    bashio::exit.nok "The 'zim_storage_path' option is required."
fi

if [[ "${ZIM_STORAGE_PATH}" != /* ]]; then
    bashio::exit.nok "ZIM storage path must be absolute: ${ZIM_STORAGE_PATH}"
fi

if [[ ! -e "${ZIM_STORAGE_PATH}" ]]; then
    bashio::exit.nok "ZIM storage path does not exist: ${ZIM_STORAGE_PATH}. Mount or create it before starting Kiwix."
fi

if [[ ! -d "${ZIM_STORAGE_PATH}" ]]; then
    bashio::exit.nok "ZIM storage path is not a directory: ${ZIM_STORAGE_PATH}"
fi

if [[ ! -r "${ZIM_STORAGE_PATH}" || ! -w "${ZIM_STORAGE_PATH}" || ! -x "${ZIM_STORAGE_PATH}" ]]; then
    bashio::exit.nok "ZIM storage path must be readable, writable, and searchable: ${ZIM_STORAGE_PATH}"
fi

MAX_UPLOAD_SIZE="$(bashio::config 'max_upload_size')"
if (( MAX_UPLOAD_SIZE < 1 )); then
    bashio::exit.nok "The 'max_upload_size' option must be at least 1 MB."
fi

if ! nginx -t >/dev/null 2>&1; then
    bashio::exit.nok "The nginx configuration is invalid. Check the add-on image and logs."
fi

bashio::log.info "Startup requirements are satisfied."
