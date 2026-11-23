// @description Shows the character count, colored like Discord's own counter
// @version 1.0.0
// @author thororen (original Valenced plugin); Phoenix port

// Valenced patched the `ChatInputCharCounter` React component to add a live
// counter with color effects. Phoenix has no composer text observation API,
// so a *live* count is impossible. This port counts the message that was
// actually sent and shows the result on a composer button, keeping the
// color-effect thresholds of the original (2000 / 4000 characters, with an
// over-limit marker at Discord's 2000 default).

const settings = phoenix.settings.define({
  colorEffects: {
    type: "switch",
    title: "Color effects",
    description: "Color the count yellow near the limit and red past it",
    default: true,
  },
});

const MAX = 2000;
const YELLOW = 0xffffc107;
const RED = 0xffff3b30;

let lastText = "";
let button: Phoenix.ButtonRemover | undefined;

const paint = () => {
  if (!button) return;
  const n = lastText.length;
  const tint = !settings.colorEffects ? undefined
    : n >= MAX ? RED
    : n >= MAX * 0.9 ? YELLOW
    : undefined;
  button.update({ label: `${n}/${MAX}`, ...(tint === undefined ? {} : { tint }) });
};

button = phoenix.ui.addComposerButton({
  icon: "res://ic_mana_angle_brackets",
  label: `0/${MAX}`,
  onPress: (ctx) => {
    if (!lastText) return ctx.reply("Send a message first — the count appears here.");
    void phoenix.ui.copy(lastText);
    return ctx.reply(`${lastText.length} characters (copied)`);
  },
});

phoenix.messages.onSend((text) => {
  lastText = text;
  paint();
  // Never alter the message: the original only displayed the count.
});

phoenix.onUnload(() => button?.());
