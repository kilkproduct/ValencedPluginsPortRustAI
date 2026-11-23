# NSFW Blur

Phoenix Unlock port of the Valenced plugin **NSFW Blur**.

| | |
| --- | --- |
| Target plugin id | `phoenix.nsfw-blur` |
| Version | 1.0.0 |
| Original author | thororen (https://www.thororen.com) |
| Original version | 1.0.0 |
| Original source | [plugins/nsfw-blur](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/nsfw-blur) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Blur NSFW media in NSFW channels

## What the original did

Patches createMessageContent to drop inline media and spoiler every attachment in NSFW channels.

## What this port does

Hides media rows with `ui.hide`, and can drop messages with attachments in NSFW channels at the gateway. NSFW channels come from the read-only cache.

## Features

- Media rows hidden
- Optional dropping of NSFW attachments
- Channel NSFW flags read from Phoenix's cache

## Settings

- Hide NSFW media
- Drop NSFW messages

## Phoenix API used

- `ui.hide`
- `stores.sql`
- `gateway.messageCreate (hook before)`

## Known limitations

- No image blur: media is hidden, not blurred
- Hiding is global, not per NSFW channel

## Install

Copy `dist/nsfw-blur.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
