// Shared by the observer's tools: read and append register events, validated against the
// chaOS event contract (imported read-only from the shared runtime). Append-only.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export const ROOT = process.cwd();
export const EVENTS = path.join(ROOT, "traceability/register/events.jsonl");
export const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
export const OBSERVER = { role: "agent", name: "claude-code", system: "observer" };

const { validateEvent } = await import(path.join(ROOT, "knowledge-engineering-chaOS/chaOS-seed-main/src/contract.mjs"));

export function readEvents() {
  if (!fs.existsSync(EVENTS)) return [];
  return fs.readFileSync(EVENTS, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
}

// input: { type, actor, data }. data.occurred is required: { at } or { not_before, not_after }, plus basis.
export function appendEvent(input) {
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
  const times = o ? (o.at ? [o.at] : [o.not_before, o.not_after]) : [];
  if (!o || !o.basis || !times.every((t) => ISO.test(String(t))))
    problems.push("data.occurred needs at, or not_before and not_after, as ISO 8601 UTC times, plus a basis");
  if (problems.length) throw new Error(`refused: ${problems.join("; ")}`);
  const existing = fs.existsSync(EVENTS) ? fs.readFileSync(EVENTS, "utf8") : "";
  fs.appendFileSync(EVENTS, (existing && !existing.endsWith("\n") ? "\n" : "") + JSON.stringify(event) + "\n");
  return event;
}

export const sha256 = (file) => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
