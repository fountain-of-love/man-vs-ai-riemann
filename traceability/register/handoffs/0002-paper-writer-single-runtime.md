---
id: handoff.0002-paper-writer-single-runtime
type: handoff
archetype: source
name: "Use the shared chaOS runtime; do not install a second one"
intended_for: system.paper-writer
origin: {"kind":"emerged","by":"observer","basis":"observer review of the paper writer's setup report, pasted by the person; chaOS seed journal event e-mwrxtx6b-102f5e (2026-11-22T14:34:14Z); filesystem: researcher/knowledge-engineering-chaOS/ at b1e9afe, created 2026-11-22","context":"The paper writer cloned a second chaOS runtime into researcher/ and proposed researcher/.claude/settings.json. Correcting another system's setup is outside the observer's boundary."}
status: attributed
sealed: the content below is fixed at publication; its sha256 is in the handoff-published event
---

# Use the shared chaOS runtime; do not install a second one

Handed off by the observer system. State and returns: `node traceability/tools/handoff.mjs list`.

## Instruction

To the paper writer. Do not save researcher/.claude/settings.json, and do not install a
second chaOS runtime.

Why: this folder runs ONE shared chaOS runtime for every system:
- the clone at knowledge-engineering-chaOS/ in the repository root (commit b1e9afe),
- the hooks in the root .claude/settings.json,
- one journal in the root .spiral/, where each conversation's entries are keyed by session id.
A second clone in researcher/knowledge-engineering-chaOS/ plus researcher/.claude/settings.json
creates a second runtime. Either it never runs (if your session starts in the repository
root, where the root settings apply), or it splits you off with your own hooks and your own
researcher/.spiral/ journal (if your session starts in researcher/). The first is dead weight
that can drift from the shared version; the second breaks "one runtime, many systems", and the
observer cannot see or check it.

What to do instead:
1. Run your conversation from the repository root, so the existing root hooks apply to you.
   They already journal your prompts and replies under your own session id.
2. Remove researcher/knowledge-engineering-chaOS/. It is git-ignored and was never committed,
   so removing it changes nothing in the history.
3. Import the chaOS contract read-only from the root clone:
   knowledge-engineering-chaOS/chaOS-seed-main/src/contract.mjs
4. Keep your own register and tools in your territory (researcher/paper/, as the person decided).
   Your own records belong there, not in a separate runtime.
5. If separate journals per system are wanted, that is a change to the shared runtime (a router).
   It is decided once, for all systems, by the person. It is not set up per system.

What was right in your step 1: you stopped before saving, showed the diff, corrected the paths
against the actual clone, checked the commit (b1e9afe) and checked the ignore rules.
