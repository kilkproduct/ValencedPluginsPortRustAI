// @description PetPet anyone with /petpet
// @version 1.0.0
// @author cocobo1 (original Valenced plugin); Phoenix port
// @note Contributor to the original: Wolfie
// @warning Sends the target's avatar URL to api.popcat.xyz to render the GIF

// The Valenced original fetched a GIF from api.popcat.xyz, wrote it into the
// cache with FileModule and uploaded it as a real attachment through REST.
// Phoenix has no file-module or multipart upload access, so this port posts
// the service's image URL as a message and lets Discord unfurl it. The
// command name, argument handling and service are the original's.

const SERVICE = "https://api.popcat.xyz/pet?image=";

const avatarFor = async (userId: string): Promise<string> => {
  try {
    const res = await phoenix.discord.get(`/users/${userId}`);
    if (res.ok) {
      const user = res.json<{ id?: string; avatar?: string | null }>();
      if (user.avatar) {
        return `https://cdn.discordapp.com/avatars/${userId}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=128`;
      }
    }
  } catch (err) {
    phoenix.log.debug(`petpet: resolving ${userId}: ${err}`);
  }
  // Default avatars come from the snowflake, like the original did.
  return `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(userId) >> 22n) % 6}.png`;
};

phoenix.commands.register({
  name: "petpet",
  description: "PetPet someone",
  execute: async (args, ctx) => {
    // Accepts a mention, a raw id, or nothing (yourself).
    const id = args.trim().replace(/[<@!>]/g, "") || ctx.currentUserId;
    if (!id || !/^\d+$/.test(id)) return { content: "Usage: /petpet <user mention or id>" };
    const image = await avatarFor(id);
    const url = `${SERVICE}${encodeURIComponent(image)}`;
    phoenix.log.info(`petpet: petted ${id}`);
    // Unfurls into the GIF; the original attached the image itself.
    return { content: url };
  },
});
