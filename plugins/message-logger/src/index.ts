// @description Keeps deleted messages and edit history visible in chat
// @version 1.0.0
// @author palmdevs (original Valenced plugin); Phoenix port

const { gateway } = phoenix;

const settings = phoenix.settings.define({
  logDeletes: {
    type: "switch",
    title: "Deleted messages",
    description: "Keep deleted messages and attachments in chat",
    default: true,
  },
  logEdits: {
    type: "switch",
    title: "Edits",
    description: "Keep earlier versions of edited messages",
    default: true,
  },
  ignoreSelf: {
    type: "switch",
    title: "Your messages",
    description: "Do not log your own messages",
    default: false,
  },
  ignoreBots: {
    type: "switch",
    title: "Bots",
    description: "Do not log messages from bots",
    default: false,
  },
});

interface Change {
  text: string;
  removed: boolean;
  at: number;
}

interface Entry {
  content: string;
  attachments: Phoenix.Attachment[];
  changes: Change[];
  deletedAt?: number;
}

const EPHEMERAL = 64;
const RED = 0xfff23f43;
const LIMIT = 8192;
const entries = new Map<string, Entry>();
let selfId: string | undefined;

const whoAmI = async () => {
  if (selfId) return;
  try {
    const res = await phoenix.discord.get("/users/@me");
    if (res.ok) selfId = res.json<{ id?: string }>().id;
  } catch {
    // Not signed in yet; retried on the next message.
  }
};
void whoAmI();

const ignored = (message: Phoenix.GatewayMessage) => {
  if ((message.flags & EPHEMERAL) !== 0) return true;
  if (settings.ignoreBots && message.author?.bot) return true;
  if (settings.ignoreSelf && selfId && message.author?.id === selfId) return true;
  return false;
};

const clock = (at: number) => {
  const date = new Date(at);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const history = phoenix.ui.addMessageAccessory({
  priority: 1,
  render({ messageId }) {
    const entry = entries.get(messageId);
    if (!settings.logEdits || !entry?.changes.length) return null;
    const text = entry.changes
      .map((change) =>
        change.removed
          ? `Removed ${change.text} · ${clock(change.at)}`
          : `${change.text || "(empty)"} · edited ${clock(change.at)}`,
      )
      .join("\n");
    return entry.deletedAt === undefined ? text : { text, color: RED };
  },
});

const deleted = phoenix.ui.addMessageAccessory({
  render({ messageId }) {
    const at = entries.get(messageId)?.deletedAt;
    return at === undefined ? null : { text: `Deleted · ${clock(at)}`, color: RED, tint: RED };
  },
});

const remember = (message: Phoenix.GatewayMessage) => {
  let entry = entries.get(message.id);
  if (!entry) {
    entry = { content: message.content, attachments: [], changes: [] };
    entries.set(message.id, entry);
    // Oldest first, so the map stays bounded.
    for (const key of entries.keys()) {
      if (entries.size <= LIMIT) break;
      entries.delete(key);
    }
  }
  entry.content = message.content;
  if (message.attachments?.length) entry.attachments = message.attachments;
  return entry;
};

phoenix.hook(gateway.messageCreate, {
  before(message) {
    if (!message?.id || typeof message.content !== "string") return;
    if (!selfId) void whoAmI();
    if (ignored(message)) return;
    remember(message);
  },
});

phoenix.hook(gateway.messageUpdate, {
  before(message) {
    if (!message?.id || typeof message.content !== "string") return;
    if (ignored(message)) return;
    const old = entries.get(message.id);
    const at = message.edited_timestamp ? Date.parse(message.edited_timestamp) : Date.now();
    const changes = old?.changes ?? [];
    if (old && old.content !== message.content) {
      changes.push({ text: old.content, removed: false, at });
    }
    const removed = (old?.attachments ?? []).filter(
      (attachment) => !message.attachments?.some((kept) => kept.id === attachment.id),
    );
    if (removed.length) {
      message.attachments = [...(message.attachments ?? []), ...removed];
      changes.push({
        text: removed.map((attachment) => attachment.filename).join(", "),
        removed: true,
        at,
      });
    }
    if (old) old.changes = changes;
    remember(message);
    if (old) history.update?.(message.id);
  },
});

const markDeleted = (id: string) => {
  const entry = entries.get(id);
  if (!entry) return false;
  if (entry.deletedAt === undefined) {
    entry.deletedAt = Date.now();
    deleted.update?.(id);
    if (entry.changes.length) history.update?.(id);
  }
  return true;
};

phoenix.hook(gateway.messageDelete, {
  before(message) {
    if (!settings.logDeletes) return;
    if (markDeleted(message.id)) return false;
  },
});

phoenix.hook(gateway.messageDeleteBulk, {
  before(bulk) {
    if (!settings.logDeletes) return;
    const kept = bulk.ids.filter((id) => !markDeleted(id));
    if (!kept.length) return false;
    bulk.ids = kept;
  },
});
