# Show Tag

Phoenix Unlock port of the Valenced plugin **Show Tag**.

| | |
| --- | --- |
| Target plugin id | `phoenix.show-tag` |
| Version | 1.0.0 |
| Original author | bleelblep |
| Original version | 1.0.0 |
| Original source | [plugins/show-tag](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/show-tag) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Show usernames next to display names in chat

## What the original did

Rewrites the rendered username to `display (@username)` and the reply preview with it.

## What this port does

Emits the same text from a header message accessory.

## Features

- Username next to the display name
- Legacy discriminators and bots handled like the original
- Only-username mode

## Settings

- Only username

## Phoenix API used

- `ui.addMessageAccessory placement: header`

## Known limitations

- Cannot change the message row itself
- Nicknames are not exposed to accessories (global name is used)

## Install

Copy `dist/show-tag.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
