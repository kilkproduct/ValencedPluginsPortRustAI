# Selectable Bios

Phoenix Unlock port of the Valenced plugin **Selectable Bios**.

| | |
| --- | --- |
| Target plugin id | `phoenix.selectable-bios` |
| Version | 1.0.0 |
| Original author | Loki-vtx (https://github.com/Loki-vtx) |
| Original version | 1.0.0 |
| Original source | [plugins/selectable-bios](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/selectable-bios) |
| Compatibility | **B** — adaptable |
| Status | `IMPLEMENTED` |

Copy profile bios as text

## What the original did

Makes profile bios selectable so they can be copied.

## What this port does

Adds a Bio profile tab that shows the bio with a Copy button.

## Features

- Bio on its own tab
- One-tap copy

## Settings

None.

## Phoenix API used

- `ui.addProfileTab`
- `discord.get`

## Known limitations

- Text inside Discord's own bio view is still not selectable

## Install

Copy `dist/selectable-bios.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
