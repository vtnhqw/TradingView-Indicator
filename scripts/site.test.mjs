import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
const root = fileURLToPath(new URL("../", import.meta.url));

test("production build includes both pages, relative assets and unchanged downloadable Pine files", async () => {
  const result = spawnSync(process.execPath, ["scripts/build.mjs"], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(result.status, 0, result.stdout + result.stderr);
  for (const page of ["index.html", "note/level2_orderbook_cheatsheet.html"]) {
    const file = path.join(root, "out", page);
    const html = await readFile(file, "utf8");
    const references = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)]
      .map((match) => match[1])
      .filter((value) => !/^(?:https?:|data:)/.test(value));
    assert.ok(references.some((ref) => ref.endsWith(".js")));
    for (const ref of references) {
      assert.ok(
        !ref.startsWith("/"),
        `Asset must work under a deployment subpath: ${ref}`,
      );
      assert.ok(
        (await readFile(path.resolve(path.dirname(file), ref))).length > 0,
        `Missing ${ref}`,
      );
    }
  }
  for (const file of (await readdir(path.join(root, "indicators"))).filter(
    (file) => file.endsWith(".pine"),
  )) {
    assert.equal(
      await readFile(path.join(root, "out/indicators", file), "utf8"),
      await readFile(path.join(root, "indicators", file), "utf8"),
    );
  }
});
