# Global Badges

Phoenix Unlock port of the Valenced plugin **Global Badges**.

| | |
| --- | --- |
| Target plugin id | `phoenix.global-badges` |
| Version | 1.0.0 |
| Original author | Wolfie (https://wolfies.org/) |
| Original version | 1.0.0 |
| Original source | [plugins/global-badges](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/global-badges) |
| Compatibility | **B** — adaptable |
| Status | `IMPLEMENTED` |

Show profile badges from other client mods

## What the original did

Splices badges from badges.equicord.org into the profile's badge row, with ordering and per-provider toggles.

## What this port does

Fetches the same service and shows badges in a profile section and a Badges profile tab (with the badge artwork as images).

## Features

- 17 client-mod badge providers
- Mod name as prefix, suffix or hidden
- 30-minute cache with a manual refresh button

## Settings

- Mod name position
- Refresh badges

## Phoenix API used

- `fetch`
- `ui.addProfileSection`
- `ui.addProfileTab`

## Known limitations

- Cannot replace or add to Discord's own badge row
- No drag-to-reorder and no per-provider toggles (no settings list control)

## Privacy notes

- Sends requests to badges.equicord.org. The service returns all known users in one response; this plugin sends no user IDs.

## Install

Copy `dist/global-badges.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
