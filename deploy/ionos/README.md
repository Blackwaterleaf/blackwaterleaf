# BlackWaterLeaf IONOS-Deployment

1. Build from the repository root: `pnpm build`.
2. Copy the repository build inputs and `deploy/ionos` to `/opt/blackwaterleaf/app` on the VPS.
3. Create `/etc/blackwaterleaf/production.conf` with mode `600` from `production.env.names`; never commit the populated file.
4. Start the isolated stack with `docker compose -f /opt/blackwaterleaf/app/deploy/ionos/docker-compose.yml up -d --build`.
5. Run `docker compose ... exec app node dist/index.js` only through the container command; do not expose MySQL publicly.
6. Verify `/healthz` and `/readyz` locally on `127.0.0.1:8080`, then perform local registration/login, media upload, Resend verification, IONOS-AI and Stripe webhook tests.
7. Configure the external TLS proxy and certificate for `blackwaterleaf.com` and `www.blackwaterleaf.com`.
8. Lower DNS TTL before cutover, switch only the A/AAAA records to the IONOS IP, then verify DNS, HTTPS, login and existing data.
9. Keep the previous Manus deployment unchanged until the rollback window is closed.

The compose stack intentionally binds the internal proxy only to loopback. Public HTTP/HTTPS exposure must be provided by the host-level TLS proxy or a separately reviewed IONOS firewall configuration.
