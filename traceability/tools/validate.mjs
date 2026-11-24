#!/usr/bin/env node
// Observer validation: checks the rules in
// traceability/register/nodes/criterion/observer-validation-rules.md that a machine can check.
//
// Usage (from the repository root):  node traceability/tools/validate.mjs
//
// Read-only towards everything outside traceability/. It imports the chaOS seed
// contract to validate events, and never writes to knowledge-engineering-chaOS/ or .spiral/.
// Exit 0 when every rule passes, 1 otherwise.
import { execFileSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const CHAOS = path.join(ROOT, "knowledge-engineering-chaOS");
const CHAOS_COMMIT = "b1e9afe";
const EVENTS = "traceability/register/events.jsonl";
const EXPORT = /^[a-z0-9-]+-chat_\d+\.\d+\.html$/;
const RESEARCH = [EXPORT, /^snapshots\//, /^Onderzoeksnotitie/, /^history\//];
const SHARED = [/^README\.md$/, /^license\.md$/, /^\.gitignore$/, /^\.claude\//];
const OBSERVER = [/^traceability\//];

const git = (...args) => execFileSync("git", args, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const results = [];
const rule = (id, name, fn) => {
  let problems;
  try { problems = fn() ?? []; } catch (e) { problems = [e.message]; }
  results.push({ id, name, problems });
};
const isResearch = (p) => RESEARCH.some((r) => r.test(p));

// VR-01 Research artefacts never change: a file keeps one content across all commits, moves allowed.
rule("VR-01", "research artefacts are never edited", () => {
  const seen = new Map(), problems = [];
  for (const c of git("rev-list", "HEAD").split("\n")) {
    for (const line of git("ls-tree", "-r", c).split("\n").filter(Boolean)) {
      const [meta, p] = line.split("\t");
      if (!isResearch(p)) continue;
      const blob = meta.split(" ")[2], name = path.basename(p), prev = seen.get(name);
      if (prev && prev.blob !== blob) problems.push(`${name} differs between ${prev.c} and ${c.slice(0, 7)}`);
      if (!prev) seen.set(name, { blob, c: c.slice(0, 7) });
    }
  }
  for (const p of git("diff", "--name-only", "HEAD").split("\n").filter(Boolean))
    if (isResearch(p)) problems.push(`${p} has uncommitted changes`);
  return problems;
});

// VR-02 Per conversation: one live export in the root, the newest; every older export in snapshots/.
rule("VR-02", "per conversation, one live export in the root, older ones in snapshots/", () => {
  const ver = (f) => f.match(/_(\d+)\.(\d+)\.html$/).slice(1).map(Number);
  const cmp = (a, b) => ver(a)[0] - ver(b)[0] || ver(a)[1] - ver(b)[1];
  const series = (f) => path.basename(f).replace(/_\d+\.\d+\.html$/, "");
  const files = git("ls-files").split("\n");
  const root = files.filter((f) => EXPORT.test(f));
  const snaps = files.filter((f) => f.startsWith("snapshots/") && EXPORT.test(path.basename(f)));
  const problems = [];
  for (const name of new Set([...root, ...snaps].map(series))) {
    const live = root.filter((f) => series(f) === name);
    if (live.length !== 1) { problems.push(`${name}: expected 1 export in the root, found ${live.length}`); continue; }
    for (const s of snaps.filter((f) => series(f) === name && cmp(path.basename(f), live[0]) >= 0))
      problems.push(`${s} is not older than ${live[0]}`);
  }
  return problems;
});

// VR-03 / VR-04 Exports are cumulative and derived artefacts reproduce byte for byte.
rule("VR-03/04", "exports are cumulative; derived JSONL reproduces exactly", () => {
  const committed = fs.readdirSync(path.join(ROOT, "traceability")).filter((f) => f.endsWith(".jsonl"));
  const problems = [];
  for (const f of committed) {
    const tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "observer-")), f);
    execFileSync("python3", ["-I", "traceability/tools/extract_turns.py", ".", tmp], { cwd: ROOT, encoding: "utf8" });
    if (!fs.readFileSync(tmp).equals(fs.readFileSync(path.join(ROOT, "traceability", f))))
      problems.push(`traceability/${f} does not reproduce from the exports`);
  }
  return committed.length ? problems : ["no derived JSONL found"];
});

// VR-05 Every tracked file belongs to research, shared ground or the observer boundary.
rule("VR-05", "observer output stays inside traceability/", () =>
  git("ls-files").split("\n").filter(Boolean)
    .filter((p) => ![...RESEARCH, ...SHARED, ...OBSERVER].some((r) => r.test(p)))
    .map((p) => `${p} is outside every declared territory`));

// VR-06 Register events conform to the chaOS event contract.
let events = [];
const contract = path.join(CHAOS, "chaOS-seed-main/src/contract.mjs");
if (!fs.existsSync(contract)) {
  results.push({ id: "VR-06", name: "register events conform to the chaOS event contract", problems: ["chaOS runtime not found: clone it into knowledge-engineering-chaOS/"] });
} else {
  const { validateEvent } = await import(contract);
  rule("VR-06", "register events conform to the chaOS event contract", () => {
    events = fs.readFileSync(path.join(ROOT, EVENTS), "utf8").split("\n").filter(Boolean).map((l, i) => {
      try { return JSON.parse(l); } catch { throw new Error(`line ${i + 1} is not JSON`); }
    });
    return events.flatMap((e, i) => validateEvent(e).map((m) => `line ${i + 1}: ${m}`));
  });
}

// VR-07 The event log is append-only: unique ids, and the committed log is a prefix of the current one.
rule("VR-07", "the event log is append-only", () => {
  const problems = [], ids = new Set();
  for (const e of events) { if (ids.has(e.id)) problems.push(`duplicate id ${e.id}`); ids.add(e.id); }
  let committed = "";
  try { committed = git("show", `HEAD:${EVENTS}`); } catch { return problems; }
  if (!fs.readFileSync(path.join(ROOT, EVENTS), "utf8").startsWith(committed)) problems.push("committed events were edited or removed");
  return problems;
});

// VR-08 Every commit an event cites exists.
rule("VR-08", "every cited commit resolves", () =>
  events.flatMap((e) => [...(e.data?.commits ?? []), ...(e.data?.head ? [e.data.head] : [])])
    .filter((c) => { try { git("cat-file", "-e", `${c}^{commit}`); return false; } catch { return true; } })
    .map((c) => `commit ${c} not found`));

// VR-09 No invented times: every operation states when it occurred, and on what basis.
rule("VR-09", "every occurrence time has a basis", () =>
  events.filter((e) => {
    const o = e.data?.occurred, ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;
    const times = o ? (o.at ? [o.at] : [o.not_before, o.not_after]) : [];
    return !o || !o.basis || !times.every((t) => ISO.test(String(t)));
  }).map((e) => `${e.id} (${e.type}) lacks an occurrence time with a basis`));

// VR-10 The shared chaOS runtime is untouched.
rule("VR-10", "the chaOS runtime is unmodified", () => {
  if (!fs.existsSync(CHAOS)) return ["chaOS runtime not found"];
  const problems = [];
  const head = execFileSync("git", ["rev-parse", "--short=7", "HEAD"], { cwd: CHAOS, encoding: "utf8" }).trim();
  if (head !== CHAOS_COMMIT) problems.push(`chaOS is at ${head}, expected ${CHAOS_COMMIT}`);
  const dirty = execFileSync("git", ["status", "--porcelain"], { cwd: CHAOS, encoding: "utf8" }).trim();
  if (dirty) problems.push(`chaOS has local changes:\n${dirty}`);
  return problems;
});

// VR-11 Pushes are the person's: no push event has an agent as actor.
rule("VR-11", "only a person pushes", () =>
  events.filter((e) => e.type === "git-push" && e.actor?.role !== "person").map((e) => `${e.id} is a push by ${e.actor.role}`));

// VR-15 A published hand-off is sealed: its file still matches the sha256 in its event.
rule("VR-15", "published hand-offs are unchanged", () =>
  events.filter((e) => e.type === "handoff-published").flatMap((e) => {
    const file = path.join(ROOT, e.data?.file ?? "");
    if (!e.data?.file || !fs.existsSync(file)) return [`${e.data?.handoff}: file ${e.data?.file} missing`];
    const hash = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    return hash === e.data.sha256 ? [] : [`${e.data.handoff}: ${e.data.file} changed after publication`];
  }));

// VR-16 A hand-off follows its lifecycle: published once, then returns, then at most one close.
rule("VR-16", "hand-offs follow their lifecycle", () => {
  const state = new Map(), problems = [];
  for (const e of events) {
    const id = e.data?.handoff;
    if (!e.type?.startsWith("handoff-")) continue;
    if (!id) { problems.push(`${e.id} names no hand-off`); continue; }
    const s = state.get(id);
    if (e.type === "handoff-published") { if (s) problems.push(`${id} published twice`); else state.set(id, "open"); continue; }
    if (!s) problems.push(`${id} ${e.type} before it was published`);
    else if (s === "closed") problems.push(`${id} ${e.type} after it was closed`);
    if (e.type === "handoff-closed") {
      state.set(id, "closed");
      if (!["handled-elsewhere", "handled-here", "withdrawn"].includes(e.data.outcome)) problems.push(`${id} closed with unknown outcome ${e.data.outcome}`);
      if (e.data.outcome === "handled-here" && !e.data.reason) problems.push(`${id} handled-here without a reason`);
    }
  }
  return problems;
});

let failed = 0;
for (const r of results) {
  const ok = r.problems.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? "pass" : "FAIL"}  ${r.id}  ${r.name}`);
  for (const p of r.problems) console.log(`        ${p}`);
}
console.log(`\n${results.length - failed} of ${results.length} rules pass`);
process.exit(failed ? 1 : 0);
