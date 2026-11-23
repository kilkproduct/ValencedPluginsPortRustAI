# YouBar+

Phoenix Unlock port of the Valenced plugin **YouBar+**.

| | |
| --- | --- |
| Target plugin id | `phoenix.youbar-plus` |
| Version | 1.0.0 |
| Original author | Purple_Ξye™ (https://github.com/Purple-EyeZ) |
| Original version | 1.0.0 |
| Original source | [plugins/youbar-plus](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/youbar-plus) |
| Compatibility | **B** — adaptable |
| Status | `IMPLEMENTED` |

Add Settings, Favorites and DM buttons to the chat header

## What the original did

Adds Settings, Favorites and DM buttons to the You Bar and navigates with RootNavigationRef.

## What this port does

Adds the same three shortcuts as chat header buttons; each reports where the screen lives, since plugins cannot push Discord's navigator.

## Features

- Settings, Favorites and DM shortcuts
- Defaults match the original (Settings on)

## Settings

- Settings button
- Favorites button
- DMs button

## Phoenix API used

- `ui.addHeaderButton`
- `settings onChange`

## Known limitations

- Cannot open Settings, Favorites or the DM list directly: no navigation API

## Install

Copy `dist/youbar-plus.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
