// @description Send custom emojis from any server, and animated ones, as image links
// @version 1.0.0
// @author Palm (original Valenced plugin); Phoenix port
// @note Contributors to the original: contrabags, nexpid, aeongdesu, Dziurwa

// The Valenced original unlocked five Nitro products by patching Discord's
// `ProductCatalog.canUserUse`: emojis everywhere (with animation), stickers
// everywhere, client themes, app icons and stream quality — then rewrote
// emoji and sticker markup so Discord would accept it.
//
// Phoenix exposes exactly one of those: `messages.onEmojiPick`, which makes
// the picker treat Nitro-locked custom emojis as usable in the message box.
// Themes, app icons, stickers and stream quality have no plugin surface at
// all, so they are documented as not ported (see README).

const settings = phoenix.settings.define({
  "expressions.emojis.transform": {
    type: "switch",
    title: "Send custom emojis",
    description: "Turn an unusable custom emoji into an image link",
    default: true,
  },
  "expressions.emojis.size": {
    type: "select",
    title: "Emoji size",
    options: [
      { value: "32" },
      { value: "48" },
      { value: "64" },
      { value: "96" },
      { value: "128" },
      { value: "160" },
    ],
    default: "48",
  },
  "expressions.hyperlink": {
    type: "select",
    title: "Link style",
    description: "How the image link appears in the message box",
    options: [
      { value: "name", label: "Hidden behind the name" },
      { value: "invisible", label: "Invisible link text" },
      { value: "bare", label: "Bare URL" },
    ],
    default: "name",
  },
  "expressions.checkPermission": {
    type: "switch",
    title: "Check permissions",
    description: "Leave emojis alone that you can already use",
    default: true,
  },
});

interface Emoji {
  id: string;
  name: string;
  animated: boolean;
  available: boolean;
  guild: string;
}

const emojis = new Map<string, Emoji>();
const byName = new Map<string, Emoji[]>();
const channelGuild = new Map<string, string>();
/** The emoji last picked per name, which `:name:` in the box means. */
const picked = new Map<string, Emoji>();

const addEmojis = (guild: string, list: Phoenix.Emoji[] | undefined) => {
  for (const raw of list ?? []) {
    if (!raw.id || !raw.name || emojis.has(raw.id)) continue;
    const emoji: Emoji = {
      id: raw.id,
      name: raw.name,
      animated: !!raw.animated,
      available: raw.available !== false,
      guild,
    };
    emojis.set(raw.id, emoji);
    byName.set(emoji.name, [...(byName.get(emoji.name) ?? []), emoji]);
  }
};

// Phoenix loads guilds lazily and never hands READY to plugins, so guild
// emojis come from its cache. Ids in cache keys are zero-padded to 20 digits.
const unpad = (id: string) => id.replace(/^0+/, "");
const load = async () => {
  const rows = await phoenix.stores.sql<{ g: string; e: string | null }>(
    "SELECT k AS g, json_extract(CAST(v AS TEXT), '$.emojis') AS e FROM guilds",
  );
  for (const row of rows) if (row.e) addEmojis(unpad(row.g), JSON.parse(row.e));
  // One row per guild keeps this under the 10000-row limit.
  const channels = await phoenix.stores.sql<{ g: string; c: string }>(
    "SELECT substr(k, 1, 20) AS g, group_concat(substr(k, 22)) AS c FROM channel_stubs" +
      " WHERE k NOT LIKE '00000000000000000000:%' GROUP BY 1",
  );
  for (const row of channels) {
    for (const id of row.c.split(",")) channelGuild.set(unpad(id), unpad(row.g));
  }
  phoenix.log.info(
    `fake-nitro: ${emojis.size} emojis in ${rows.length} servers, ${channelGuild.size} channels`,
  );
};
load().catch((err) => phoenix.log.warn(`fake-nitro: reading the cache: ${err}`));

const guildCreate = phoenix.gateway.guildCreate;
if (guildCreate) {
  phoenix.on(
    guildCreate as Phoenix.Sig<{ id: string; emojis?: Phoenix.Emoji[]; channels?: { id: string }[] }>,
    (guild) => {
      addEmojis(guild.id, guild.emojis);
      for (const channel of guild.channels ?? []) channelGuild.set(channel.id, guild.id);
    },
  );
}
const emojisUpdate = phoenix.gateway.guildEmojisUpdate;
if (emojisUpdate) {
  phoenix.on(
    emojisUpdate as Phoenix.Sig<{ guild_id: string; emojis?: Phoenix.Emoji[] }>,
    (update) => addEmojis(update.guild_id, update.emojis),
  );
}

// The real Nitro tier, which decides whether an emoji needs unlocking.
let premium = 0;
let asked: "no" | "asking" | "done" = "no";
const ask = () => {
  if (asked !== "no") return;
  asked = "asking";
  phoenix.discord
    .get("/users/@me")
    .then((res) => {
      premium = res.json<{ premium_type?: number }>().premium_type ?? 0;
      asked = "done";
    })
    .catch(() => {
      asked = "no";
    });
};
ask();
for (const event of [phoenix.gateway.initialGuild, phoenix.gateway.messageCreate]) {
  if (event) phoenix.on(event as Phoenix.Sig<unknown>, ask);
}

/** Whatever Discord lets a non-Nitro user send: the server's static emojis. */
const usable = (emoji: Emoji, guild: string | undefined) => {
  if (!settings["expressions.checkPermission"]) return false;
  return emoji.available && (premium > 0 || (!emoji.animated && emoji.guild === guild));
};

const link = (emoji: Emoji) => {
  const size = settings["expressions.emojis.size"];
  const name = encodeURIComponent(emoji.name);
  const url = `https://cdn.discordapp.com/emojis/${emoji.id}.${emoji.animated ? "gif" : "webp"}?size=${size}&name=${name}&lossless=true`;
  switch (settings["expressions.hyperlink"]) {
    case "bare":
      return url;
    case "invisible":
      return `[\u200b](${url})`;
    default:
      return `[${emoji.name}](${url})`;
  }
};

/** Links need whitespace around them to embed as an image. */
const spaced = (text: string, offset: number, length: number, replacement: string) => {
  const before = offset > 0 && !/\s/.test(text[offset - 1]) ? " " : "";
  const after = offset + length < text.length && !/\s/.test(text[offset + length]) ? " " : "";
  return before + replacement + after;
};

const rewrite = (text: string, guild: string | undefined) => {
  if (!settings["expressions.emojis.transform"]) return text;
  return text.replace(
    /(?<!\\)<a?:(\w+):(\d+)>|(?<![\\<]):(\w+):(?!\d)/g,
    (match, _name, id, name, offset, whole: string) => {
      let emoji: Emoji | undefined;
      if (id) emoji = emojis.get(id);
      else if (picked.has(name)) emoji = picked.get(name);
      else {
        const found = byName.get(name);
        if (!found || found.some((candidate) => usable(candidate, guild))) return match;
        emoji = found.find((candidate) => candidate.available);
      }
      if (!emoji || usable(emoji, guild)) return match;
      return spaced(whole, offset, match.length, link(emoji));
    },
  );
};

const guildOf = (ctx: Phoenix.UiContext) =>
  ctx.channelId ? channelGuild.get(ctx.channelId) : undefined;

phoenix.messages.onEmojiPick((id, ctx) => {
  const emoji = emojis.get(id);
  if (!emoji || usable(emoji, guildOf(ctx))) return;
  // Several servers can share a name, so remember the exact one.
  picked.set(emoji.name, emoji);
  return `:${emoji.name}: `;
});

phoenix.messages.onSend((text, ctx) => {
  if (!text.includes(":")) return;
  const result = rewrite(text, guildOf(ctx));
  return result === text ? undefined : result;
});

phoenix.onUnload(() => {
  emojis.clear();
  byName.clear();
  channelGuild.clear();
  picked.clear();
});
