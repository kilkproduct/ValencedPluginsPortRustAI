// @description Add Settings, Favorites and DM buttons to the chat header
// @version 1.0.0
// @author Purple_Ξye™ (original Valenced plugin); Phoenix port

// The Valenced original rendered extra buttons into the You Bar by patching
// `YouBarNotificationsButton`, and navigated with RootNavigationRef to
// `settings`, `@favorites` and `@me`. Phoenix has no You Bar, no navigation
// ref, and no way to push those screens from a plugin, but it does have chat
// header buttons. This port adds the same three buttons and keeps the
// original's defaults (Settings on, Favorites and DMs off).

type Shortcut = {
  key: "showSettingsButton" | "showFavoritesButton" | "showDMButton";
  title: string;
  description: string;
  icon: string;
  label: string;
  hint: string;
  default: boolean;
};

const SHORTCUTS: Shortcut[] = [
  {
    key: "showSettingsButton",
    title: "Settings button",
    description: "Show the Settings shortcut",
    icon: "res://ic_mana_puzzle_piece_plus",
    label: "User Settings",
    hint: "Settings › Plugins (Phoenix Unlocker) holds plugin options.",
    default: true,
  },
  {
    key: "showFavoritesButton",
    title: "Favorites button",
    description: "Show the Favorites shortcut",
    icon: "res://ic_mana_puzzle_piece_plus",
    label: "Favorites",
    hint: "Favorites live in the expressions picker.",
    default: false,
  },
  {
    key: "showDMButton",
    title: "DMs button",
    description: "Show the Direct Messages shortcut",
    icon: "res://ic_mana_puzzle_piece_plus",
    label: "Direct Messages",
    hint: "The DM list is the first page of the server rail.",
    default: false,
  },
];

const buttons = new Map<string, Phoenix.ButtonRemover>();

const sync = (shortcut: Shortcut, on: boolean) => {
  if (on && !buttons.has(shortcut.key)) {
    buttons.set(
      shortcut.key,
      phoenix.ui.addHeaderButton({
        icon: shortcut.icon,
        label: shortcut.label,
        onPress: (ctx) => ctx.reply(shortcut.hint),
      }),
    );
  } else if (!on && buttons.has(shortcut.key)) {
    buttons.get(shortcut.key)?.();
    buttons.delete(shortcut.key);
  }
};

const settings = phoenix.settings.define({
  showSettingsButton: {
    type: "switch",
    title: SHORTCUTS[0].title,
    description: SHORTCUTS[0].description,
    default: SHORTCUTS[0].default,
    onChange: (value) => sync(SHORTCUTS[0], value),
  },
  showFavoritesButton: {
    type: "switch",
    title: SHORTCUTS[1].title,
    description: SHORTCUTS[1].description,
    default: SHORTCUTS[1].default,
    onChange: (value) => sync(SHORTCUTS[1], value),
  },
  showDMButton: {
    type: "switch",
    title: SHORTCUTS[2].title,
    description: SHORTCUTS[2].description,
    default: SHORTCUTS[2].default,
    onChange: (value) => sync(SHORTCUTS[2], value),
  },
});

for (const shortcut of SHORTCUTS) sync(shortcut, settings[shortcut.key]);

phoenix.onUnload(() => {
  for (const remover of buttons.values()) remover();
  buttons.clear();
});
