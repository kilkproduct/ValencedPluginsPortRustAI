// @description Show the open channel's name without dashes
// @version 1.0.0
// @author k1ng_op (original Valenced plugin); Phoenix port

// The Valenced original replaced dashes with spaces only in the rendered
// channel list (a React row patch on `renderChannelListItem`), never on the
// server. Phoenix has no channel-list row patch, so the port shows the
// dash-less name in the chat header instead, and keeps the original's
// read-only spirit: nothing is renamed on Discord.
//
// A rename variant is deliberately not provided: it would change server
// state, which the original never did.

const settings = phoenix.settings.define({
  showHeaderButton: {
    type: "switch",
    title: "Header button",
    description: "Show a button with the dash-less channel name",
    default: true,
  },
});

const cache = new Map<string, string>();

const dashless = (name: string) => name.replace(/-/g, " ");

const nameOf = async (channelId: string): Promise<string | undefined> => {
  const cached = cache.get(channelId);
  if (cached) return cached;
  try {
    const res = await phoenix.discord.get(`/channels/${channelId}`);
    if (!res.ok) return undefined;
    const name = res.json<{ name?: string }>().name;
    if (!name) return undefined;
    cache.set(channelId, name);
    return name;
  } catch {
    return undefined;
  }
};

let button: Phoenix.ButtonRemover | undefined;
let current: string | undefined;

const refresh = async (channelId: string | null) => {
  if (!channelId) return;
  const name = await nameOf(channelId);
  if (!name || !button) return;
  const shown = name.includes("-") ? dashless(name) : name;
  if (shown === current) return;
  current = shown;
  button.update({ label: shown });
};

if (settings.showHeaderButton) {
  button = phoenix.ui.addHeaderButton({
    icon: "res://ic_mana_angle_brackets",
    label: "channel",
    onPress: (ctx) => {
      void nameOf(ctx.channelId ?? "").then((name) =>
        ctx.reply(name ? `${dashless(name)}  (still "${name}" on Discord)` : "Channel name unavailable."),
      );
    },
  });

  // The accessory fires on every message, so the first one in a channel
  // refreshes the button label without any polling.
  phoenix.ui.addMessageAccessory({
    placement: "header",
    render: ({ channelId }) => {
      void refresh(channelId ?? null);
      return null;
    },
  });
}

phoenix.commands.register({
  name: "dashless",
  description: "Show the open channel's name without dashes",
  execute: async (_args, ctx) => {
    const name = ctx.channelId ? await nameOf(ctx.channelId) : undefined;
    return name ? dashless(name) : "Channel name unavailable.";
  },
});

phoenix.onUnload(() => button?.());
