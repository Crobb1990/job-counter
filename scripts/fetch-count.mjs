#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const rolesPath = resolve(repoRoot, "config/roles.json");
const dataDir = resolve(repoRoot, "data");

const APP_ID = process.env.ADZUNA_APP_ID;
const APP_KEY = process.env.ADZUNA_APP_KEY;

if (!APP_ID || !APP_KEY) {
  console.error("Missing ADZUNA_APP_ID or ADZUNA_APP_KEY in environment.");
  process.exit(1);
}

async function fetchCount(query) {
  const url = new URL("https://api.adzuna.com/v1/api/jobs/au/search/1");
  url.searchParams.set("app_id", APP_ID);
  url.searchParams.set("app_key", APP_KEY);
  url.searchParams.set("results_per_page", "1");
  url.searchParams.set("what", query);
  url.searchParams.set("content-type", "application/json");

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Adzuna ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  if (typeof body.count !== "number") {
    throw new Error(`Unexpected Adzuna response: ${JSON.stringify(body).slice(0, 200)}`);
  }
  return body.count;
}

async function main() {
  const roles = JSON.parse(await readFile(rolesPath, "utf8"));
  await mkdir(dataDir, { recursive: true });

  const errors = [];
  for (const role of roles) {
    try {
      const count = await fetchCount(role.query);
      const out = {
        id: role.id,
        label: role.label,
        query: role.query,
        count,
        updatedAt: new Date().toISOString(),
        source: "Adzuna Australia",
      };
      await writeFile(
        resolve(dataDir, `${role.id}.json`),
        JSON.stringify(out, null, 2) + "\n",
      );
      console.log(`✓ ${role.id} (${role.query}): ${count.toLocaleString()}`);
    } catch (err) {
      console.error(`✗ ${role.id}: ${err.message}`);
      errors.push(role.id);
    }
  }

  if (errors.length) {
    console.error(`\n${errors.length} role(s) failed: ${errors.join(", ")}`);
    process.exit(1);
  }
}

main();
