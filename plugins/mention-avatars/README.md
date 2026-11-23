# Mention Avatars

Phoenix Unlock port of the Valenced plugin **Mention Avatars**.

| | |
| --- | --- |
| Target plugin id | `phoenix.mention-avatars` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/mention-avatars](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/mention-avatars) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Show avatars next to mentions in chat

## What the original did

Injects a small avatar next to every mention inline in the message text.

## What this port does

Names mentioners in a header accessory and opens a page listing each mentioned user with their avatar URL.

## Features

- Mention names on the message
- Full mention list with avatar links

## Settings

None.

## Phoenix API used

- `ui.addMessageAccessory`
- `ui.addMessageAction`
- `ui.openPage`

## Known limitations

- No inline images inside message text

## Install

Copy `dist/mention-avatars.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
