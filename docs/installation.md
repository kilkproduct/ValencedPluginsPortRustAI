# Installing these plugins

Four ways, easiest first. All of them are verified against Phoenix Unlock's own source
(`crates/runtime/src/lib.rs`, `settings.rs`, `update.rs`, `remote.rs`) and the official site
[mantikafasi.github.io/phoenix-unlock](https://mantikafasi.github.io/phoenix-unlock/) — not guessed.

Everything below assumes you have **built** the bundles once:

```sh
git clone <this repo> && cd ValencedPluginsPortRustAI
npm install
npm run build        # writes dist/<name>.js (28 files) and phoenix/<name>/
npm test             # optional: behavioural checks against a mock runtime
```

`dist/` is gitignored, so build it yourself or attach the CI artifact
(`phoenix-community-ports-dist` from `.github/workflows/build.yml`).

---

## 1. Add one plugin from a file (no server needed)

Best for trying a plugin or two.

1. Copy `dist/<name>.js` to the phone (USB, Syncthing, Telegram to yourself — any transfer).
2. In Discord: **Settings → Phoenix Unlocker → Plugins → "Choose a .js file"**.
3. Pick the file. It is installed to the app's `files/phoenix/plugins/<name>.js` and loaded immediately;
   its page appears in the same list with its settings and an on/off switch.

The file name becomes the plugin name (`clear-urls.js` → `clear-urls`), so keep the names from `dist/` —
they are already valid (`[A-Za-z0-9_-]`).

## 2. Add one plugin from a URL

Best for keeping a plugin updated, or for installing on a phone without a cable.

1. Put `<name>.js` somewhere served over **HTTPS** (any static host: GitHub Pages, Cloudflare Pages, an
   object store, a gist's raw URL…). The URL must end in `<name>.js`; query strings and fragments are ignored.
2. In Discord: **Settings → Phoenix Unlocker → Plugins → "From a URL"**, paste
   `https://…/clear-urls.js`, press Go.
3. Phoenix downloads it, writes it to `files/phoenix/plugins/`, and loads it. Re-submitting the same URL
   replaces the installed copy — that is how you update.

Notes from the source (`crates/runtime/src/lib.rs::install`): only `https://` is accepted, the body must be
UTF-8 JavaScript, and the name comes from the last path segment. This is a per-file fetch — Phoenix's own
`version.json` updater only tracks the plugins Phoenix ships, so a URL-installed plugin is updated by
re-submitting its URL.

## 3. Bake them into the APK you are patching

Best for a fresh install or for a device you are setting up anyway.

1. On the phone (or a desktop browser), open the official patcher:
   **https://mantikafasi.github.io/phoenix-unlock/**
2. Choose the Discord build, density and language, then under **Plugins** enable the
   **"Plugin runtime"** (required for *any* plugin, including these).
3. Under **"Your plugins"**, pick any of these `.js` files (or paste one's source into the box). This is
   where `dist/<name>.js` goes. They run alongside the bundled ones; their `// @description`,
   `// @version` and `// @author` lines are what Discord shows for them.
4. Press **Patch Discord** and install the APK. The chosen plugins are installed on first start and can be
   toggled later under Settings → Phoenix Unlocker.

This is the only route that works without a running Phoenix build already on the phone.

## 4. From a local URL, or scripted over the debug shell (developers)

Two sub-options, both needing **ADB** (`adb` over USB or Wi-Fi).

### 4a. Serve `dist/` and install by URL

```sh
cd dist && python3 -m http.server 8000     # serves http://127.0.0.1:8000/<name>.js
adb reverse tcp:8000 tcp:8000              # phone's localhost:8000 → your machine
```

Then use **Plugins → "From a URL"** with `http://127.0.0.1:8000/clear-urls.js`… except Phoenix requires
`https://`. For a plain-HTTP local server, use the debug shell below instead.

### 4b. The localhost debug shell (Remote Debug Shell)

Phoenix exposes a localhost-only HTTP server on `127.0.0.1:4242` (`crates/runtime/src/remote.rs`), enabled by
the **Remote Debug Shell** option. With ADB port forwarding:

```sh
adb forward tcp:4242 tcp:4242

# list what is installed, and its state
curl -s http://127.0.0.1:4242/plugins

# install (or replace) a plugin from the built bundle; the file name is the plugin name
curl -s -X PUT --data-binary @dist/clear-urls.js http://127.0.0.1:4242/plugins/clear-urls
# → {"installed":"clear-urls"}

# manage one plugin
curl -s -X POST http://127.0.0.1:4242/plugins/clear-urls/reload
curl -s -X POST http://127.0.0.1:4242/plugins/clear-urls/disable
curl -s -X POST http://127.0.0.1:4242/plugins/clear-urls/enable
curl -s -X DELETE http://127.0.0.1:4242/plugins/clear-urls

# see what a plugin logged (useful when a port misbehaves on a device)
curl -s http://127.0.0.1:4242/logs
curl -s "http://127.0.0.1:4242/tree?depth=3"     # live view tree, for debugging selectors/ids
```

Install everything at once:

```sh
for f in dist/*.js; do
  name=$(basename "$f" .js)
  curl -s -X PUT --data-binary @"$f" "http://127.0.0.1:4242/plugins/$name"
  echo " $name"
done
```

The shell also has `POST /eval` (run JS in the console context) and `GET /status`, `GET /ops`,
`GET /events`, `POST /clear`. It binds to `127.0.0.1` only, so it is reachable solely through ADB.

## 5. As part of a Phoenix Unlock build

If you build Phoenix from source, `npm run build` also writes Phoenix's own plugin layout to `phoenix/`:

```
phoenix/clear-urls/src/index.ts    the source
phoenix/clear-urls/clear-urls.js   the bundle
```

```sh
cp -r phoenix/* /path/to/phoenix-unlock/plugins/
cd /path/to/phoenix-unlock
node web/tools/bundle-plugins.mjs   # writes web/plugins/<name>.js + index.json + version.json
```

`web/tools/bundle-plugins.mjs` treats `plugins/<name>/src/index.ts` as the entry, keeps the leading `// @`
lines as the description banner, and copies native artifacts when present (none here — these are pure
TypeScript ports). The result can be published like Phoenix's own site, which means the in-app updater can
deliver them through `version.json` crc32s.

---

## What "installed" looks like

- **Settings → Phoenix Unlocker → Plugins** lists every plugin with a status of `running`, `off` or `failed`.
- Tapping one opens its page: its `// @description`, its **settings** (rendered as native Phoenix rows —
  switches, text fields, number fields, select rows and buttons), **Reload**, **Edit code** (inline editor,
  "Save and restart") and **Uninstall**.
- If a plugin throws at load, its page says `Failed: …`; the same message appears in the debug shell's
  `/logs`.
- Turning a plugin off runs its `onUnload` cleanup (here: removing any buttons it added and clearing caches).

## Requirements and caveats for these specific ports

| Thing | Why it matters |
| --- | --- |
| **Plugin runtime enabled** | Choosing plugins on the patcher without the runtime produces an app that ignores them. |
| **Discord build 356207 (versionCode)** | The verified build for the current Phoenix release. Later alphas usually work but are untested upstream. |
| **Discord session made at least one request** | `phoenix.discord.*` rejects until the app has made a request of its own; the ports that read your profile or relationships retry on the next message. |
| **Rebuild after editing source** | Phoenix loads `.js` bundles, not TypeScript. Run `npm run build` and re-install the file. |
| **No upstream support** | These are third-party ports (MIT). Phoenix's authors did not write or test them; a plugin that misbehaves should be disabled, and the issue is in this repository. |
| **Third-party services** | `global-badges` → badges.equicord.org, `petpet` → api.popcat.xyz, `tenor-gif-search` → api.tenor.com. Each carries a `// @warning` header that Phoenix shows in the plugin list. |

## Where the official documentation lives

- Patcher and bundled plugin list: <https://mantikafasi.github.io/phoenix-unlock/>
- Agent/development notes: [`AGENTS.md`](https://github.com/mantikafasi/phoenix-unlock/blob/main/AGENTS.md)
- Plugin API (the contract these ports are built against):
  [`crates/runtime/phoenix.d.ts`](https://github.com/mantikafasi/phoenix-unlock/blob/main/crates/runtime/phoenix.d.ts)
- Example plugin: [`plugins/example`](https://github.com/mantikafasi/phoenix-unlock/tree/main/plugins/example)
- Bundler: [`web/tools/bundle-plugins.mjs`](https://github.com/mantikafasi/phoenix-unlock/blob/main/web/tools/bundle-plugins.mjs)

For the original Valenced ecosystem (plugin development, repository/index generation, publishing), see
<https://valenced.app/docs/plugin-development/> — useful for understanding what a port was meant to do, but
its APIs do not exist in Phoenix.
