# Migration report

What was done, what was verified, and what is still open. Written to be the honest record; the
machine-readable version is [`status.json`](status.json) and the raw test output is
[`test-results.json`](test-results.json).

## Inputs

| | |
| --- | --- |
| Source | `github.com/Valenced/valenced-community-plugins` @ `4dbc3f9d`, vendored at `.vendor/vc-plugins` (47 plugins) |
| Target | `github.com/mantikafasi/phoenix-unlock` @ `4527ff50`, vendored at `.vendor/phoenix` (runtime, UI, wire, bundled plugins, `phoenix.d.ts`) |
| Catalogue index | `https://community.valenced.app/index.json` was **unreachable from the build environment** (egress blocked). The repository's 47 `manifest.json` files are the authoritative substitute and are recorded in [`source-catalogue.json`](source-catalogue.json). The catalogue's per-plugin download URLs, SHA-256 checksums and beta channels could therefore not be verified — the manifests provide id, name, description, author, contributors, version, dependencies, dist mapping and icon. |
| Trust | No downloaded plugin code was executed during analysis; sources were read as text. |

## Coverage

| Metric | Count |
| --- | --- |
| Plugins in the source catalogue | **47** |
| Analysed (classification + missing-capability note) | **47** |
| Ported and building | **28** |
| — fully equivalent (class A/B) | 10 (A: 3, B: 7) |
| — partially equivalent (class D, gaps documented) | 18 |
| Not portable (class C/E) with a documented reason | 19 (C: 11, E: 8) |
| TypeScript errors | 0 (`strict`, against the real `phoenix.d.ts`) |
| Bundles produced | 28 `dist/<name>.js` + `dist/index.json` |
| Behavioural tests (mock runtime) | 28/28 passing (`npm test`), each asserting documented behaviour, not just "did not throw" |
| Plugins with individual README + metadata | 28/28 |

## Verification status (important)

Every ported plugin is at **`TESTING` → `MOCK_PASSED`**, *not* `VERIFIED`, and completion is not inflated:

- **Static — done.** Strict `tsc` against the checked-out `phoenix.d.ts`; esbuild bundles each plugin with
  Phoenix's own conventions (IIFE, ES2023, `// @` banner).
- **Behaviour — done in a mock, with assertions.** `scripts/test.mjs` evaluates each bundle with a `phoenix`
  global modelled on the declarations, feeds a realistic `GatewayMessage` (mentions, attachments, reactions,
  a reply reference, a timeout, code fences, a tracking URL, a message link and emoji markup) through every
  registered hook, drives outgoing text, emoji picks and request interception, renders every
  accessory/section/tab, presses every visible message action, button and command, fires injected view
  events, then runs `onUnload`. Then it **asserts the documented behaviour** per plugin — e.g.
  `utm_source` is gone from a sent link (clear-urls), `<:party:555>` became a CDN GIF link (fake-nitro),
  a known delete was dropped and marked (message-logger), a blocked author's message was dropped
  (hide-blocked-messages), the tag rendered as `Some One (@someone)` (show-tag), the Tenor `.mp4` became
  `.gif` (tenor-gif-fix), the embed URL was copied (no-embed-copy). 28/28 pass.
  A plugin without assertions fails the suite, so new ports cannot be added untested.
- **Device — not done.** No Android device or emulator with Phoenix Unlock was available in this
  environment, so *nothing here has been observed running inside Discord*. Concretely unverified:
  accessibility ids other than the ones Phoenix's own bundled plugins use, real REST responses with a live
  session, the actual `cache.sqlite` schema, how each accessory looks, and anything visual.

The correct reading of `MOCK_PASSED` is "loads, registers, handles payloads, unloads". A plugin only becomes
`VERIFIED` after it has been installed on a phone and its behaviour observed — the checklist below is what
that requires.

## Per-plugin acceptance checklist (for device verification)

1. Plugin appears on its page in Settings → Phoenix Unlocker → Plugins, with its settings.
2. Its buttons/actions/accessories are in the expected place (and nowhere else).
3. The documented behaviour happens for a real message; the documented gaps still behave as gaps.
4. Toggling a setting takes effect without a restart (where the README says so).
5. Turning the plugin off removes its UI and leaves no duplicated listeners after re-enabling.
6. Reloading the app keeps its stored state (for `favorite-anything`, `gif-to-chat-input`).

## What was reimplemented, by mechanism

| Mechanism the original used | Ports that replaced it with | Plugins |
| --- | --- | --- |
| React component patches (`after`/`instead`) | message accessories, message actions, profile tabs | show-tag, show-timeout-duration, message-logger, mention-avatars, better-typing-indicators, shiki-codeblocks, selectable-bios, global-badges |
| Flux event hooks / dispatch | gateway `hook(before)` + REST | clear-urls, message-logger, hide-blocked-messages, read-all-notifications |
| Module patching of send paths | `messages.onSend`, `discord.onRequest` | clear-urls, fake-nitro, tenor-gif-fix, silent-typing |
| Native helper calls (`.kt`) | plugin-drawn surfaces or documented gap | character-counter, nsfw-blur, who-reacted, mention-avatars, show-timeout-duration |
| `FileModule` + multipart upload | URL post + unfurl | petpet |
| Store/QoL buttons and navigation | header/composer buttons, commands | youbar-plus, dashless, read-all-notifications, gif-to-chat-input |
| Clipboard patching | message actions with `ui.copy` | clear-urls, link-alert-copy, no-embed-copy, tenor-gif-fix |
| Picker/HTTP redirection | slash command + REST | tenor-gif-search, favorite-anything |

## Known gaps in this project (not in Phoenix)

- 19 plugins are not ported. Each has a reason in [`compatibility.md`](compatibility.md) tied to a specific
  missing Phoenix capability (no React/row patch, no navigation, no composer access, no media/file access, no
  presence, no themes, no Flux).
- 18 ports are partial. The missing slice is listed per plugin in its README and in `status.json`.
- `migration/status.json` records `test_status: "MOCK_PASSED"`; there is no `VERIFIED` entry yet, by design.
- The catalogue's checksums/download metadata could not be verified (index unreachable); the vendored clone
  is the source of truth.
- Group-ordering niceties of some original settings screens (sliders, drag-to-reorder provider lists) map to
  the nearest native control (number field, select) — noted where it applies.

## Suggested next steps

1. Device pass: run the checklist above for the 10 class-A/B ports first (they are fully equivalent and
   cheap to check), then the 18 class-D ports, promoting each to `VERIFIED` in `status.json`.
2. Confirm the cache-backed queries (`fake-nitro`, `nsfw-blur`, `read-all-notifications`) against a real
   `cache.sqlite` and adjust the column names if the alpha changes them.
3. Re-check the accessibility ids used by `ui.hide` on a current build; add any newly stable ones to
   `hide-call-buttons` / `better-chat-buttons`.
4. If Phoenix grows a composer-text or navigation API, the class-D ports that need them
   (`character-counter`, `gif-to-chat-input`, `youbar-plus`) can be completed without redesign.
