import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildLocalExportPackage } from "../packages/core/dist/index.js";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const fixturePath = resolve(root, "fixtures/mvp1/ordinary-dialogue/document.taro.json");
const outDir = resolve(root, "dist/mvp1-ordinary-dialogue");
const document = JSON.parse(await readFile(fixturePath, "utf8"));
const exported = buildLocalExportPackage(document, { artifact_path: outDir });

if (!exported.ok) {
  console.error(JSON.stringify(exported.diagnostics, null, 2));
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
for (const file of exported.files) {
  const target = resolve(outDir, file.path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, file.contents);
}

console.log(outDir);
