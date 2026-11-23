// @description Hide call and video buttons on profiles and in DMs
// @version 1.0.0
// @author bleelblep (original Valenced plugin); Phoenix port
// @note Contributor to the original: John

// The Valenced original pruned the buttons out of four rendered trees:
// `UserProfileContactButtons` (profile), the DM header, the friends list and
// voice channels. Phoenix can hide views by accessibility id but only knows
// the ids for the composer and the chat header, so only those two surfaces
// can be covered. The other three are documented as unavailable rather than
// guessed at.

const TARGETS = [
  {
    key: "upHideVoiceButton",
    title: "Profile voice button",
    description: "Hide the voice call button on the message composer",
    id: "Record Voice Message",
    default: true,
  },
  {
    key: "headerSearch",
    title: "Chat header search",
    description: "Hide the search entry in the chat header",
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
  upHideVoiceButton: {
    type: "switch",
    title: TARGETS[0].title,
    description: TARGETS[0].description,
    default: TARGETS[0].default,
    onChange: (value) => sync(TARGETS[0], value),
  },
  headerSearch: {
    type: "switch",
    title: TARGETS[1].title,
    description: TARGETS[1].description,
    default: TARGETS[1].default,
    onChange: (value) => sync(TARGETS[1], value),
  },
});

for (const target of TARGETS) sync(target, settings[target.key]);

phoenix.onUnload(() => {
  for (const remover of hiding.values()) remover();
  hiding.clear();
});
