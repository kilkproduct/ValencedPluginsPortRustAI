# Read All Notifications

Phoenix Unlock port of the Valenced plugin **Read All Notifications**.

| | |
| --- | --- |
| Target plugin id | `phoenix.read-all-notifications` |
| Version | 1.0.0 |
| Original author | NexzaDev (https://github.com/NexzaDev) |
| Original version | 1.0.1 |
| Original source | [plugins/read-all-notifications](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/read-all-notifications) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Mark every unread channel as read in one tap

## What the original did

You Bar button that dispatches BULK_ACK for every unread channel.

## What this port does

Header button and `/read-all` ack unread channels through `POST /channels/:id/ack`, with an optional confirmation.

## Features

- Marks every unread channel as read
- Optional confirmation
- Optional inclusion of muted channels

## Settings

- Include muted channels
- Ask first

## Phoenix API used

- `stores.sql`
- `discord.post`
- `ui.choose`
- `ui.addHeaderButton`
- `commands.register`

## Known limitations

- Cannot add a button under the DMs
- Unread discovery depends on Phoenix's cache schema
- Threads are not enumerated separately

## Install

Copy `dist/read-all-notifications.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
