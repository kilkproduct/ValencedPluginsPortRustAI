// Discovers plugins/*/src/index.ts, typechecks, bundles each with esbuild
// (IIFE, es2023, leading `// @` lines kept as banner — same convention as
// Phoenix Unlock's web/tools/bundle-plugins.mjs), writes dist/<name>.js + dist/index.json.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const pluginsDir = `${root}plugins`;
const outDir = `${root}dist`;
mkdirSync(outDir, { recursive: true });

// 1. Typecheck
console.log("== typecheck ==");
const tsc = spawnSync("npx", ["tsc", "-p", `${root}tsconfig.json`], { stdio: "inherit", cwd: root });
if (tsc.status !== 0) {
  console.error("typecheck FAILED");
  process.exit(tsc.status ?? 1);
}
console.log("typecheck OK");

// 2. Bundle
console.log("== bundle ==");
const index = [];
let failed = [];
for (const name of readdirSync(pluginsDir).sort()) {
  const entry = `${pluginsDir}/${name}/src/index.ts`;
  if (!existsSync(entry)) continue;
  const lines = readFileSync(entry, "utf8").split(/\r?\n/);
  const header = lines.slice(0, Math.max(0, lines.findIndex((l) => !l.startsWith("// @")))).join("\n");
  const r = spawnSync(
    "npx",
    ["esbuild", entry, "--bundle", "--format=iife", "--target=es2023", "--log-level=warning",
     `--banner:js=${header}`, `--outfile=${outDir}/${name}.js`],
    { stdio: "inherit", cwd: root }
  );
  if (r.status !== 0) {
    failed.push(name);
    continue;
  }
  const warning = header.match(/^\/\/ @warning (.*)$/m)?.[1] ?? "";
  index.push({
    name,
    description: header.match(/^\/\/ @description (.*)$/m)?.[1] ?? "",
    ...(warning ? { warning } : {}),
  });
  console.log(`  bundled ${name}`);
}
writeFileSync(`${outDir}/index.json`, JSON.stringify(index, null, 2) + "\n");
console.log(`bundled ${index.length} plugin(s): ${index.map((p) => p.name).join(", ")}`);
if (failed.length) {
  console.error(`FAILED: ${failed.join(", ")}`);
  process.exit(1);
}
