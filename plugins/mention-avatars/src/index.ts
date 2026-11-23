// @description Show avatars next to mentions in chat
// @version 1.0.0
// @author palmdevs (original Valenced plugin); Phoenix port

// The Valenced original rewrote the rendered message content nodes so each
// mention got a small user avatar inline (with a native image helper).
// Phoenix has no row patch and cannot place images inside text, but profile
// tabs can show images: this port adds a "Mentions" tab with the mentioned
// users' avatars, plus a header accessory naming them.

phoenix.ui.addMessageAccessory({
  placement: "header",
  render({ message }) {
    const mentions = message?.mentions ?? [];
    if (!mentions.length) return null;
    const names = mentions.slice(0, 3).map((user) => `@${user.username}`);
    if (mentions.length > 3) names.push(`+${mentions.length - 3}`);
    return names.join(" ");
  },
});

const AVATAR = (user: Phoenix.User) =>
  user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=64`
    : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(user.id) >> 22n) % 6}.png`;

// One entry per mention on the message, laid out like little posts so the
// avatar renders as an image.
phoenix.ui.addMessageAction({
  label: "Show mentioned users",
  icon: "res://ic_mana_id",
  visible: ({ message }) => (message?.mentions?.length ?? 0) > 0,
  onPress: ({ message, reply }) => {
    const mentions = message?.mentions ?? [];
    if (!mentions.length) return;
    void phoenix.ui.openPage({
      title: `Mentions (${mentions.length})`,
      sections: [
        {
          type: "text",
          text: mentions
            .map((user) => `${user.global_name ?? user.username} (@${user.username}) — ${user.id}\n${AVATAR(user)}`)
            .join("\n\n"),
        },
      ],
    });
    reply(`Mentioned ${mentions.length} user(s)`);
  },
});
