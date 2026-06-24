# AGENTS.md

This file is the working contract for humans and AI agents contributing to Taro.

## Product Authority

Read these files before changing product behavior or adding implementation plans:

1. `docs/PRODUCT.md`
2. `docs/ARCHITECTURE.md`
3. `docs/STATE_MODEL.md`
4. `docs/API_CONTRACTS.md`
5. Relevant files under `docs/spec/`
6. Relevant ADRs under `docs/adr/`

When these files conflict, prefer the higher file in the list and update the lower-level file in the same change.

## Core Product Rules

- Document is the single source of truth.
- A Group is a narrative step with configurable end conditions (click, trigger, auto).
- Unified editing interface: No separate Writing/Canvas surfaces; all views edit the same Document.
- Stage state is derived from `position + path context`, not from a global scene object.
- Choices, conditions, jumps, record writes, and critical state changes must be visible, searchable, and editable.
- Templates are generators by default. Generated structure becomes ordinary editable story structure.
- Components declare events, not hide flow. Custom components must expand their flow control into visible Taro event bindings.
- Do not introduce slash-command-first, node-editor-first, timeline-first, or SDK-first authoring as the primary model.

## Repository Workflow

- At the start of every task, invoke the `using-superpowers` skill once before any response or action.
- Use a subagentic workflow for task execution: split work into bounded implementation, audit, or review slices; delegate suitable slices to subagents; then integrate and verify the result in the current checkout.
- Do not create a new branch or worktree unless the user explicitly asks.
- Preserve existing user edits. Never reset or overwrite unrelated changes.
- Keep docs and implementation in sync. If behavior changes, update the relevant product/spec/contract file.
- Prefer small, reviewable changes with explicit verification.
- Use `rg` or `rg --files` for repository search.
- For manual edits, use patch-style edits and keep unrelated formatting churn out of scope.

## Documentation Expectations

Every product or architecture change must answer:

- Which creator workflow changes?
- Which source-of-truth object changes?
- Which API contract changes?
- Which tests or dogfood loop prove it?
- Which existing docs become stale if this lands?

Use [docs/TASK_TEMPLATE.md](docs/TASK_TEMPLATE.md) for implementation tasks.

## Completion Standard

Do not claim a task is complete without fresh evidence. At minimum:

- Run the relevant test or documentation check.
- Read the command output.
- Report what passed and what was not verified.
- Link changed files in the final handoff.
