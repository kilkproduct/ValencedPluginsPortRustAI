# Tenor GIF Search

Phoenix Unlock port of the Valenced plugin **Tenor GIF Search**.

| | |
| --- | --- |
| Target plugin id | `phoenix.tenor-gif-search` |
| Version | 1.0.0 |
| Original author | Palm (https://github.com/sponsors/PalmDevs) |
| Original version | 1.0.0 |
| Original source | [plugins/tenor-gif-search](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/tenor-gif-search) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Brings back Tenor GIF search through /tenor

## What the original did

Redirects Discord's GIF picker to Tenor with the old Discord Tenor key.

## What this port does

`/tenor <query>` searches the same API and lists results in a page; picking one copies the GIF link for the composer.

## Features

- Tenor search with the original API key
- gif / tinygif / nanogif quality
- Result count setting

## Settings

- GIF quality
- Results

## Phoenix API used

- `commands.register`
- `fetch`
- `ui.openPage`
- `ui.copy`

## Known limitations

- The GIF picker still uses Discord's provider
- No grid preview: results are a list of buttons

## Privacy notes

- Queries are sent to api.tenor.com.

## Install

Copy `dist/tenor-gif-search.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
