// @description Hides annoying chat buttons (Gift, Voice Message, and more)
// @version 1.0.0
// @author Palm (original Valenced plugin); Phoenix port

// The Valenced original pruned four composer action buttons — Apps &
// Commands, Gift, New Thread and Voice Message — plus the send button's
// collapse behaviour, by patching `ChatInputSendButton`. Phoenix can hide
// views by accessibility id, so it can hide the Gift and Voice Message
// buttons; the Apps & Commands and New Thread ids are not known to plugins,
// and collapse-on-typing is not exposed at all. Those three are documented
// as not ported.

const TARGETS = [
  {
    key: "gift",
    title: "Hide Gift",
    description: "Remove the Nitro Gift button from the chat composer",
    id: "composer.gift",
    default: true,
  },
  {
    key: "voice",
    title: "Hide Voice Message",
    description: "Remove the Record Voice Message button from the chat composer",
    id: "Record Voice Message",
    default: true,
  },
  {
    key: "emoji",
    title: "Hide Emoji",
    description: "Remove the emoji button from the chat composer",
    id: "composer.expressions",
    default: false,
  },
  {
    key: "search",
    title: "Hide Search",
    description: "Remove the search entry from the chat header",
    id: "search.entry",
    default: false,
  },
] as const;

const hiding = new Map<string, Phoenix.Remover>();

const sync = (target: (typeof TARGETS)[number], on: boolean) => {
  const existing = hiding.get(target.key);
  if (on && !existing) hiding.set(target.key, phoenix.ui.hide(target.id));
  else if (!on && existing) {
    existing();
    hiding.delete(target.key);
  }
};

const settings = phoenix.settings.define({
  gift: {
    type: "switch",
    title: TARGETS[0].title,
    description: TARGETS[0].description,
    default: TARGETS[0].default,
    onChange: (value) => sync(TARGETS[0], value),
  },
  voice: {
    type: "switch",
    title: TARGETS[1].title,
    description: TARGETS[1].description,
    default: TARGETS[1].default,
    onChange: (value) => sync(TARGETS[1], value),
  },
  emoji: {
    type: "switch",
    title: TARGETS[2].title,
    description: TARGETS[2].description,
    default: TARGETS[2].default,
    onChange: (value) => sync(TARGETS[2], value),
  },
  search: {
    type: "switch",
    title: TARGETS[3].title,
    description: TARGETS[3].description,
    default: TARGETS[3].default,
    onChange: (value) => sync(TARGETS[3], value),
  },
});

for (const target of TARGETS) sync(target, settings[target.key]);

phoenix.onUnload(() => {
  for (const remover of hiding.values()) remover();
  hiding.clear();
});
