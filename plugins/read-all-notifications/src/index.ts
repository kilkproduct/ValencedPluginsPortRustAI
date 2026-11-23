// @description Mark every unread channel as read in one tap
// @version 1.0.0
// @author NexzaDev (original Valenced plugin); Phoenix port
// @note Contributors to the original: kemo

// The Valenced original added a button under the DMs in the You Bar and
// dispatched a BULK_ACK Flux event with every unread channel. Phoenix has no
// You Bar and no Flux dispatch, but it can ack channels through Discord's own
// REST endpoint (POST /channels/:id/ack), which is what BULK_ACK ends up
// doing. Unread channels are discovered from Phoenix's read-only cache.

const settings = phoenix.settings.define({
  includeMuted: {
    type: "switch",
    title: "Include muted channels",
    description: "Also mark muted channels as read",
    default: false,
  },
  confirm: {
    type: "switch",
    title: "Ask first",
    description: "Ask before marking everything as read",
    default: true,
  },
});

/** Unread channels from the cache: one row per channel, so this stays small. */
const unread = async (): Promise<{ id: string; muted: number }[]> => {
  try {
    return await phoenix.stores.sql<{ id: string; muted: number }>(
      "SELECT substr(k, 1, 20) AS id, json_extract(CAST(v AS TEXT), '$.muted') AS muted" +
        " FROM channels WHERE json_extract(CAST(v AS TEXT), '$.read_state.last_message_id') IS NOT NULL",
    );
  } catch (err) {
    phoenix.log.warn(`read-all-notifications: reading the cache: ${err}`);
    return [];
  }
};

const markAll = async (ctx: Phoenix.UiContext) => {
  const rows = await unread();
  const targets = rows
    .map((row) => ({ id: String(row.id).replace(/^0+/, ""), muted: row.muted === 1 }))
    .filter((row) => settings.includeMuted || !row.muted);

  if (!targets.length) {
    ctx.reply("You have no unread channels");
    return;
  }

  if (settings.confirm) {
    const picked = await phoenix.ui.choose({
      title: "Mark all as read?",
      message: `This marks ${targets.length} channel(s) as read.`,
      options: ["Mark as read", "Cancel"],
    });
    if (picked !== 0) return;
  }

  let done = 0;
  const failed: string[] = [];
  for (const target of targets) {
    try {
      const res = await phoenix.discord.post(`/channels/${target.id}/ack`);
      if (res.ok) done++;
      else failed.push(target.id);
    } catch {
      failed.push(target.id);
    }
  }

  const noun = done === 1 ? "channel" : "channels";
  ctx.reply(
    failed.length
      ? `Marked ${done} ${noun} as read; ${failed.length} failed`
      : `Marked ${done} ${noun} as read`,
  );
};

phoenix.ui.addHeaderButton({
  icon: "res://ic_mana_puzzle_piece_plus",
  label: "Read all",
  onPress: (ctx) => void markAll(ctx),
});

phoenix.commands.register({
  name: "read-all",
  description: "Mark every unread channel as read",
  execute: (_args, ctx) => markAll(ctx),
});
