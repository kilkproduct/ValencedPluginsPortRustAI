# Attribution and licence audit

## Source repositories

| Repository | Commit | Licence | Notes |
| --- | --- | --- | --- |
| [Valenced/valenced-community-plugins](https://github.com/Valenced/valenced-community-plugins) | `4dbc3f9d` (vendored at `.vendor/vc-plugins`) | **GPL-3.0** (`LICENSE` at the repo root) | Catalogue of 47 plugins |
| [mantikafasi/phoenix-unlock](https://github.com/mantikafasi/phoenix-unlock) | `4527ff50` (vendored at `.vendor/phoenix`) | No licence file in the checked-out tree (public repository) | Target platform; used only as a build/API reference, no Phoenix code is redistributed here |
| This repository | — | **MIT** (`LICENSE`, kilkproduct 2026) | The port code |

## Two layers of licensing

A Valenced plugin's files are licensed twice over: by the repository's GPL-3.0 (the default for all 47
directories) **and**, for four plugins, by their own licence file:

| Plugin | Plugin-level licence file | Effect |
| --- | --- | --- |
| `clear-urls` | CC-BY-4.0 (+ `NOTICE`) | Attribution required; its `NOTICE` also credits RevengePlugins (CC BY 4.0) and ClearURLs Rules |
| `favorite-anything` | MIT | Reuse permitted with copyright notice |
| `hide-call-buttons` | BSD-3-Clause | Reuse permitted with notice; no endorsement |
| `show-tag` | Unlicense | Public domain |

The remaining 43 inherit GPL-3.0 from the repository root.

## How the ports respect it

1. **No Valenced source is copied.** Every plugin in `plugins/` was written against Phoenix's TypeScript API.
   Behaviour (settings, labels, defaults, algorithms such as clear-urls' parameter list or tenor-gif-fix's
   URL transform) was re-derived from reading the original, which is what the GPL/MIT/CC terms permit —
   reimplementation is independent expression. Where the original's *data* mattered (clear-urls' ClearURLs
   rule list, which is CC BY 4.0), the port carries the attribution in its header comment.
2. **Attribution is retained per plugin.** Author, original version and the original source path appear in
   `plugins/<name>/README.md`, `plugins/<name>/metadata.json` and `migration/status.json`. Contributors named
   by a manifest are credited with `// @note` lines in the source.
3. **Modifications are documented.** Each source file opens with a comment describing the original's
   mechanism and the port's, and each README has "What the original did" / "What this port does".
4. **No endorsement implied.** BSD-3-Clause's non-endorsement clause is respected: nothing here claims the
   original authors reviewed or endorsed these ports.
5. **The result's licence.** The port code is MIT, which is compatible with reimplementing GPL-3.0 behaviour
   without copying the expression. If you intend to redistribute a *modified copy of the original plugin*
   rather than a reimplementation, GPL-3.0 applies instead.

## Per-plugin audit

| Original plugin | Original author | Original licence | Port status | Attribution / licence note |
| --- | --- | --- | --- | --- |
| Better Chat Buttons | Palm | GPL-3.0 (repository licence) | IMPLEMENTED | Independent reimplementation; no Valenced source copied |
| Better Typing Indicators | Palm | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Character Counter | thororen | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Clear URLs | hakuxyz | CC-BY-4.0 | IMPLEMENTED | Yes — attribution to nexpid/RevengePlugins and ClearURLs Rules, kept in the port's header comment |
| Dashless | k1ng_op | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Fake Nitro | Palm | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Favorite Anything | TheUnrealZaka | MIT | PARTIAL | Yes — MIT permits reuse with notice; the port credits Zakaria Hamdaoui, nin0dev and davri |
| GIF to Chat Input | j | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Global Badges | Wolfie | GPL-3.0 (repository licence) | IMPLEMENTED | Independent reimplementation; no Valenced source copied |
| Hide Blocked Messages | Palm | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Hide Call Buttons | bleelblep | BSD-3-Clause | IMPLEMENTED | Yes — credits bleelblep and John |
| Link Alert Copy | Palm | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Mention Avatars | Palm | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Message Link Preview | Palm | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Message Logger | Palm | GPL-3.0 (repository licence) | IMPLEMENTED | Independent reimplementation; no Valenced source copied |
| No Embed Copy | thororen | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| NSFW Blur | thororen | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| PetPet | cocobo1 | GPL-3.0 (repository licence) | IMPLEMENTED | Independent reimplementation; no Valenced source copied |
| Read All Notifications | NexzaDev | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Selectable Bios | Loki-vtx | GPL-3.0 (repository licence) | IMPLEMENTED | Independent reimplementation; no Valenced source copied |
| Shiki Codeblocks | Palm | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Show Tag | bleelblep | Unlicense | PARTIAL | Yes — public domain |
| Show Timeout Duration | Palm | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Silent Typing | Palm | GPL-3.0 (repository licence) | IMPLEMENTED | Independent reimplementation; no Valenced source copied |
| Tenor GIF Fix | thororen | GPL-3.0 (repository licence) | IMPLEMENTED | Independent reimplementation; no Valenced source copied |
| Tenor GIF Search | Palm | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| Who Reacted | Palm | GPL-3.0 (repository licence) | PARTIAL | Independent reimplementation; no Valenced source copied |
| YouBar+ | Purple_Ξye™ | GPL-3.0 (repository licence) | IMPLEMENTED | Independent reimplementation; no Valenced source copied |

## Third-party services used by ports

| Service | Plugin | Data sent | Documented where |
| --- | --- | --- | --- |
| `badges.equicord.org` | global-badges | Nothing user-specific: the service returns all known users in one response | `// @warning` header + README privacy note |
| `api.popcat.xyz` | petpet | The target user's avatar URL | `// @warning` header + README |
| `api.tenor.com` | tenor-gif-search | The search query | `// @warning` header + README |

No port reads, stores or transmits credentials, private conversations or other users' data, and none
bypasses access controls. `read-all-notifications` only acks the signed-in user's own read state;
`fake-nitro` only rewrites the user's own outgoing message text to image links.

## What was deliberately not ported for policy reasons

Nothing in the catalogue had to be excluded for being invasive: every plugin whose behaviour touches
privacy either was portable in a transparent form (see above) or is blocked for *technical* reasons
documented in `migration/compatibility.md`. `fake-nitro` is the closest call — it does not unlock Nitro for
media playback or themes, and its port only sends emojis as ordinary image links, which is client-neutral.
