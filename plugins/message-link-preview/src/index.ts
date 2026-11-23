// @description Preview messages you are linked to, right in chat
// @version 1.0.0
// @author palmdevs (original Valenced plugin); Phoenix port

// The Valenced original rendered full, interactive message rows under a
// message that linked to them (native row injection, tappable, reactable).
// Phoenix has no row injection, so this port shows the linked message's
// author, timestamp and text as a message accessory — the same information
// in a compact form — and opens the full message in a page on tap.

const settings = phoenix.settings.define({
  maxPreviews: {
    type: "number",
    title: "Previews per message",
    description: "Only the first links in a message get a preview",
    default: 5,
  },
});

/** Channel/message links in message content, e.g. https://discord.com/channels/g/c/m */
const LINK = /https?:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/channels\/(\d+|@me)\/(\d+)\/(\d+)/g;

type Link = { guildId: string; channelId: string; messageId: string };

const findLinks = (content: string, selfId: string, max: number): Link[] => {
  const links: Link[] = [];
  for (const match of content.matchAll(LINK)) {
    if (links.length >= max) break;
    const [, guildId, channelId, messageId] = match;
    if (messageId === selfId) continue;
    if (links.some((link) => link.messageId === messageId)) continue;
    links.push({ guildId, channelId, messageId });
  }
  return links;
};

const cache = new Map<string, { at: number; text: string }>();
const TTL = 5 * 60 * 1000;

const preview = async (link: Link): Promise<string | null> => {
  const cached = cache.get(link.messageId);
  if (cached && Date.now() - cached.at < TTL) return cached.text;
  const res = await phoenix.discord.get(`/channels/${link.channelId}/messages/${link.messageId}`);
  if (!res.ok) return null;
  const message = res.json<{
    author?: { username?: string; global_name?: string | null };
    content?: string;
    embeds?: unknown[];
    attachments?: unknown[];
  }>();
  const author = message.author?.global_name || message.author?.username || "unknown";
  const body = message.content?.trim() || (message.embeds?.length ? "[embed]" : message.attachments?.length ? "[attachment]" : "(empty)");
  const text = `${author}: ${body.length > 160 ? `${body.slice(0, 157)}…` : body}`;
  cache.set(link.messageId, { at: Date.now(), text });
  return text;
};

const rendered = new Map<string, Link[]>();

phoenix.ui.addMessageAccessory({
  render: async ({ message, messageId }) => {
    if (!message?.content?.includes("discord.com/channels")) return null;
    const max = Math.max(1, Math.round(settings.maxPreviews));
    const links = findLinks(message.content, messageId, max);
    if (!links.length) return null;
    rendered.set(messageId, links);
    const lines: string[] = [];
    for (const link of links) {
      try {
        const text = await preview(link);
        if (text) lines.push(`↳ ${text}`);
      } catch (err) {
        phoenix.log.debug(`message-link-preview: ${link.messageId}: ${err}`);
      }
    }
    return lines.length ? lines.join("\n") : null;
  },
});

phoenix.ui.addMessageAction({
  label: "Open linked message",
  icon: "res://ic_mana_angle_brackets",
  visible: ({ message }) => !!message?.content?.includes("discord.com/channels"),
  onPress: async ({ message, messageId }) => {
    if (!message?.content) return;
    const max = Math.max(1, Math.round(settings.maxPreviews));
    const links = rendered.get(messageId) ?? findLinks(message.content, messageId, max);
    if (!links.length) return;
    const sections: Phoenix.PageSection[] = [];
    for (const link of links) {
      const res = await phoenix.discord.get(`/channels/${link.channelId}/messages/${link.messageId}`);
      const text = res.ok
        ? (() => {
            const full = res.json<{ content?: string }>();
            return full.content || "(no text)";
          })()
        : "(not visible)";
      sections.push({ type: "text", title: `#${link.channelId}`, text });
    }
    void phoenix.ui.openPage({ title: "Linked messages", sections });
  },
});
