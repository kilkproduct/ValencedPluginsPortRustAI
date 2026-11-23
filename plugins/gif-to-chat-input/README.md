# GIF to Chat Input

Phoenix Unlock port of the Valenced plugin **GIF to Chat Input**.

| | |
| --- | --- |
| Target plugin id | `phoenix.gif-to-chat-input` |
| Version | 1.0.0 |
| Original author | j |
| Original version | 1.0.0 |
| Original source | [plugins/gif-to-chat-input](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/gif-to-chat-input) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Holds picked GIFs in the chatbox instead of sending them

## What the original did

Intercepts `gif_reply` sends and puts the GIF in the chatbox instead.

## What this port does

`/hold <link>` stores a GIF link and a composer button copies it back, so a picked GIF is never auto-sent.

## Features

- Hold a GIF link across restarts
- Composer button to retrieve it
- Optional auto-copy

## Settings

- Copy when held

## Phoenix API used

- `commands.register`
- `ui.addComposerButton`
- `storage`
- `messages.addLocal`
- `ui.copy`

## Known limitations

- Cannot intercept the picker itself
- Cannot insert text into the composer

## Install

Copy `dist/gif-to-chat-input.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
