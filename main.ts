import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// Sunline Trophy Desk hands the static guide to the grader.
// app/ and screenshots/ are copied into the output directory, then dossier.json
// is whatever buildDossier writes from that copy. A copy into itself, an empty
// image, or a shot over the byte cap fails here with the path in the message.

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const out = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000
};

const appDir = join(root, "app");
const shotDir = join(root, "screenshots");

refuseUnsafeOutput(out, appDir, shotDir);

const appIndex = join(appDir, "index.html");
if (!existsSync(appIndex)) {
  throw new Error("app/index.html is missing. The desk has nothing to publish.");
}

const shots = readScreenshots(shotDir, caps.screenshots);

mkdirSync(out, { recursive: true });
copyTree(appDir, join(out, "app"), "app");
copyTree(shotDir, join(out, "screenshots"), "screenshots");

const copiedIndex = join(out, "app", "index.html");
if (!existsSync(copiedIndex)) {
  throw new Error(`The app copy finished, but ${copiedIndex} is not there.`);
}

const dossier = buildDossierOrExplain(out, caps);
if (dossier.length === 0) {
  throw new Error(`buildDossier returned no bytes for ${out}.`);
}

const dossierPath = join(out, "dossier.json");
writeFileSync(dossierPath, dossier);
const written = lstatSync(dossierPath).size;
if (written !== dossier.length) {
  throw new Error(`dossier.json on disk is ${formatBytes(written)}, but buildDossier returned ${formatBytes(dossier.length)}.`);
}

console.log(`Copied app and ${shots.length} screenshots to ${out}`);
for (const shot of shots) {
  console.log(`  screenshots/${shot.name}  ${formatBytes(shot.bytes)}`);
}
console.log(`Wrote ${dossierPath} (${formatBytes(written)})`);

function refuseUnsafeOutput(outDir, appSource, shotSource) {
  if (outDir === root) {
    throw new Error(`MAKEFUN_OUTPUT_DIR resolves to the repository (${outDir}). Refusing to overwrite it.`);
  }
  const appDest = join(outDir, "app");
  const shotDest = join(outDir, "screenshots");
  if (isInside(appDest, appSource) || isInside(shotDest, shotSource)) {
    throw new Error(`MAKEFUN_OUTPUT_DIR (${outDir}) would copy app/ or screenshots/ into itself. Pick a directory outside those folders.`);
  }
}

function isInside(child, parent) {
  const rel = relative(parent, child);
  if (rel === "") return true;
  if (isAbsolute(rel)) return false;
  return rel !== ".." && !rel.startsWith(`..${sep}`);
}

function readScreenshots(dir, limits) {
  if (!existsSync(dir)) {
    throw new Error("screenshots/ is missing. Capture the official desk views before publishing.");
  }
  let names;
  try {
    names = readdirSync(dir).filter((name) => !name.startsWith(".")).sort();
  } catch (err) {
    throw new Error(`screenshots/ could not be read: ${errorText(err)}`);
  }
  if (names.length === 0) {
    throw new Error("screenshots/ is empty. The first image by name is the cover.");
  }
  if (names.length > limits.max) {
    throw new Error(`screenshots/ has ${names.length} files (${names.join(", ")}). The cap is ${limits.max}.`);
  }
  return names.map((name) => {
    const path = join(dir, name);
    const stat = lstatSync(path);
    if (!stat.isFile()) {
      throw new Error(`screenshots/${name} is not a file.`);
    }
    if (!/\.(png|jpe?g)$/i.test(name)) {
      throw new Error(`screenshots/${name} is not a PNG or JPEG. Remove it or the dossier step will reject the folder.`);
    }
    if (stat.size === 0) {
      throw new Error(`screenshots/${name} is empty.`);
    }
    if (stat.size > limits.max_bytes) {
      throw new Error(`screenshots/${name} is ${formatBytes(stat.size)}, over the ${formatBytes(limits.max_bytes)} cap.`);
    }
    return { name, bytes: stat.size };
  });
}

function copyTree(from, to, label) {
  try {
    cpSync(from, to, { recursive: true });
  } catch (err) {
    throw new Error(`Could not copy ${label}/ from ${from} to ${to}: ${errorText(err)}`);
  }
}

function buildDossierOrExplain(dir, limits) {
  try {
    return buildDossier(dir, limits);
  } catch (err) {
    throw new Error(`Could not build dossier.json from ${dir}: ${errorText(err)}`);
  }
}

function errorText(err) {
  return err instanceof Error ? err.message : String(err);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  const rounded = kb >= 100 ? Math.round(kb) : Math.round(kb * 10) / 10;
  return `${rounded} KB`;
}
