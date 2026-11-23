# Silent Typing

Phoenix Unlock port of the Valenced plugin **Silent Typing**.

| | |
| --- | --- |
| Target plugin id | `phoenix.silent-typing` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/silent-typing](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/silent-typing) |
| Compatibility | **A** — directly portable |
| Status | `IMPLEMENTED` |

Stops Discord from sending typing indicators when you type

## What the original did

Never sends typing indicators.

## What this port does

Drops Discord's `POST /channels/:id/typing` request before it leaves the device.

## Features

- No typing indicator is ever sent
- Nothing else about typing changes

## Settings

- Silent typing on/off

## Phoenix API used

- `discord.onRequest`

## Known limitations

None — the original's behaviour is reproduced in full.

## Install

Copy `dist/silent-typing.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
