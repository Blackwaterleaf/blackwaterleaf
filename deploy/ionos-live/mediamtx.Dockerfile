FROM bluenviron/mediamtx:1.21.0 AS mediamtx
FROM alpine:3.20
RUN apk add --no-cache ca-certificates curl gettext
COPY --from=mediamtx /mediamtx /mediamtx
COPY mediamtx.yml.template /config/mediamtx.yml.template
COPY mediamtx-entrypoint.sh /entrypoint.sh
RUN chmod 0555 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
