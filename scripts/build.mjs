import { readFile, readdir, mkdir, copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { build } from "vite";

const root = fileURLToPath(new URL("../", import.meta.url));
const indicatorFiles = (await readdir(path.join(root, "indicators")))
  .filter((file) => file.endsWith(".pine"))
  .sort();
const catalog = await readFile(
  path.join(root, "src/lib/indicators.js"),
  "utf8",
);
const bundledFiles = [
  ...catalog.matchAll(/from\s+["']\.\.\/\.\.\/indicators\/([^"']+)\?raw["']/g),
]
  .map((match) => match[1])
  .sort();
if (JSON.stringify(indicatorFiles) !== JSON.stringify(bundledFiles))
  throw new Error("Website catalog does not match indicators/*.pine");
for (const file of indicatorFiles) {
  const source = await readFile(path.join(root, "indicators", file), "utf8");
  if (!/^\/\/@version=6/m.test(source) || !/\bindicator\s*\(/.test(source))
    throw new Error("Invalid Pine source: " + file);
}
await build({ root });
await mkdir(path.join(root, "out/indicators"), { recursive: true });
for (const file of indicatorFiles)
  await copyFile(
    path.join(root, "indicators", file),
    path.join(root, "out/indicators", file),
  );
console.log(
  `Built React website and standalone lab; ${indicatorFiles.length} exact Pine sources bundled and copied.`,
);
