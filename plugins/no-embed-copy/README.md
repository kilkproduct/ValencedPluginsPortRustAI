# No Embed Copy

Phoenix Unlock port of the Valenced plugin **No Embed Copy**.

| | |
| --- | --- |
| Target plugin id | `phoenix.no-embed-copy` |
| Version | 1.0.0 |
| Original author | thororen (https://www.thororen.com) |
| Original version | 1.0.0 |
| Original source | [plugins/no-embed-copy](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/no-embed-copy) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Make embeds copy their link instead of opening it

## What the original did

Makes an embed press copy the embed URL instead of opening it.

## What this port does

Copies the embed URL on an embed press (the press is passed back to Discord) and offers `Copy embed link` in the message menu.

## Features

- Embed URL copied on tap
- Message action for the same, without tapping the embed

## Settings

- Intercept embed taps

## Phoenix API used

- `ui.onEvent (intercept)`
- `ui.addMessageAction`
- `ui.copy`

## Known limitations

- Discord still opens the link after the copy
- Only works when the press event carries the URL

## Install

Copy `dist/no-embed-copy.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
