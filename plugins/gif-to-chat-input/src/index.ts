// @description Holds picked GIFs in the chatbox instead of sending them
// @version 1.0.0
// @author j (original Valenced plugin); Phoenix port
// @note Contributor to the original: Benjii

// The Valenced original intercepted `Messages.sendMessage` when the location
// was `gif_reply` and inserted the GIF into the chatbox instead of sending
// it. Phoenix has no chat-input insertion and no send-location marker, so
// this port uses an explicit composer button: pick the GIF in Discord's
// picker, hold it here, and the link is ready to paste. Nothing is sent
// until you send it, which is the behaviour the original wanted.

const HELD = "heldGif";

type Held = { url: string; at: number };

const settings = phoenix.settings.define({
  autoCopy: {
    type: "switch",
    title: "Copy when held",
    description: "Copy the held link to the clipboard right away",
    default: true,
  },
});

const held = (): Held | undefined => phoenix.storage.get<Held>(HELD);

const button = phoenix.ui.addComposerButton({
  icon: "res://ic_mana_angle_brackets",
  label: "Hold GIF",
  onPress: (ctx) => {
    const current = held();
    if (!current) {
      ctx.reply("Nothing held. Copy a GIF link, then send it here to hold it.");
      return;
    }
    void phoenix.ui.copy(current.url);
    if (ctx.channelId) phoenix.messages.addLocal(ctx.channelId, `Held GIF: ${current.url}`);
  },
});

// Holding happens through the message box: `/hold <link>` keeps the link
// instead of sending it.
phoenix.commands.register({
  name: "hold",
  description: "Hold a GIF link instead of sending it",
  execute: (args) => {
    const url = args.trim();
    if (!/^https?:\/\//.test(url)) return { content: "Usage: /hold <gif link>" };
    phoenix.storage.set(HELD, { url, at: Date.now() } satisfies Held);
    if (settings.autoCopy) phoenix.ui.copy(url);
    // Returning nothing means the command itself sends nothing.
    phoenix.ui.toast("GIF held — use the Hold GIF button to get it back");
  },
});

phoenix.onUnload(() => button());
