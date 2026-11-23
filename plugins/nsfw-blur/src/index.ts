// @description Blur NSFW media in NSFW channels
// @version 1.0.0
// @author thororen (original Valenced plugin); Phoenix port

// Valenced patched `createMessageContent` in the renderer to turn off inline
// embed media and mark every attachment as a spoiler inside NSFW channels.
// Phoenix has no renderer patch and no image blur API. This port keeps the
// intent (media hidden until you choose to look) by hiding media rows with
// ui.hide(), and can additionally drop such messages at the gateway so
// nothing is fetched at all.

const MEDIA_IDS = ["message.embed.media", "message.attachment.media"];

// Phoenix exposes no channel NSFW flag to plugins directly; read it from the
// read-only cache (one row per channel, so this stays under the row cap).
const nsfwChannels = new Set<string>();

/** Cache keys are zero-padded snowflakes; the API uses unpadded ids. */
const unpad = (id: string) => id.replace(/^0+/, "");

const loadChannels = async () => {
  try {
    const rows = await phoenix.stores.sql<{ id: string; nsfw: number }>(
      "SELECT substr(k, 1, 20) AS id, json_extract(CAST(v AS TEXT), '$.nsfw') AS nsfw" +
        " FROM channels WHERE json_extract(CAST(v AS TEXT), '$.nsfw') = 1",
    );
    for (const row of rows) nsfwChannels.add(unpad(String(row.id)));
    phoenix.log.info(`nsfw-blur: ${nsfwChannels.size} NSFW channel(s) in the cache`);
  } catch (err) {
    phoenix.log.warn(`nsfw-blur: reading the channel cache: ${err}`);
  }
};

const hiding = new Map<string, Phoenix.Remover>();

const syncHide = (on: boolean) => {
  for (const id of MEDIA_IDS) {
    if (on && !hiding.has(id)) hiding.set(id, phoenix.ui.hide(id));
    else if (!on && hiding.has(id)) {
      hiding.get(id)?.();
      hiding.delete(id);
    }
  }
};

const settings = phoenix.settings.define({
  hideMedia: {
    type: "switch",
    title: "Hide NSFW media",
    description: "Hide attachment and embed media rows so nothing loads until you open it",
    default: true,
    onChange: syncHide,
  },
  dropMessages: {
    type: "switch",
    title: "Drop NSFW messages",
    description: "Do not show messages with attachments in channels marked NSFW at all",
    default: false,
  },
});

syncHide(settings.hideMedia);
void loadChannels();

phoenix.hook(phoenix.gateway.messageCreate, {
  before(message) {
    if (!settings.dropMessages) return;
    if (!nsfwChannels.has(message.channel_id)) return;
    if (!message.attachments?.length && !message.embeds?.length) return;
    return false;
  },
});

phoenix.onUnload(() => {
  for (const remover of hiding.values()) remover();
  hiding.clear();
});
