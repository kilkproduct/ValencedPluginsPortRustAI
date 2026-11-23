// @description View code blocks in chat with syntax highlighting
// @version 1.0.0
// @author palmdevs (original Valenced plugin); Phoenix port

// The Valenced original highlighted code blocks in place with Shiki, inline
// in the chat list, and could open them in a selectable viewer. Phoenix has
// no chat-list row injection, but it does ship a syntax-highlighting code
// viewer (`ui.openPage` / `ui.showSheet` with `highlight: true`), which is the
// same viewer concept. This port offers both a tap-like message action and a
// long-press-free "open" path, with the original's `openOnTap` default.

const settings = phoenix.settings.define({
  openOnTap: {
    type: "switch",
    title: "Open on tap",
    description: "Tap a code block's action to view it in full and select its text",
    default: true,
  },
});

const BLOCK = /```([^\n`]*)\n([\s\S]*?)```/;

type Block = { lang: string; code: string };

const blocks = (content: string): Block[] => {
  const found: Block[] = [];
  for (const match of content.matchAll(new RegExp(BLOCK.source, "g"))) {
    found.push({ lang: (match[1] || "").trim(), code: match[2] });
  }
  return found;
};

const open = ({ message, messageId, reply }: Phoenix.MessageContext) => {
  const content = message?.content;
  if (!content) return;
  const found = blocks(content);
  if (!found.length) {
    reply("No code block in this message.");
    return;
  }
  if (!settings.openOnTap) return;
  void phoenix.ui.openPage({
    title: found.length === 1 ? `${found[0].lang || "code"}` : `${found.length} code blocks`,
    sections: found.map((block) => ({
      type: "code" as const,
      title: block.lang || undefined,
      text: block.code,
      highlight: true,
    })),
  });
  phoenix.log.debug(`shiki-codeblocks: opened ${found.length} block(s) of ${messageId}`);
};

phoenix.ui.addMessageAction({
  label: "View highlighted",
  icon: "res://ic_mana_angle_brackets",
  visible: ({ message }) => !!message?.content?.includes("```"),
  onPress: open,
});
