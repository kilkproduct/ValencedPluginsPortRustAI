# API compatibility: Valenced → Phoenix

Phoenix plugins receive one global, `phoenix`, described completely by
[`crates/runtime/phoenix.d.ts`](../.vendor/phoenix/crates/runtime/phoenix.d.ts). Valenced plugins imported a
module graph instead: `@valenced/patcher`, `@valenced/modules/finders`, `@valenced/discord/flux`,
`@valenced/discord/native`, `@valenced/components/*`, React and React Native. **None of the Valenced API exists
in Phoenix**, and none of it is emulated here. This page maps the categories.

## What each Phoenix surface can do

| Phoenix surface | Capability | Cannot |
| --- | --- | --- |
| `phoenix.gateway` + `on`/`hook` | Observe any gateway event; typed payloads for `messageCreate/Update/Delete/DeleteBulk`; `before` may mutate, replace or **drop** (`false`) an event; `after` sees the client's result | Reach events not in the build's registry; hook guild/channel internals that Phoenix does not dispatch to plugins |
| `phoenix.messages.onSend` | Rewrite, cancel or pass through the text of a message you send | Read the composer while typing, insert text, intercept picker sends |
| `phoenix.messages.onEmojiPick` | Turn a custom-emoji pick into arbitrary text; while a handler exists, Nitro-locked emojis count as usable in the box | Change reactions, stickers, themes, icons |
| `phoenix.messages.addLocal/updateLocal/deleteLocal` | Show device-only messages | Send, edit or delete real messages directly (use `discord.post/patch/delete`) |
| `phoenix.ui.addHeaderButton` / `addComposerButton` | Native buttons; `ButtonRemover.update({label, icon, tint})` | Place buttons anywhere else, add menu rows, navigate |
| `phoenix.ui.addMessageAccessory` | Text (optionally coloured) under or beside each message; async render; per-message `update` | Insert images, embeds, rows, or react to taps |
| `phoenix.ui.addMessageAction` | A row in the long-press menu, with `visible` and async `onPress` | Add buttons to Discord's own sheets or alerts |
| `phoenix.ui.addProfileSection` / `addProfileTab` | Text section on the main tab; a whole extra tab built from `ProfileBlock` (text, entry with images, input, buttons) | Reorder or replace Discord's badge rows, make its own bio text selectable |
| `phoenix.ui.hide(id)` | Remove any view by accessibility id, and restore it | Hide by component, class or position; know ids a build does not use |
| `phoenix.ui.onEvent` / `patchProps` / `onNode` / `find` / `mount` | Observe or intercept view events, patch props declaratively, mount a raw subtree | Patch React components, styles or the render tree |
| `phoenix.ui.openPage` / `showSheet` / `choose` / `notify` / `toast` / `copy` | Full-screen pages with highlighted code, sheets, dialogs, toasts, clipboard | Navigate Discord itself |
| `phoenix.commands.register` | `/name args` in the message box, returning text to send | Register real slash commands with Discord, add options |
| `phoenix.settings.define` | Native settings rows with live values and `onChange` | Arbitrary custom settings screens, lists, sliders |
| `phoenix.storage` | Per-plugin JSON key/value, persisted | File access, cross-plugin storage |
| `phoenix.stores.sql` | Read-only SQL over `cache.sqlite`, ≤10,000 rows | Write, transactions, schema guarantees |
| `phoenix.discord.*` | Discord REST through the app's session, plus request/response interception (`false` drops a request) | Read the session token; upload multipart files |
| `phoenix.fetch` | Plain HTTP with CORS-free access | Access the filesystem or native modules |
| `phoenix.bridge.invoke` | Raw Android host module calls by numeric ids | A stable API — last resort, unused by every port here |
| `phoenix.onUnload` | Cleanup on disable/reload/remove | — |

## Valenced category → Phoenix replacement

| Valenced | Used by originals to | Phoenix replacement here |
| --- | --- | --- |
| `getModules(withName/withProps)` + `after/instead/before` on components | Rewrite usernames, rows, embeds, counters, badges, bios | Message accessories, profile sections/tabs, message actions, `ui.hide`; if the outcome needs the row itself → **not portable** |
| `onFluxEventDispatched` / `Dispatcher.dispatch` | Clean links, un-idle, bulk-ack, fix the reactions sheet | Gateway `hook(before)` for payloads; REST for state changes; presence/reactions-store cases → **not portable** |
| Flux stores (`RelationshipStore`, `ChannelStore`, `ReadStateStore`, `MessageStore`) | Read relationships, channels, unread state | `discord.get` (`/users/@me/relationships`) and read-only `stores.sql` |
| `FileModule` + `FormData` upload | Send generated images (petpet) | Post the image URL and let Discord unfurl it |
| `HttpModule` / `HTTP.get` | Redirect the GIF picker, renew signed URLs | `discord.get/post` + `onRequest` interception |
| `Clipboard.setString` patching | Clean URLs on copy | A `Copy cleaned text` message action, plus `ui.copy` |
| React Native `<Text selectable>`, `Design.*` components | Selectable bios, settings UIs | Profile tabs with Copy buttons, native settings |
| Native Android modules (`.kt`) | Themes, blur, avatars on pills, timeout colours, WebView injection | No equivalent; those plugins are class **C/E** |
| `plugin.jsonStorage` | Settings persistence | `phoenix.storage` + `phoenix.settings` |
| `plugin.requireReload()` | Apply patches that cannot be live | `onChange` handlers; live where the API allows |
| Valenced Themes API | Theme packs | Nothing: Phoenix has no plugin theme system |

## Patterns worth copying

```ts
// Drop an event entirely (hide blocked users' messages).
phoenix.hook(phoenix.gateway.messageCreate, { before: (m) => (blocked.has(m.author.id) ? false : undefined) });

// Rewrite outgoing text (tracking parameters, emoji links).
phoenix.messages.onSend((text) => (changed === text ? undefined : changed));

// Hide a button and reflect a setting live.
const hide = new Map<string, Phoenix.Remover>();
const sync = (id: string, on: boolean) => { /* add/remove in `hide` */ };

// Render a per-message label, coloured.
phoenix.ui.addMessageAccessory({ placement: "header", render: ({ message }) => ({ text, color: 0xffff3b30 }) });

// Ask something once, then remember it.
const res = await phoenix.discord.get("/users/@me"); // rejects until the app has made a request
```

## Anti-patterns

- **Inventing API.** No `phoenix.navigation`, no `phoenix.themes`, no `messages.insertText`, no
  `gateway.memberUpdate` unless the build exposes it. `phoenix.gateway` is an index signature: a typo yields
  `undefined`, and `phoenix.on(undefined, …)` is a runtime error, so gate optional events on truthiness.
- **Caching settings at load.** Read `settings.x` where you use it; the returned object tracks the user.
- **Assuming a cache schema.** Wrap `stores.sql` and degrade.
- **Polling.** No timers exist; use events and accessory renders.
- **Swallowing presses to simulate a patch.** `ui.onEvent(..., { intercept: true })` with `return true`
  consumes the event for real; prefer copying and returning `false` unless blocking is the point.
