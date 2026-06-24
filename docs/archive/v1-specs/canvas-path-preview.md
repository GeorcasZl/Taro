# Spec: Canvas Path Context And Preview

Last updated: 2026-05-16

## Goal

Canvas and Preview must render story positions with explicit path context so branch-dependent stage state is understandable and diagnosable.

## Canvas Modes

Canvas supports three zoom levels:

- **Structure view**: overall story flow, choices, conditions, jumps, and merge points.
- **Path view**: selected path, current route, branch alternatives, and state differences.
- **Group view**: current Group preview, content list, stage state, and selected item parameters.

Group view is the MVP visual editing target. It should show:

- Player-facing Preview.
- Current Group ordered content list.
- Current stage state derived from the selected path context.
- Current Group stage changes.
- Instant effects and waits in this Group.
- Selected item Inspector.

The MVP1 ordinary-dialogue vertical slice implements the first narrow Group-view stage edit: a rainy-street background change. It can record that edit as a visible `stage_change` item in the selected current Group, or as a new stage-only Group inserted after the selected Group. The stage-only Group may contain no text item. Repeating the same background action must still create a visible `stage_change` item; only the resource reference may be deduplicated. MVP1 must still derive the current linear background from earlier Groups so Canvas and local Export show inherited background state in ordinary dialogue. Full inherited-state visualization, path switching, Inspector depth, waits, effects, and branch-merge difference tools remain later Canvas work.

## Path Context

When rendering a story position, Canvas uses:

```text
current position + selected path context
```

If there is only one path, Canvas may choose it automatically.

If there are multiple paths, Canvas must show the active path context and allow switching.

## Branch Merge Differences

At a merge point, Canvas compares stage state from inbound paths.

If stage state differs, Canvas must show:

- The differing fields.
- Which prior item set each value.
- A path switcher to inspect each result.
- Actions to set unified state, accept path difference, or split later flow.

## Canvas Editing Rules

MVP1 Canvas editing is limited to presentation edits that map directly back to Document items or parameters.

MVP1 Canvas may create or edit:

- Character placement.
- Text box placement.
- Display-mode parameters.
- Basic current-Group stage changes.
- A new stage-only Group after the selected Group for a stage change that should consume its own player advance.

Later Canvas may create or edit:

- Stage object placement.
- Choice options.
- Condition branches.
- Jump targets.
- Interaction result bindings.
- Hotspot regions.

Canvas edits must create Document commands. Canvas cannot create private graph edges or hidden flow.

Canvas edits must distinguish:

- Current stage state inherited from the path.
- New state changes introduced by the current Group.
- Temporary editor selection and handles.
- Preview playback state.

Only the second category is story truth by default. Selection, handles, zoom, and playback controls are editor or Preview state.

## Selection Sync

Writing, Canvas, Inspector, and Preview may synchronize selection.

Selection sync must not be a Document mutation. Selecting a Canvas object should identify the corresponding Group, content item, display-mode parameter, stage change, action binding, or resource reference.

## Preview Modes

Preview supports:

- Current Group preview.
- From-position preview.
- Path preview.
- Full preview.

Preview must expose:

- Active path context.
- Current Group.
- Current item.
- Current stage state.
- Current records.
- Source trace for actions and diagnostics.

Preview must use the same click progression and Group execution rules as Export. Editor overlays, selected-object highlights, handles, and diagnostic traces are Preview/Canvas aids, not player runtime behavior.

## Acceptance Loop: Branch Merge

1. Create a branch with two paths.
2. Path A changes background.
3. Path B leaves background unchanged.
4. Merge paths.
5. Canvas marks stage-state difference.
6. Creator switches path context and sees both stage results.
7. Creator sets a unified background or accepts the difference.
8. Preview reflects the chosen resolution.

## Captured Later Directions

These Canvas directions are preserved for later work:

- Breadcrumbs, minimap, path selector, branch filtering, and target search for large works.
- Rich hotspot region editing.
- Plugin-provided Canvas tools that use standard handles, selection, and Inspector schemas.
- Smart selection from Canvas into content ranges or capability types.
