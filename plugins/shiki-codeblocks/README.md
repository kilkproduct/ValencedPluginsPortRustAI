# Shiki Codeblocks

Phoenix Unlock port of the Valenced plugin **Shiki Codeblocks**.

| | |
| --- | --- |
| Target plugin id | `phoenix.shiki-codeblocks` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/shiki-codeblocks](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/shiki-codeblocks) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

View code blocks in chat with syntax highlighting

## What the original did

Renders syntax-highlighted code blocks inline with Shiki, plus a selectable full-screen viewer.

## What this port does

`View highlighted` message action opens every code block in Phoenix's own syntax-highlighting viewer.

## Features

- Highlighted code viewer, one section per block
- Uses the block's language tag

## Settings

- Open on tap

## Phoenix API used

- `ui.addMessageAction`
- `ui.openPage (highlight)`

## Known limitations

- No inline highlighted code in chat
- Shiki theme selection is not ported (Phoenix chooses the theme)

## Install

Copy `dist/shiki-codeblocks.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
