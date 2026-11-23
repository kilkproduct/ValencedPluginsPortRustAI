// Regenerates plugins/<name>/metadata.json and README.md from
// migration/status.json plus the per-plugin notes below. Run after changing a
// plugin's source or its migration status: `node scripts/docs.mjs`.
//
// The notes are the curated part: what the original did, what the port does
// instead, and what is missing. Keep them in sync with the source comments.
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const status = JSON.parse(readFileSync(`${root}migration/status.json`, "utf8"));
const byDir = new Map(status.plugins.map((plugin) => [plugin.source_dir, plugin]));

/** Per-plugin curated documentation. */
const NOTES = {
  "clear-urls": {
    original: "Hooks the send/edit paths and rewrites links with the ClearURLs rule set, plus cleans the clipboard.",
    port: "Rewrites incoming messages in gateway hooks and outgoing text in `messages.onSend`, using the original's tracking-parameter list; a message action copies cleaned text.",
    api: ["gateway.messageCreate/messageUpdate (hook before)", "messages.onSend", "ui.addMessageAction", "ui.copy"],
    features: ["Strips utm_*, fbclid, gclid and ~50 more tracking parameters", "Works on sent, edited and received messages", "Copy-without-tracking message action"],
    settings: ["Clear URLs on/off", "Clean links you send on/off"],
  },
  "silent-typing": {
    original: "Never sends typing indicators.",
    port: "Drops Discord's `POST /channels/:id/typing` request before it leaves the device.",
    api: ["discord.onRequest"],
    features: ["No typing indicator is ever sent", "Nothing else about typing changes"],
    settings: ["Silent typing on/off"],
  },
  "message-logger": {
    original: "Native-backed log of deleted messages, edits and removed attachments, with a history sheet.",
    port: "Gateway hooks keep message state in memory; two message accessories show edit history and a red `Deleted · HH:MM` marker. Deletes of known messages are dropped from the client handler so they stay on screen.",
    api: ["gateway.messageCreate/Update/Delete/DeleteBulk (hook before)", "ui.addMessageAccessory", "Remover.update"],
    features: ["Deleted messages stay, marked in red", "Earlier versions of edited messages", "Removed attachments are put back", "Ignore your own messages or bots"],
    settings: ["Deleted messages", "Edits", "Ignore your messages", "Ignore bots"],
  },
  "better-typing-indicators": {
    original: "Draws a typing indicator with user avatars inside the channel list (native helper).",
    port: "Listens to `typingStart` and names the people typing in the channel as a header accessory, expiring entries after Discord's ten-second window.",
    api: ["gateway.typingStart (on)", "gateway.messageCreate (hook after)", "ui.addMessageAccessory placement: header"],
    features: ["Names of everyone typing in the open channel", "Ten-second expiry and removal once the message is sent", "Bots optional"],
    settings: ["Show names", "Include bots"],
    limits: ["The channel list cannot be patched, so nothing is drawn there", "Requires a build that exposes `typingStart` (an event registry entry, not a typed payload)"],
  },
  "better-chat-buttons": {
    original: "Hides Apps & Commands, Gift, New Thread and Voice Message, and configures send-button collapse.",
    port: "Hides composer and header buttons by accessibility id, live, as settings change.",
    api: ["ui.hide", "settings onChange"],
    features: ["Hide the Gift button", "Hide the Voice Message button", "Hide the emoji button", "Hide the chat header search entry"],
    settings: ["Hide Gift", "Hide Voice Message", "Hide Emoji", "Hide Search"],
    limits: ["Apps & Commands and New Thread have no accessibility id known to plugins", "Send-button collapse behaviour is not exposed"],
  },
  "hide-call-buttons": {
    original: "Prunes call/video buttons from profiles, DM headers, the friends list and voice channels.",
    port: "Hides the surfaces Phoenix exposes accessibility ids for (composer voice button, header search).",
    api: ["ui.hide"],
    features: ["Hide the composer voice button", "Hide the chat header search entry"],
    settings: ["Profile voice button", "Chat header search"],
    limits: ["Profile call/video buttons, DM header call buttons, friends-list call buttons and voice-channel buttons cannot be targeted"],
  },
  "youbar-plus": {
    original: "Adds Settings, Favorites and DM buttons to the You Bar and navigates with RootNavigationRef.",
    port: "Adds the same three shortcuts as chat header buttons; each reports where the screen lives, since plugins cannot push Discord's navigator.",
    api: ["ui.addHeaderButton", "settings onChange"],
    features: ["Settings, Favorites and DM shortcuts", "Defaults match the original (Settings on)"],
    settings: ["Settings button", "Favorites button", "DMs button"],
    limits: ["Cannot open Settings, Favorites or the DM list directly: no navigation API"],
  },
  "global-badges": {
    original: "Splices badges from badges.equicord.org into the profile's badge row, with ordering and per-provider toggles.",
    port: "Fetches the same service and shows badges in a profile section and a Badges profile tab (with the badge artwork as images).",
    api: ["fetch", "ui.addProfileSection", "ui.addProfileTab"],
    features: ["17 client-mod badge providers", "Mod name as prefix, suffix or hidden", "30-minute cache with a manual refresh button"],
    settings: ["Mod name position", "Refresh badges"],
    limits: ["Cannot replace or add to Discord's own badge row", "No drag-to-reorder and no per-provider toggles (no settings list control)"],
    warnings: ["Sends requests to badges.equicord.org. The service returns all known users in one response; this plugin sends no user IDs."],
  },
  petpet: {
    original: "Sends a petpet GIF generated by api.popcat.xyz as a real uploaded attachment via FileModule and REST.",
    port: "`/petpet` resolves the target's avatar and posts the generated image URL, which Discord unfurls. Same command, same service.",
    api: ["commands.register", "discord.get", "onSend-free"],
    features: ["/petpet <mention|id>, defaults to you", "Real avatar when the user has one, default avatar otherwise"],
    warnings: ["The target's avatar URL is sent to api.popcat.xyz."],
    limits: ["Cannot upload the GIF as an attachment: Phoenix has no file-module or multipart API"],
  },
  "character-counter": {
    original: "Live character counter in the composer with colour effects.",
    port: "Counts the last sent message and shows it on a composer button, tinting yellow near Discord's 2000-character limit and red past it.",
    api: ["messages.onSend", "ui.addComposerButton", "ButtonRemover.update"],
    features: ["Count of the last message you sent", "Colour effects at the limit", "Tap to copy the last message back"],
    settings: ["Color effects"],
    limits: ["No live count while typing: plugins cannot read the composer"],
  },
  "hide-blocked-messages": {
    original: "Patches ChatManager.createRow to hide blocked/ignored rows and optionally replies to them.",
    port: "Drops messages from blocked/ignored users in a gateway before-hook; relationships are read from `/users/@me/relationships`.",
    api: ["gateway.messageCreate (hook before)", "discord.get"],
    features: ["Hide blocked users' messages", "Hide ignored users' messages", "Optionally hide replies to them"],
    settings: ["Hide blocked messages", "Hide ignored messages", "Hide replies"],
    limits: ["Hidden at the gateway, so the messages never appear (the original hid them after receipt)", "Reply detection only works when the referenced message is in the payload"],
  },
  "show-tag": {
    original: "Rewrites the rendered username to `display (@username)` and the reply preview with it.",
    port: "Emits the same text from a header message accessory.",
    api: ["ui.addMessageAccessory placement: header"],
    features: ["Username next to the display name", "Legacy discriminators and bots handled like the original", "Only-username mode"],
    settings: ["Only username"],
    limits: ["Cannot change the message row itself", "Nicknames are not exposed to accessories (global name is used)"],
  },
  "show-timeout-duration": {
    original: "Draws the remaining timeout in the native username row, in the theme's critical colour.",
    port: "Captures `communication_disabled_until` from the gateway and shows `timeout 3h 20m left` as a header accessory.",
    api: ["gateway.messageCreate (on + hook after)", "ui.addMessageAccessory"],
    features: ["Compact duration (3d 4h / 3h 20m / 12m 5s)", "Red, like Discord's own timeout styling"],
    limits: ["A snapshot per message, not a live countdown", "Cannot recolour the username row"],
  },
  "mention-avatars": {
    original: "Injects a small avatar next to every mention inline in the message text.",
    port: "Names mentioners in a header accessory and opens a page listing each mentioned user with their avatar URL.",
    api: ["ui.addMessageAccessory", "ui.addMessageAction", "ui.openPage"],
    features: ["Mention names on the message", "Full mention list with avatar links"],
    limits: ["No inline images inside message text"],
  },
  "message-link-preview": {
    original: "Renders interactive message rows under a message that links to other messages.",
    port: "Shows a compact `↳ author: text` preview per link, cached for five minutes, plus a page with the full text of every linked message.",
    api: ["ui.addMessageAccessory", "ui.addMessageAction", "discord.get"],
    features: ["Previews per message setting (default 5)", "Author and text of the linked message", "Open the linked messages in full"],
    settings: ["Previews per message"],
    limits: ["Previews are text-only, not interactive rows", "No inline height limit or tap-to-react"],
  },
  "who-reacted": {
    original: "Draws up to five reactor avatars on each reaction pill via a native helper.",
    port: "`Who reacted` message action fetches reactors per reaction and lists them in a page, newest counts included.",
    api: ["ui.addMessageAction", "discord.get", "ui.openPage"],
    features: ["Reactor names per reaction", "Caps for reactions per message and reactors per reaction, like the original"],
    settings: ["Maximum reactions", "Reactors per reaction"],
    limits: ["On demand, not drawn on the pill", "No avatars, since pages show text and buttons"],
  },
  "nsfw-blur": {
    original: "Patches createMessageContent to drop inline media and spoiler every attachment in NSFW channels.",
    port: "Hides media rows with `ui.hide`, and can drop messages with attachments in NSFW channels at the gateway. NSFW channels come from the read-only cache.",
    api: ["ui.hide", "stores.sql", "gateway.messageCreate (hook before)"],
    features: ["Media rows hidden", "Optional dropping of NSFW attachments", "Channel NSFW flags read from Phoenix's cache"],
    settings: ["Hide NSFW media", "Drop NSFW messages"],
    limits: ["No image blur: media is hidden, not blurred", "Hiding is global, not per NSFW channel"],
  },
  "shiki-codeblocks": {
    original: "Renders syntax-highlighted code blocks inline with Shiki, plus a selectable full-screen viewer.",
    port: "`View highlighted` message action opens every code block in Phoenix's own syntax-highlighting viewer.",
    api: ["ui.addMessageAction", "ui.openPage (highlight)"],
    features: ["Highlighted code viewer, one section per block", "Uses the block's language tag"],
    settings: ["Open on tap"],
    limits: ["No inline highlighted code in chat", "Shiki theme selection is not ported (Phoenix chooses the theme)"],
  },
  "dashless": {
    original: "Renders channel names with spaces instead of dashes, locally only.",
    port: "Shows the dash-less name in a header button and in `/dashless`, and never renames anything on Discord.",
    api: ["ui.addHeaderButton", "commands.register", "discord.get"],
    features: ["Header button with the dash-less channel name", "/dashless command"],
    settings: ["Header button"],
    limits: ["Cannot change the channel list rows", "Names are cached after the first lookup"],
  },
  "read-all-notifications": {
    original: "You Bar button that dispatches BULK_ACK for every unread channel.",
    port: "Header button and `/read-all` ack unread channels through `POST /channels/:id/ack`, with an optional confirmation.",
    api: ["stores.sql", "discord.post", "ui.choose", "ui.addHeaderButton", "commands.register"],
    features: ["Marks every unread channel as read", "Optional confirmation", "Optional inclusion of muted channels"],
    settings: ["Include muted channels", "Ask first"],
    limits: ["Cannot add a button under the DMs", "Unread discovery depends on Phoenix's cache schema", "Threads are not enumerated separately"],
  },
  "fake-nitro": {
    original: "Unlocks emojis everywhere, stickers, client themes, app icons and stream quality by patching ProductCatalog.",
    port: "Sends custom and animated emojis as image links, with the original's settings (size, link style, permission check). Emoji data comes from Phoenix's guild cache, and Nitro tier from `/users/@me`.",
    api: ["messages.onEmojiPick", "messages.onSend", "stores.sql", "discord.get"],
    features: ["Custom and animated emojis from any server", "`:name:` shortcodes and `<:name:id>` markup", "Emoji size and link style options"],
    settings: ["Send custom emojis", "Emoji size", "Link style", "Check permissions"],
    limits: ["Stickers, themes, app icons and stream quality are not portable: no plugin API", "Reactions keep their Nitro lock"],
  },
  "favorite-anything": {
    original: "Shows the GIF favorite star on all media and maps images/videos into GIF favorites, renewing signed URLs.",
    port: "Favorites any image or video attachment from the message menu, keeps them in plugin storage, renews expiring CDN signatures in batches via `/attachments/refresh-urls`, and lists them from settings.",
    api: ["ui.addMessageAction", "discord.post", "storage", "ui.openPage"],
    features: ["Favorite images and videos, not just GIFs", "Automatic signed-URL renewal (batched, 50 at a time)", "List and copy favorites"],
    settings: ["Renew signed URLs", "Show saved favorites", "Clear saved favorites"],
    limits: ["Not integrated with Discord's GIF picker", "Favorites live in plugin storage"],
  },
  "selectable-bios": {
    original: "Makes profile bios selectable so they can be copied.",
    port: "Adds a Bio profile tab that shows the bio with a Copy button.",
    api: ["ui.addProfileTab", "discord.get"],
    features: ["Bio on its own tab", "One-tap copy"],
    limits: ["Text inside Discord's own bio view is still not selectable"],
  },
  "tenor-gif-search": {
    original: "Redirects Discord's GIF picker to Tenor with the old Discord Tenor key.",
    port: "`/tenor <query>` searches the same API and lists results in a page; picking one copies the GIF link for the composer.",
    api: ["commands.register", "fetch", "ui.openPage", "ui.copy"],
    features: ["Tenor search with the original API key", "gif / tinygif / nanogif quality", "Result count setting"],
    settings: ["GIF quality", "Results"],
    limits: ["The GIF picker still uses Discord's provider", "No grid preview: results are a list of buttons"],
    warnings: ["Queries are sent to api.tenor.com."],
  },
  "gif-to-chat-input": {
    original: "Intercepts `gif_reply` sends and puts the GIF in the chatbox instead.",
    port: "`/hold <link>` stores a GIF link and a composer button copies it back, so a picked GIF is never auto-sent.",
    api: ["commands.register", "ui.addComposerButton", "storage", "messages.addLocal", "ui.copy"],
    features: ["Hold a GIF link across restarts", "Composer button to retrieve it", "Optional auto-copy"],
    settings: ["Copy when held"],
    limits: ["Cannot intercept the picker itself", "Cannot insert text into the composer"],
  },
  "tenor-gif-fix": {
    original: "Rewrites Tenor MP4 sources to GIF sources for download and share.",
    port: "Rewrites Tenor links in outgoing messages and offers `Copy as GIF link` on any message that contains one, using the original's URL algorithm.",
    api: ["messages.onSend", "ui.addMessageAction", "ui.copy"],
    features: ["Tenor .mp4 → .gif link rewriting", "Works on any Tenor link in a message"],
    settings: ["Rewrite links you send"],
    limits: ["Downloads and shares cannot be intercepted: no media manager"],
  },
  "link-alert-copy": {
    original: "Adds a Copy Link button to the Leaving Discord alert.",
    port: "Copies the link when the alert's press is observed, and offers a message action that copies a link with no alert at all.",
    api: ["ui.onEvent (intercept)", "ui.addMessageAction", "ui.copy"],
    features: ["Link copied before the alert is confirmed", "Copy the first link in a message"],
    settings: ["Copy before asking", "Show a toast"],
    limits: ["Cannot add a button to Discord's alert"],
  },
  "no-embed-copy": {
    original: "Makes an embed press copy the embed URL instead of opening it.",
    port: "Copies the embed URL on an embed press (the press is passed back to Discord) and offers `Copy embed link` in the message menu.",
    api: ["ui.onEvent (intercept)", "ui.addMessageAction", "ui.copy"],
    features: ["Embed URL copied on tap", "Message action for the same, without tapping the embed"],
    settings: ["Intercept embed taps"],
    limits: ["Discord still opens the link after the copy", "Only works when the press event carries the URL"],
  },
};

// The curated notes are also the source of truth for what is missing, so
// migration/status.json cannot drift from the per-plugin READMEs.
let statusChanged = false;
for (const [dir, notes] of Object.entries(NOTES)) {
  const plugin = byDir.get(dir);
  if (!plugin) continue;
  const missingText = notes.limits?.length ? notes.limits.map((l) => (l.endsWith(".") ? l : `${l}.`)).join(" ") : "";
  const notesText = `${notes.port} Ported surface: ${notes.api.join(", ")}.`;
  if (plugin.missing_functionality !== missingText || plugin.notes !== notesText) {
    plugin.missing_functionality = missingText;
    plugin.notes = notesText;
    statusChanged = true;
  }
}
if (statusChanged) {
  writeFileSync(`${root}migration/status.json`, JSON.stringify(status, null, 2) + "\n");
  console.log("updated migration/status.json from the curated notes");
}

const missing = [];
for (const dir of readdirSync(`${root}plugins`)) {
  const plugin = byDir.get(dir);
  if (!plugin) {
    missing.push(dir);
    continue;
  }
  const notes = NOTES[dir];
  if (!notes) {
    missing.push(dir);
    continue;
  }
  const source = readFileSync(`${root}plugins/${dir}/src/index.ts`, "utf8");
  const header = Object.fromEntries(
    [...source.matchAll(/^\/\/ @(\w+) (.*)$/gm)].map((match) => [match[1], match[2]]),
  );

  writeFileSync(
    `${root}plugins/${dir}/metadata.json`,
    JSON.stringify(
      {
        name: dir,
        target_id: plugin.target_id,
        description: header.description ?? plugin.original_name,
        version: header.version ?? "1.0.0",
        original: {
          id: plugin.original_id,
          name: plugin.original_name,
          author: plugin.original_author,
          version: plugin.original_version,
          source: `https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/${dir}`,
        },
        compatibility: plugin.compatibility,
        status: plugin.status,
        phoenix_api: notes.api,
        license: "GPL-3.0 (original repository) — this port is an independent reimplementation, see docs/attribution.md",
      },
      null,
      2,
    ) + "\n",
  );

  const list = (items) => (items?.length ? items.map((item) => `- ${item}`).join("\n") : "None.");
  const readme = `# ${plugin.original_name}

Phoenix Unlock port of the Valenced plugin **${plugin.original_name}**.

| | |
| --- | --- |
| Target plugin id | \`${plugin.target_id}\` |
| Version | ${header.version ?? "1.0.0"} |
| Original author | ${plugin.original_author_name}${plugin.original_author_url ? ` (${plugin.original_author_url})` : ""} |
| Original version | ${plugin.original_version} |
| Original source | [plugins/${dir}](https://github.com/Valenced/valenced-community-plugins/tree/main/plugins/${dir}) |
| Compatibility | **${plugin.compatibility}** — ${plugin.compatibility === "A" ? "directly portable" : plugin.compatibility === "B" ? "adaptable" : "partially portable"} |
| Status | \`${plugin.status}\` |

${header.description ?? ""}

## What the original did

${notes.original}

## What this port does

${notes.port}

## Features

${list(notes.features)}

## Settings

${list(notes.settings)}

## Phoenix API used

${list(notes.api.map((api) => `\`${api}\``))}

## Known limitations

${notes.limits?.length ? list(notes.limits) : "None — the original's behaviour is reproduced in full."}
${notes.warnings?.length ? `\n## Privacy notes\n\n${list(notes.warnings)}\n` : ""}
## Install

Copy \`dist/${dir}.js\` into Phoenix Unlock's plugin directory (Settings → Phoenix Unlocker → Plugins), or bundle
this folder with Phoenix Unlock's own tooling — the layout (\`plugins/<name>/src/index.ts\`, \`// @\` header
lines, esbuild IIFE) matches it exactly.

## License and attribution

The original plugin is part of the Valenced Community Plugins repository, which is GPL-3.0. This port is an
independent reimplementation written against Phoenix Unlock's TypeScript API: no Valenced source code is
copied. The original author and the original plugin are credited above and in \`migration/status.json\`.
See [\`docs/attribution.md\`](../../docs/attribution.md) for the per-plugin licence audit.
`;
  writeFileSync(`${root}plugins/${dir}/README.md`, readme);
  console.log(`documented ${dir}`);
}

if (missing.length) {
  console.error(`\nNo curated notes for: ${missing.join(", ")}`);
  process.exit(1);
}
console.log(`\n${readdirSync(`${root}plugins`).length} plugin(s) documented`);
