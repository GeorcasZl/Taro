# Spec: Group And Content Execution

Last updated: 2026-05-15

## Goal

Define how a Group executes so Writing, Canvas, Preview, and Export share one mental model.

## Model

A Group executes an ordered list of content items after one player advance.

Content item categories:

- Present text.
- Change stage.
- Change sound.
- Play instant effect.
- Wait.
- Start interaction.
- Write record.
- Evaluate condition.
- Jump.
- Apply result action.
- Run plugin capability.

## Ordering Rules

- Items execute in list order.
- Blocking items stop later items until complete.
- Non-blocking items may continue while later items run.
- Wait items are blocking by default.
- Interaction items are blocking by default.
- Text items use display-mode rules to decide whether they block.
- Jump actions end the current Group flow unless explicitly modeled as a queued action.

## Blocking Rules

Blocking is explicit in the Document model.

Default blocking:

- Text: ordinary text is blocking by default; special display modes may make text non-blocking.
- Wait: blocking.
- Interaction: blocking.
- Record write: non-blocking after immediate application.
- Stage change: non-blocking unless transition duration blocks.
- Sound change: non-blocking.
- Instant effect: non-blocking unless marked blocking.
- Condition: non-blocking after branch evaluation.
- Jump: terminal for current flow.

After a Group completes, the project default is to wait for player advance. A Group or display mode may explicitly auto-advance.

## Click Progression Rules

Display mode click behavior handles reading progression.

Priority:

1. If current text is not fully revealed, click completes the text.
2. Else if current wait is skippable, click skips the wait.
3. Else if the Group has completed and is waiting, click enters the next Group.
4. Else the click is ignored or handled by the display mode without changing story flow.

Interaction clicks are different. They emit named trigger results that bind to visible result actions.

## Trigger Result Rules

When an interaction content item emits a trigger, the trigger does not implicitly decide flow.

The visible binding must explicitly choose one or more result actions:

- Continue current Group.
- Enter next Group.
- Jump to position.
- Return to a visible generated target.
- Write record.
- Change state.
- Play effect.
- Wait.

## Preview Controls

Preview must support:

- Replay current Group.
- Step next content item.
- Skip wait.
- Pause and resume.
- Reset preview state.
- Inspect current records.
- Inspect current stage state.

## Export Parity

Export runtime must use the same Group ordering, blocking, record, jump, and interaction rules as Preview.

MVP Export only needs to prove these semantics for the ordinary VN dialogue loop and covered basic records/conditions. Broader plugin and template runtime parity is an alpha or later requirement.

## Diagnostics

Diagnostics must identify:

- Group with no reachable continuation.
- Blocking interaction without trigger binding.
- Wait with invalid duration.
- Jump after terminal jump in the same Group.
- Plugin item whose blocking behavior is undeclared.
- Non-blocking item that writes state after a later condition depends on that state.

## Deferred Runtime Directions

The model should preserve room for:

- Auto Mode, using timers instead of player clicks without changing click priority.
- Player rollback/history, preferably at Group boundaries before arbitrary mid-item rollback.
- Named Preview test configurations saved from temporary record overrides.
- Save/load snapshots that restore visible state without becoming a second source of truth.
