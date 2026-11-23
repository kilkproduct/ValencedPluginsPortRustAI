# Hide Call Buttons

Phoenix Unlock port of the Valenced plugin **Hide Call Buttons**.

| | |
| --- | --- |
| Target plugin id | `phoenix.hide-call-buttons` |
| Version | 1.0.0 |
| Original author | bleelblep |
| Original version | 1.0.0 |
| Original source | [plugins/hide-call-buttons](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/hide-call-buttons) |
| Compatibility | **B** — adaptable |
| Status | `IMPLEMENTED` |

Hide call and video buttons on profiles and in DMs

## What the original did

Prunes call/video buttons from profiles, DM headers, the friends list and voice channels.

## What this port does

Hides the surfaces Phoenix exposes accessibility ids for (composer voice button, header search).

## Features

- Hide the composer voice button
- Hide the chat header search entry

## Settings

- Profile voice button
- Chat header search

## Phoenix API used

- `ui.hide`

## Known limitations

- Profile call/video buttons, DM header call buttons, friends-list call buttons and voice-channel buttons cannot be targeted

## Install

Copy `dist/hide-call-buttons.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
