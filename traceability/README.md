# Traceability

This folder is the boundary of the **observer system** in this project.

Two separate systems work here:

| System | Role | Owns |
|---|---|---|
| **Research system** | Does the research: the conversation, the notes, the paper. | The chat exports, `snapshots/`, the `Onderzoeksnotitie` files, `history/`, the paper. |
| **Observer system** (this one) | Observes the research and keeps it reproducible and traceable. It does no research. | `traceability/`, plus the tooling listed below. |

The boundary is hard. Neither system works inside the other's territory.

## The boundary

### The observer may

- **Read** every research artefact.
- **Record** what arrives: commit it in the order it appeared, and move an older version to
  `snapshots/` or `history/` without changing its content.
- **Derive** artefacts from research files, inside `traceability/` only. Each one must be
  regenerable by a script in `traceability/tools/`.
- **Check** that derived artefacts still match their sources.
- **Report gaps**, such as missing timestamps, instead of filling them.

### The observer may not

- Edit, rewrite, translate, summarise or correct any research artefact.
- Add mathematical content, judge the research, or steer its direction.
- Invent data. A missing value stays missing (`null`) and is listed under [Known gaps](#known-gaps).
- Place derived artefacts outside `traceability/`.

### Shared ground

Some files belong to the project, not to either system. The observer keeps them up to
date only where they describe structure or provenance:

| Path | What it is |
|---|---|
| `README.md`, `license.md`, `.gitignore` | Project-level description, licence and ignore rules. |
| `.claude/` | Claude Code settings for this project: the spiral hooks and skill link. |
| `.spiral/` | The chaOS seed journal, written by the hooks. Local only, not committed. |
| `knowledge-engineering-chaOS/` | Local clone of the [chaOS tooling](https://github.com/concordia-field/knowledge-engineering-chaOS). Not committed; clone it again to restore the hooks. |

## What is here

| Path | What it is | Source | Regenerate with |
|---|---|---|---|
| [`original-riemann-chat_0.06.jsonl`](original-riemann-chat_0.06.jsonl) | The conversation as data: 40 turns, one per line, with keys `id`, `at`, `type`, `actor` and `data`. | All chat exports, from 0.02 to 0.06. | `python3 -I traceability/tools/extract_turns.py` |
| [`tools/extract_turns.py`](tools/extract_turns.py) | The extractor. It refuses to write if a turn's text differs between exports. | — | — |
| [`tools/reconstruct-history.sh`](tools/reconstruct-history.sh) | **Record only.** The script that reconstructed the first nine commits. | — | Do not rerun. |
| [`tools/record_event.mjs`](tools/record_event.mjs) | Appends one event to the register, validated against the chaOS contract. | — | — |
| [`tools/validate.mjs`](tools/validate.mjs) | Checks the validation rules a machine can check. Writes nothing. | — | `node traceability/tools/validate.mjs` |
| [`register/`](register/README.md) | The observer's register: the system, its skill, workflow and validation rules, and an event for every operation on the repository. In chaOS formats. | Git records, this conversation | — |

Fields in the JSONL:

- `id`: the message ID from the export.
- `at`: always `null`. See [Known gaps](#known-gaps).
- `type`: `"message"`.
- `actor`: `"user"` or `"assistant"`.
- `data`: the turn's position in the chat (`seq`), its `text` with math as LaTeX, the export
  it first appears in (`first_seen_in`), and any `attachments` (metadata only).

## Provenance of the git history

The first nine commits (`92e2aa1` to `c847198`) were **reconstructed** on 2026-11-22,
after the fact. They replay the order in which the research files appeared, as read from
the exports themselves:

| Export | Turns | New in this version | Note that first appears |
|---|---|---|---|
| 0.02 | 20 | 20 | — |
| 0.03 | 24 | 4 | — |
| 0.04 | 32 | 8 | Onderzoeksnotitie 1 (turn 32) |
| 0.05 | 36 | 4 | Onderzoeksnotitie 2 |
| 0.06 | 40 | 4 | Onderzoeksnotitie 2.1 |

Each export contains the previous one unchanged, plus new turns. The paper was made
outside the conversation and is committed after 0.06.

**The order of the reconstructed commits is evidence. Their dates are not:** they are
all from the day of reconstruction. Commits from `9de50fa` onward were made at the time
they describe.

## Working rhythm

When the research system produces something new, the observer follows the workflow
[Record a research change](register/nodes/workflow/record-research-change.md):
**observe, place, record, derive, validate**. Then the person **publishes** (pushes).
Every operation, including the person's own, is appended to
[`register/events.jsonl`](register/events.jsonl).

The chaOS seed hooks journal prompts and replies in `.spiral/`, but that journal is
**shared** by every conversation in this folder. It is not the observer's record and the
observer never writes to it; the register is.

## Known gaps

- **No timestamps.** The chat exports contain no times for the turns, so `at` is `null`.
- **Reconstructed dates.** The first nine commits are dated to the reconstruction, not
  to when the files were made.
- **Attachment content missing.** Turn 9 refers to a screenshot of a mapping table.
  Only its metadata is in the export; the image itself is not in the repository.
- **The paper's origin.** The PDF was made by a process outside the conversation. How
  it was made is not recorded here.
- **When the remote was added.** No git record holds it. The register gives an interval:
  after `git init`, before the first commit, as the person stated.
- **The person's exact commands.** Git records what a push did and when, not the command
  typed. The register says so instead of reconstructing one.
- **The turns JSONL is not a chaOS event stream.** It uses the same five keys, but `at` is
  `null`, `actor` is a plain string and `id` is the export's message id. The chaOS
  contract would reject it, so it must not be fed into a journal as it is.
