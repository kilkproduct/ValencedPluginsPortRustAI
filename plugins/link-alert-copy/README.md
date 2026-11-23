# Link Alert Copy

Phoenix Unlock port of the Valenced plugin **Link Alert Copy**.

| | |
| --- | --- |
| Target plugin id | `phoenix.link-alert-copy` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/link-alert-copy](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/link-alert-copy) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Copy a link before leaving Discord

## What the original did

Adds a Copy Link button to the Leaving Discord alert.

## What this port does

Copies the link when the alert's press is observed, and offers a message action that copies a link with no alert at all.

## Features

- Link copied before the alert is confirmed
- Copy the first link in a message

## Settings

- Copy before asking
- Show a toast

## Phoenix API used

- `ui.onEvent (intercept)`
- `ui.addMessageAction`
- `ui.copy`

## Known limitations

- Cannot add a button to Discord's alert

## Install

Copy `dist/link-alert-copy.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
