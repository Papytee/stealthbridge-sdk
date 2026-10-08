import { after, before, describe, test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { build as bundle } from "esbuild";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = path.join(root, "tests", "fixtures");
const artifacts = path.join(root, "artifacts");
const expectedPackageFiles = [
  "README.md",
  "dist/client.d.ts",
  "dist/client.js",
  "dist/index.d.ts",
  "dist/index.js",
  "dist/types.d.ts",
  "dist/types.js",
  "package.json"
];
const budgets = {
  packedBytes: 12_000,
  unpackedBytes: 30_000,
  fullBrowserBytes: 3_000,
  treeShakenBrowserBytes: 1_000
};
const forbiddenModulePattern = /^(?:node:|fs(?:\/|$)|crypto(?:\/|$)|path(?:\/|$)|child_process(?:\/|$)|worker_threads(?:\/|$)|net(?:\/|$)|tls(?:\/|$))/;
const secretMaterialPattern = /\b(?:privateKey|secretKey|mnemonic|seedPhrase|walletSecret)\b/i;

let workspace;
let packed;
let tarball;

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: { ...process.env, NO_COLOR: "1" }
  });
  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed (${result.status})\n${result.stdout}\n${result.stderr}`
    );
  }
  return result.stdout.trim();
}

async function installFixture(name) {
  const destination = path.join(workspace, name);
  await cp(path.join(fixtures, name), destination, { recursive: true });
  run("npm", [
    "install",
    "--offline",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--no-package-lock",
    "--no-save",
    tarball
  ], destination);
  return destination;
}

async function browserBuild(entryPoint) {
  const result = await bundle({
    entryPoints: [entryPoint],
    bundle: true,
    format: "esm",
    platform: "browser",
    target: ["es2022"],
    treeShaking: true,
    minify: true,
    metafile: true,
    write: false,
    logLevel: "silent"
  });
  assert.equal(result.outputFiles.length, 1);
  const output = result.outputFiles[0];
  return { bytes: output.contents.byteLength, text: output.text, metafile: result.metafile };
}

function assertBrowserSafe(result) {
  const imports = Object.values(result.metafile.inputs).flatMap((input) => input.imports);
  assert.equal(
    imports.some(({ path: importPath }) => forbiddenModulePattern.test(importPath)),
    false,
    "browser bundle must not reference Node.js built-ins"
  );
  assert.doesNotMatch(result.text, secretMaterialPattern);
  assert.doesNotMatch(result.text, /\b(?:process|Buffer|require)\b/);
}

before(async () => {
  assert.ok(Number.parseInt(process.versions.node, 10) >= 22, "package checks require Node.js 22+");
  workspace = await mkdtemp(path.join(tmpdir(), "stealthbridge-package-consumers-"));
  await mkdir(artifacts, { recursive: true });
  const packOutput = run("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", artifacts]);
  [packed] = JSON.parse(packOutput);
  tarball = path.join(artifacts, packed.filename);
});

after(async () => {
  if (workspace) await rm(workspace, { recursive: true, force: true });
});

describe("published package contract", { concurrency: false }, () => {
  test("emits the public ESM entry point and declarations", async () => {
    const packageJson = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
    assert.deepEqual(packageJson.exports, {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
        default: "./dist/index.js"
      }
    });
    assert.equal(packageJson.type, "module");
    assert.equal(packageJson.sideEffects, false);
    assert.equal(packageJson.engines.node, ">=22");

    for (const emittedFile of expectedPackageFiles.filter((name) => name.startsWith("dist/"))) {
      const contents = await readFile(path.join(root, emittedFile), "utf8");
      assert.ok(contents.length > 0, `${emittedFile} must be non-empty`);
    }
    assert.match(await readFile(path.join(root, "dist/index.js"), "utf8"), /\.\/client\.js/);
    assert.match(await readFile(path.join(root, "dist/index.d.ts"), "utf8"), /\.\/types\.js/);
  });

  test("packs only intended files with verifiable integrity and size budgets", async (context) => {
    assert.deepEqual(packed.files.map(({ path: filePath }) => filePath).sort(), expectedPackageFiles);
    const archive = await readFile(tarball);
    const integrity = `sha512-${createHash("sha512").update(archive).digest("base64")}`;
    const shasum = createHash("sha1").update(archive).digest("hex");
    assert.equal(packed.integrity, integrity);
    assert.equal(packed.shasum, shasum);
    assert.ok(packed.size <= budgets.packedBytes, `${packed.size} exceeds ${budgets.packedBytes}`);
    assert.ok(
      packed.unpackedSize <= budgets.unpackedBytes,
      `${packed.unpackedSize} exceeds ${budgets.unpackedBytes}`
    );
    context.diagnostic(`tarball ${packed.filename}: ${packed.size} B packed, ${packed.unpackedSize} B unpacked`);
  });

  test("installs the tarball and resolves the public API in Node.js ESM", async (context) => {
    const consumer = await installFixture("node-esm");
    const output = run(process.execPath, ["index.mjs"], consumer);
    assert.match(output, /all read-only methods/);
    context.diagnostic(`runtime ${process.version}: ${output}`);
  });

  test("resolves every public declaration in an isolated TypeScript consumer", async () => {
    const consumer = await installFixture("typescript");
    run(process.execPath, [path.join(root, "node_modules", "typescript", "bin", "tsc"), "-p", "tsconfig.json"], consumer);
  });

  test("creates a browser-safe bundle from the installed tarball", async (context) => {
    const consumer = await installFixture("browser");
    const result = await browserBuild(path.join(consumer, "full.mjs"));
    assertBrowserSafe(result);
    assert.ok(
      result.bytes <= budgets.fullBrowserBytes,
      `${result.bytes} exceeds ${budgets.fullBrowserBytes}`
    );
    context.diagnostic(`full minified browser ESM bundle: ${result.bytes} B`);
  });

  test("tree-shakes unused client code with a reproducible size ceiling", async (context) => {
    const consumer = path.join(workspace, "browser");
    const full = await browserBuild(path.join(consumer, "full.mjs"));
    const shaken = await browserBuild(path.join(consumer, "tree-shaken.mjs"));
    assertBrowserSafe(shaken);
    assert.ok(
      shaken.bytes <= budgets.treeShakenBrowserBytes,
      `${shaken.bytes} exceeds ${budgets.treeShakenBrowserBytes}`
    );
    assert.ok(shaken.bytes < full.bytes / 2, `${shaken.bytes} is not less than half of ${full.bytes}`);
    assert.doesNotMatch(shaken.text, /StealthBridgeClient|\/v1\/|\/health/);
    context.diagnostic(`ApiError-only bundle: ${shaken.bytes} B (${full.bytes} B full)`);
  });
});
