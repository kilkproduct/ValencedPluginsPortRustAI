// @description Lists who reacted to a message
// @version 1.0.0
// @author palmdevs (original Valenced plugin); Phoenix port

// The Valenced original drew up to five reactor avatars on each reaction pill
// through a native helper, only for pills on screen. Phoenix has no reaction
// pill patch, so this port fetches reactors on demand from the message action
// menu, with the original's per-reaction cap as a setting.

const settings = phoenix.settings.define({
  maxReactions: {
    type: "number",
    title: "Maximum reactions",
    description: "Messages with more different reactions than this are not fetched",
    default: 10,
  },
  maxAvatars: {
    type: "number",
    title: "Reactors per reaction",
    description: "How many reactor names to list under each reaction",
    default: 5,
  },
});

const LIMIT = 20;

const emojiKey = (emoji: Phoenix.PartialEmoji) =>
  emoji.id ? `${emoji.name}:${emoji.id}` : (emoji.name ?? "?");

phoenix.ui.addMessageAction({
  label: "Who reacted",
  icon: "res://ic_mana_puzzle_piece_plus",
  visible: ({ message }) => (message?.reactions?.length ?? 0) > 0,
  onPress: async ({ message, reply }) => {
    if (!message?.reactions?.length) return;
    const reactions = message.reactions.slice(0, LIMIT);
    const cap = Math.round(settings.maxReactions);
    if (reactions.length > cap) {
      reply(`Too many reactions (${reactions.length} > ${cap}).`);
      return;
    }

    const perReaction = Math.max(1, Math.round(settings.maxAvatars));
    const lines: string[] = [];
    for (const reaction of reactions) {
      const key = emojiKey(reaction.emoji);
      try {
        const res = await phoenix.discord.get(
          `/channels/${message.channel_id}/messages/${message.id}/reactions/${encodeURIComponent(key)}?limit=${perReaction}`,
        );
        if (!res.ok) {
          lines.push(`${key}: (not visible)`);
          continue;
        }
        const users = res.json<{ username?: string; global_name?: string | null }[]>();
        const names = users
          .slice(0, perReaction)
          .map((user) => user.global_name || user.username || "?");
        const more = reaction.count - names.length;
        lines.push(`${key} (${reaction.count}): ${names.join(", ")}${more > 0 ? ` +${more}` : ""}`);
      } catch (err) {
        phoenix.log.warn(`who-reacted: ${key}: ${err}`);
        lines.push(`${key}: (failed to load)`);
      }
    }

    void phoenix.ui.openPage({
      title: "Reactors",
      sections: [{ type: "text", text: lines.join("\n\n") }],
    });
  },
});
