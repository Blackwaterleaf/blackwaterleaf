# YouTube and Twitch Direct Embed Notes

The implementation supports direct player embedding for **YouTube Live** and **Twitch** only. It was verified against the providers’ official documentation on 19 September 2026.

| Provider | Accepted staff input | Generated direct player | Required implementation constraint | Source |
| --- | --- | --- | --- | --- |
| YouTube | Eleven-character video identifier or a standard YouTube URL | `https://www.youtube-nocookie.com/embed/{VIDEO_ID}` | The official embedded-player documentation specifies an iframe embed URL and a minimum player viewport of 200 × 200 pixels. | [YouTube Embedded Players and Player Parameters](https://developers.google.com/youtube/player_parameters) |
| Twitch | Channel name or standard Twitch channel URL | `https://player.twitch.tv/?channel={CHANNEL}&parent={CURRENT_HOST}` | Twitch requires a `parent` hostname for iframe embeds and specifies at least 400 × 300 pixels for the player. The hostname is generated from the active BlackWaterLeaf page so preview and production domains both work. | [Twitch – Embedding Video and Clips](https://dev.twitch.tv/docs/embed/video-and-clips/) |

Only the normalized public provider reference is stored: a canonical YouTube watch URL or a canonical Twitch channel URL. Stream keys, OAuth credentials and generic arbitrary iframe URLs are neither accepted nor stored. Content Security Policy permits frames only from `youtube.com`, `youtube-nocookie.com`, and `player.twitch.tv` in addition to the first-party origin.
