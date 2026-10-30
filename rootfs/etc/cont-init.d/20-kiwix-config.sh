#!/usr/bin/with-contenv bashio
# ==============================================================================
# Home Assistant Community Add-on: Kiwix
# Configures Kiwix based on user settings
# ==============================================================================

bashio::log.info "Configuring Kiwix server..."

# Read configuration values
ZIM_STORAGE_PATH=$(bashio::config 'zim_storage_path')
LOG_LEVEL=$(bashio::config 'log_level')

# Create ZIM storage directory if it doesn't exist
if [[ ! -d "${ZIM_STORAGE_PATH}" ]]; then
    bashio::log.info "Creating ZIM storage directory: ${ZIM_STORAGE_PATH}"
    mkdir -p "${ZIM_STORAGE_PATH}"
fi

# Removable filesystems may not support Unix ownership. The services run as root,
# so only ensure the directory itself is writable without traversing every ZIM.
chown kiwix:kiwix "${ZIM_STORAGE_PATH}" 2>/dev/null || true
chmod g+w "${ZIM_STORAGE_PATH}" 2>/dev/null || true

# Log configuration summary
bashio::log.info "Configuration summary:"
bashio::log.info "  ZIM Storage Path: ${ZIM_STORAGE_PATH}"
bashio::log.info "  Log Level: ${LOG_LEVEL}"

# Count existing ZIM files
ZIM_COUNT=$(find "${ZIM_STORAGE_PATH}" -name "*.zim" -type f 2>/dev/null | wc -l)
if (( ZIM_COUNT > 0 )); then
    bashio::log.info "Found ${ZIM_COUNT} existing ZIM file(s) in storage directory"
else
    bashio::log.info "No ZIM files found. You can add them via the management interface."
fi

bashio::log.info "Kiwix configuration completed!"
