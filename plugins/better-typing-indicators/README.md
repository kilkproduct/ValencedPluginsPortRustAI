# Better Typing Indicators

Phoenix Unlock port of the Valenced plugin **Better Typing Indicators**.

| | |
| --- | --- |
| Target plugin id | `phoenix.better-typing-indicators` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/better-typing-indicators](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/better-typing-indicators) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Show who is typing, with names, in the open channel

## What the original did

Draws a typing indicator with user avatars inside the channel list (native helper).

## What this port does

Listens to `typingStart` and names the people typing in the channel as a header accessory, expiring entries after Discord's ten-second window.

## Features

- Names of everyone typing in the open channel
- Ten-second expiry and removal once the message is sent
- Bots optional

## Settings

- Show names
- Include bots

## Phoenix API used

- `gateway.typingStart (on)`
- `gateway.messageCreate (hook after)`
- `ui.addMessageAccessory placement: header`

## Known limitations

- The channel list cannot be patched, so nothing is drawn there
- Requires a build that exposes `typingStart` (an event registry entry, not a typed payload)

## Install

Copy `dist/better-typing-indicators.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
