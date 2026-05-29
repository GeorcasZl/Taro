# ADR 0003: Stage State Is Path-Driven

Date: 2026-05-15

## Status

Accepted

## Context

Branching stories can reach the same position through different paths. Those paths may imply different backgrounds, music, character positions, expressions, overlays, or tones. A single global current stage state cannot explain this correctly.

## Decision

Stage state is derived from:

```text
current position + selected path context
```

Canvas and Preview must show or choose path context whenever a position has multiple meaningful predecessors. Branch merge differences must be diagnosed and resolvable.

## Consequences

Benefits:

- Runtime behavior matches player history.
- Canvas can explain why a stage looks different.
- Branch merge problems become visible.

Costs:

- Preview from the middle requires path selection or derivation.
- Canvas needs UI for path context and state differences.
- Export diagnostics must reason about multiple inbound paths.

