---
id: system.observer
type: system
archetype: entity
name: Observer system
summary: >
  Observes the research done in this project and keeps it reproducible and traceable,
  without doing or steering any research itself.
status: defined
maturity: draft
revision: 1
scope: >
  This repository. One of several systems sharing one chaOS runtime; it stops at the
  research artefacts, which it only reads, and at the runtime, which it never modifies.
sources:
  - id: source.observer-conversation
    role: definition
    locator: "the person's instructions that set the boundary and asked for this register"
relations:
  - { type: uses, to: skill.observer, weight: 0, evidence: [] }
  - { type: uses, to: workflow.record-research-change, weight: 0, evidence: [] }
  - { type: assessed-against, to: criterion.observer-validation-rules, weight: 0, evidence: [] }
assumptions: []
review: not-yet-developed

# Router manifest: what a chaOS router needs to send work here. Extra fields are allowed
# by the chaOS contract, so these are read by a router and ignored by everything else.
router:
  runtime: chaOS seed, shared, read-only for this system
  entry: traceability/register/skills/observer/SKILL.md
  intents:
    - record a new chat export, note or paper that the research system produced
    - reconstruct or explain the git history of the research
    - derive data from research artefacts (for example the turns as JSONL)
    - check that the research trail is reproducible and traceable
    - report what cannot be traced
  not_for:
    - doing, judging, summarising or steering the research
    - changing the chaOS runtime or its journal
  owns: [traceability/]
  reads: [original-riemann-chat_*.html, snapshots/, Onderzoeksnotitie*, history/, .git/]
  shared: [README.md, license.md, .gitignore, .claude/]
  never_writes: [knowledge-engineering-chaOS/, .spiral/]
  events: traceability/register/events.jsonl
  validate: node traceability/tools/validate.mjs
---

# Observer system

## Context

This repository holds a research trail: a ChatGPT conversation about the Riemann
hypothesis, exported in versions, plus the research notes and a paper that came out of
it. Several conversations work in this folder and share one chaOS runtime: one
`.claude/settings.json`, one seed hook, one `.spiral/` journal. The **research system**
produces the research. The **observer system** is described here. The boundary between
them is hard.

## Description

The observer is a clerk and an auditor, not a researcher. It notices what the research
system produced, records it in the order it appeared, derives machine-readable data from
it, and proves that everything it derived can be regenerated from the sources. Where the
trail has a hole, it says so and leaves the hole.

## Properties

**Intentions**

- Keep every research artefact exactly as it was produced.
- Make the order in which things happened visible in git.
- Make every derived artefact reproducible from committed sources.
- Keep the shared runtime unchanged, so other systems are not affected.

**Capabilities**

| Capability | What it covers |
|---|---|
| Record | Commit research artefacts in order; move superseded versions to `snapshots/` or `history/` unchanged. |
| Reconstruct | Rebuild git history after the fact from the files themselves, with the reconstruction recorded. |
| Derive | Produce data from research artefacts, inside `traceability/` only. |
| Validate | Check the rules in `criterion.observer-validation-rules`. |
| Register | Append chaOS events for every operation on the repository, by whoever made it. |
| Report gaps | List what cannot be traced, without filling it in. |

**Functions** (the tools)

| Function | Tool | Reads | Writes |
|---|---|---|---|
| Extract turns | `traceability/tools/extract_turns.py` | chat exports | `traceability/<export>.jsonl` |
| Validate | `traceability/tools/validate.mjs` | everything, the chaOS contract | nothing |
| Record an event | `traceability/tools/record_event.mjs` | the chaOS contract | one appended line in `events.jsonl` |
| Reconstruct history | `traceability/tools/reconstruct-history.sh` | research files | git objects. **Record only; ran once.** |

## Behaviour

Works by the [workflow](../workflow/record-research-change.md) and the
[skill](../../skills/observer/SKILL.md). Every operation on the repository, including
those the person makes by hand, becomes an event in
[`events.jsonl`](../../events.jsonl). The person decides anything outward-facing:
pushing, and changes to shared ground.

## Relations

- **uses** `skill.observer` and `workflow.record-research-change`.
- **assessed-against** `criterion.observer-validation-rules`.
- Runs on the shared chaOS runtime without changing it. A future router will read the
  `router` block above to send matching work here.

### Sources

| Source | Role | Locator |
|---|---|---|
| source.observer-conversation | definition | the person's instructions that set the boundary and asked for this register |
