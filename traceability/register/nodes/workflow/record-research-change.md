---
id: workflow.record-research-change
type: workflow
archetype: concept
name: Record a research change
summary: >
  The steps the observer takes each time the research system produces a new chat
  export, note or paper.
status: defined
maturity: draft
revision: 1
scope: This repository, for artefacts the research system produces.
sources:
  - id: source.observer-conversation
    role: definition
    locator: "the reconstruction of the history, then the boundary and register requests"
  - id: source.git-records
    role: data
    locator: "commits 92e2aa1 to af88bfb and their reflogs"
relations:
  - { type: derives-from, to: system.observer, weight: 0, evidence: [] }
  - { type: requires, to: criterion.observer-validation-rules, weight: 0, evidence: [] }
assumptions: []
review: not-yet-developed
---

# Record a research change

## Context

The research system works in versions. Each new chat export contains the previous one
unchanged plus new turns. Notes appear inside the chat and are then saved as files. A
refined note gets a new number and the old one moves to `history/`. This workflow keeps
that trail intact as it grows.

## Description

Five steps: **observe, place, record, derive, validate**. Then the person **publishes**.
Each step leaves something checkable behind.

## Properties

| Step | Who | Does | Leaves behind |
|---|---|---|---|
| 1 · Observe | observer | Compare the new artefact with the latest of its kind: for an export, which turns are new; for a note, which export it first appears in. | The order of events, with its evidence. |
| 2 · Place | observer | One live version in the root. Move the version it replaces into `snapshots/` (exports) or `history/` (notes), unchanged. | A layout that passes VR-01 and VR-02. |
| 3 · Record | observer | Commit the artefact on its own, in the order it appeared: an export first, then the note it produced. Append one event per commit to `events.jsonl`. | A commit and an event. |
| 4 · Derive | observer | Rerun `python3 -I traceability/tools/extract_turns.py`. Commit derived artefacts separately from the research. | Updated JSONL, reproducible byte for byte. |
| 5 · Validate | observer | Run `node traceability/tools/validate.mjs`. Fix the observer's own work if it fails; never touch a research file to make a check pass. | A passing run, or a reported failure. |
| 6 · Publish | person | Push. The observer then appends a `git-push` event, with its time read from the remote-tracking reflog. | A push and an event. |

**Order of commits for one research step**, as the history shows:

```text
export 0.N+1 in root, 0.N → snapshots/      (one commit)
note produced by that export                (one commit; a superseded note → history/ in the same commit)
derived data                                 (one commit)
```

## Behaviour

- **If the person's account and the sources disagree,** stop after *Observe*. Show the
  conflict and the corrected order, and continue once the person agrees.
- **A step outside the conversation,** such as the paper, is recorded after the last
  export it depends on, and its origin goes under *Known gaps*.
- **A failed operation is recorded too.** Example: the first reconstruction attempt
  (`edb40a1`) was discarded, and its event says why.
- **Reconstruction after the fact** uses a temporary index, so the working tree is never
  touched. The script is kept as a record and is never rerun.

## Relations

- **derives-from** `system.observer`: this is how its Record, Derive and Validate
  capabilities are carried out.
- **requires** `criterion.observer-validation-rules`: step 5.

### Sources

| Source | Role | Locator |
|---|---|---|
| source.observer-conversation | definition | the reconstruction of the history, then the boundary and register requests |
| source.git-records | data | commits 92e2aa1 to af88bfb and their reflogs |
