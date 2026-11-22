#!/usr/bin/env node
// Append one event to the observer register, validated against the chaOS event contract.
//
// Usage (from the repository root):
//   echo '{"type":"git-commit","actor":{"role":"agent"},"data":{"occurred":{...},...}}' | node traceability/tools/record_event.mjs
//
// Adds id and at (the recording time), and data.system / data.recorded_by. Refuses an event
// that fails the contract or lacks data.occurred as ISO UTC times with a basis (VR-09).
// Append-only. Never writes outside traceability/.
import fs from "node:fs";
import { appendEvent } from "./lib/events.mjs";

try {
  const event = appendEvent(JSON.parse(fs.readFileSync(0, "utf8")));
  console.log(`${event.id} ${event.type}`);
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
