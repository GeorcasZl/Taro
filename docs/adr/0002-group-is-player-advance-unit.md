# ADR 0002: Group Is The Player Advance Unit

Date: 2026-05-15

## Status

Accepted

## Context

One line of text is not always one player advance. A player advance may include text, sound, effects, waits, interaction, stage changes, records, and jumps. Taro needs one stable unit for authoring, preview, diagnostics, and export.

## Decision

Use **Group** as the stable internal and lightweight creator-facing term for one player advance.

A Group contains an ordered list of content items. Enter creates the next Group. Explicit same-Group insertion adds an item to the current Group.

## Consequences

Benefits:

- Preview has a clear execution unit.
- Multi-content presentation is expressible without a timeline.
- Writing can show low-noise structure.
- Export can preserve player advance semantics.

Costs:

- UI must teach Group behavior through interaction instead of heavy terminology.
- Split, merge, and reorder operations become required early.

