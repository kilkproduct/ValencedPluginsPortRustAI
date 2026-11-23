# Message Logger

Phoenix Unlock port of the Valenced plugin **Message Logger**.

| | |
| --- | --- |
| Target plugin id | `phoenix.message-logger` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/message-logger](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/message-logger) |
| Compatibility | **A** — directly portable |
| Status | `IMPLEMENTED` |

Keeps deleted messages and edit history visible in chat

## What the original did

Native-backed log of deleted messages, edits and removed attachments, with a history sheet.

## What this port does

Gateway hooks keep message state in memory; two message accessories show edit history and a red `Deleted · HH:MM` marker. Deletes of known messages are dropped from the client handler so they stay on screen.

## Features

- Deleted messages stay, marked in red
- Earlier versions of edited messages
- Removed attachments are put back
- Ignore your own messages or bots

## Settings

- Deleted messages
- Edits
- Ignore your messages
- Ignore bots

## Phoenix API used

- `gateway.messageCreate/Update/Delete/DeleteBulk (hook before)`
- `ui.addMessageAccessory`
- `Remover.update`

## Known limitations

None — the original's behaviour is reproduced in full.

## Install

Copy `dist/message-logger.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
