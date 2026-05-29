# Taro Code Style

Last updated: 2026-05-15

## Engineering Principles

Code should protect the product model.

Prefer:

- Small modules with clear ownership.
- Explicit commands for Document mutations.
- Derived views over duplicated persistent state.
- Stable identifiers over line-number references.
- Structured parsers and schemas over ad hoc string parsing.
- Tests that prove creator workflows.

Avoid:

- Hidden flow logic inside UI state.
- Plugin shortcuts that bypass visible Taro actions.
- Canvas-only objects that cannot map to Writing.
- Preview-only behavior that differs from Export.
- Broad rewrites that are not needed for the task.

## Naming

Use product terms consistently:

- `Document`
- `StoryFlow`
- `Group`
- `ContentItem`
- `Position`
- `Record`
- `Condition`
- `StageState`
- `PathContext`
- `DisplayMode`
- `InteractionCapability`
- `TriggerResult`
- `ResultAction`
- `Diagnostic`

Avoid using these as primary product model names:

- `Scene`
- `Beat`
- `Moment`
- `Clip`
- `Node`
- `Override`
- `Profile`

Those words may appear only when scoped to compatibility, rendering internals, imported formats, or plugin implementation details.

## Document Mutations

Persistent changes should use explicit command functions.

Command names should describe product behavior:

- `createGroupAfter`
- `insertItemIntoGroup`
- `splitGroup`
- `mergeGroups`
- `bindTriggerAction`
- `deriveStageState`
- `comparePathStageState`
- `normalizeMergeStageState`

Each command should validate:

- Target existence.
- Reference integrity.
- Record type compatibility.
- Plugin capability availability.
- Document revision assumptions when collaborative or async writes exist.

## Derived State

Derived state should be rebuildable from the Document.

Examples:

- Story graph.
- Canvas layout.
- Stage state at position.
- Preview trace.
- Diagnostics.
- Export graph.

Cache derived state only when invalidation is explicit and testable.

## Error Handling

Errors should use stable codes and source locations.

Every error that reaches creators should include:

- What happened.
- Where it happened.
- Why it matters.
- How to fix it.

Do not expose low-level renderer, parser, or plugin stack traces as the primary message.

## Tests

Tests should focus on:

- Document command invariants.
- Group execution order.
- Path-driven stage derivation.
- Record and condition correctness.
- Plugin trigger binding visibility.
- Preview and Export parity.
- Diagnostics source links.

When adding a behavior, add the smallest test that would fail if the product model were violated.

## Documentation Coupling

If code changes one of these concepts, update the matching doc in the same change:

- Group semantics: `docs/STATE_MODEL.md`, `docs/spec/group-content-execution.md`
- Writing behavior: `docs/spec/writing-source-flow.md`
- Canvas or path context: `docs/spec/canvas-path-preview.md`
- Runtime click, blocking, Preview, or Export semantics: `docs/spec/runtime-semantics.md`
- Plugin or template behavior: `docs/spec/plugins-templates.md`
- MVP scope or deferrals: `docs/MVP.md`
- API contracts: `docs/API_CONTRACTS.md`
- UI surface or interaction posture: `docs/UI_DESIGN.md`
- Major decision: `docs/adr/*.md`

## Formatting

Use the repository's formatter once implementation tooling exists.

Until then:

- Keep files focused.
- Prefer descriptive names over comments explaining unclear names.
- Add comments only for non-obvious product invariants or migration rules.
- Keep generated artifacts out of hand-written source folders.
- Keep public examples small and executable.
