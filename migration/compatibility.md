# Compatibility analysis

Every plugin in the Valenced catalogue (47) is classified here, against the checked-out Phoenix runtime.

| Class | Meaning |
| --- | --- |
| **A** | Directly portable with existing Phoenix APIs |
| **B** | Adaptable: same outcome, different implementation |
| **C** | Needs a Phoenix capability that does not exist |
| **D** | Partially portable: some behaviour reproduced, the rest documented |
| **E** | Incompatible: cannot be reproduced reliably or safely |

**10 fully ported**, **18 partially ported**, **19 not portable** — all 47 examined, none silently dropped.

## Ported plugins

| Plugin | Author | Class | Status | Documented gaps |
| --- | --- | --- | --- | --- |
| Better Chat Buttons | Palm | B | IMPLEMENTED | Apps & Commands and New Thread have no accessibility id known to plugins. Send-button collapse behaviour is not exposed. |
| Clear URLs | hakuxyz | A | IMPLEMENTED | — |
| Global Badges | Wolfie | B | IMPLEMENTED | Cannot replace or add to Discord's own badge row. No drag-to-reorder and no per-provider toggles (no settings list control). |
| Hide Call Buttons | bleelblep | B | IMPLEMENTED | Profile call/video buttons, DM header call buttons, friends-list call buttons and voice-channel buttons cannot be targeted. |
| Message Logger | Palm | A | IMPLEMENTED | — |
| PetPet | cocobo1 | B | IMPLEMENTED | Cannot upload the GIF as an attachment: Phoenix has no file-module or multipart API. |
| Selectable Bios | Loki-vtx | B | IMPLEMENTED | Text inside Discord's own bio view is still not selectable. |
| Silent Typing | Palm | A | IMPLEMENTED | — |
| Tenor GIF Fix | thororen | B | IMPLEMENTED | Downloads and shares cannot be intercepted: no media manager. |
| YouBar+ | Purple_Ξye™ | B | IMPLEMENTED | Cannot open Settings, Favorites or the DM list directly: no navigation API. |
| Better Typing Indicators | Palm | D | PARTIAL | The channel list cannot be patched, so nothing is drawn there. Requires a build that exposes `typingStart` (an event registry entry, not a typed payload). |
| Character Counter | thororen | D | PARTIAL | No live count while typing: plugins cannot read the composer. |
| Dashless | k1ng_op | D | PARTIAL | Cannot change the channel list rows. Names are cached after the first lookup. |
| Fake Nitro | Palm | D | PARTIAL | Stickers, themes, app icons and stream quality are not portable: no plugin API. Reactions keep their Nitro lock. |
| Favorite Anything | TheUnrealZaka | D | PARTIAL | Not integrated with Discord's GIF picker. Favorites live in plugin storage. |
| GIF to Chat Input | j | D | PARTIAL | Cannot intercept the picker itself. Cannot insert text into the composer. |
| Hide Blocked Messages | Palm | D | PARTIAL | Hidden at the gateway, so the messages never appear (the original hid them after receipt). Reply detection only works when the referenced message is in the payload. |
| Link Alert Copy | Palm | D | PARTIAL | Cannot add a button to Discord's alert. |
| Mention Avatars | Palm | D | PARTIAL | No inline images inside message text. |
| Message Link Preview | Palm | D | PARTIAL | Previews are text-only, not interactive rows. No inline height limit or tap-to-react. |
| No Embed Copy | thororen | D | PARTIAL | Discord still opens the link after the copy. Only works when the press event carries the URL. |
| NSFW Blur | thororen | D | PARTIAL | No image blur: media is hidden, not blurred. Hiding is global, not per NSFW channel. |
| Read All Notifications | NexzaDev | D | PARTIAL | Cannot add a button under the DMs. Unread discovery depends on Phoenix's cache schema. Threads are not enumerated separately. |
| Shiki Codeblocks | Palm | D | PARTIAL | No inline highlighted code in chat. Shiki theme selection is not ported (Phoenix chooses the theme). |
| Show Tag | bleelblep | D | PARTIAL | Cannot change the message row itself. Nicknames are not exposed to accessories (global name is used). |
| Show Timeout Duration | Palm | D | PARTIAL | A snapshot per message, not a live countdown. Cannot recolour the username row. |
| Tenor GIF Search | Palm | D | PARTIAL | The GIF picker still uses Discord's provider. No grid preview: results are a list of buttons. |
| Who Reacted | Palm | D | PARTIAL | On demand, not drawn on the pill. No avatars, since pages show text and buttons. |

## Not portable plugins

Each was checked against `crates/runtime` (not just the docs). The last column is the capability Phoenix
would need for a port to be possible.

| Plugin | Author | Class | Missing capability |
| --- | --- | --- | --- |
| tralwdwd's action sheet patcher library | tralwdwdd | E | No action-sheet patching API in Phoenix; Valenced library for patching Discord action sheets. |
| Add Attachments | Wolfie | C | No message-edit UI or attachment-upload interception API. |
| Anonymous File Names | k1ng_op | C | No file-picker or upload filename interception API. |
| Themes API | Valenced | E | No theme/font/icon-pack API; native Android theme engine. |
| Block YouTube Ads | Palm | E | Android-only; no WebView script injection API. |
| Bluetooth Audio Fix | NoReplyUI5 | C | No audio-route interception; cannot hook Discord's Bluetooth route switching. |
| Coco's Command Lib | cocobo1 | E | Valenced command library; Phoenix provides native commands.register. |
| Developer Kit | Valenced | E | Valenced module finder/patcher inspection tools have no Phoenix equivalent. |
| Disable Call Idle | k1ng_op | C | No voice connection management API. |
| File Size on Picker | contrabags | C | No media picker UI patch target. |
| Join as Lurker | Palm | C | No invite or guild-join flow API, and no way to select lurker mode. |
| Jump To Top | tralwdwdd | C | No chat scroll control API. |
| No Idle | k1ng_op | C | No presence/IDLE gateway event and no way to set presence. |
| Reactions Sheet Fix | Palm | E | The fix targets MessageReactionsStore internals and Dispatcher.dispatch, neither of which Phoenix exposes; Phoenix's own reactions sheet cannot be observed from a plugin. |
| Search Action Sheet | tralwdwdd | C | No search results UI patch API. |
| Themes | Valenced | E | No theme settings system; depends on Valenced Themes API + native. |
| Sound Controls | Wolfie | C | No Discord sound system patch API. |
| Legacy Themes | Valenced | E | Depends on Valenced Themes API; no Phoenix theme system. |
| ValidUser | k1ng_op | C | No message rendering or store patch API for @unknown-user resolution. |

## Notes on the notable blockers

- **Theme and native plugins** (`api.themes`, `settings.themes`, `themes.legacy`, `block-youtube-ads`) are backed by
  Valenced's native Android theme/WebView layer. Phoenix has no theme system and no WebView injection, so there
  is nothing to port *to*.
- **Render-patch plugins** (`jump-to-top`, `search-action-sheet`, `no-embed-copy`'s original, `selectable-bios`,
  `link-alert-copy`) patched React trees Phoenix does not expose. Where an event hook or a plugin-drawn surface
  could reproduce the *outcome*, the plugin was ported as class D instead of being dropped.
- **`action-sheet-patcher`, `cocos-command-lib`, `developer-kit`** are libraries/tools for Valenced internals.
  Phoenix already provides commands (`phoenix.commands`) and exposes no module system, so there is no user-facing
  behaviour to port.
- **`valid-user`** (resolve unknown users) and **`reactions-sheet-fix`** depend on Flux stores and a dispatcher that
  Phoenix does not have; `who-reacted` covers the readable part of the reactions use case.
- **Privacy-sensitive plugins** were reviewed rather than copied: `read-all-notifications` only acks the user's own
  read state, `global-badges` sends no IDs (the service returns all users in one response), and no port collects
  other users' data or bypasses access controls.
