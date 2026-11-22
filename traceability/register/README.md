# Observer register

Everything the observer system is and has done, in chaOS's own record formats. It is
built to plug into chaOS without changing it: **one runtime, many systems**.

## One runtime, many systems

Several conversations share this folder and one chaOS runtime: the seed hook in
`.claude/settings.json`, its journal in `.spiral/`, and the clone in
`knowledge-engineering-chaOS/`. Anything one system changes there, every other system
feels. So:

- **The runtime stays immutable.** This system never writes to
  `knowledge-engineering-chaOS/` or `.spiral/`. VR-10 checks that the clone is unchanged.
- **Each system keeps its own register.** This one lives in `traceability/register/`.
  It reuses chaOS formats, so chaOS can read it, but it is never stored in chaOS.
- **A router comes later.** It will read each system's manifest, the `router` block in
  [`nodes/system/observer.md`](nodes/system/observer.md), and send work to the system
  whose intents match. Until then, this skill is **not linked** into `.claude/skills/`:
  doing so would load it in every conversation in this folder.

## What is here

| Path | chaOS record | What it holds |
|---|---|---|
| [`nodes/system/observer.md`](nodes/system/observer.md) | node (`entity`) | The system: its intentions, capabilities and functions, its boundary, and the router manifest. |
| [`skills/observer/SKILL.md`](skills/observer/SKILL.md) | skill | The approach, as a skill an agent loads. |
| [`nodes/workflow/record-research-change.md`](nodes/workflow/record-research-change.md) | node (`concept`) | The workflow: observe, place, record, derive, validate, then the person publishes. |
| [`nodes/criterion/observer-validation-rules.md`](nodes/criterion/observer-validation-rules.md) | node (`source`, role `criterion`) | The validation rules VR-01 to VR-14, edition 1. |
| [`nodes/source/`](nodes/source/) | node (`source`) | Where the facts come from: the git records and this conversation. |
| [`events.jsonl`](events.jsonl) | event | Every operation on the repository, one per line, append-only. |

Check it all with:

```bash
node traceability/tools/validate.mjs
```

## Events

Each event passes the chaOS seed's `validateEvent`: `id` (`e-…`), `at`, `type`, `actor`
(`role`: `person`, `agent` or `tool`), and `data`. Two times are kept apart:

- **`at`** is when the observer recorded the event, as chaOS requires.
- **`data.occurred`** is when the operation happened, with its `basis`: an exact `at`
  where a git or file record exists, or an interval (`not_before`, `not_after`) where
  none does.

What has been recorded so far:

| Occurred (UTC) | Actor | Operation | Basis |
|---|---|---|---|
| 11:55:50 | person | `git init` | creation time of `.git/` |
| between 11:55:50 and 12:03:30 | person | add remote `main` (SSH) | the person's account; no record of the time |
| 12:03:30 | agent | reconstruct history, attempt 1: **discarded** (`edb40a1`) | HEAD reflog |
| 12:03:51 | agent | reconstruct history: 9 commits, `92e2aa1` to `c847198` | branch reflog |
| 12:22:31 | person | first push, upstream set | push log |
| 12:26:06 | agent | commit README (`9de50fa`) | HEAD reflog |
| 12:31:38 | agent | commit licence (`69a9ab1`) | HEAD reflog |
| 12:32:02 | agent | commit `.gitignore` (`14fc1d7`) | HEAD reflog |
| 12:32:18 | person | push | push log |
| 12:41:46 | agent | commit turns JSONL (`af88bfb`) | HEAD reflog |
| 12:42:46 | person | push | push log |
| 13:56:07 | agent | commit hook install, **discarded** (`f72b1be`): it mixed in the JSONL move | HEAD reflog |
| 13:56:14 | agent | commit chaOS seed hook install (`3c63efe`) | HEAD reflog |
| 13:56:19 | agent | commit observer boundary (`59ece55`) | HEAD reflog |

All on 2026-11-22. The log itself holds every later event; this table is a snapshot.

Append with `node traceability/tools/record_event.mjs`, which validates against the chaOS
contract and refuses an event without an occurrence time and basis. The chaOS integration is deliberately not in this log: it belongs to
the shared runtime, not to this system. Its commit is recorded, because a commit is an
operation on the repository.

## Adding to the register

- **A new operation:** append one event. Never edit or remove an earlier line (VR-07).
- **A new capability, workflow or rule:** a new node, or a new `revision` of an existing
  one. Ids never change and are never reused.
- **A changed rule:** raise the criterion's `edition`, so earlier findings keep citing
  the edition they were judged by.
