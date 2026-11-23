# Phoenix Community Ports

Valenced Community Plugins, migrated to [Phoenix Unlock](https://github.com/mantikafasi/phoenix-unlock).

Phoenix Unlock patches Discord's Android alpha into a plugin host: TypeScript plugins get a `phoenix`
global with gateway hooks, UI slots, slash commands, settings and HTTP access
([`crates/runtime/phoenix.d.ts`](.vendor/phoenix/crates/runtime/phoenix.d.ts)). Valenced was a different
mod of the same app with a React-patching API. This repository reimplements what the Valenced catalogue
does, against Phoenix's API, as independently installable plugins.

## Status

| | |
| --- | --- |
| Catalogue inventoried | **47** plugins |
| Ported and building | **28** (8 fully, plus partial ports below) |
| Fully equivalent | **10** |
| Partial (documented gaps) | **18** |
| Not portable (documented) | **19** |
| TypeScript | strict, ES2023, `npx tsc` clean |
| Bundles | 28 files in `dist/`, esbuild IIFE, Phoenix's own conventions |
| Tests | `npm test` — mock-runtime behavioural assertions, 28/28 passing |

Every plugin is also listed in [`migration/status.json`](migration/status.json) with its classification,
what is missing, and its original author.

## Install

1. Build (or use `dist/`): `npm install && npm run build`.
2. Copy the bundles you want — `dist/<plugin>.js` — to the phone.
3. Settings → Phoenix Unlocker → Plugins → add the `.js` file.
4. Each plugin's settings appear on its page under Settings → Phoenix Unlocker → Plugins.

`dist/index.json` is written in the same shape Phoenix's own bundler emits
(`{name, description, warning?}`), so the collection can also be served as a plugin repository.

## Compatibility table

`A` directly portable · `B` adaptable · `C` needs a missing Phoenix capability · `D` partially portable ·
`E` incompatible. Only `A` and `B` are used for shipped plugins; `C`/`D` gaps are spelled out per plugin.

| Plugin | Author | Version | Class | Status | Missing functionality |
| --- | --- | --- | --- | --- | --- |
| [Better Chat Buttons](plugins/better-chat-buttons/README.md) | Palm | 1.0.0 | B | IMPLEMENTED | Apps & Commands and New Thread have no accessibility id known to plugins Send-button collapse behaviour is not exposed |
| [Clear URLs](plugins/clear-urls/README.md) | hakuxyz (https://github.com/hakuxyz "GitHub") | 1.0.0 | A | IMPLEMENTED | — |
| [Global Badges](plugins/global-badges/README.md) | Wolfie | 1.0.0 | B | IMPLEMENTED | Cannot replace or add to Discord's own badge row No drag-to-reorder and no per-provider toggles (no settings list control) |
| [Hide Call Buttons](plugins/hide-call-buttons/README.md) | bleelblep | 1.0.0 | B | IMPLEMENTED | Profile call/video buttons, DM header call buttons, friends-list call buttons and voice-channel buttons cannot be targeted |
| [Message Logger](plugins/message-logger/README.md) | Palm | 1.0.0 | A | IMPLEMENTED | — |
| [PetPet](plugins/petpet/README.md) | cocobo1 | 1.0.2 | B | IMPLEMENTED | Cannot upload the GIF as an attachment: Phoenix has no file-module or multipart API |
| [Selectable Bios](plugins/selectable-bios/README.md) | Loki-vtx | 1.0.0 | B | IMPLEMENTED | Text inside Discord's own bio view is still not selectable |
| [Silent Typing](plugins/silent-typing/README.md) | Palm | 1.0.0 | A | IMPLEMENTED | — |
| [Tenor GIF Fix](plugins/tenor-gif-fix/README.md) | thororen | 1.0.0 | B | IMPLEMENTED | Downloads and shares cannot be intercepted: no media manager |
| [YouBar+](plugins/youbar-plus/README.md) | Purple_Ξye™ | 1.0.0 | B | IMPLEMENTED | Cannot open Settings, Favorites or the DM list directly: no navigation API |
| [Better Typing Indicators](plugins/better-typing-indicators/README.md) | Palm | 1.0.0 | D | PARTIAL | The channel list cannot be patched, so nothing is drawn there Requires a build that exposes `typingStart` (an event registry entry, not a typed payload) |
| [Character Counter](plugins/character-counter/README.md) | thororen | 1.0.0 | D | PARTIAL | No live count while typing: plugins cannot read the composer |
| [Dashless](plugins/dashless/README.md) | k1ng_op | 1.0.0 | D | PARTIAL | Cannot change the channel list rows Names are cached after the first lookup |
| [Fake Nitro](plugins/fake-nitro/README.md) | Palm | 1.0.0 | D | PARTIAL | Stickers, themes, app icons and stream quality are not portable: no plugin API Reactions keep their Nitro lock |
| [Favorite Anything](plugins/favorite-anything/README.md) | TheUnrealZaka | 1.0.0 | D | PARTIAL | Not integrated with Discord's GIF picker Favorites live in plugin storage |
| [GIF to Chat Input](plugins/gif-to-chat-input/README.md) | j | 1.0.0 | D | PARTIAL | Cannot intercept the picker itself Cannot insert text into the composer |
| [Hide Blocked Messages](plugins/hide-blocked-messages/README.md) | Palm | 1.0.0 | D | PARTIAL | Hidden at the gateway, so the messages never appear (the original hid them after receipt) Reply detection only works when the referenced message is in the payload |
| [Link Alert Copy](plugins/link-alert-copy/README.md) | Palm | 1.0.0 | D | PARTIAL | Cannot add a button to Discord's alert |
| [Mention Avatars](plugins/mention-avatars/README.md) | Palm | 1.0.0 | D | PARTIAL | No inline images inside message text |
| [Message Link Preview](plugins/message-link-preview/README.md) | Palm | 1.0.0 | D | PARTIAL | Previews are text-only, not interactive rows No inline height limit or tap-to-react |
| [No Embed Copy](plugins/no-embed-copy/README.md) | thororen | 1.0.0 | D | PARTIAL | Discord still opens the link after the copy Only works when the press event carries the URL |
| [NSFW Blur](plugins/nsfw-blur/README.md) | thororen | 1.0.0 | D | PARTIAL | No image blur: media is hidden, not blurred Hiding is global, not per NSFW channel |
| [Read All Notifications](plugins/read-all-notifications/README.md) | NexzaDev (https://github.com/NexzaDev "GitHub") | 1.0.1 | D | PARTIAL | Cannot add a button under the DMs Unread discovery depends on Phoenix's cache schema Threads are not enumerated separately |
| [Shiki Codeblocks](plugins/shiki-codeblocks/README.md) | Palm | 1.0.0 | D | PARTIAL | No inline highlighted code in chat Shiki theme selection is not ported (Phoenix chooses the theme) |
| [Show Tag](plugins/show-tag/README.md) | bleelblep | 1.0.0 | D | PARTIAL | Cannot change the message row itself Nicknames are not exposed to accessories (global name is used) |
| [Show Timeout Duration](plugins/show-timeout-duration/README.md) | Palm | 1.0.0 | D | PARTIAL | A snapshot per message, not a live countdown Cannot recolour the username row |
| [Tenor GIF Search](plugins/tenor-gif-search/README.md) | Palm | 1.0.0 | D | PARTIAL | The GIF picker still uses Discord's provider No grid preview: results are a list of buttons |
| [Who Reacted](plugins/who-reacted/README.md) | Palm | 1.0.0 | D | PARTIAL | On demand, not drawn on the pill No avatars, since pages show text and buttons |
| [Add Attachments](plugins/add-attachments/README.md) | Wolfie | 1.0.0 | C | BLOCKED | No message-edit UI or attachment-upload interception API. |
| [Anonymous File Names](plugins/anonymous-file-names/README.md) | k1ng_op | 1.0.0 | C | BLOCKED | No file-picker or upload filename interception API. |
| [Block YouTube Ads](plugins/block-youtube-ads/README.md) | Palm | 1.0.0 | E | BLOCKED | Android-only; no WebView script injection API. |
| [Bluetooth Audio Fix](plugins/bluetooth-audio-fix/README.md) | NoReplyUI5 | 1.0.0.1 | C | BLOCKED | No audio-route interception; cannot hook Discord's Bluetooth route switching. |
| [Coco's Command Lib](plugins/cocos-command-lib/README.md) | cocobo1 | 2.0.0 | E | BLOCKED | Valenced command library; Phoenix provides native commands.register. |
| [Developer Kit](plugins/developer-kit/README.md) | Valenced | 1.0.0 | E | BLOCKED | Valenced module finder/patcher inspection tools have no Phoenix equivalent. |
| [Disable Call Idle](plugins/disable-call-idle/README.md) | k1ng_op | 1.0.0 | C | BLOCKED | No voice connection management API. |
| [File Size on Picker](plugins/file-size-on-picker/README.md) | contrabags | 1.0.0 | C | BLOCKED | No media picker UI patch target. |
| [Join as Lurker](plugins/join-as-lurker/README.md) | Palm | 1.0.0 | C | BLOCKED | No invite or guild-join flow API, and no way to select lurker mode. |
| [Jump To Top](plugins/jump-to-top/README.md) | tralwdwdd | 1.0.0 | C | BLOCKED | No chat scroll control API. |
| [Legacy Themes](plugins/themes.legacy/README.md) | Valenced | 1.0.0 | E | BLOCKED | Depends on Valenced Themes API; no Phoenix theme system. |
| [No Idle](plugins/no-idle/README.md) | k1ng_op | 1.0.0 | C | BLOCKED | No presence/IDLE gateway event and no way to set presence. |
| [Reactions Sheet Fix](plugins/reactions-sheet-fix/README.md) | Palm | 1.0.0 | E | BLOCKED | The fix targets MessageReactionsStore internals and Dispatcher.dispatch, neither of which Phoenix exposes; Phoenix's own reactions sheet cannot be observed from a plugin. |
| [Search Action Sheet](plugins/search-action-sheet/README.md) | tralwdwdd | 1.0.0 | C | BLOCKED | No search results UI patch API. |
| [Sound Controls](plugins/sound-controls/README.md) | Wolfie | 1.0.0 | C | BLOCKED | No Discord sound system patch API. |
| [Themes](plugins/settings.themes/README.md) | Valenced | 1.0.0 | E | BLOCKED | No theme settings system; depends on Valenced Themes API + native. |
| [Themes API](plugins/api.themes/README.md) | Valenced | 1.0.1 | E | BLOCKED | No theme/font/icon-pack API; native Android theme engine. |
| [tralwdwd's action sheet patcher library](plugins/action-sheet-patcher/README.md) | tralwdwdd | 1.0.0 | E | BLOCKED | No action-sheet patching API in Phoenix; Valenced library for patching Discord action sheets. |
| [ValidUser](plugins/valid-user/README.md) | k1ng_op | 1.0.0 | C | BLOCKED | No message rendering or store patch API for @unknown-user resolution. |

Why the blocked ones cannot be ported is documented per plugin in
[`migration/compatibility.md`](migration/compatibility.md).

## Layout

```
plugins/<name>/src/index.ts   the whole plugin (Phoenix bundles one file per plugin)
plugins/<name>/README.md      what it does, what is missing, licence, API used
plugins/<name>/metadata.json  machine-readable identity + attribution
shared/README.md              patterns for cache reads, durations, avatar URLs (no importable code)
migration/status.json         the inventory and every classification
migration/source-catalogue.json  the 47-plugin source inventory
migration/compatibility.md    per-plugin analysis, including the blocked ones
dist/                         built bundles + index.json
scripts/                      build, test and docs generators
docs/                         architecture, installation, development, API notes, attribution
```

## Develop

```sh
npm install        # esbuild + typescript only
npm run typecheck  # tsc against the real phoenix.d.ts
npm run build      # typecheck, then bundle every plugin into dist/
npm test           # load each bundle in a VM with a mocked phoenix global
npm run check      # all three
node scripts/docs.mjs  # regenerate per-plugin README/metadata from migration/status.json
```

See [`docs/development.md`](docs/development.md) for the conventions, and
[`docs/api-compatibility.md`](docs/api-compatibility.md) for which Valenced APIs each Phoenix API replaces.

## Known limitations

The short version, in order of how often it bites:

- **No React or module patching.** Phoenix plugins cannot touch Discord's components, rows, embeds or
  pickers. Anything that only changes *how* Discord draws something becomes a Phoenix UI slot (message
  accessory, message action, profile section/tab, header/composer button) or is not possible.
- **No navigation API.** A plugin cannot open Settings, the DM list, a channel or a message.
- **No composer access.** Text cannot be read while typing or inserted; `messages.onSend` only sees the
  final text, and `onEmojiPick` only sees picker presses.
- **No file or media access.** Attachments cannot be uploaded, downloaded, blurred or renamed.
- **No Flux stores, presence, voice or theme APIs.** Plugins that patched those are documented as not ported.
- **Read-only SQL.** `stores.sql` has a 10,000-row cap and a schema Phoenix does not promise to keep, so
  every query here is defensive and optional.

Details and the reasoning per plugin: [`migration/compatibility.md`](migration/compatibility.md).

## Relationship to Valenced

Valenced's plugin API (`@valenced/patcher`, `@valenced/modules/finders`, React components, Flux stores,
native Android modules) does not exist in Phoenix. These ports use only the documented Phoenix API; the
original source is read for *behaviour* — settings, labels, edge cases, URL algorithms — not copied. Where
behaviour could not be reproduced, the plugin says so instead of approximating it.

## Licensing and attribution

The Valenced community repository is GPL-3.0; four plugins carry their own licence files (CC BY 4.0, MIT,
BSD-3-Clause, Unlicense). Every port records its original author, version and source URL, and is an
independent reimplementation against Phoenix's API. Per-plugin audit:
[`docs/attribution.md`](docs/attribution.md).

Third-party services used by ports (all opt-in and documented in each README): badges.equicord.org,
api.popcat.xyz, api.tenor.com.

## Licence

The port code in this repository is released under the MIT licence in [`LICENSE`](LICENSE).
