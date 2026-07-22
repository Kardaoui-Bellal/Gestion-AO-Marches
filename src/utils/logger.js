function timestamp() {
    return new Date().toISOString();
}

function info(message, meta = {}) {
    console.log(`[INFO] ${timestamp()} — ${message}`, Object.keys(meta).length ? meta : "");
}

function warn(message, meta = {}) {
    console.warn(`[WARN] ${timestamp()} — ${message}`, Object.keys(meta).length ? meta : "");
}

function error(message, err = null) {
    console.error(`[ERROR] ${timestamp()} — ${message}`);
    if (err) console.error(err);
}

module.exports = { info, warn, error };