# Taro Task Template

Use this template for implementation tasks, product-spec revisions, and reviewable architecture changes.

## Task Title

Short imperative title.

## Goal

One sentence describing the user-visible or architecture-visible outcome.

## Product Source

Read before editing:

- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/STATE_MODEL.md`
- Relevant `docs/spec/*.md`
- Relevant `docs/adr/*.md`

## Scope

In scope:

- List the exact behavior, document, or contract changes.

Out of scope:

- List adjacent work that must not be bundled into this task.

## Files

Create:

- `path/to/new-file`

Modify:

- `path/to/existing-file`

Review only:

- `path/to/context-file`

## Acceptance Criteria

- The creator workflow is described or implemented end to end.
- The change preserves Writing as source of truth.
- Canvas, Preview, Plugin, and Export behavior are updated when affected.
- Diagnostics are source-locatable when errors are possible.
- Tests or documentation checks provide fresh evidence.

## Implementation Steps

- [ ] Read the product source files listed above.
- [ ] Confirm the current repository state with `git status --short --branch`.
- [ ] Add or update the smallest product/contract document needed.
- [ ] Add or update tests before broad implementation when code behavior changes.
- [ ] Implement the smallest coherent change.
- [ ] Run focused verification.
- [ ] Run broader verification when shared contracts changed.
- [ ] Update `CHANGELOG.md`.
- [ ] Summarize evidence and remaining risk.

## Verification

Run the most relevant commands for the change:

```bash
rg -n "T[O]DO|T[B]D|F[I]XME|P[L]ACEHOLDER" README.md AGENTS.md docs CHANGELOG.md
git diff --check
```

For code changes, add the repository's focused test command and expected result here before implementation begins.

## Handoff

Report:

- Files changed.
- Verification commands and results.
- Product decisions affected.
- Follow-up tasks created or intentionally deferred.
