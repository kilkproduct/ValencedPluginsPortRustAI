## What this is

A complete migration of the [Valenced Community Plugins](https://github.com/Valenced/valenced-community-plugins) catalogue (`@ 4dbc3f9d`, 47 plugins) to [Phoenix Unlock](https://github.com/mantikafasi/phoenix-unlock) (`@ 4527ff50`), written against `crates/runtime/phoenix.d.ts` only.

**47 analysed · 28 ported · 19 not portable (each with a specific reason) · 28/28 behavioural tests passing · strict tsc clean · CI green.**

## Contents

| Area | What's here |
| --- | --- |
| `plugins/` | 28 self-contained ports, each with `src/index.ts`, `README.md` (what the original did, what the port does, gaps, API used, licence) and `metadata.json` |
| `migration/` | `status.json` (per-plugin classification, gaps, attribution, test status), `source-catalogue.json`, `compatibility.md`, `dependency-map.json`, `report.md`, `test-results.json` |
| `docs/` | `architecture.md`, `installation.md` (four verified install routes), `development.md`, `api-compatibility.md` (Valenced→Phoenix API map), `attribution.md` (licence audit) |
| `scripts/` | `build.mjs` (typecheck + esbuild in Phoenix's conventions), `test.mjs` (mock-runtime behavioural harness), `docs.mjs` (repo-wide doc generator) |
| `.github/workflows/build.yml` | typecheck → bundle → test → doc-freshness gate → artifacts, plus single-plugin dispatch |
| `tools/test-with-phoenix.mjs` | clones Phoenix and runs the CI sequence locally |

## Verification — read this before approving

- **Static:** strict `tsc` over all 28 plugins against the real `phoenix.d.ts`; esbuild IIFE/es2023 bundles with the `// @` banner convention.
- **Behavioural (mock):** `npm test` drives every hook, accessory, action, button, command, view event and `onUnload`, and **asserts documented behaviour** (utm stripping, `<:party:555>` → CDN GIF link, kept/marked deletes, blocked-author drop, `Some One (@someone)` tag format, Tenor `.mp4`→`.gif`, embed copy, timeout formatting…). A plugin without assertions fails the suite. 28/28 pass.
- **Device: not done.** No Android device was available, so **nothing is marked `VERIFIED`** — every port is `MOCK_PASSED`, and `migration/report.md` lists the exact device checklist to promote one. Please do not read this PR as "works on a phone"; it is "loads, registers, handles realistic payloads, unloads, and does what it says in a mock".

## Ported (28)

- **A — fully equivalent (3):** clear-urls, silent-typing, message-logger.
- **B — adaptable, recommended to test first (7):** show-tag, better-chat-buttons, hide-call-buttons, youbar-plus, global-badges, petpet, tenor-gif-fix, selectable-bios.
- **D — partial, gaps documented per plugin (18):** fake-nitro, character-counter, who-reacted, mention-avatars, message-link-preview, hide-blocked-messages, nsfw-blur, shiki-codeblocks, read-all-notifications, dashless, better-typing-indicators, favorite-anything, tenor-gif-search, gif-to-chat-input, link-alert-copy, no-embed-copy, show-timeout-duration, global-badges variants.

## Not portable (19) — reasons in `migration/compatibility.md`

Themes/native (`api.themes`, `settings.themes`, `themes.legacy`, `block-youtube-ads`), render-patch or Flux-dependent plugins (`jump-to-top`, `search-action-sheet`, `reactions-sheet-fix`, `valid-user`, `gas`-style cases), picker/upload interception (`add-attachments`, `anonymous-file-names`, `file-size-on-picker`, `gif-to-chat-input`'s original path), voice/audio (`disable-call-idle`, `bluetooth-audio-fix`, `sound-controls`), and Valenced-internal libraries (`action-sheet-patcher`, `cocos-command-lib`, `developer-kit`).

## Licensing

Original repo is GPL-3.0 with per-plugin overrides (CC BY 4.0, MIT, BSD-3-Clause, Unlicense). Every port is an independent reimplementation against Phoenix's API — no Valenced source copied — with author, original version and source path recorded, plus a per-plugin audit in `docs/attribution.md`. Port code: MIT.

## Notes for reviewers

- `.vendor/` is gitignored; CI clones Phoenix's declarations, so the typecheck is against the real API. `node tools/test-with-phoenix.mjs` does the same locally.
- Two small plugin-source fixes rode along after review of earlier revisions (the `no-embed-copy`/`link-alert-copy` event handlers now avoid consuming presses they cannot attribute; `hide-call-buttons` documents that only two surfaces have known accessibility ids).
- CI caught and I fixed a self-inflicted issue: `test-results.json` had a timestamp, which broke the doc-freshness gate. It is deterministic now.

<!-- arena:pr -->
