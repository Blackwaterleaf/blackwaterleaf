#!/bin/sh
set -eu

: "${BWL_APP_ORIGIN:?BWL_APP_ORIGIN is required}"
: "${BWL_MEDIA_CONTROL_SECRET:?BWL_MEDIA_CONTROL_SECRET is required}"
: "${BWL_TLS_DIR:?BWL_TLS_DIR is required}"

case "$BWL_APP_ORIGIN" in
  https://*) ;;
  *) echo "BWL_APP_ORIGIN must start with https://" >&2; exit 64 ;;
esac

if [ "${#BWL_MEDIA_CONTROL_SECRET}" -lt 32 ]; then
  echo "BWL_MEDIA_CONTROL_SECRET must contain at least 32 characters" >&2
  exit 64
fi

if [ ! -r "$BWL_TLS_DIR/fullchain.pem" ] || [ ! -r "$BWL_TLS_DIR/privkey.pem" ]; then
  echo "TLS certificate files are unavailable" >&2
  exit 66
fi

export BWL_TLS_DIR
sed \
  -e "s|__BWL_APP_ORIGIN__|$BWL_APP_ORIGIN|g" \
  -e "s|__BWL_MEDIA_CONTROL_SECRET__|$BWL_MEDIA_CONTROL_SECRET|g" \
  /config/mediamtx.yml.template > /config/mediamtx.yml

exec /mediamtx /config/mediamtx.yml
