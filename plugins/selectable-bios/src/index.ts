// @description Copy profile bios as text
// @version 1.0.0
// @author Loki-vtx (original Valenced plugin); Phoenix port

// The Valenced original patched the `BioText` component to mark every text
// node selectable, so a bio could be highlighted and copied. Phoenix's
// profile sections are not selectable and cannot be patched, but a profile
// tab is drawn by the plugin, so its text can be shown there with a Copy
// action — the same end result (a bio you can take with you).

phoenix.ui.addProfileTab({
  title: "Bio",
  render: async ({ userId }) => {
    if (!userId) return [{ type: "text", text: "Profiles with a default avatar have no bio." }];
    try {
      const res = await phoenix.discord.get(`/users/${userId}/profile`);
      if (!res.ok) return [{ type: "text", text: "Could not load this profile." }];
      const profile = res.json<{ user?: { bio?: string | null; global_name?: string | null } }>();
      const bio = profile.user?.bio?.trim();
      if (!bio) return [{ type: "text", text: "This user has no bio." }];
      return [
        { type: "text", title: profile.user?.global_name ?? "Bio", text: bio },
        {
          type: "buttons",
          buttons: [{ label: "Copy bio", onPress: () => phoenix.ui.copy(bio) }],
        },
      ];
    } catch (err) {
      phoenix.log.warn(`selectable-bios: ${err}`);
      return [{ type: "text", text: "Could not load this profile." }];
    }
  },
});
