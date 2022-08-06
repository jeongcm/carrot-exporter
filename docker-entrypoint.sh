#!/bin/sh


if [[ -f /vault/secrets/ncdb-admin-login ]]; then
    source /vault/secrets/ncdb-admin-login
    export NC_LARI_DB_CONFIG_USER="${NC_LARI_DB_CONFIG_USER}"
    export NC_LARI_DB_CONFIG_PASSWORD="${NC_LARI_DB_CONFIG_PASSWORD}"
fi

if [[ -f /vault/secrets/nc-mailgun ]]; then
    source /vault/secrets/nc-mailgun
    export NC_LARI_MAILGUN_API_KEY="${NC_LARI_MAILGUN_API_KEY}"
fi

npm run start

