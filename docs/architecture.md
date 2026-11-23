# Architecture

## What this repository is

A collection of Phoenix Unlock plugins, one directory each, that reimplement the
[Valenced Community Plugins](https://github.com/Valenced/valenced-community-plugins) catalogue. There is no
custom loader, no runtime shim and no fork of Phoenix: every plugin is a plain TypeScript file bundled the
way Phoenix already bundles its own plugins, and Phoenix's own plugin loader installs it.

```
                     Valenced catalogue (47 plugins)
                                │
              migration/status.json  ← classification + attribution
                                │
        plugins/<name>/src/index.ts  (one file, Phoenix API only)
                                │  npm run build  (typecheck → esbuild IIFE)
                          dist/<name>.js  +  dist/index.json
                                │
                    Phoenix Unlock plugin directory
```

## Why one file per plugin

Phoenix's bundler (`web/tools/bundle-plugins.mjs`) takes `plugins/<name>/src/index.ts`, keeps the leading
`// @` comment lines as a banner, and emits `web/plugins/<name>.js` with esbuild in IIFE form. Plugins share
nothing at runtime: each bundle is evaluated on its own with a single global, `phoenix`.

This repository keeps that exact layout, so a plugin directory can be dropped into a Phoenix checkout and
bundled by Phoenix's own tool, and the `dist/` output here has the same shape
(`{name, description, warning?}` in `index.json`).

`shared/` deliberately contains **no importable code**. Phoenix bundles one file per plugin, and a plugin
directory has to stay independently installable, so a `../../shared/…` import would break both properties.
What is shared is documented instead: `shared/README.md` holds the vetted patterns for cache reads, duration
formatting, avatar URLs and the "call `/users/@me` once" retry, and each plugin inlines the few lines it
needs.

## Plugin anatomy

```ts
// @description one line, shown in the plugin list
// @version 1.0.0
// @author original author (Valenced) ; Phoenix port

const settings = phoenix.settings.define({ /* native controls */ });

phoenix.hook(phoenix.gateway.messageCreate, { before(message) { /* … */ } });
phoenix.ui.addMessageAccessory({ render: ({ message }) => /* … */ });
phoenix.commands.register({ name: "…", execute: (args, ctx) => /* … */ });
phoenix.onUnload(() => { /* undo anything Phoenix does not own */ });
```

Rules every plugin in this repository follows:

1. **Only documented API.** `crates/runtime/phoenix.d.ts` is the contract; nothing here calls an
   undocumented method or invents an event name. Events without typed payloads (`typingStart`,
   `guildCreate`, …) are looked up on `phoenix.gateway` and simply skipped when the build lacks them.
2. **Settings over hard-coding.** Every user-visible choice that the original exposed is a native Phoenix
   setting (switch/text/number/select/button).
3. **Cheap caching.** Network responses and cache reads are memoised; nothing polls. Where a recurring tick
   would be ideal (expiring state), the plugin piggybacks on accessory renders, which Phoenix drives.
4. **Cleanup.** `phoenix.onUnload` removes buttons the plugin added and clears its maps; gateway hooks,
   settings and accessories are removed by Phoenix itself.
5. **No ambient authority.** No plugin reads message content it does not display, stores what it does not
   need, or talks to a third party without saying so in its header (`// @warning`) and README.

## Data flow of a message

```
gateway event
   ├─ phoenix.hook(before)  ── clear-urls rewrites links, message-logger remembers,
   │                           hide-blocked-messages may drop the message
   └─ Discord renders the row
         ├─ header accessory   ── show-tag, show-timeout-duration, better-typing-indicators
         ├─ content accessory  ── message-logger (edit history), message-link-preview
         └─ message actions    ── who-reacted, shiki-codeblocks, favorite-anything, copy actions
```

Outgoing messages go through `phoenix.messages.onSend` (text rewrites: clear-urls, fake-nitro,
tenor-gif-fix) and, where a request-level hook is needed, `phoenix.discord.onRequest` (silent-typing).

## Failure behaviour

- Every network call is wrapped: a failure logs at `warn`/`debug` and degrades (no accessory, unchanged
  message) instead of throwing inside a Discord render path.
- Cache queries are treated as best-effort: `stores.sql` is read-only, capped at 10,000 rows, and its schema
  is not a Phoenix promise, so a failed query leaves the feature inert rather than broken.
- Async work started at load (`void load()`) never blocks plugin start.
