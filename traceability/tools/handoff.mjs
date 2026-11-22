#!/usr/bin/env node
// Hand off a task that is outside the observer's boundary, and follow it until it returns.
//
// A hand-off is an instruction the observer will not carry out itself. It is published as a
// file in traceability/register/handoffs/ (sealed with its sha256) plus an event; every later
// step is another event. Its state is derived from the events, never stored separately.
//
// Usage (from the repository root), each reading JSON on stdin:
//   node traceability/tools/handoff.mjs publish   {slug, title, intended_for, origin, instruction, occurred}
//   node traceability/tools/handoff.mjs return <id>  {actor, summary, location, needs_handling, occurred}
//   node traceability/tools/handoff.mjs close  <id>  {outcome, reason, occurred}
//   node traceability/tools/handoff.mjs list
//
// origin.kind: "misdirected" (asked of the observer, belongs elsewhere) or "emerged" (arose in the work).
// close outcome: "handled-elsewhere", "handled-here" (with the reason it came back), or "withdrawn".
import fs from "node:fs";
import path from "node:path";
import { appendEvent, OBSERVER, ROOT, sha256 } from "./lib/events.mjs";
import { handoffStates } from "./lib/handoffs.mjs";

const DIR = path.join(ROOT, "traceability/register/handoffs");
const ORIGINS = ["misdirected", "emerged"];
const OUTCOMES = ["handled-elsewhere", "handled-here", "withdrawn"];

const fail = (message) => { console.error(`refused: ${message}`); process.exit(1); };
const stdin = () => JSON.parse(fs.readFileSync(0, "utf8"));
const [command, id] = process.argv.slice(2);
const states = handoffStates();

if (command === "list") {
  for (const s of states.values()) console.log(`${s.id}  ${s.state}  → ${s.intended_for}  ${s.title}`);
  if (!states.size) console.log("no hand-offs");
} else if (command === "publish") {
  const input = stdin();
  if (!/^[a-z0-9-]+$/.test(input.slug ?? "")) fail("slug must be lowercase letters, digits and dashes");
  if (!input.title || !input.instruction || !input.intended_for) fail("title, instruction and intended_for are required");
  if (!ORIGINS.includes(input.origin?.kind)) fail(`origin.kind must be one of: ${ORIGINS.join(", ")}`);
  if (!input.origin.basis) fail("origin.basis is required: where the instruction came from");
  const number = String(states.size + 1).padStart(4, "0");
  const handoff = `handoff.${number}-${input.slug}`;
  const rel = `traceability/register/handoffs/${number}-${input.slug}.md`;
  if (fs.existsSync(path.join(ROOT, rel))) fail(`${rel} already exists`);
  const front = [
    "---",
    `id: ${handoff}`,
    "type: handoff",
    "archetype: source",
    `name: ${JSON.stringify(input.title)}`,
    `intended_for: ${input.intended_for}`,
    `origin: ${JSON.stringify(input.origin)}`,
    "status: attributed",
    "sealed: the content below is fixed at publication; its sha256 is in the handoff-published event",
    "---",
    "",
    `# ${input.title}`,
    "",
    "Handed off by the observer system. State and returns: `node traceability/tools/handoff.mjs list`.",
    "",
    "## Instruction",
    "",
    input.instruction.trimEnd(),
    "",
  ].join("\n");
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(path.join(ROOT, rel), front);
  try {
    const e = appendEvent({ type: "handoff-published", actor: { ...OBSERVER, ...(input.actor ?? {}) },
      data: { handoff, title: input.title, intended_for: input.intended_for, origin: input.origin, file: rel, sha256: sha256(path.join(ROOT, rel)),
        summary: input.summary ?? input.title, occurred: input.occurred } });
    console.log(`${e.id} ${handoff} published → ${rel}`);
  } catch (error) { fs.unlinkSync(path.join(ROOT, rel)); fail(error.message); }
} else if (command === "return" || command === "close") {
  const s = states.get(id);
  if (!s) fail(`unknown hand-off ${id}`);
  if (s.state.startsWith("closed")) fail(`${id} is already ${s.state}`);
  const input = stdin();
  if (command === "close" && !OUTCOMES.includes(input.outcome)) fail(`outcome must be one of: ${OUTCOMES.join(", ")}`);
  if (command === "close" && input.outcome === "handled-here" && !input.reason) fail("handled-here needs a reason: why it came back inside the boundary");
  if (command === "return" && (!input.actor?.role || !input.summary)) fail("a return needs actor.role and a summary");
  const { actor, occurred, ...rest } = input;
  try {
    const e = appendEvent({ type: `handoff-${command === "return" ? "returned" : "closed"}`, actor: actor ?? OBSERVER,
      data: { handoff: id, ...rest, occurred } });
    console.log(`${e.id} ${id} ${e.type}`);
  } catch (error) { fail(error.message); }
} else {
  fail("usage: handoff.mjs publish | return <id> | close <id> | list");
}
