# shared/

Intentionally empty of importable code.

Phoenix bundles **one file per plugin** (`plugins/<name>/src/index.ts` → `dist/<name>.js`) and a plugin
directory must stay independently installable — drop it into a Phoenix checkout and it builds, copy one
bundle and it runs. A `../../shared/…` import would break both, so nothing here is imported.

Shared *knowledge* lives here instead:

## Reading Phoenix's cache safely

`phoenix.stores.sql` is read-only, capped at 10,000 rows, and its schema is not a promise. Every port that
reads it uses this shape:

```ts
const unpad = (id: string) => id.replace(/^0+/, ""); // cache keys are 20-digit zero-padded

try {
  const rows = await phoenix.stores.sql<{ id: string; nsfw: number }>(
    "SELECT substr(k, 1, 20) AS id, json_extract(CAST(v AS TEXT), '$.nsfw') AS nsfw" +
      " FROM channels WHERE json_extract(CAST(v AS TEXT), '$.nsfw') = 1",
  );
  for (const row of rows) ids.add(unpad(String(row.id)));
} catch (err) {
  phoenix.log.warn(`reading the cache: ${err}`); // feature goes inert, never crashes
}
```

One row per entity (`GROUP BY`, `substr(k, 1, 20)`) keeps the query far below the row cap — see Phoenix's own
`plugins/fakenitro` for the emoji/channel form.

## Compact durations

```ts
function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}
```

## Avatar URLs, with the default-avatar fallback

```ts
const avatarUrl = (user: { id: string; avatar?: string | null }, size = 128) =>
  user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${user.avatar.startsWith("a_") ? "gif" : "png"}?size=${size}`
    : `https://cdn.discordapp.com/embed/avatars/${Number(BigInt(user.id) >> 22n) % 6}.png`;
```

## Reading `/users/@me` once

Phoenix rejects plugin API calls until the app has made a request of its own, so the pattern is: try, cache
on success, and retry on the next gateway event (never in a loop).

```ts
let selfId: string | undefined;
async function whoAmI() {
  if (selfId) return;
  try {
    const res = await phoenix.discord.get("/users/@me");
    if (res.ok) selfId = res.json<{ id?: string }>().id;
  } catch { /* retried on the next message */ }
}
```
