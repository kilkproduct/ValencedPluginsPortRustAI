// @description Stops Discord from sending typing indicators when you type
// @version 1.0.0
// @author palmdevs (original Valenced plugin); Phoenix port

const settings = phoenix.settings.define({
  enabled: {
    type: "switch",
    title: "Silent typing",
    description: "Never send typing indicators",
    default: true,
  },
});

// Discord sends POST /channels/{id}/typing while you type. Dropping the
// request keeps the indicator from ever leaving the device.
phoenix.discord.onRequest(
  { method: "POST", pathPrefix: "/channels/", pathSuffix: "/typing" },
  () => (settings.enabled ? false : undefined),
);
