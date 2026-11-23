# Who Reacted

Phoenix Unlock port of the Valenced plugin **Who Reacted**.

| | |
| --- | --- |
| Target plugin id | `phoenix.who-reacted` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/who-reacted](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/who-reacted) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Lists who reacted to a message

## What the original did

Draws up to five reactor avatars on each reaction pill via a native helper.

## What this port does

`Who reacted` message action fetches reactors per reaction and lists them in a page, newest counts included.

## Features

- Reactor names per reaction
- Caps for reactions per message and reactors per reaction, like the original

## Settings

- Maximum reactions
- Reactors per reaction

## Phoenix API used

- `ui.addMessageAction`
- `discord.get`
- `ui.openPage`

## Known limitations

- On demand, not drawn on the pill
- No avatars, since pages show text and buttons

## Install

Copy `dist/who-reacted.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
