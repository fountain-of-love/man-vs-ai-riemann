# Riemann chat: the composition of the zeta function

A versioned research trail. It records how a single human–AI conversation about the
Riemann hypothesis turned into a series of research notes and, finally, a paper.

**Author:** Yves Langeraert ([my-atlas](https://github.com/fountain-of-love/my-atlas))

The conversation and the notes are in Dutch. This README is in English, like the
repositories it builds on.

> **What kind of truth am I reading?**
> This is **raw research**, not established mathematics. The notes state an
> ambition (to prove the Riemann hypothesis by reconstructing the composition of the
> zeta function) and a working hypothesis. Nothing here has been proved or verified.

## The research question

The value **1/2** appears in many mathematical contexts, each time with a different
meaning. The working hypothesis is that these appearances are connected through one
underlying structure, and that this structure shows up in the Riemann zeta function.

The notes follow two reference systems through the same chain of mathematical
transformations:

| Reference system | What it follows |
|---|---|
| **A · Number structure** | The natural numbers and the primes, through their transformations, toward the zeta function. |
| **B · Scale structure** | The same development, with **L** as a symbolic stand-in for the scale value 1/2. |

Along that chain, five relations are examined: **Origin**, **Scale**, **Direction**
(functional symmetry), **Rotation** (complex representation) and **Increment**
(accumulation and composition).

The central hypothesis, from note 2.1:

> L represents the structural condition under which the zeta function reveals its prime
> structure, and under which its non-trivial zeros lie on the critical line.

## What is here

| Path | What it is |
|---|---|
| [`original-riemann-chat_0.06.html`](original-riemann-chat_0.06.html) | The latest export of the conversation. |
| [`snapshots/`](snapshots/) | Earlier exports, 0.02 to 0.05. Each one contains everything in the version before it, plus what was added since. |
| [`Onderzoeksnotitie 1`](Onderzoeksnotitie%201) | Note 1: the research approach, a function as a system with five properties, the first reference points (natural numbers, primes, Fibonacci). |
| [`Onderzoeksnotitie 2.1`](Onderzoeksnotitie%202.1) | Note 2.1: the current note. It refines note 2 and lays out five research rounds, from linearisation to proof and verification. |
| [`history/`](history/) | Notes that have been superseded. Note 2 lives here since 2.1 replaced it. |
| [`Onderzoeksnotitie-2.1-paper.pdf`](Onderzoeksnotitie-2.1-paper.pdf) | *De compositie van de Riemann-zètafunctie*: note 2.1 written up as a paper, produced outside the conversation. |

## How the trail grew

The git history replays the order in which things happened. Each note is committed
right after the chat version in which it first appears.

```text
chat 0.02
chat 0.03   ── 0.02 → snapshots/
chat 0.04   ── 0.03 → snapshots/   + Onderzoeksnotitie 1
chat 0.05   ── 0.04 → snapshots/   + Onderzoeksnotitie 2
chat 0.06   ── 0.05 → snapshots/   Onderzoeksnotitie 2 → history/, + Onderzoeksnotitie 2.1
paper       ── Onderzoeksnotitie-2.1-paper.pdf
```

Conventions that keep the trail readable:

- **One live version in the root.** The newest chat export and the current note sit in
  the root. Older ones move to `snapshots/` or `history/` unchanged.
- **Nothing is rewritten.** Snapshots and superseded notes keep their content exactly
  as they were, so any later claim can be traced back to where it first appeared.
- **A refinement gets a new number.** Note 2 became 2.1 instead of being edited in place.
  The chat already announces the next step, 2.2: from multiplicative to additive
  structure.

## Context, direction, tooling, inspiration

This repository is one strand in a wider body of work.

### Context: the Living Mathematics Library

[living-mathematics-library](https://github.com/fountain-of-love/living-mathematics-library/)
is the layered atlas this work belongs to: vocabulary, concepts, formulas, formula bonds,
experiments, reference material and raw research, kept apart so a reader always knows
what kind of truth they are reading. This repository sits in its **raw research**
layer. Findings that hold up are meant to move into the library as typed
`math-node/0.1` knowledge nodes, such as formulas, conjectures, experiments and
proofs, each with an epistemic status and provenance.

### Direction: the Living Fibonacci Blueprint

[fibonacci-blueprint](https://github.com/fountain-of-love/fibonacci-blueprint/) is the
organising pattern the notes start from. It sets the direction in two ways:

- **Self-similarity.** The same pattern is applied to the whole, to its parts and to
  the relations between them. The notes use it the same way: one starting relation,
  composed through successive transformations, carried by two reference systems at once.
- **The two tensions as a compass.**
  - *Possibility ↔ Actuality*: keep what is hypothesised apart from what is established.
  - *Stability ↔ Change*: keep earlier versions intact while the work moves on, which
    is what `snapshots/` and `history/` are for.

  Following the blueprint, every claim in the notes should be readable as an
  **invariant**, a **variable** or a **hypothesis**.

### Tooling: knowledge-engineering chaOS

[knowledge-engineering-chaOS](https://github.com/concordia-field/knowledge-engineering-chaOS)
is the intended tooling for turning this trail into auditable findings:

- **OSCARC findings.** Each result becomes one finding, checkable against its sources.
- **An assumptions register.** Anything resting on an open assumption, such as the role
  of L, is at most `conditional`.
- **Separate labels.** `status`, `conformity`, `maturity` and `weight` are kept apart,
  so that a recurring idea earns structure, never truth.
- **A person decides.** An agent may prepare a finding; a recorded human decision
  approves or releases it.

chaOS is not installed in this repository yet.

### Inspiration: love as a field

[love-as-a-field](https://github.com/fountain-of-love/love-as-a-field/) explores
semantic provenance, conceptual lineage and attribution in human–AI co-creation. That
is the spirit of this repository: the conversation is kept verbatim, every version is
timestamped in git, and each idea can be traced back to the exchange it came from.

## Reading order

1. [`Onderzoeksnotitie 1`](Onderzoeksnotitie%201) for the approach and the vocabulary.
2. [`Onderzoeksnotitie 2.1`](Onderzoeksnotitie%202.1) for the current state of the research.
3. [The paper](Onderzoeksnotitie-2.1-paper.pdf) for the same material written up as a paper.
4. The chat exports, open in a browser, to see how each idea emerged.

## Licence

Fountain of Love License v2.0, dual-licensed with CC BY-NC-SA 4.0, like the related
repositories. See [license.md](license.md).
