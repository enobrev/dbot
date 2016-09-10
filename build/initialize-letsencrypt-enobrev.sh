#!/usr/bin/env bash

set -e -x

export DEBIAN_FRONTEND=noninteractive

SYSADMIN_EMAIL="src@enobrev.com"
DOCUMENT_ROOT="/home/enobrev/Dropbox/code/www/dbot.enobrev.net"
DOMAIN="dbot.enobrev.net"

# --test-cert
/opt/letsencrypt/letsencrypt-auto certonly --non-interactive --agree-tos --email ${SYSADMIN_EMAIL} -a webroot --webroot-path=${DOCUMENT_ROOT}/public/api      -d api.${DOMAIN}
/opt/letsencrypt/letsencrypt-auto certonly --non-interactive --agree-tos --email ${SYSADMIN_EMAIL} -a webroot --webroot-path=${DOCUMENT_ROOT}/public/www      -d ${DOMAIN} -d www.${DOMAIN}

service nginx restart