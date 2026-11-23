# Message Link Preview

Phoenix Unlock port of the Valenced plugin **Message Link Preview**.

| | |
| --- | --- |
| Target plugin id | `phoenix.message-link-preview` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/message-link-preview](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/message-link-preview) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Preview messages you are linked to, right in chat

## What the original did

Renders interactive message rows under a message that links to other messages.

## What this port does

Shows a compact `↳ author: text` preview per link, cached for five minutes, plus a page with the full text of every linked message.

## Features

- Previews per message setting (default 5)
- Author and text of the linked message
- Open the linked messages in full

## Settings

- Previews per message

## Phoenix API used

- `ui.addMessageAccessory`
- `ui.addMessageAction`
- `discord.get`

## Known limitations

- Previews are text-only, not interactive rows
- No inline height limit or tap-to-react

## Install

Copy `dist/message-link-preview.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
