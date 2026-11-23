// @description Show who is typing, with names, in the open channel
// @version 1.0.0
// @author Palm (original Valenced plugin); Phoenix port

// The Valenced original drew a typing indicator with user avatars inside the
// channel list, a render target Phoenix does not have. This port listens to
// the same gateway event and shows the typers as a header accessory on the
// messages of that channel, which is the closest portable surface.

const settings = phoenix.settings.define({
  showNames: {
    type: "switch",
    title: "Show names",
    description: "Name the people typing instead of counting them",
    default: true,
  },
  includeBots: {
    type: "switch",
    title: "Include bots",
    description: "Count bots as typing",
    default: false,
  },
});

/** Discord's typing indicator expires after ~10 seconds. */
const TTL = 10_000;

type Typer = { name: string; at: number; bot: boolean };

/** channelId -> userId -> typer */
const typing = new Map<string, Map<string, Typer>>();

type TypingPayload = {
  channel_id?: string;
  user_id?: string;
  member?: { user?: Phoenix.User; nick?: string | null };
};

const event = phoenix.gateway.typingStart;
if (event) {
  phoenix.on(event as Phoenix.Sig<TypingPayload>, (payload) => {
    const channelId = payload?.channel_id;
    const userId = payload?.user_id;
    if (!channelId || !userId) return;
    const user = payload.member?.user;
    if (user?.bot && !settings.includeBots) return;
    let channel = typing.get(channelId);
    if (!channel) {
      channel = new Map();
      typing.set(channelId, channel);
    }
    channel.set(userId, {
      name: payload.member?.nick || user?.global_name || user?.username || "someone",
      at: Date.now(),
      bot: user?.bot === true,
    });
  });
} else {
  phoenix.log.warn("better-typing-indicators: this build has no typingStart event");
}

const live = (channelId: string): Typer[] => {
  const channel = typing.get(channelId);
  if (!channel) return [];
  const now = Date.now();
  const current: Typer[] = [];
  for (const [userId, typer] of channel) {
    if (now - typer.at > TTL) channel.delete(userId);
    else if (!typer.bot || settings.includeBots) current.push(typer);
  }
  if (!channel.size) typing.delete(channelId);
  return current;
};

phoenix.ui.addMessageAccessory({
  placement: "header",
  priority: 5,
  render({ channelId }) {
    if (!channelId) return null;
    const current = live(channelId);
    if (!current.length) return null;
    if (settings.showNames) return `${current.map((typer) => typer.name).join(", ")} typing…`;
    return current.length === 1 ? "1 person typing…" : `${current.length} people typing…`;
  },
});

// A typed message means the sender stopped typing.
phoenix.hook(phoenix.gateway.messageCreate, {
  after(message) {
    const channel = typing.get(message.channel_id);
    if (!channel) return;
    channel.delete(message.author?.id);
    if (!channel.size) typing.delete(message.channel_id);
  },
});

phoenix.onUnload(() => typing.clear());
