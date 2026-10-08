import assert from "node:assert/strict";
import { realpath, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const fixtureRoot = await realpath(process.cwd());
const resolvedEntry = await realpath(fileURLToPath(import.meta.resolve("@stealthbridge/sdk")));
const installedPackageRoot = await realpath(
  path.join(fixtureRoot, "node_modules", "@stealthbridge", "sdk")
);

assert.equal(resolvedEntry, path.join(installedPackageRoot, "dist", "index.js"));
assert.ok(resolvedEntry.startsWith(`${installedPackageRoot}${path.sep}`));
assert.equal(resolvedEntry.includes(`${path.sep}src${path.sep}`), false);

const packageJson = JSON.parse(
  await readFile(path.join(installedPackageRoot, "package.json"), "utf8")
);
assert.equal(packageJson.name, "@stealthbridge/sdk");
assert.equal(packageJson.version, "0.2.0");
assert.equal(packageJson.exports["."].import, "./dist/index.js");
assert.equal(packageJson.dependencies, undefined);

console.log(`Next.js fixture resolved packed SDK entry: ${resolvedEntry}`);
