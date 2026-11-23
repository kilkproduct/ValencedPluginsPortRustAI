// @description Download and share Tenor links as GIFs instead of MP4s
// @version 1.0.0
// @author thororen (original Valenced plugin); Phoenix port
// @note Contributor to the original: nexpid

// The Valenced original patched `downloadMediaAsset` and
// `useMediaShareActions` so a Tenor MP4 source was rewritten to its GIF
// counterpart before being downloaded or shared. Phoenix has no media
// manager, but it can expose the same rewrite as explicit actions, and can
// do it automatically for links you send.

const settings = phoenix.settings.define({
  rewriteOnSend: {
    type: "switch",
    title: "Rewrite links you send",
    description: "Turn Tenor .mp4 links into .gif links in outgoing messages",
    default: true,
  },
});

/** The original's rewrite: `<host>/<id[-2 chars]>AC/<file>.gif`. */
export function toGif(url: string): string | undefined {
  const path = url.split("/");
  const index = path.findIndex((part) => part.endsWith(".tenor.com"));
  if (index === -1) return undefined;
  const [host, id, file] = path.slice(index, index + 3);
  if (!host || !id || !file) return undefined;
  return `https://${host}/${id.slice(0, -2)}AC/${file.split(".")[0]}.gif`;
}

const TENOR_URL = /https?:\/\/[^\s<>"']*\.tenor\.com\/[^\s<>"']+/g;

const rewrite = (text: string) =>
  text.replace(TENOR_URL, (match) => {
    const gif = toGif(match);
    if (!gif) return match;
    phoenix.log.debug(`tenor-gif-fix: ${match} -> ${gif}`);
    return gif;
  });

phoenix.messages.onSend((text) => {
  if (!settings.rewriteOnSend || !text.includes(".tenor.com")) return;
  const result = rewrite(text);
  return result === text ? undefined : result;
});

// The same rewrite, on demand, for any Tenor link already in a message.
phoenix.ui.addMessageAction({
  label: "Copy as GIF link",
  icon: "res://ic_mana_angle_brackets",
  visible: ({ message }) => !!message?.content?.includes(".tenor.com"),
  onPress: ({ message }) => {
    if (!message?.content) return;
    const result = rewrite(message.content);
    if (result === message.content) {
      phoenix.ui.toast("No Tenor link to rewrite");
      return;
    }
    phoenix.ui.copy(result);
    phoenix.ui.toast("Copied the GIF link");
  },
});
