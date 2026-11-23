# Better Chat Buttons

Phoenix Unlock port of the Valenced plugin **Better Chat Buttons**.

| | |
| --- | --- |
| Target plugin id | `phoenix.better-chat-buttons` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/better-chat-buttons](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/better-chat-buttons) |
| Compatibility | **B** — adaptable |
| Status | `IMPLEMENTED` |

Hides annoying chat buttons (Gift, Voice Message, and more)

## What the original did

Hides Apps & Commands, Gift, New Thread and Voice Message, and configures send-button collapse.

## What this port does

Hides composer and header buttons by accessibility id, live, as settings change.

## Features

- Hide the Gift button
- Hide the Voice Message button
- Hide the emoji button
- Hide the chat header search entry

## Settings

- Hide Gift
- Hide Voice Message
- Hide Emoji
- Hide Search

## Phoenix API used

- `ui.hide`
- `settings onChange`

## Known limitations

- Apps & Commands and New Thread have no accessibility id known to plugins
- Send-button collapse behaviour is not exposed

## Install

Copy `dist/better-chat-buttons.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
