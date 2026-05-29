# ADR 0001: Writing Is The Source Of Truth

Date: 2026-05-15

## Status

Accepted

## Context

Taro needs rich visual editing, branching, plugins, preview, and export. A common failure mode would be letting Canvas, plugins, or runtime preview create their own hidden objects and flow state. That would make the story hard to read, search, debug, and export.

## Decision

Writing and the structured Document behind it are the source of truth.

Canvas, Preview, Inspector, plugins, templates, diagnostics, and export must derive from or write back to the same Document.

Any edit that affects story flow, state, stage presentation, or player-visible behavior must be traceable to a visible Document item, parameter, relation, or action binding.

## Consequences

Benefits:

- Story remains readable.
- Diagnostics can link to source.
- Export can match Preview.
- Plugins cannot hide critical story logic.

Costs:

- Canvas and plugin APIs need stronger contracts.
- Some visual edits require translation into story-flow operations.
- Implementation must maintain stable positions and references.

