// One-command verification against the *real* Phoenix tree.
//
//   node tools/test-with-phoenix.mjs [--keep]
//
// Clones mantikafasi/phoenix-unlock (shallow, sparse) into .vendor/phoenix if
// it is not already there, then runs exactly what CI runs: strict typecheck
// against `crates/runtime/phoenix.d.ts`, the esbuild bundle for every plugin,
// and the behavioural test suite. `--keep` leaves the clone in place (it is
// gitignored); without it the clone is removed again afterwards.
import { spawnSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const vendor = `${root}.vendor/phoenix`;
const keep = process.argv.includes("--keep");
// Only remove what this run created; a developer may have other clones in
// .vendor/ (for example the Valenced catalogue used for analysis).
let cloned = false;
const run = (cmd, args, cwd = root) => {
  const result = spawnSync(cmd, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
};

if (!existsSync(`${vendor}/crates/runtime/phoenix.d.ts`)) {
  console.log("== cloning Phoenix Unlock (sparse) ==");
  run("git", [
    "clone", "--depth", "1", "--filter=blob:none", "--sparse",
    "https://github.com/mantikafasi/phoenix-unlock", vendor,
  ]);
  run("git", ["sparse-checkout", "set", "crates/runtime", "crates/wire", "web/tools", "plugins"], vendor);
  cloned = true;
}

console.log("== typecheck against phoenix.d.ts ==");
run("npx", ["tsc", "-p", `${root}tsconfig.json`]);

console.log("== bundle ==");
run("node", [`${root}scripts/build.mjs`]);

console.log("== behavioural tests ==");
run("node", [`${root}scripts/test.mjs`]);

console.log("== docs/inventory freshness ==");
run("node", [`${root}scripts/docs.mjs`]);

if (!keep && cloned) {
  console.log("== removing the temporary Phoenix clone (use --keep to retain) ==");
  rmSync(vendor, { recursive: true, force: true });
}
console.log("\nall checks passed");
