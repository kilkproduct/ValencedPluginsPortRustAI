// @description Favorite any image or video, not just GIFs
// @version 1.0.0
// @author TheUnrealZaka (original Valenced plugin); Phoenix port
// @note Original ported from the Equicord desktop plugin by nin0dev and davri
// @warning Fetches signed CDN URLs through /attachments/refresh-urls when they expire

// The Valenced original patched Discord's `GIFFavButton` component so the star
// appeared on every media attachment, mapped every image/video into a GIF
// favorite, and renewed expired CDN signatures in batches. Phoenix cannot
// render that button, but it can do the same job from the message menu:
// add any image or video attachment to your GIF favorites, and keep its
// signed URL fresh through the same REST endpoint the original used.

const REFRESH = "/attachments/refresh-urls";
const MARGIN = 3_600_000;
const BATCH = 50;

const SIGNED =
  /^https:\/\/(?:cdn\.discordapp\.com|media\.discordapp\.net|images-ext-[12]\.discordapp\.net)\/(?:attachments|ephemeral-attachments|external)\//;
const VIDEO = /\.(?:mp4|webm|mov|m4v|avi|mkv|flv|wmv|gifv|gif)$/i;
const SIGNATURE_PARAM = /^(?:ex|is|hm)=/;

const FavoriteFormat = { None: 0, Image: 1, Video: 2 } as const;

type Favorite = { url: string; format: number; saved: number };

const settings = phoenix.settings.define({
  renew: {
    type: "switch",
    title: "Renew signed URLs",
    description: "Refresh expiring CDN links so old favorites keep working",
    default: true,
  },
  favorites: {
    type: "button",
    title: "Show saved favorites",
    onPress: () => void showFavorites(),
  },
  clear: {
    type: "button",
    title: "Clear saved favorites",
    onPress: () => {
      phoenix.storage.set(KEY, []);
      phoenix.ui.toast("Favorites cleared");
    },
  },
});

const KEY = "favorites";
const load = (): Favorite[] => phoenix.storage.get<Favorite[]>(KEY) ?? [];
const save = (favorites: Favorite[]) => phoenix.storage.set(KEY, favorites);

const isSigned = (url: string) => SIGNED.test(url) && /[?&](?:ex|is|hm)=/.test(url);
const expiry = (url: string) => {
  const match = /[?&]ex=([0-9a-f]+)/i.exec(url);
  return match ? parseInt(match[1], 16) : 0;
};

/** Picks the best playable/viewable URL from an attachment. */
const sourceOf = (attachment: Phoenix.Attachment): { url: string; format: number } | null => {
  const type = attachment.content_type ?? "";
  const name = attachment.filename ?? "";
  if (type.startsWith("image/")) return { url: attachment.url, format: FavoriteFormat.Image };
  if (type.startsWith("video/") || VIDEO.test(name)) {
    return { url: attachment.url, format: FavoriteFormat.Video };
  }
  return null;
};

const showFavorites = async () => {
  const favorites = load();
  if (!favorites.length) {
    phoenix.ui.toast("No favorites saved yet");
    return;
  }
  const lines = favorites
    .slice(-50)
    .map((favorite) => `${favorite.format === FavoriteFormat.Video ? "[video]" : "[image]"} ${favorite.url}`);
  void phoenix.ui.openPage({
    title: `Favorites (${favorites.length})`,
    sections: [
      { type: "text", text: lines.join("\n\n") },
      {
        type: "buttons",
        buttons: [{ label: "Copy all", onPress: () => phoenix.ui.copy(favorites.map((f) => f.url).join("\n")) }],
      },
    ],
  });
};

// Renew signatures in one batch, exactly like the original's renewal queue.
const renew = async () => {
  if (!settings.renew) return;
  const favorites = load();
  const stale = favorites
    .filter((favorite) => isSigned(favorite.url) && expiry(favorite.url) * 1000 - Date.now() < MARGIN)
    .slice(0, BATCH);
  if (!stale.length) return;
  try {
    const res = await phoenix.discord.post(REFRESH, { attachment_urls: stale.map((f) => f.url) });
    if (!res.ok) return;
    const body = res.json<{ refreshed_urls?: { original?: string; refreshed?: string | null }[] }>();
    const fresh = new Map<string, string>();
    for (const entry of body.refreshed_urls ?? []) {
      if (entry.original && entry.refreshed && entry.refreshed !== entry.original) {
        fresh.set(entry.original, entry.refreshed);
      }
    }
    if (!fresh.size) return;
    save(load().map((favorite) => (fresh.has(favorite.url) ? { ...favorite, url: fresh.get(favorite.url)! } : favorite)));
    phoenix.log.info(`favorite-anything: renewed ${fresh.size} link(s)`);
  } catch (err) {
    phoenix.log.warn(`favorite-anything: renewing links: ${err}`);
  }
};

// Signed links last hours; re-check when one is close to expiring, without
// any polling. Accessory renders are the only recurring tick available.
let nextCheck = 0;
phoenix.ui.addMessageAccessory({
  placement: "header",
  render({ message }) {
    const now = Date.now();
    if (now >= nextCheck) {
      nextCheck = now + 60_000;
      void renew();
    }
    return null;
  },
});

phoenix.ui.addMessageAction({
  label: "Favorite this media",
  icon: "res://ic_mana_puzzle_piece_plus",
  visible: ({ message }) => (message?.attachments ?? []).some((a) => sourceOf(a) !== null),
  onPress: ({ message, reply }) => {
    const attachments = message?.attachments ?? [];
    const favorites = load();
    let added = 0;
    for (const attachment of attachments) {
      const source = sourceOf(attachment);
      if (!source) continue;
      if (favorites.some((favorite) => favorite.url === source.url)) continue;
      favorites.push({ url: source.url, format: source.format, saved: Date.now() });
      added++;
    }
    save(favorites);
    reply(added ? `Saved ${added} favorite(s)` : "Already in your favorites");
  },
});

phoenix.onUnload(() => {
  // Nothing to undo beyond Phoenix's own registrations; favorites persist.
  phoenix.log.debug(`favorite-anything: ${load().length} favorite(s) kept`);
});
