# ADR 0006: Plugins May Recommend Flow But Not Hide It

Date: 2026-05-15

## Status

Accepted

## Context

Plugins are essential for rich display modes and interactions. But if plugins directly own jumps, conditions, records, or route progress invisibly, creators cannot debug or safely export the work.

## Decision

Plugins may declare trigger results and recommended actions.

When inserted into a project, those recommendations must expand into visible Taro trigger bindings and result actions. Critical story flow remains editable through Taro.

## Consequences

Benefits:

- Plugins can accelerate authoring.
- Story logic remains searchable and diagnosable.
- Export can validate plugin dependencies and story flow.

Costs:

- Plugin manifests need explicit trigger and action schemas.
- Plugin insertion needs a binding-expansion step.
- Runtime plugin APIs must report triggers instead of silently controlling flow.

