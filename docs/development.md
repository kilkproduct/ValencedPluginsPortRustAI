# Development

## Toolchain

Node 22+ and nothing else. `npm install` pulls exactly two dev dependencies:

| Tool | Why |
| --- | --- |
| `typescript` | strict typechecking against the real `phoenix.d.ts` |
| `esbuild` | the same bundler Phoenix uses (`web/tools/bundle-plugins.mjs`) |

No runtime dependency, no framework, no test runner to install: `scripts/test.mjs` is a Node VM harness.

```sh
npm run typecheck   # tsc -p tsconfig.json (strict, ES2023, no DOM lib)
npm run build       # typecheck then bundle every plugins/*/src/index.ts into dist/
npm test            # load each bundle with a mocked phoenix global, drive it, unload it
npm run check       # all of the above
node scripts/docs.mjs   # regenerate plugins/*/README.md + metadata.json from migration/status.json
```

## Adding a plugin

1. Pick the source plugin from `.vendor/vc-plugins/plugins/<name>/` (the catalogue clone) and read its
   `index.ts`/`index.tsx`, `settings.tsx` and `shared.ts`. The **behaviour** matters — settings, labels,
   defaults, edge cases. Do not copy code.
2. Create `plugins/<name>/src/index.ts` with the `// @description`, `// @version`, `// @author` header and
   the translation comment explaining what the original patched and what this does instead.
3. Use only APIs from `.vendor/phoenix/crates/runtime/phoenix.d.ts`. If the API you need is not there, the
   plugin is class **C/E** — document it in `migration/status.json` instead of inventing a method.
4. Add a `NOTES` entry in `scripts/docs.mjs` (original behaviour, port behaviour, features, settings, API,
   limits, privacy warnings) and set the plugin's classification in `migration/status.json`.
5. `node scripts/docs.mjs && npm run check`.

## Conventions

- **Header lines are the manifest.** Phoenix reads `// @description`, `// @version`, `// @author` and
  `// @warning` from the top of the bundle (they survive esbuild as a banner). Keep them first, one per line,
  before any import.
- **Settings are the UI.** `phoenix.settings.define({...})` renders native rows. Reach for `select` instead
  of many switches, `number` for caps, and `button` for actions that do not need a header button.
- **Never poll.** There is no `setTimeout`/`setInterval` in Phoenix's runtime. If something must recur,
  piggyback on an accessory render (Phoenix drives those per message) or on a gateway event.
- **Settings are live, but read them when used.** The object returned by `define` reflects current values;
  do not cache them at load time unless you also wire `onChange`.
- **Guard the cache.** `stores.sql` is read-only with a 10,000-row cap; wrap every query in `try/catch`,
  select one row per entity (`GROUP BY`, `substr(k, 1, 20)`), and never assume a column exists.
- **Clean up.** Anything Phoenix does not own (buttons you added, maps you filled) is removed in
  `phoenix.onUnload`.
- **Say what leaves the device.** Third-party requests get a `// @warning` header line and a README section.

## Testing

`scripts/test.mjs` builds a mock `phoenix` object that mirrors the declarations (gateway handles are opaque
objects, `settings.define` returns defaults, `discord.*` returns plausible JSON), drives each bundle, and
then **asserts its documented behaviour** through the `EXPECT` table — a plugin with no expectations fails,
so a new port cannot be merged without a behavioural assertion. For each bundle the harness:

1. evaluates it and lets module-level promises settle;
2. runs every registered `before`/`after` gateway hook with a realistic `GatewayMessage`, a delete and a
   bulk delete;
3. runs every observer, `onSend`, `onEmojiPick` and `onRequest` handler;
4. renders every accessory, evaluates message-action visibility and presses the visible ones, renders
   profile sections and tabs;
5. presses every header/composer button and runs every command;
6. fires injected view events, then calls every `onUnload` cleanup and settles promises again.

Results are printed and written to `migration/test-results.json`.

Add an expectation when you add a plugin:

```js
const EXPECT = {
  "my-plugin": (observed) => {
    assert(observed.onSend.some((t) => t === "expected"), "message rewrite missing");
  },
};
```

`observed` carries everything the plugin did: `hooks` (per event, `kept`/`dropped`), `observers`, `onSend`
outputs, `emojiPicks`, `accessories`, `actions`, `profileSections`, `profileTabs`, `commands` (per name),
`requests` (typing etc.), `viewEvents` results, `pages` opened, `copies`, `replies`, `hides` and
`buttonUpdates` (the patches passed to `ButtonRemover.update`).

**What this does and does not prove.** It proves the bundle parses, registers, handles a realistic payload
without throwing, and unloads cleanly. It does *not* prove that Discord renders the accessory the way a phone
would, that a REST call succeeds with a real session, or that a cache query matches a real schema. Those
require Phoenix Unlock on a device — see `migration/test-results.json` for the current, honest status
(`MOCK_PASSED`, not `VERIFIED`).

## Regenerating the inventory

```sh
# source catalogue (47 manifests) from the vendored clone
python3 - <<'PY'
import json, pathlib
# …walk .vendor/vc-plugins/plugins/*/manifest.json…
PY
```

The generated files are committed so the repository is readable without the clone: `migration/source-catalogue.json`,
`migration/status.json`, `migration/dependency-map.json`, `migration/compatibility.md`,
`migration/test-results.json`.
