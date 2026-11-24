# Traceability

This folder is the boundary of the **observer system** in this project.

Two separate systems work here:

| System | Role | Owns |
|---|---|---|
| **Research system** | Does the research: the conversations, the notes, the paper. | The chat exports (`*-chat_<version>.html`), `snapshots/`, the `Onderzoeksnotitie` files, `history/`, the paper. |
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
| [`original-riemann-chat_0.07.jsonl`](original-riemann-chat_0.07.jsonl) | The original conversation as data: 43 turns, one per line, with keys `id`, `at`, `type`, `actor` and `data`. | Its exports 0.02 to 0.07. | `python3 -I traceability/tools/extract_turns.py` |
| [`original-riemann-chat_0.06.jsonl`](original-riemann-chat_0.06.jsonl) | The same conversation as it stood at 0.06: 40 turns. Kept as derived; still reproduces. | Its exports 0.02 to 0.06. | the same |
| [`let-s-get-this-cracking-riemann-chat_0.01.jsonl`](let-s-get-this-cracking-riemann-chat_0.01.jsonl) | A second conversation, started from the author's LinkedIn post: 22 turns. | Its export 0.01. | the same |
| [`tools/extract_turns.py`](tools/extract_turns.py) | The extractor. The output name picks the conversation and the version (`<conversation>_<version>.jsonl`). It refuses to write if a turn's text differs between exports. Without arguments it regenerates every JSONL here. | — | — |
| [`tools/reconstruct-history.sh`](tools/reconstruct-history.sh) | **Record only.** The script that reconstructed the first nine commits. | — | Do not rerun. |
| [`tools/record_event.mjs`](tools/record_event.mjs) | Appends one event to the register, validated against the chaOS contract. | — | — |
| [`tools/handoff.mjs`](tools/handoff.mjs) | Publishes a task outside the boundary as a hand-off, and records its return and close. | — | — |
| [`tools/lib/`](tools/lib/) | Shared code for the tools: appending events and deriving hand-off state. | — | — |
| [`tools/validate.mjs`](tools/validate.mjs) | Checks the validation rules a machine can check. Writes nothing. | — | `node traceability/tools/validate.mjs` |
| [`register/`](register/README.md) | The observer's register: the system, its skill, workflows and validation rules, hand-offs, and an event for every operation on the repository. In chaOS formats. | Git records, this conversation | — |

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
- **Empty last turn in 0.07.** Turn 43 of `original-riemann-chat` is an assistant message with
  no content in the export itself; the reply was probably still being generated, or cut off,
  when it was exported. Its `text` is `""`.
- **A second 0.06 export.** A re-export of 0.06 (same turns and text, different page
  styling, sha256 `cf713859…`) arrived on 2026-11-22. The committed 0.06 stayed the
  snapshot; the re-export is not in the repository.
- **When 0.07 and the 0.06 snapshot were committed.** 0.07 arrived on 2026-11-22 but was
  committed on 2026-11-24, together with the move of 0.06 to `snapshots/`. Arrival times
  in the register come from the file birth times.
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
