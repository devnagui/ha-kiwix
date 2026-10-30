#!/usr/bin/with-contenv bashio
# ==============================================================================
# Home Assistant Community Add-on: Kiwix
# Configures Kiwix based on user settings
# ==============================================================================

bashio::log.info "Configuring Kiwix server..."

# Read configuration values
ZIM_STORAGE_PATH="$(bashio::config 'zim_storage_path')"
LOG_LEVEL="$(bashio::config 'log_level')"
MAX_UPLOAD_SIZE="$(bashio::config 'max_upload_size')"
ENABLE_MANAGEMENT="$(bashio::config 'enable_management')"

bashio::log.level "${LOG_LEVEL}"

# Log configuration summary
bashio::log.info "Configuration summary:"
bashio::log.info "  ZIM Storage Path: ${ZIM_STORAGE_PATH}"
bashio::log.info "  Maximum Upload Size: ${MAX_UPLOAD_SIZE} MB"
bashio::log.info "  Management Enabled: ${ENABLE_MANAGEMENT}"
bashio::log.info "  Log Level: ${LOG_LEVEL}"

# Count existing ZIM files
ZIM_COUNT=$(find "${ZIM_STORAGE_PATH}" -maxdepth 1 -name "*.zim" -type f 2>/dev/null | wc -l)
if (( ZIM_COUNT > 0 )); then
    bashio::log.info "Found ${ZIM_COUNT} existing ZIM file(s) in storage directory"
else
    bashio::log.info "No ZIM files found. You can add them via the management interface."
fi

bashio::log.info "Kiwix configuration completed!"
