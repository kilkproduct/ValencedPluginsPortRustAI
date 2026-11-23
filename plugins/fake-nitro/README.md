# Fake Nitro

Phoenix Unlock port of the Valenced plugin **Fake Nitro**.

| | |
| --- | --- |
| Target plugin id | `phoenix.fake-nitro` |
| Version | 1.0.0 |
| Original author | Palm (https://palmdevs.me) |
| Original version | 1.0.0 |
| Original source | [plugins/fake-nitro](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/fake-nitro) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Send custom emojis from any server, and animated ones, as image links

## What the original did

Unlocks emojis everywhere, stickers, client themes, app icons and stream quality by patching ProductCatalog.

## What this port does

Sends custom and animated emojis as image links, with the original's settings (size, link style, permission check). Emoji data comes from Phoenix's guild cache, and Nitro tier from `/users/@me`.

## Features

- Custom and animated emojis from any server
- `:name:` shortcodes and `<:name:id>` markup
- Emoji size and link style options

## Settings

- Send custom emojis
- Emoji size
- Link style
- Check permissions

## Phoenix API used

- `messages.onEmojiPick`
- `messages.onSend`
- `stores.sql`
- `discord.get`

## Known limitations

- Stickers, themes, app icons and stream quality are not portable: no plugin API
- Reactions keep their Nitro lock

## Install

Copy `dist/fake-nitro.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
