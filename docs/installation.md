# Installation

## Requirements

- A phone running Phoenix Unlock (Discord Android alpha 356.7, versionCode 356207, patched), with the
  **plugin runtime** enabled at build time.
- The bundles from `dist/` (or your own build).

## Install from this repository

1. `npm install && npm run build` on a machine with Node 22+.
2. Copy `dist/<plugin>.js` to the phone (USB, Syncthing, a chat to yourself — any transfer works).
3. In Discord: **Settings → Phoenix Unlocker → Plugins → Add plugin**, then pick the `.js` file.
4. Each plugin appears on its own page under **Settings → Phoenix Unlocker → Plugins**, where its settings
   live and where it can be turned off or removed.

No reboot is needed: Phoenix loads the bundle, runs it, and the plugin's buttons, actions and commands
appear immediately. Turning a plugin off runs its `onUnload` cleanup.

## Installing the whole collection at once

`dist/index.json` lists every bundle in Phoenix's own index format:

```json
[
  { "name": "clear-urls", "description": "Removes tracking parameters from links you send and receive" }
]
```

Serve `dist/` over HTTPS and point Phoenix's plugin repository at it, or copy the directory to the phone and
add the bundles you want. (The index format matches `web/tools/bundle-plugins.mjs`; if Phoenix's own index
gains fields, add them in `scripts/build.mjs`.)

## Using a plugin directory with Phoenix's own tooling

A plugin here is already laid out for Phoenix's bundler. From a Phoenix checkout:

```sh
cp -r /path/to/phoenix-community-ports/plugins/<name> plugins/
node web/tools/bundle-plugins.mjs
```

This produces `web/plugins/<name>.js` with Phoenix's own settings, versioning (`web/version.json`, crc32 per
plugin) and OTA update metadata.

## First-run notes

- **`silent-typing`, `hide-*`, `clear-urls`, `message-logger`** work with no configuration.
- **Plugins that call the Discord API** (`global-badges`, `who-reacted`, `favorite-anything`,
  `message-link-preview`, `dashless`, `selectable-bios`, `read-all-notifications`) need the app to have made
  a request of its own first; Phoenix rejects plugin API calls until then, and the plugins retry on the next
  message.
- **Cache-backed plugins** (`fake-nitro`, `nsfw-blur`, `read-all-notifications`) read Phoenix's
  `cache.sqlite`. If the schema differs on your build they log a warning and simply do less; they never
  write to it.
- **Third-party services**: `global-badges` (badges.equicord.org), `petpet` (api.popcat.xyz),
  `tenor-gif-search` (api.tenor.com). Each plugin's header carries a `// @warning` line saying so, and the
  plugin list in Phoenix shows it.

## Uninstalling

Turn the plugin off (or remove it) in Settings → Phoenix Unlocker → Plugins. Phoenix removes listeners,
settings and UI; plugins that stored data (`favorite-anything`, `gif-to-chat-input`) keep their storage file
until the plugin is removed, and their settings pages have a "Clear" button.
