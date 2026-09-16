# BlackWaterLeaf XP Policy V1

**Policy version:** `xp-2026-09-16-v1`
**Status:** Implemented in source code; activation requires the reviewed `assistant_usage` schema addition and subsequent acceptance testing.
**Scope:** BlackWaterLeaf web staging only. No XP has been granted retroactively.

## Purpose and scope

Experience points acknowledge verified participation in a user’s own BlackWaterLeaf world. They are not a currency, have no monetary value, do not unlock safety-critical advice, and are never awarded for clicks, failed operations, simulated activity, or server errors. XP is calculated exclusively by the server and recorded in the immutable `xp_events` journal.

## Eligible events

| Server event | Journal event type | XP | Limit | Verification requirement |
|---|---:|---:|---|---|
| First authenticated visit of a UTC day | `daily_login` | 5 | Once per UTC day | Active authenticated account; server-generated day key |
| First accepted image for one observation | `photo_upload` | 10 | Once per observation | Observation ownership, media-processing consent, validated image signature, successful storage and media record |
| Successful AI response | `ai_use` | 3 | At most 10 successful responses per UTC day | Active authenticated account, AI-processing consent, completed server-side model response and audit record |

The fixed server-side values are deliberately visible in source code and are not accepted as user input. A failed AI request does not grant XP and does not count as a successful daily AI response.

## Integrity and anti-abuse controls

Each event receives a deterministic, server-generated `eventKey` containing the account identifier and the source record. The database enforces uniqueness on `eventKey`, making repeated browser submissions, retries, and concurrent duplicate requests unable to grant XP twice. Media XP uses one key per observation, not per upload, so replacing or adding images does not repeatedly award points. AI XP uses the server-created AI usage-record identifier and is granted only after the response is complete.

The existing journal keeps the associated source category and source identifier: `session`, `media_asset`, or `ai_request`. It also records the UTC day key and this policy version. The system stores no client-supplied point amount, no editable XP balance, and no client-side reward decision.

## Privacy and transparency

The experience journal contains only the user relationship, event category, server amount, source reference, date key, policy version, and timestamp. It does not contain image bytes, observation text, AI prompts, or AI responses. The AI audit table stores only technical request identifiers, selected realm, model identifier, and character counts; prompts and answers are intentionally not persisted.

Users see their current XP total, level, and recent event list in the profile after activation. XP is not credited before this policy’s schema and acceptance checks are approved. Consent for media processing is required for image uploads; consent for AI processing is required for AI requests and can be withdrawn in the profile at any time.

## Operations and review

Administrators must not edit individual XP entries to correct ordinary user actions. A product change to XP values, reward types, rate limits, retention, or consent use requires a new policy version, a reviewed source change, a migration assessment, tests, and a release checkpoint. Any suspected abuse or anomaly should be investigated from the journal’s source references rather than by inventing or deleting compensating events.
