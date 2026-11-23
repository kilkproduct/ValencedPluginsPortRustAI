# Dashless

Phoenix Unlock port of the Valenced plugin **Dashless**.

| | |
| --- | --- |
| Target plugin id | `phoenix.dashless` |
| Version | 1.0.0 |
| Original author | k1ng_op |
| Original version | 1.0.0 |
| Original source | [plugins/dashless](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/dashless) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Show the open channel's name without dashes

## What the original did

Renders channel names with spaces instead of dashes, locally only.

## What this port does

Shows the dash-less name in a header button and in `/dashless`, and never renames anything on Discord.

## Features

- Header button with the dash-less channel name
- /dashless command

## Settings

- Header button

## Phoenix API used

- `ui.addHeaderButton`
- `commands.register`
- `discord.get`

## Known limitations

- Cannot change the channel list rows
- Names are cached after the first lookup

## Install

Copy `dist/dashless.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
