// @description Brings back Tenor GIF search through /tenor
// @version 1.0.0
// @author Palm (original Valenced plugin); Phoenix port
// @note Contributor to the original: Livie

// The Valenced original made Discord's own GIF picker talk to Tenor instead
// of its new provider by intercepting the picker's HTTP calls. Phoenix has no
// picker hook, but it does have Discord request interception and slash
// commands, so this port answers /tenor with Tenor's API directly and posts
// the chosen GIF. The provider, API key and grid qualities are the original's.

/** Tenor API v1 key Discord used before it moved to its own GIF provider. */
const TENOR_KEY = "3Z0688EVWYKH";
const TENOR = "https://api.tenor.com/v1";

const GridQualities = [
  { value: "gif" },
  { value: "tinygif" },
  { value: "nanogif" },
] as const;

const settings = phoenix.settings.define({
  gridQuality: {
    type: "select",
    title: "GIF quality",
    description: "Media format requested from Tenor",
    options: GridQualities,
    default: "tinygif",
  },
  limit: {
    type: "number",
    title: "Results",
    description: "How many GIFs to list (Tenor caps this at 50)",
    default: 8,
  },
});

type TenorResult = {
  id?: string;
  content_description?: string;
  itemurl?: string;
  media?: { gif?: Record<string, { url?: string }>; tinygif?: { url?: string }; nanogif?: { url?: string } }[];
};

type TenorResponse = { results?: TenorResult[]; next?: string };

const urlOf = (result: TenorResult): string | undefined => {
  const media = result.media?.[0] as Record<string, { url?: string }> | undefined;
  if (!media) return undefined;
  return media[settings.gridQuality]?.url ?? media.gif?.url ?? result.itemurl;
};

const search = async (query: string, limit: number): Promise<TenorResult[]> => {
  const url = `${TENOR}/search?q=${encodeURIComponent(query)}&key=${TENOR_KEY}&limit=${limit}&media_filter=minimal`;
  const res = await phoenix.fetch(url);
  if (!res.ok) throw new Error(`Tenor returned ${res.status}`);
  return res.json<TenorResponse>().results ?? [];
};

phoenix.commands.register({
  name: "tenor",
  description: "Search Tenor for a GIF",
  execute: async (args, ctx) => {
    const query = args.trim();
    if (!query) return { content: "Usage: /tenor <search terms>" };
    const limit = Math.min(50, Math.max(1, Math.round(settings.limit)));
    let results: TenorResult[];
    try {
      results = await search(query, limit);
    } catch (err) {
      phoenix.log.warn(`tenor-gif-search: ${err}`);
      return { content: "Tenor search failed. Try again later." };
    }
    if (!results.length) return { content: `No GIFs for "${query}".` };

    const options: Phoenix.PageSection[] = [
      {
        type: "buttons",
        buttons: results.map((result, index) => ({
          label: `${index + 1}. ${(result.content_description ?? "GIF").slice(0, 40)}`,
          onPress: () => {
            const url = urlOf(result);
            if (!url) return;
            phoenix.ui.copy(url);
            phoenix.ui.toast("GIF link copied — paste it in the message box");
          },
        })),
      },
    ];
    void phoenix.ui.openPage({ title: `Tenor: ${query}`, sections: options });
    return ctx.reply(`Found ${results.length} GIF(s) for "${query}"`);
  },
});
