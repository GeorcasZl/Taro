# Spec: Investigation Hotspot Loop

Last updated: 2026-06-24

Status: Alpha/later product loop. This is not part of MVP.

## Goal

Define the creator loop for an investigation room with clickable hotspots, viewed records, repeated returns, and a final continuation after all required hotspots are viewed.

## Creator Flow

1. Creator inserts an investigation hotspot template in the unified interface.
2. Taro generates ordinary editable Document structure (Group + Event bindings).
3. Creator defines a background image and three hotspot regions on the Stage Canvas.
4. Each hotspot region automatically maps to a `click` trigger on that component.
5. Each trigger result writes a viewed record and jumps to a branch.
6. Each branch returns to the investigation choice.
7. A condition checks whether all required viewed records are true.
8. When complete, the flow continues to the next Group.

## Generated Structure

The template generates:

- A Group containing the interaction component.
- Three hotspot event bindings (`trigger: hotspot_1_clicked`).
- Three viewed records in the Record Dictionary.
- Three branch targets.
- A completion condition.
- A continuation jump.

After insertion, this structure is editable as normal Taro event bindings.

## Script Flow Representation

The Script Flow must show:

- The Hotspot Component node.
- Event bindings for hotspot clicks.
- Record writes for viewed status.
- Return jumps.
- Completion condition logic.

Compact representation (syntax sugar) is acceptable if it can be expanded.

## Stage Canvas Representation

The Stage Canvas must show:

- Background image.
- Hotspot regions.
- Hover and selected states.
- When selecting a hotspot, its associated event bindings are highlighted in the Timeline and Script Flow.
- Path context is properly maintained when previewing each branch.

## Preview Requirements

Preview must show:

- Clickable hotspots.
- Viewed-state changes.
- Return behavior.
- Completion condition result.
- Diagnostic trace if a hotspot has no binding.

## Diagnostics

Required diagnostics:

- Hotspot region has no trigger binding.
- Trigger binding writes an unknown record.
- Return jump target is missing.
- Completion condition references an unknown record.
- All-complete continuation is unreachable.
