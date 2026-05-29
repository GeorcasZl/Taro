# ADR 0004: Canvas Is Not A Second Source

Date: 2026-05-15

## Status

Accepted

## Context

Canvas must be powerful enough to edit structure, stage presentation, and interactions. If it becomes a free node editor or hidden scene graph, Taro loses the text-first product thesis and creates two conflicting sources of truth.

## Decision

Canvas may edit structure and presentation only through Document commands that map back to Writing-visible objects.

Canvas structural connections must correspond to choices, conditions, jumps, or interaction result actions. Canvas stage edits must correspond to stage changes, display-mode parameters, resources, or content-item parameters.

## Consequences

Benefits:

- Canvas remains powerful without stealing authorship from Writing.
- Writing and Canvas can navigate to the same source.
- Diagnostics and export stay coherent.

Costs:

- Canvas cannot support arbitrary graph operations without story-flow meaning.
- Some familiar node-editor interactions need Taro-specific translation.

