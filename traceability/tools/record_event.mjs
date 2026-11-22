#!/usr/bin/env node
// Append one event to the observer register, validated against the chaOS event contract.
//
// Usage (from the repository root):
//   echo '{"type":"git-commit","actor":{"role":"agent"},"data":{...}}' | node traceability/tools/record_event.mjs
//
// Adds id and at (the recording time), and data.system / data.recorded_by. Refuses to
// append an event that fails the contract or lacks data.occurred with a basis (VR-09).
// Append-only: it never rewrites existing lines. Never writes outside traceability/.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const EVENTS = path.join(ROOT, "traceability/register/events.jsonl");
const { validateEvent } = await import(path.join(ROOT, "knowledge-engineering-chaOS/chaOS-seed-main/src/contract.mjs"));

const input = JSON.parse(fs.readFileSync(0, "utf8"));
const now = Date.now();
const event = {
  id: `e-${now.toString(36)}-${crypto.randomBytes(3).toString("hex")}`,
  at: new Date(now).toISOString(),
  type: input.type,
  actor: input.actor,
  data: { system: "observer", ...input.data, recorded_by: "observer" },
};

const problems = validateEvent(event);
const o = event.data.occurred;
if (!o || !o.basis || !(o.at || (o.not_before && o.not_after))) problems.push("data.occurred needs at, or not_before and not_after, plus a basis");
if (problems.length) {
  console.error(`refused: ${problems.join("; ")}`);
  process.exit(1);
}
const existing = fs.existsSync(EVENTS) ? fs.readFileSync(EVENTS, "utf8") : "";
fs.appendFileSync(EVENTS, (existing && !existing.endsWith("\n") ? "\n" : "") + JSON.stringify(event) + "\n");
console.log(`${event.id} ${event.type}`);
