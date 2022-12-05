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

if [[ -f /vault/secrets/nc-fusebill ]]; then
    source /vault/secrets/nc-fusebill
    export FUSEBILL_API_KEY="${FUSEBILL_API_KEY}"
fi


if [[ -f /vault/secrets/ncDoKeys ]]; then
    source /vault/secrets/ncDoKeys
    export NC_LARI_DO_ACCESS_KEY_ID="${NC_LARI_DO_ACCESS_KEY_ID}"
    export NC_LARI_DO_SECRET_ACCESS_KEY="${NC_LARI_DO_SECRET_ACCESS_KEY}"
fi

npm run start

