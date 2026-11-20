import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

// Sunline Trophy Desk hands the static guide to the grader.
// app/ and screenshots/ are copied into the output directory, then dossier.json
// is whatever buildDossier writes from that copy.

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const out = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");

if (out === root) {
  throw new Error("MAKEFUN_OUTPUT_DIR points at the repository. Refusing to overwrite it.");
}

const appIndex = join(root, "app", "index.html");
if (!existsSync(appIndex)) {
  throw new Error("app/index.html is missing.");
}
if (!existsSync(join(root, "screenshots"))) {
  throw new Error("screenshots/ is missing.");
}

mkdirSync(out, { recursive: true });
cpSync(join(root, "app"), join(out, "app"), { recursive: true });
cpSync(join(root, "screenshots"), join(out, "screenshots"), { recursive: true });

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 48 * 1024 * 1024,
  app_path_max_bytes: 1000
};

const dossier = buildDossier(out, caps);
writeFileSync(join(out, "dossier.json"), dossier);
console.log(`Wrote ${join(out, "dossier.json")} (${dossier.length} bytes)`);
