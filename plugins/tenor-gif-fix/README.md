# Tenor GIF Fix

Phoenix Unlock port of the Valenced plugin **Tenor GIF Fix**.

| | |
| --- | --- |
| Target plugin id | `phoenix.tenor-gif-fix` |
| Version | 1.0.0 |
| Original author | thororen (https://www.thororen.com) |
| Original version | 1.0.0 |
| Original source | [plugins/tenor-gif-fix](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/tenor-gif-fix) |
| Compatibility | **B** — adaptable |
| Status | `IMPLEMENTED` |

Download and share Tenor links as GIFs instead of MP4s

## What the original did

Rewrites Tenor MP4 sources to GIF sources for download and share.

## What this port does

Rewrites Tenor links in outgoing messages and offers `Copy as GIF link` on any message that contains one, using the original's URL algorithm.

## Features

- Tenor .mp4 → .gif link rewriting
- Works on any Tenor link in a message

## Settings

- Rewrite links you send

## Phoenix API used

- `messages.onSend`
- `ui.addMessageAction`
- `ui.copy`

## Known limitations

- Downloads and shares cannot be intercepted: no media manager

## Install

Copy `dist/tenor-gif-fix.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
