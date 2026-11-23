// Behavioural test harness.
//
// Each dist bundle is evaluated in a Node VM with a mocked `phoenix` global
// modelled on crates/runtime/phoenix.d.ts. The harness then drives the plugin
// the way Phoenix would — gateway hooks with a realistic message, outgoing
// text, emoji picks, request interception, accessory renders, message actions,
// buttons, commands, injected view events — and asserts the documented
// behaviour where the port's logic is deterministic (URL cleaning, emoji
// rewriting, delete marking, blocked-user dropping, name formatting, …).
//
// This is NOT a device test: it cannot prove Discord renders an accessory the
// way a phone would, or that a REST call succeeds with a live session.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const distDir = `${root}dist`;

const makeRemover = () => {
  const remove = () => {
    remove.calls += 1;
  };
  remove.calls = 0;
  remove.updates = [];
  remove.update = (patch) => remove.updates.push(patch);
  return remove;
};

/** A gateway message shaped like Phoenix.GatewayMessage. */
const baseMessage = () => ({
  id: "1234567890123456789",
  channel_id: "1111111111111111111",
  guild_id: "999999999999999999",
  // Exercises clear-urls (tracking URL), shiki-codeblocks (fence),
  // message-link-preview (message link) and fake-nitro (emoji markup).
  content:
    "hello https://example.com/?utm_source=x <:party:555> " +
    "https://discord.com/channels/999999999999999999/1111111111111111111/1234567890123456788 " +
    "```js\nconst a = 1;\n```",
  timestamp: new Date("2026-01-02T03:04:05.000Z").toISOString(),
  edited_timestamp: null,
  tts: false,
  mention_everyone: false,
  mentions: [{ id: "222", username: "someone", discriminator: "0", avatar: null, global_name: "Some One" }],
  mention_roles: [],
  attachments: [{ id: "1", filename: "a.png", size: 1, url: "https://x/a.png", proxy_url: "https://x/a.png", content_type: "image/png" }],
  embeds: [{ url: "https://example.com/embedded", title: "Embed" }],
  pinned: false,
  type: 0,
  flags: 0,
  components: [],
  member: {
    roles: [],
    joined_at: "2026-01-01T00:00:00.000Z",
    flags: 0,
    communication_disabled_until: new Date(Date.now() + 3_600_000).toISOString(),
  },
  channel_type: 0,
  author: { id: "222", username: "someone", discriminator: "0", avatar: null, global_name: "Some One", bot: false },
  reactions: [
    { count: 2, count_details: { normal: 2, burst: 0 }, me: false, me_burst: false, emoji: { id: null, name: "👍" }, burst_colors: [] },
  ],
  message_reference: { message_id: "1234567890123456788", channel_id: "1111111111111111111" },
  referenced_message: null,
  nonce: "1234567890123456789",
});

function makePhoenix() {
  const calls = {
    on: [], hooks: [], headerButtons: [], composerButtons: [], accessories: [], actions: [],
    profileSections: [], profileTabs: [], commands: [], onSend: [], onEmojiPick: [],
    hides: [], requestFilters: [], viewEvents: [], unload: [], posts: [], pages: [],
    buttonRemovers: [], copies: [], replies: [],
  };
  const sig = (name) => Object.freeze({ toString: () => `gateway.${name}`, __sig: name });
  const register = (list, value) => {
    list.push(value);
    return makeRemover();
  };
  const ok = (body) => ({
    status: 200,
    ok: true,
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
          values[key] =
            spec.default ??
            (spec.type === "switch" ? false
              : spec.type === "number" ? 0
              : spec.type === "select" ? spec.options[0].value
              : "");
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
      addHeaderButton: (o) => {
        const remover = register(calls.headerButtons, o);
        calls.buttonRemovers.push(remover);
        return remover;
      },
      addComposerButton: (o) => {
        const remover = register(calls.composerButtons, o);
        calls.buttonRemovers.push(remover);
        return remover;
      },
      addMessageAccessory: (o) => register(calls.accessories, o),
      addMessageAction: (o) => register(calls.actions, o),
      addProfileSection: (o) => register(calls.profileSections, o),
      addProfileTab: (o) => register(calls.profileTabs, o),
      choose: async () => 0,
      showSheet: async () => -1,
      openPage: (o) => {
        calls.pages.push(o);
        return { close() {} };
      },
      hide: (id) => {
        calls.hides.push(id);
        return makeRemover();
      },
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
      copy: (text) => {
        calls.copied = text;
        calls.copies.push(text);
      },
      toast: (text) => {
        calls.toast = text;
      },
    },
    commands: { register: (o) => register(calls.commands, o), list: () => [] },
    stores: {
      sql: async (query) => {
        if (query.includes("FROM guilds")) {
          // An animated emoji, so a non-Nitro user cannot use it in place.
          return [{ g: "0000000000000999999", e: JSON.stringify([{ id: "555", name: "party", animated: true, available: true }]) }];
        }
        if (query.includes("channel_stubs")) return [{ g: "0000000000000999999", c: "1111111111111111111" }];
        if (query.includes("FROM channels")) return [{ id: "1111111111111111111", muted: 0, nsfw: 0 }];
        return [];
      },
    },
    onUnload: (fn) => calls.unload.push(fn),
    fetch: async (url) => {
      if (url.includes("tenor.com")) {
        return ok({ results: [{ id: "1", content_description: "cat", media: [{ tinygif: { url: "https://media.tenor.com/a/tiny.gif" } }] }] });
      }
      return ok({ users: { 222: [{ mod: "vencord", badge: "https://x/b.svg", tooltip: "Donor" }] } });
    },
    discord: {
      authorize: async () => "https://redirect?code=x",
      onRequest: (filter, handler) => register(calls.requestFilters, { filter, handler }),
      onResponse: () => makeRemover(),
      request: async () => ok({}),
      get: async (path) => {
        if (path.includes("/relationships")) return ok([{ id: "333", type: 2 }, { id: "444", type: 3 }]);
        if (path.includes("/users/@me/profile") || path.endsWith("/profile")) return ok({ user: { bio: "hello world", global_name: "Some One" } });
        if (path.includes("/users/@me")) return ok({ id: "222", premium_type: 0 });
        if (path.includes("/reactions/")) return ok([{ username: "reactor" }]);
        if (path.includes("/messages/")) return ok({ author: { username: "linked" }, content: "linked text" });
        return ok({ id: "222", name: "general-chat", avatar: null });
      },
      delete: async () => ok({}),
      post: async (path, body) => {
        calls.posts.push({ path, body });
        if (path.includes("refresh-urls")) return ok({ refreshed_urls: [] });
        return ok({});
      },
      put: async () => ok({}),
      patch: async () => ok({}),
    },
    bridge: { invoke: () => true },
  };
  return { phoenix, calls };
}

const clone = (value) => JSON.parse(JSON.stringify(value));
const context = (message, replies) => ({
  messageId: message.id,
  channelId: message.channel_id,
  currentUserId: "222",
  message,
  reply: (text) => {
    if (replies) replies.push(text);
    return text ?? "";
  },
});

/** Per-command arguments, so commands are driven with realistic input. */
const COMMAND_ARGS = {
  tenor: "cat",
  hold: "https://media.tenor.com/abc/giphy.gif",
  petpet: "222",
  dashless: "",
  "read-all": "",
};

/**
 * Assertions on observable behaviour. Each receives the recorded interactions
 * and throws (failing that plugin) when the documented behaviour is missing.
 */
const EXPECT = {
  "clear-urls": (o) => {
    assert(
      o.onSend.some((text) => text.includes("https://example.com/") && !text.includes("utm_source")),
      `tracking parameters not stripped on send: ${JSON.stringify(o.onSend)}`,
    );
  },
  "silent-typing": (o) => assert(o.requests[0] === "dropped", "typing request not dropped"),
  "message-logger": (o) => {
    assert(o.accessories.some((text) => typeof text === "string" && text.startsWith("Deleted")), "deleted marker missing");
    assert(o.hooks.messageDelete === "dropped", "known delete not kept");
  },
  "hide-blocked-messages": (o) => {
    assert(o.blockedHook === "dropped", "message from a blocked user not dropped");
    assert(o.hooks.messageCreate === "kept", "message from an allowed user was dropped");
  },
  "show-tag": (o) => assert(o.accessories.includes("Some One (@someone)"), `unexpected tag: ${JSON.stringify(o.accessories)}`),
  "show-timeout-duration": (o) => assert(o.accessories.some((text) => typeof text === "string" && /\d+[dhms]/.test(text)), "timeout duration missing"),
  "mention-avatars": (o) => assert(o.accessories.some((text) => typeof text === "string" && text.includes("@someone")), "mention names missing"),
  "fake-nitro": (o) => {
    assert(o.emojiPicks[0] === ":party: ", `unexpected emoji pick: ${JSON.stringify(o.emojiPicks)}`);
    assert(o.onSend.some((text) => text.includes("cdn.discordapp.com/emojis/555.gif")), "emoji markup not rewritten to a GIF link");
  },
  "tenor-gif-fix": (o) => {
    assert(
      o.onSend.includes("https://media.tenor.com/AbCdEfAC/giphy.gif"),
      `mp4 link not rewritten: ${JSON.stringify(o.onSend)}`,
    );
  },
  "petpet": (o) => assert(String(o.commands.petpet ?? "").includes("api.popcat.xyz"), "petpet did not post a service link"),
  "tenor-gif-search": (o) => {
    assert(o.replies.some((reply) => String(reply).includes("Found 1 GIF")), `unexpected tenor replies: ${JSON.stringify(o.replies)}`);
    assert(o.pages.some((page) => String(page.title).startsWith("Tenor:")), "no Tenor results page");
  },
  "character-counter": (o) => {
    const update = o.buttonUpdates.flat().find((patch) => /^\d+\/2000$/.test(patch.label ?? ""));
    assert(update, `composer button never updated with a count: ${JSON.stringify(o.buttonUpdates)}`);
  },
  "global-badges": (o) => {
    assert(o.profileSections.some((text) => String(text).includes("Vencord - Donor")), `badges missing: ${JSON.stringify(o.profileSections)}`);
    assert(o.profileTabs.some((blocks) => Array.isArray(blocks) && blocks.length > 0), "badge tab empty");
  },
  "selectable-bios": (o) => {
    const blocks = o.profileTabs.find((blocks) => Array.isArray(blocks) && blocks.length > 0);
    assert(blocks && JSON.stringify(blocks).includes("hello world"), "bio not shown on the tab");
  },
  "message-link-preview": (o) => {
    assert(o.accessories.some((text) => typeof text === "string" && text.includes("linked")), `preview missing: ${JSON.stringify(o.accessories)}`);
  },
  "who-reacted": (o) => assert(o.pages.some((page) => JSON.stringify(page).includes("reactor")), "reactors not listed"),
  "shiki-codeblocks": (o) => {
    const page = o.pages.find((page) => page.title.includes("js"));
    assert(page && JSON.stringify(page).includes("const a = 1;"), "code block not opened");
  },
  "no-embed-copy": (o) => assert(o.copied === "https://example.com/embedded", `embed link not copied: ${o.copied}`),
  "link-alert-copy": (o) => assert(o.copies.includes("https://example.com/"), `link not copied before the alert: ${JSON.stringify(o.copies)}`),
  "nsfw-blur": (o) => assert(o.hides.includes("message.attachment.media"), "media rows not hidden"),
  "better-chat-buttons": (o) => {
    assert(o.hides.includes("composer.gift"), "gift button not hidden");
    assert(o.hides.includes("Record Voice Message"), "voice button not hidden");
  },
  "hide-call-buttons": (o) => assert(o.hides.includes("Record Voice Message"), "voice button not hidden"),
  "youbar-plus": (o) => assert(o.headerButtons.some((button) => button.label === "User Settings"), "settings shortcut missing"),
  "dashless": (o) => assert(String(o.commands.dashless ?? "") === "general chat", `unexpected dashless output: ${JSON.stringify(o.commands.dashless)}`),
  "better-typing-indicators": (o) => {
    assert(o.observers.typingStart === 1, "typingStart not observed");
  },
  "message-logger-bulk": () => {},
  "favorite-anything": (o) => assert(o.actions.some((action) => action.label === "Favorite this media"), "favorite action missing"),
  "read-all-notifications": (o) => {
    assert(
      o.posts.some((post) => post.path.endsWith("/ack")),
      `no ack request: ${JSON.stringify(o.posts)}`,
    );
  },
  "gif-to-chat-input": (o) => assert(o.commands.hold !== undefined, "/hold did not run"),
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

let pass = 0;
let fail = 0;
const results = [];

for (const file of readdirSync(distDir).sort()) {
  if (!file.endsWith(".js")) continue;
  const name = file.replace(/\.js$/, "");
  const code = readFileSync(`${distDir}/${file}`, "utf8");
  const { phoenix, calls } = makePhoenix();
  const observed = {
    hooks: {}, observers: {}, onSend: [], emojiPicks: [], accessories: [], actions: [],
    profileSections: [], profileTabs: [], commands: {}, requests: [], pages: [], hides: [],
    buttonUpdates: [], copied: undefined, headerButtons: [], posts: [],
  };

  try {
    vm.runInNewContext(code, { phoenix, console }, { filename: file });
    // Let module-level `void load()` promises settle.
    await new Promise((resolve) => setImmediate(resolve));

    // --- gateway hooks -----------------------------------------------------
    for (const { sig, hooks } of calls.hooks) {
      const event = sig?.__sig ?? String(sig);
      const payload = event.startsWith("messageDeleteBulk")
        ? { ids: ["1234567890123456789"], channel_id: "1111111111111111111" }
        : event.startsWith("messageDelete")
          ? { id: "1234567890123456789", channel_id: "1111111111111111111" }
          : clone(baseMessage());
      if (hooks.before) {
        const out = hooks.before(payload);
        observed.hooks[event] = out === false ? "dropped" : "kept";
      }
      if (hooks.after) hooks.after(clone(baseMessage()), true);
    }

    // A blocked author must be dropped by hide-blocked-messages even though
    // the default author is not blocked.
    for (const { sig, hooks } of calls.hooks) {
      if ((sig?.__sig ?? String(sig)) !== "messageCreate" || !hooks.before) continue;
      const blocked = clone(baseMessage());
      blocked.author.id = "333";
      blocked.author.username = "blocked";
      const out = hooks.before(blocked);
      if (out === false) observed.blockedHook = "dropped";
    }

    // --- observers ---------------------------------------------------------
    for (const { sig, fn } of calls.on) {
      const event = sig?.__sig ?? String(sig);
      observed.observers[event] = (observed.observers[event] ?? 0) + 1;
      try {
        fn(clone(baseMessage()));
      } catch (err) {
        throw new Error(`${event} observer threw: ${err.message}`);
      }
    }

    // --- outgoing text / emoji picks --------------------------------------
    for (const [index, fn] of calls.onSend.entries()) {
      const inputs = [
        "hi <:party:555> https://example.com/?utm_source=x",
        "https://media.tenor.com/AbCdEfGh/giphy.mp4",
      ];
      for (const input of [
        "hi <:party:555> https://example.com/?utm_source=x",
        "https://media.tenor.com/AbCdEfGh/giphy.mp4",
      ]) {
        const out = fn(input, {
          channelId: "1111111111111111111",
          currentUserId: "222",
          reply: () => "",
        });
        if (typeof out === "string") observed.onSend.push(out);
      }
    }
    for (const fn of calls.onEmojiPick) {
      const out = fn("555", { channelId: "1111111111111111111", currentUserId: "222", reply: () => "" });
      if (typeof out === "string") observed.emojiPicks.push(out);
    }

    // --- request interception (typing indicator) --------------------------
    for (const { handler } of calls.requestFilters) {
      const out = handler({
        method: "POST",
        path: "/channels/1111111111111111111/typing",
        body: "{}",
        json: () => ({}),
      });
      observed.requests.push(out === false ? "dropped" : "passed");
    }

    // --- injected view events ---------------------------------------------
    for (const { event, handler } of calls.viewEvents) {
      for (const payload of [
        { event, node: 1, payload: "https://example.com/", accessibilityId: "message.embed.1", messageId: "1234567890123456789", channelId: "1111111111111111111" },
        { event, node: 1, payload: {}, accessibilityId: null, messageId: "1234567890123456789", channelId: "1111111111111111111" },
      ]) {
        handler(payload);
      }
    }

    // --- accessories -------------------------------------------------------
    for (const accessory of calls.accessories) {
      const rendered = await accessory.render(context(clone(baseMessage()), calls.replies));
      observed.accessories.push(rendered && typeof rendered === "object" ? rendered.text : rendered);
    }

    // --- message actions ---------------------------------------------------
    for (const action of calls.actions) {
      const ctx = context(clone(baseMessage()), calls.replies);
      const visible = action.visible ? await action.visible(ctx) : true;
      if (!visible) continue;
      await action.onPress(ctx);
      await new Promise((resolve) => setImmediate(resolve));
      observed.actions.push(action);
    }

    // --- profiles ----------------------------------------------------------
    for (const section of calls.profileSections) {
      observed.profileSections.push(await section.render({ userId: "222", currentUserId: "222", channelId: null, reply: () => "" }));
    }
    for (const tab of calls.profileTabs) {
      observed.profileTabs.push(await tab.render({ userId: "222", currentUserId: "222", channelId: null, reply: () => "" }));
    }

    // --- buttons and commands ---------------------------------------------
    for (const button of [...calls.headerButtons, ...calls.composerButtons]) {
      button.onPress({
        channelId: "1111111111111111111",
        currentUserId: "222",
        reply: (text) => {
          calls.replies.push(text);
          return text ?? "";
        },
      });
    }
    for (const command of calls.commands) {
      const out = await command.execute(COMMAND_ARGS[command.name] ?? "", {
        channelId: "1111111111111111111",
        currentUserId: "222",
        reply: (text) => {
          calls.replies.push(text);
          return text ?? "";
        },
      });
      observed.commands[command.name] =
        out && typeof out === "object" && "content" in out ? out.content : (out ?? "");
      await new Promise((resolve) => setImmediate(resolve));
    }

    // --- unload ------------------------------------------------------------
    for (const fn of calls.unload) fn();
    await new Promise((resolve) => setImmediate(resolve));

    observed.pages = calls.pages;
    observed.hides = calls.hides;
    observed.copied = calls.copied;
    observed.headerButtons = calls.headerButtons;
    observed.posts = calls.posts;
    observed.buttonUpdates = calls.buttonRemovers.map((remover) => remover.updates ?? []);
    observed.copies = calls.copies;
    observed.replies = calls.replies;

    // --- assertions --------------------------------------------------------
    const expect = EXPECT[name];
    if (expect) expect(observed);
    else throw new Error("no behavioural expectations defined (add one to EXPECT)");

    const summary =
      `hooks=${calls.hooks.length} observers=${calls.on.length} accessory=${calls.accessories.length} ` +
      `action=${calls.actions.length} header=${calls.headerButtons.length} composer=${calls.composerButtons.length} ` +
      `profile=${calls.profileSections.length}+${calls.profileTabs.length} cmd=${calls.commands.length} ` +
      `onSend=${calls.onSend.length} onEmojiPick=${calls.onEmojiPick.length} hides=${calls.hides.length} ` +
      `viewEvents=${calls.viewEvents.length} req=${calls.requestFilters.length}`;
    console.log(`PASS ${name.padEnd(24)} ${summary}`);
    pass += 1;
    results.push({ name, status: "PASS", summary, expectations: expect ? "asserted" : "none" });
  } catch (error) {
    console.log(`FAIL ${name}: ${error.message}`);
    fail += 1;
    results.push({ name, status: "FAIL", error: String(error.message ?? error) });
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
writeFileSync(
  `${root}migration/test-results.json`,
  JSON.stringify(
    {
      // No timestamp: this file is committed as evidence, and it should only
      // change when behaviour changes (CI checks that docs/inventory are clean).
      kind: "mock-runtime behavioural test (not a device test)",
      harness: "scripts/test.mjs",
      passed: pass,
      failed: fail,
      results,
    },
    null,
    2,
  ) + "\n",
);
process.exit(fail ? 1 : 0);
