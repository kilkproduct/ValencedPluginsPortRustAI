// @description Hides messages from blocked and ignored users
// @version 1.0.0
// @author palmdevs (original Valenced plugin); Phoenix port

// The Valenced original patched ChatManager.createRow to drop blocked/ignored
// rows at render time. Phoenix has no render patch, so the port drops the
// message at the gateway instead: nothing is drawn, because nothing arrives.

const settings = phoenix.settings.define({
  blocked: {
    type: "switch",
    title: "Hide blocked messages",
    description: "Hide messages from users you blocked",
    default: true,
  },
  ignored: {
    type: "switch",
    title: "Hide ignored messages",
    description: "Hide messages from users you ignored",
    default: true,
  },
  replies: {
    type: "switch",
    title: "Hide replies",
    description: "Also hide replies to blocked or ignored users",
    default: false,
  },
});

// Relationship types, per Discord's relationship object.
const BLOCKED = 2;
const IGNORED = 3;

const hidden = new Set<string>();
let loaded = false;

const load = async () => {
  try {
    const res = await phoenix.discord.get("/users/@me/relationships");
    if (!res.ok) return;
    for (const relation of res.json<{ id: string; type: number }[]>()) {
      if (relation.type === BLOCKED || relation.type === IGNORED) hidden.add(relation.id);
    }
    loaded = true;
    phoenix.log.info(`hide-blocked-messages: ${hidden.size} relationship(s) hidden`);
  } catch (err) {
    phoenix.log.warn(`hide-blocked-messages: loading relationships: ${err}`);
  }
};
void load();

const canHide = (userId?: string) => !!userId && hidden.has(userId);

phoenix.hook(phoenix.gateway.messageCreate, {
  before(message) {
    if (!loaded) void load();
    if (!settings.blocked && !settings.ignored) return;
    if (canHide(message.author?.id)) return false;

    if (settings.replies && message.message_reference?.message_id) {
      // The referenced message is usually in the same channel payload cache;
      // when Phoenix did not include it, this is unknowable and the reply stays.
      const referenced = message.referenced_message;
      if (referenced?.author && canHide(referenced.author.id)) return false;
    }
  },
});
