// @description Show profile badges from other client mods
// @version 1.0.0
// @author Wolfie (original Valenced plugin); Phoenix port
// @warning Fetches badges.equicord.org/users, which returns badges for every
// @warning known user in one response; no user IDs are sent by this plugin.

// The Valenced original patched Discord's `useBadges` hook and ProfileBadge
// components to splice the badges into the profile's own badge row, then let
// you reorder and hide them. Phoenix has no profile badge row patch, so this
// port shows the same badges in a profile section (native images are not
// reachable from sections, so each line is "mod — tooltip").

const API = "https://badges.equicord.org/users";
const REFRESH = 30 * 60 * 1000;

/** The client mods the badge service knows, with display names. */
const PROVIDERS: Record<string, string> = {
  aero: "Aero",
  raincord: "Raincord",
  aliucord: "Aliucord",
  badgevault: "BadgeVault",
  betterdiscord: "BetterDiscord",
  bunny: "Bunny",
  enmity: "Enmity",
  equicord: "Equicord",
  goosemod: "GooseMod",
  nekocord: "Nekocord",
  paicord: "Paicord",
  record: "ReCord",
  replugged: "Replugged",
  reviewdb: "ReviewDB",
  velocity: "Velocity",
  vencord: "Vencord",
  vendroidenhanced: "Vendroid Enhanced",
};

type Badge = { mod: string; badge: string; tooltip: string };

const settings = phoenix.settings.define({
  showModStyle: {
    type: "select",
    title: "Mod name position",
    options: [
      { value: "none", label: "Hidden" },
      { value: "prefix", label: "Before the tooltip" },
      { value: "suffix", label: "After the tooltip" },
    ],
    default: "prefix",
  },
  refreshNow: {
    type: "button",
    title: "Refresh badges",
    onPress: () => {
      users.clear();
      last = 0;
      phoenix.ui.toast("Badge cache cleared; the next profile refreshes it.");
    },
  },
});

const users = new Map<string, Badge[]>();
let last = 0;
let fetching = false;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parse = (body: unknown) => {
  if (!isRecord(body) || !isRecord(body.users)) throw new Error("invalid badge response");
  for (const [userId, list] of Object.entries(body.users)) {
    if (!Array.isArray(list)) continue;
    const valid = list.filter(
      (badge): badge is Badge =>
        isRecord(badge) &&
        typeof badge.mod === "string" &&
        badge.mod.length > 0 &&
        typeof badge.badge === "string" &&
        typeof badge.tooltip === "string" &&
        // The original skipped its own ecosystem's badges.
        badge.mod.toLowerCase() !== "valenced",
    );
    if (valid.length) users.set(userId, valid);
    else users.delete(userId);
  }
};

const refresh = async () => {
  if (fetching) return;
  if (users.size && Date.now() - last < REFRESH) return;
  fetching = true;
  try {
    const res = await phoenix.fetch(API, { headers: { "cache-control": "no-cache" } });
    if (!res.ok) throw new Error(`badge service returned ${res.status}`);
    parse(res.json());
    last = Date.now();
    phoenix.log.info(`global-badges: ${users.size} user(s) with badges`);
  } catch (err) {
    phoenix.log.warn(`global-badges: ${err}`);
  } finally {
    fetching = false;
  }
};

const label = (badge: Badge) => {
  const name = PROVIDERS[badge.mod] ?? badge.mod;
  if (settings.showModStyle === "prefix") return `${name} - ${badge.tooltip}`;
  if (settings.showModStyle === "suffix") return `${badge.tooltip} - ${name}`;
  return badge.tooltip;
};

phoenix.ui.addProfileSection({
  title: "Client Badges",
  render: async ({ userId }) => {
    if (!userId) return null;
    await refresh();
    const badges = users.get(userId);
    if (!badges?.length) return null;
    return badges.map(label).join("\n");
  },
});

phoenix.ui.addProfileTab({
  title: "Badges",
  render: async ({ userId }) => {
    if (!userId) return [{ type: "text", text: "No badges for a default profile." }];
    await refresh();
    const badges = users.get(userId);
    if (!badges?.length) return [{ type: "text", text: "No badges from other client mods." }];
    // Images render in profile tabs, so the badge artwork can be shown here.
    return badges.map((badge) => ({
      type: "entry" as const,
      title: label(badge),
      subtitle: PROVIDERS[badge.mod] ?? badge.mod,
      text: "",
      images: [badge.badge],
    }));
  },
});

phoenix.onUnload(() => users.clear());
