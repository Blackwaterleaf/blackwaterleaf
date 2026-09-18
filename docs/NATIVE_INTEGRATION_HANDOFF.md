# BlackWaterLeaf Native Integration Handoff

**Status:** Web-side contract and staging API exist; the native client is not yet connected to the same live API, database, media storage, or XP journal. No new APK is required or produced by this web release.

## Required native work

| Order | Work item | Acceptance condition |
|---:|---|---|
| 1 | Configure the native staging build with the published BlackWaterLeaf API base URL. | The build contains no database URL, storage credential, or secret. |
| 2 | Use the existing OAuth/Bearer session flow against the same app identity. | An active account can call `profile.me`; a suspended account is rejected. |
| 3 | Consume server profile, consent, locale, unit-system, role, and account status. | Native UI does not infer roles or status from email or cached local data. |
| 4 | Move observation creation, revision updates, and media uploads through the protected API. | `clientId`, expected revision, ownership, visibility, upload validation, and conflicts are demonstrated against staging. |
| 5 | Preserve private offline capture as a local queue, then require an explicit user sync action. | No automatic publishing; conflicts are visible and resolved deliberately. |
| 6 | Read the shared community and knowledge APIs. | Public-only data rules and source visibility match the web experience. |
| 7 | Add the XP profile summary and show the same server total/level. | Native never calculates or writes XP; it only displays the server journal result. |
| 8 | Add AI only after the web schema and consent flow are accepted. | Native requires `ai_processing` consent, uses the protected server assistant endpoint, and never embeds an LLM key. |
| 9 | Test on the target Android device, including offline, re-login, media, conflict, consent withdrawal, and error states. | A controlled test account sees the same real server data in web and native. |

## XP and AI dependencies

The native integration must wait for the web-side `assistant_usage` schema change, database verification, and acceptance test. Existing XP records use the legacy `xp_events` journal vocabulary: `daily_login`, `photo_upload`, and `ai_use`. Native clients must not insert these records or synthesize points; all XP is server-owned.

## Release boundary

Native integration is independent of custom-domain DNS cutover. The API should be verified using the published staging endpoint before any production domain or APK release is considered.
