# Character Counter

Phoenix Unlock port of the Valenced plugin **Character Counter**.

| | |
| --- | --- |
| Target plugin id | `phoenix.character-counter` |
| Version | 1.0.0 |
| Original author | thororen (https://www.thororen.com) |
| Original version | 1.0.0 |
| Original source | [plugins/character-counter](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/character-counter) |
| Compatibility | **D** — partially portable |
| Status | `PARTIAL` |

Shows the character count, colored like Discord's own counter

## What the original did

Live character counter in the composer with colour effects.

## What this port does

Counts the last sent message and shows it on a composer button, tinting yellow near Discord's 2000-character limit and red past it.

## Features

- Count of the last message you sent
- Colour effects at the limit
- Tap to copy the last message back

## Settings

- Color effects

## Phoenix API used

- `messages.onSend`
- `ui.addComposerButton`
- `ButtonRemover.update`

## Known limitations

- No live count while typing: plugins cannot read the composer

## Install

Copy `dist/character-counter.js` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (`plugins/<name>/src/index.ts`, `// @` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in `migration/status.json`.
See [`docs/attribution.md`](../../docs/attribution.md) for the per-plugin licence audit.
