---
id: criterion.observer-validation-rules
type: criterion
archetype: source
name: Observer validation rules
summary: >
  The standard the observer's work is checked against: what must hold for the research
  trail to be reproducible and traceable.
status: defined
maturity: draft
revision: 3
edition: "3 · 2026-11-22"
citation: traceability/register/nodes/criterion/observer-validation-rules.md, edition 3
access: direct
licence: see license.md
scope: This repository. Checked by node traceability/tools/validate.mjs where marked auto.
sources: not-applicable
relations:
  - { type: defined-by, to: system.observer, weight: 0, evidence: [] }
---

# Observer validation rules

## Context

These rules are the observer's criterion in the chaOS sense: a source with role
`criterion`. A finding about the trail cites the rule by its id and this edition. When a
rule changes, the edition number goes up; findings keep citing the edition that was in
force.

## Description

Rules marked **auto** are checked by `node traceability/tools/validate.mjs`, which
exits non-zero if any fails. Rules marked **manual** are checked by the observer before
it reports.

## Properties

| ID | Rule | Check |
|---|---|---|
| VR-01 | **Research artefacts are never edited.** A research file keeps one content across every commit and in the working tree. Moving it is allowed. | auto |
| VR-02 | **One live export in the root.** Exactly one chat export in the root, the newest; every other export is in `snapshots/` and older. | auto |
| VR-03 | **Exports are cumulative.** Each turn has the same text in every export that contains it. | auto, inside VR-04 |
| VR-04 | **Derived artefacts reproduce.** Rerunning the tool from committed sources gives byte-identical output. | auto |
| VR-05 | **Every file has a territory.** Each tracked file belongs to the research, to shared ground or to `traceability/`. | auto |
| VR-06 | **Events conform to chaOS.** Every line in `events.jsonl` passes the chaOS seed's `validateEvent`. | auto |
| VR-07 | **The event log is append-only.** Ids are unique, and the committed log is a prefix of the current one. | auto |
| VR-08 | **Cited commits exist.** Every commit an event names resolves in this repository. | auto |
| VR-09 | **No invented times.** Every event states when the operation occurred (an exact time, or an interval), as ISO 8601 UTC times, and on what basis. *Edition 2: the time format is now checked.* | auto |
| VR-10 | **The shared runtime is untouched.** `knowledge-engineering-chaOS/` is at `b1e9afe` with no local changes. | auto |
| VR-11 | **Only a person pushes.** No push event has an agent as actor. | auto |
| VR-12 | **The observer never writes to `.spiral/`** or changes `.claude/` without the person's approval. | manual |
| VR-13 | **One commit, one step.** Research artefacts, observer output and shared ground are not mixed in one commit, except a move that belongs to the step that causes it. | manual |
| VR-14 | **Gaps are listed.** Every `null`, interval or missing source appears under *Known gaps* in `traceability/README.md`. | manual |
| VR-15 | **Published hand-offs are sealed.** A hand-off file still matches the sha256 in its `handoff-published` event. *Edition 3.* | auto |
| VR-16 | **Hand-offs follow their lifecycle.** Published once; returns only while open; at most one close, with a known outcome; `handled-here` carries a reason. *Edition 3.* | auto |
| VR-17 | **Out-of-boundary work is handed off, not done.** A task outside the observer's boundary is published as a hand-off first. It is done here only when it is closed `handled-here`, with the reason. *Edition 3.* | manual |

## Behaviour

A failing rule is reported with its id and the check's message. The fix is always in the
observer's own work. A research artefact is never changed to make a rule pass. If a rule
itself is wrong, the person decides, and the edition goes up.

## Relations

- **defined-by** `system.observer`.
- Used by `workflow.record-research-change` at step 5.
