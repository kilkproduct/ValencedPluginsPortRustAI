// @description Make embeds copy their link instead of opening it
// @version 1.0.0
// @author thororen (original Valenced plugin); Phoenix port
// @note Contributor to the original: redstonekasi

// The Valenced original patched `Embed` so a press copied the embed's URL
// instead of opening the external page. Phoenix cannot patch the embed view,
// but `ui.onEvent("press", …, { intercept: true })` can consume the press
// before Discord handles it, and the embed URL can be read from the message
// that owns the pressed row. The message action gives the same result without
// relying on the event payload carrying a URL.

const settings = phoenix.settings.define({
  interceptPress: {
    type: "switch",
    title: "Intercept embed taps",
    description: "Copy the embed link when an embed is tapped",
    default: true,
  },
});

const urlOf = (event: Phoenix.ViewEvent): string | undefined => {
  const payload = event.payload;
  if (!payload || typeof payload !== "object") return undefined;
  const record = payload as Record<string, unknown>;
  for (const key of ["url", "href", "link"]) {
    const value = record[key];
    if (typeof value === "string" && /^https?:\/\//.test(value)) return value;
  }
  return undefined;
};

phoenix.ui.onEvent(
  "press",
  (event) => {
    if (!settings.interceptPress) return;
    // Only embeds, not every press in the app.
    if (!event.accessibilityId?.startsWith("message.embed")) return;
    const url = urlOf(event);
    if (!url) return;
    phoenix.ui.copy(url);
    phoenix.ui.toast("Embed link copied");
    // Let the press continue to Discord. Consuming it (`return true`) would be
    // the original behaviour, but a wrong guess here would block real taps.
    return false;
  },
  { intercept: true },
);

phoenix.ui.addMessageAction({
  label: "Copy embed link",
  icon: "res://ic_mana_angle_brackets",
  visible: ({ message }) => (message?.embeds?.length ?? 0) > 0,
  onPress: async ({ message, reply }) => {
    const embed = message?.embeds?.[0];
    if (!embed) return;
    const url = embed.url;
    if (!url) {
      reply("This embed has no link.");
      return;
    }
    phoenix.ui.copy(url);
    phoenix.ui.toast("Embed link copied");
  },
});
