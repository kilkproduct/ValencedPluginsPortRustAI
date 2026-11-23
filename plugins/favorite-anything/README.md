# Favorite Anything

Phoenix Unlock port of the Valenced plugin **Favorite Anything**.

| | |
| --- | --- |
| Target plugin id | `phoenix.favorite-anything` |
| Version | 1.0.0 |
| Original author | TheUnrealZaka (https://www.theunrealzaka.me) |
| Original version | 1.0.0 |
| Original source | [plugins/favorite-anything](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/favorite-anything) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Favorite any image or video, not just GIFs

## What the original did

Shows the GIF favorite star on all media and maps images/videos into GIF favorites, renewing signed URLs.

## What this port does

Favorites any image or video attachment from the message menu, keeps them in plugin storage, renews expiring CDN signatures in batches via `/attachments/refresh-urls`, and lists them from settings.

## Features

- Favorite images and videos, not just GIFs
- Automatic signed-URL renewal (batched, 50 at a time)
- List and copy favorites

## Settings

- Renew signed URLs
- Show saved favorites
- Clear saved favorites

## Phoenix API used

- `ui.addMessageAction`
- `discord.post`
- `storage`
- `ui.openPage`

## Known limitations

- Not integrated with Discord's GIF picker
- Favorites live in plugin storage

## Install

Copy `dist/favorite-anything.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
