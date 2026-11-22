---
id: source.git-records
type: source
archetype: source
name: Git records of this repository
summary: >
  The repository's own records of what happened and when: commits, reflogs, the
  remote-tracking push log, .git/config and the creation time of .git/.
status: established
maturity: seed
citation: .git/ of this repository
url: not-applicable
version: HEAD at the time an event is recorded
accessed_at: 2026-11-22
access: direct
licence: see license.md
sources: not-applicable
relations: []
---

# Git records of this repository

## Context

Read directly from `.git/` on the machine where the work happened. Reflogs are local:
a fresh clone does not have them, so the times they give are preserved in the events.

## Description

| Record | Gives |
|---|---|
| `.git/logs/HEAD`, `.git/logs/refs/heads/main` | When each commit and reset happened, and discarded commits such as `edb40a1`. |
| `.git/logs/refs/remotes/main/main` | When each push happened and what it pushed ("update by push"). |
| `.git/config` | The remote name and URL, and the upstream of `main`. Its change time matches the first push. |
| Creation time of `.git/` | When `git init` ran. |

## Properties

- **Observed:** the times and hashes above, as recorded in events.
- **Not recorded anywhere:** the exact commands the person typed, and when the remote
  was added.

## Behaviour

Not applicable: a source does not act.

## Relations

Supports the events in `traceability/register/events.jsonl`.
