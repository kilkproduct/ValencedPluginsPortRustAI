// @description Copy a link before leaving Discord
// @version 1.0.0
// @author palmdevs (original Valenced plugin); Phoenix port

// The Valenced original added a "Copy Link" button to Discord's
// MaskedLinkModal — the "Leaving Discord" alert. Phoenix has no alert patch
// and cannot add a button to it, but it can intercept the tap that opens it:
// `ui.onEvent` with `intercept: true` sees the press, and returning `false`
// passes it back. This port copies the link first (so it is on the clipboard
// whatever you decide), then lets the alert open as usual.

const settings = phoenix.settings.define({
  copyAlways: {
    type: "switch",
    title: "Copy before asking",
    description: "Copy the link to the clipboard when the alert opens",
    default: true,
  },
  toast: {
    type: "switch",
    title: "Show a toast",
    description: "Confirm that the link was copied",
    default: true,
  },
});

/** The URL of the alert's link, when the event exposes one. */
const urlOf = (event: Phoenix.ViewEvent): string | undefined => {
  const payload = event.payload;
  if (typeof payload === "string" && /^https?:\/\//.test(payload)) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    for (const key of ["url", "href", "link", "uri"]) {
      const value = record[key];
      if (typeof value === "string" && /^https?:\/\//.test(value)) return value;
    }
  }
  return undefined;
};

phoenix.ui.onEvent(
  "press",
  (event) => {
    if (!settings.copyAlways) return;
    const url = urlOf(event);
    if (!url) return;
    // The alert would show this URL; copying it first means it is on the
    // clipboard whether the user continues or cancels.
    phoenix.ui.copy(url);
    if (settings.toast) phoenix.ui.toast("Link copied");
  },
  { intercept: true },
);

// The reliable path without an alert: copy a link from a message.
phoenix.ui.addMessageAction({
  label: "Copy first link",
  icon: "res://ic_mana_angle_brackets",
  visible: ({ message }) => /https?:\/\//.test(message?.content ?? ""),
  onPress: ({ message }) => {
    const url = message?.content?.match(/https?:\/\/[^\s<>"']+/)?.[0];
    if (!url) return;
    phoenix.ui.copy(url);
    phoenix.ui.toast("Link copied");
  },
});
