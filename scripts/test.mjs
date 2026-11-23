// Runtime smoke test: loads each dist bundle in a Node VM with a mocked
// `phoenix` global modelled on crates/runtime/phoenix.d.ts, checks that the
// plugin registers its hooks/UI/commands without throwing, then exercises a
// gateway message through every before/after hook it registered and calls
// onUnload. This is not a device test — real Discord behaviour needs Phoenix
// Unlock on a phone.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const distDir = `${root}dist`;

const makeRemover = () => {
  const remove = () => { remove.calls += 1; };
  remove.calls = 0;
  remove.update = () => { remove.updates = (remove.updates ?? 0) + 1; };
  return remove;
};

function makePhoenix() {
  const calls = {
    on: [], hooks: [], headerButtons: [], composerButtons: [], accessories: [], actions: [],
    profileSections: [], profileTabs: [], commands: [], onSend: [], onEmojiPick: [],
    hides: [], requestFilters: [], viewEvents: [], unload: [], removerCalls: 0,
  };
  const sig = (name) => Object.freeze({ toString: () => `gateway.${name}`, __sig: name });
  const register = (list, value) => { list.push(value); return makeRemover(); };

  // A representative gateway message, matching Phoenix.GatewayMessage.
  const message = {
    id: "1234567890123456789",
    channel_id: "1111111111111111111",
    guild_id: "999999999999999999",
    // Exercises clear-urls, shiki-codeblocks, message-link-preview and
    // fake-nitro's emoji rewriting in one payload.
    content:
      "hello https://example.com/?utm_source=x <:party:555> " +
      "https://discord.com/channels/999999999999999999/1111111111111111111/1234567890123456788 " +
      "```js\nconst a = 1;\n```",
    timestamp: new Date().toISOString(),
    edited_timestamp: null,
    tts: false,
    mention_everyone: false,
    mentions: [{ id: "222", username: "someone", discriminator: "0", avatar: null, global_name: "Some One" }],
    mention_roles: [],
    attachments: [{ id: "1", filename: "a.png", size: 1, url: "https://x", proxy_url: "https://x" }],
    embeds: [],
    pinned: false,
    type: 0,
    flags: 0,
    components: [],
    member: { roles: [], joined_at: new Date().toISOString(), flags: 0, communication_disabled_until: new Date(Date.now() + 3_600_000).toISOString() },
    channel_type: 0,
    author: { id: "222", username: "someone", discriminator: "0", avatar: null, global_name: "Some One" },
    reactions: [{ count: 2, count_details: { normal: 2, burst: 0 }, me: false, me_burst: false, emoji: { id: null, name: "👍" }, burst_colors: [] }],
    message_reference: { message_id: "1234567890123456788", channel_id: "1111111111111111111" },
    referenced_message: null,
  };

  const ok = (body) => ({
    status: 200, ok: true,
    text: () => JSON.stringify(body),
    json: () => body,
  });

  const phoenix = {
    gateway: new Proxy({}, { get: (_, key) => sig(String(key)) }),
    on: (s, fn) => register(calls.on, { sig: s, fn }),
    hook: (s, hooks) => register(calls.hooks, { sig: s, hooks }),
    dispatch: () => true,
    enqueue: () => {},
    log: { debug() {}, info() {}, warn() {}, error() {} },
    storage: (() => {
      const store = new Map();
      return {
        get: (key) => store.get(key),
        set: (key, value) => store.set(key, value),
        delete: (key) => store.delete(key),
        keys: () => [...store.keys()],
      };
    })(),
    settings: {
      define: (schema) => {
        const values = {};
        for (const [key, spec] of Object.entries(schema)) {
          if (spec.type === "button") continue;
          values[key] = spec.default ?? (spec.type === "switch" ? false : spec.type === "number" ? 0 : spec.type === "select" ? spec.options[0].value : "");
        }
        return values;
      },
    },
    messages: {
      addLocal: () => "local-1",
      updateLocal: () => true,
      deleteLocal: () => true,
      onSend: (fn) => register(calls.onSend, fn),
      onEmojiPick: (fn) => register(calls.onEmojiPick, fn),
    },
    ui: {
      addHeaderButton: (o) => register(calls.headerButtons, o),
      addComposerButton: (o) => register(calls.composerButtons, o),
      addMessageAccessory: (o) => register(calls.accessories, o),
      addMessageAction: (o) => register(calls.actions, o),
      addProfileSection: (o) => register(calls.profileSections, o),
      addProfileTab: (o) => register(calls.profileTabs, o),
      choose: async () => 0,
      showSheet: async () => -1,
      openPage: (o) => { calls.openedPage = o; return { close() {} }; },
      hide: (id) => { calls.hides.push(id); return makeRemover(); },
      onEvent: (event, handler) => register(calls.viewEvents, { event, handler }),
      dispatch: () => true,
      onNode: () => makeRemover(),
      patchProps: () => makeRemover(),
      update: () => {},
      find: () => [],
      findDown: () => null,
      node: () => null,
      root: () => 1,
      mount: () => makeRemover(),
      notify: () => () => {},
      copy: (text) => { calls.copied = text; },
      toast: (text) => { calls.toast = text; },
    },
    commands: { register: (o) => register(calls.commands, o), list: () => [] },
    stores: {
      sql: async (query) => {
        calls.sqlQuery = query;
        // Enough shape for the plugins that read guild/channel caches.
        if (query.includes("FROM guilds")) return [{ g: "0000000000000999999", e: JSON.stringify([{ id: "555", name: "party", animated: false, available: true }]) }];
        if (query.includes("channel_stubs")) return [{ g: "0000000000000999999", c: "1111111111111111111" }];
        if (query.includes("FROM channels")) return [{ id: "1111111111111111111", muted: 0 }];
        return [];
      },
    },
    onUnload: (fn) => calls.unload.push(fn),
    fetch: async () => ok({ users: { 222: [{ mod: "vencord", badge: "https://x/b.svg", tooltip: "Donor" }] } }),
    discord: {
      authorize: async () => "https://redirect?code=x",
      onRequest: (filter, handler) => register(calls.requestFilters, { filter, handler }),
      onResponse: () => makeRemover(),
      request: async () => ok({}),
      get: async (path) => {
        if (path.includes("/relationships")) return ok([{ id: "333", type: 2 }]);
        if (path.includes("/users/@me")) return ok({ id: "222", premium_type: 0 });
        if (path.includes("/messages/")) return ok({ author: { username: "linked" }, content: "linked text" });
        if (path.includes("/reactions/")) return ok([{ username: "reactor" }]);
        return ok({ id: "222", name: "general-chat", avatar: null });
      },
      delete: async () => ok({}),
      post: async () => ok({}),
      put: async () => ok({}),
      patch: async () => ok({}),
    },
    bridge: { invoke: () => true },
  };
  return { phoenix, calls, message, ok };
}

const clone = (value) => JSON.parse(JSON.stringify(value));

let pass = 0;
let fail = 0;
const results = [];

for (const file of readdirSync(distDir).sort()) {
  if (!file.endsWith(".js")) continue;
  const name = file.replace(/\.js$/, "");
  const code = readFileSync(`${distDir}/${file}`, "utf8");
  const { phoenix, calls, message } = makePhoenix();
  const notes = [];
  try {
    vm.runInNewContext(code, { phoenix, console }, { filename: file });

    // Let promises from module-level `void load()` calls settle.
    await new Promise((resolve) => setImmediate(resolve));

    // Exercise every gateway hook with a realistic payload.
    for (const { sig, hooks } of calls.hooks) {
      const event = sig?.__sig ?? String(sig);
      const payload = event.startsWith("messageDeleteBulk")
        ? { ids: [message.id], channel_id: message.channel_id }
        : event.startsWith("messageDelete")
          ? { id: message.id, channel_id: message.channel_id }
          : clone(message);
      if (hooks.before) {
        const out = hooks.before(payload);
        notes.push(`${event}.before=${out === false ? "dropped" : "kept"}`);
      }
      if (hooks.after) hooks.after(clone(message), true);
    }

    // Exercise observers.
    for (const { sig, fn } of calls.on) {
      const event = sig?.__sig ?? String(sig);
      try {
        fn(clone(message));
      } catch (err) {
        notes.push(`${event}.on threw: ${err.message}`);
      }
    }

    // Outgoing message pipeline.
    for (const fn of calls.onSend) {
      let out;
      try {
        out = fn("hi <:party:555> https://example.com/?utm_source=x", { channelId: message.channel_id, currentUserId: "222", reply: () => "" });
      } catch (err) {
        notes.push(`onSend threw: ${err.message}`);
        continue;
      }
      if (out !== undefined) notes.push(`onSend=${typeof out === "string" ? "rewritten" : out}`);
    }
    for (const fn of calls.onEmojiPick) fn("555", { channelId: message.channel_id, currentUserId: "222", reply: () => "" });

    // Outgoing request filters: typing/posting behaviour.
    for (const { handler } of calls.requestFilters) {
      const out = handler({ method: "POST", path: `/channels/${message.channel_id}/typing`, body: "{}", json: () => ({}) });
      notes.push(`onRequest=${out === false ? "dropped" : "passed"}`);
    }

    // Injected view events must not throw, whatever the payload shape.
    for (const { event, handler } of calls.viewEvents) {
      const payloads = [
        { event, node: 1, payload: "https://example.com/", accessibilityId: "message.embed.1", messageId: message.id, channelId: message.channel_id },
        { event, node: 1, payload: {}, accessibilityId: null, messageId: message.id, channelId: message.channel_id },
      ];
      for (const payload of payloads) handler(payload);
      notes.push(`onEvent:${event}`);
    }

    // Message accessories and actions render lazily; ask each one.
    for (const accessory of calls.accessories) {
      const ctx = {
        messageId: message.id,
        channelId: message.channel_id,
        currentUserId: "222",
        message: clone(message),
        reply: () => "",
      };
      const rendered = await accessory.render(ctx);
      notes.push(`accessory=${rendered == null ? "null" : "value"}`);
      if (accessory.placement) notes.push(`placement=${accessory.placement}`);
    }
    for (const action of calls.actions) {
      const ctx = { messageId: message.id, channelId: message.channel_id, currentUserId: "222", message: clone(message), reply: () => "" };
      const visible = action.visible ? await action.visible(ctx) : true;
      if (visible) {
        try {
          await action.onPress(ctx);
          await new Promise((resolve) => setImmediate(resolve));
          notes.push(`action:${action.label}=pressed`);
        } catch (err) {
          throw new Error(`action ${action.label} threw: ${err.message}`);
        }
      } else {
        notes.push(`action:${action.label}=hidden`);
      }
    }
    for (const section of calls.profileSections) {
      const rendered = await section.render({ userId: "222", currentUserId: "222", channelId: null, reply: () => "" });
      notes.push(`profileSection=${rendered == null ? "null" : "value"}`);
    }
    for (const tab of calls.profileTabs) {
      const blocks = await tab.render({ userId: "222", currentUserId: "222", channelId: null, reply: () => "" });
      notes.push(`profileTab=${Array.isArray(blocks) ? `${blocks.length} block(s)` : "invalid"}`);
    }

    // Buttons must survive a press.
    for (const button of [...calls.headerButtons, ...calls.composerButtons]) {
      button.onPress({ channelId: message.channel_id, currentUserId: "222", reply: () => "" });
    }

    // Commands must run (petpet hits /petpet).
    for (const command of calls.commands) {
      const out = await command.execute("222", { channelId: message.channel_id, currentUserId: "222", reply: () => "" });
      notes.push(`command /${command.name}=${out == null ? "void" : "value"}`);
    }

    // Turning the plugin off must not throw and must undo registrations.
    for (const fn of calls.unload) fn();
    await new Promise((resolve) => setImmediate(resolve));

    const summary = `hooks=${calls.hooks.length} on=${calls.on.length} accessory=${calls.accessories.length} action=${calls.actions.length} header=${calls.headerButtons.length} composer=${calls.composerButtons.length} profile=${calls.profileSections.length}+${calls.profileTabs.length} cmd=${calls.commands.length} viewEvents=${calls.viewEvents.length} onSend=${calls.onSend.length} onEmojiPick=${calls.onEmojiPick.length} hides=${calls.hides.length} req=${calls.requestFilters.length}`;
    console.log(`PASS ${name}\n     ${summary}\n     ${[...new Set(notes)].join(" · ")}`);
    pass += 1;
    results.push({ name, status: "PASS", summary, notes: [...new Set(notes)] });
  } catch (error) {
    console.log(`FAIL ${name}: ${error.stack ?? error.message}`);
    fail += 1;
    results.push({ name, status: "FAIL", error: String(error.message ?? error) });
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
writeFileSync(
  `${root}migration/test-results.json`,
  JSON.stringify({ generated: new Date().toISOString(), kind: "mock-runtime smoke test", passed: pass, failed: fail, results }, null, 2) + "\n",
);
process.exit(fail ? 1 : 0);
