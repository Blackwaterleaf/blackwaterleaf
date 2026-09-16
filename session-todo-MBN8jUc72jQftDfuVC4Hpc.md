# BlackWaterLeaf local authentication tracker

- [x] Confirm full transition direction from Manus OAuth to local email/password accounts.
- [x] Confirm `blackwaterleaf.com` remains the live application domain and IONOS is not used for the current rollout.
- [x] Create a least-privilege Resend sending key and stage sender domains.
- [x] Add local credential and verification-token schema and apply its additive migration.
- [x] Add secure local registration, login, verification, reset, and account-transition routes.
- [x] Add German account-access pages and replace visible Manus login calls.
- [x] Verify schema, fail-closed email delivery behavior, session security, mobile layout, and production build.
- [ ] Verify `mail.blackwaterleaf.com` with Resend after the Webador DNS editor is unlocked.
- [ ] Store a sending-only Resend credential as the protected `RESEND_API_KEY` project secret.
- [ ] Run real confirmation and reset email delivery tests after sender verification.
- [ ] Remove legacy Manus OAuth only after local-account migration is accepted and existing users have transitioned.
