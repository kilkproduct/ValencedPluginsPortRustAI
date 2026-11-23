# Hide Blocked Messages

Phoenix Unlock port of the Valenced plugin **Hide Blocked Messages**.

| | |
| --- | --- |
| Target plugin id | `phoenix.hide-blocked-messages` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/hide-blocked-messages](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/hide-blocked-messages) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Hides messages from blocked and ignored users

## What the original did

Patches ChatManager.createRow to hide blocked/ignored rows and optionally replies to them.

## What this port does

Drops messages from blocked/ignored users in a gateway before-hook; relationships are read from `/users/@me/relationships`.

## Features

- Hide blocked users' messages
- Hide ignored users' messages
- Optionally hide replies to them

## Settings

- Hide blocked messages
- Hide ignored messages
- Hide replies

## Phoenix API used

- `gateway.messageCreate (hook before)`
- `discord.get`

## Known limitations

- Hidden at the gateway, so the messages never appear (the original hid them after receipt)
- Reply detection only works when the referenced message is in the payload

## Install

Copy `dist/hide-blocked-messages.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
