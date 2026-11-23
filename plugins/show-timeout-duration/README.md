# Show Timeout Duration

Phoenix Unlock port of the Valenced plugin **Show Timeout Duration**.

| | |
| --- | --- |
| Target plugin id | `phoenix.show-timeout-duration` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/show-timeout-duration](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/show-timeout-duration) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Show how long a timed-out user has left, next to their message

## What the original did

Draws the remaining timeout in the native username row, in the theme's critical colour.

## What this port does

Captures `communication_disabled_until` from the gateway and shows `timeout 3h 20m left` as a header accessory.

## Features

- Compact duration (3d 4h / 3h 20m / 12m 5s)
- Red, like Discord's own timeout styling

## Settings

None.

## Phoenix API used

- `gateway.messageCreate (on + hook after)`
- `ui.addMessageAccessory`

## Known limitations

- A snapshot per message, not a live countdown
- Cannot recolour the username row

## Install

Copy `dist/show-timeout-duration.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
