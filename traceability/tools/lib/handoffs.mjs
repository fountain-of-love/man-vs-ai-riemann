// Hand-off state, derived from register events only.
import { readEvents } from "./events.mjs";

export function handoffStates(events = readEvents()) {
  const states = new Map();
  for (const e of events) {
    const id = e.data?.handoff;
    if (!id) continue;
    if (e.type === "handoff-published") states.set(id, { id, title: e.data.title, intended_for: e.data.intended_for, file: e.data.file, state: "published", returns: 0 });
    const s = states.get(id);
    if (!s) continue;
    if (e.type === "handoff-returned") { s.state = e.data.needs_handling ? "returned: needs handling" : "returned"; s.returns++; }
    if (e.type === "handoff-closed") s.state = `closed: ${e.data.outcome}`;
  }
  return states;
}
