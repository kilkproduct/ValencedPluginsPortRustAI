# Clear URLs

Phoenix Unlock port of the Valenced plugin **Clear URLs**.

| | |
| --- | --- |
| Target plugin id | `phoenix.clear-urls` |
| Version | 1.0.0 |
| Original author | hakuxyz (https://github.com/hakuxyz) |
| Original version | 1.0.0 |
| Original source | [plugins/clear-urls](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/clear-urls) |
| Compatibility | **A** — directly portable |
| Status | `IMPLEMENTED` |

Removes tracking parameters from links you send and receive

## What the original did

Hooks the send/edit paths and rewrites links with the ClearURLs rule set, plus cleans the clipboard.

## What this port does

Rewrites incoming messages in gateway hooks and outgoing text in `messages.onSend`, using the original's tracking-parameter list; a message action copies cleaned text.

## Features

- Strips utm_*, fbclid, gclid and ~50 more tracking parameters
- Works on sent, edited and received messages
- Copy-without-tracking message action

## Settings

- Clear URLs on/off
- Clean links you send on/off

## Phoenix API used

- `gateway.messageCreate/messageUpdate (hook before)`
- `messages.onSend`
- `ui.addMessageAction`
- `ui.copy`

## Known limitations

None — the original's behaviour is reproduced in full.

## Install

Copy `dist/clear-urls.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
