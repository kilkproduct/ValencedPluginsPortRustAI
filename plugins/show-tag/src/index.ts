// @description Show usernames next to display names in chat
// @version 1.0.0
// @author bleelblep (original Valenced plugin); Phoenix port
// @note Contributor to the original: Cynosphere

// The Valenced original patched RowManager.generate to rewrite the rendered
// username (and its reply preview) into `display (@username)`. Phoenix has no
// row patch, so the same text is emitted by a header message accessory.
// Nicknames are not available from `MessageContext.message` (a plain
// `Message` has no `member`), so the display name is the user's global name.

const ZWSP = "\u200b";

const settings = phoenix.settings.define({
  onlyUsername: {
    type: "switch",
    title: "Only username",
    description: "Show just the username, never the display name",
    default: false,
  },
});

function formatName(shown: string, user: Phoenix.User, onlyUsername: boolean) {
  if (onlyUsername) return ZWSP + user.username;

  // Migrated users have discriminator "0".
  if (user.discriminator === "0") {
    if (shown.toLowerCase() === user.username) return shown;
    return `${shown} (@${user.username})`;
  }

  // Bots still have discriminators.
  if (shown !== user.username) return `${shown} (${user.username}#${user.discriminator})`;
  return `${shown}#${user.discriminator}`;
}

phoenix.ui.addMessageAccessory({
  placement: "header",
  render({ message }) {
    const author = message?.author;
    if (!author) return null;
    // Webhooks have no real username to show.
    if (author.bot && author.discriminator === "0000") return null;
    const shown = author.global_name || author.username;
    if (!shown) return null;
    return formatName(shown, author, settings.onlyUsername);
  },
});
