# Taro State Model

Last updated: 2026-05-15

## Purpose

This document defines the conceptual state model for Taro. It is product-level and implementation-guiding; exact storage formats may evolve, but they must preserve these identities, relationships, and invariants.

## Model Layers

Taro separates five state layers:

1. **Document state**: persistent authoring truth.
2. **Stage state**: persistent player-facing presentation derived along a path.
3. **Story record state**: persistent narrative state used by conditions and branches.
4. **Temporary play state**: runtime interaction state that does not become story truth unless recorded.
5. **Editor state**: selection, focus, zoom, scroll, and panel state.

Only Document state is the durable authoring source. Stage and story record state are derived or simulated from Document commands.

## Document

The Document contains:

- Project metadata
- Story flow
- Groups
- Content items
- Stable positions
- Records
- Resources
- Display modes
- Plugin capability references
- Templates generated into normal structure
- Diagnostics metadata

The Document must be serializable, diffable, migratable, and exportable.

## Story Flow

Story flow is the ordered and structured body of the work.

It contains Groups and flow relations:

- Linear next relation
- Choice option target
- Condition branch target
- Jump target
- Interaction result target
- Named position target

Line numbers are editor presentation. Stable positions are the durable identity.

## Stable Position

A stable position identifies a location in the story flow.

Required behavior:

- Survives text edits around it.
- Can be referenced by jumps and diagnostics.
- Can be renamed when exposed as a named target.
- Can be moved while preserving references.
- Can report all inbound references before deletion.

## Group

A Group is the player advance unit.

Fields:

- `id`: stable Group identity.
- `position`: stable story position.
- `items`: ordered content items.
- `incoming`: derived inbound flow references.
- `outgoing`: derived outgoing flow references.
- `metadata`: optional authoring labels, comments, collapsed state, and diagnostics.

Rules:

- Enter creates a new Group in Writing.
- Option/Alt+Enter or another explicit same-Group insertion adds a content item to the current Group.
- Same-Group insertion may target the space between two existing items. The resulting `items` order is the source of truth for Preview and Export.
- Empty text items are temporary focused editing affordances. If an empty text item loses focus, it is removed unless it is the only editable affordance for an otherwise empty document.
- Backspace on a focused empty text item removes that item and moves focus to the previous text item, next text item, or Group-level insertion target.
- Shift+Enter creates a line break inside the current text item instead of creating a new Group.
- Split creates two Groups and moves selected items.
- Merge combines adjacent compatible Groups and preserves item order.
- A Group may have zero text items if it performs stage, sound, wait, interaction, record, or action behavior.
- MVP1 may create a stage-only Group after the selected Group for an explicit background change; the Group participates in linear stage-state continuation like any other Group.

## Content Item

A content item is one executable or presentable element inside a Group.

Common item kinds:

- `text`
- `stage_change`
- `sound_change`
- `wait`
- `instant_effect`
- `interaction`
- `record_write`
- `choice`
- `condition`
- `jump`
- `result_action`
- `plugin_capability`

Shared fields:

- `id`: stable item identity.
- `group_id`: owning Group.
- `order`: order inside the Group.
- `kind`: item kind.
- `blocking`: whether execution waits before later items.
- `source_range`: editable source range or structural origin.
- `diagnostics`: linked issues.

## Execution Model

Within a Group:

1. Items execute in order by default.
2. Blocking items pause later items until complete.
3. Non-blocking items may start and let later items continue.
4. Wait items block until their duration or condition completes.
5. Interaction items usually block until a trigger result is emitted or cancelled.
6. Text blocking behavior is controlled by display mode.
7. Group completion waits for all required blocking behavior and result actions.

The model avoids a multi-track timeline. Concurrency is explicit through non-blocking item declarations.

Confirmed default behavior:

- Ordinary text is blocking by default.
- Special display modes may make text non-blocking.
- Project default after Group completion is to wait for player advance.
- Group or display mode settings may explicitly auto-advance.

## Stage State

Stage state is the persistent player-facing presentation context along a path.

Examples:

- Background
- Character sprites
- Character positions
- Character expressions
- BGM
- Ambience
- Persistent overlays
- Screen tone
- Active display container defaults

Stage state is changed by `stage_change`, `sound_change`, and compatible plugin capability items.

Stage state is not globally owned by a scene. It is derived by applying changes along a selected path context.

Canvas and Preview must distinguish:

- Current stage state: inherited from the selected path context.
- Current Group stage changes: new changes introduced by the current Group.
- Instant effects: events that occur and do not persist.
- Waits: timing inside the current Group.

## Story Record State

Records represent story state in creator-facing language.

Record categories:

- Boolean flags
- Numbers
- Text values
- Enumerations
- Inventory-like collections
- Relationship values
- Route progress
- Viewed status

MVP record editing uses basic record types and simple comparisons. Advanced expressions are allowed only as a later, clearly marked path.

Rules:

- Conditions read records.
- Record writes change records.
- Advanced expressions may read records through a constrained expression system.
- Records have owners, descriptions, types, default values, and reference tracking.
- Ordinary conditions should primarily read records. Conditions that read stage state or runtime context belong to an advanced path and must be marked in UI and diagnostics.

## Temporary Play State

Temporary play state includes:

- Hover
- Focus
- Current timer value
- Drag state
- Press duration
- Input composition
- Animation progress

Temporary play state does not affect story branches unless explicitly converted into a record write or result action.

## Editor State

Editor state includes:

- Current selection
- Cursor
- Open panels
- Canvas zoom
- Current path context
- Scroll positions
- Preview playback control state
- Expanded and collapsed UI sections

Editor state can be saved as workspace preference, but it is not story truth.

Selection is editor state. Selecting a Group, item, range, Canvas object, or Inspector control synchronizes Studio surfaces but must not be modeled as a persistent Document command.

## Plugin Private State

Plugin private state may exist for runtime implementation.

Rules:

- It must be serializable when required for save/load.
- It must declare replay and preview semantics.
- It must declare migration behavior.
- It must not hide critical story flow, record writes, conditions, or jumps.

## Path Context

A path context is a selected route from an entry point to the current position.

It is needed when:

- A position has multiple predecessors.
- Branches merge after divergent stage state.
- Preview starts from the middle.
- Canvas renders a current stage at a merge point.

Canvas and Preview must show the active path context when it affects state.

## Branch Merge State Differences

When multiple paths reach the same position, Taro compares derived stage state.

If differences exist, the Document can represent one of three outcomes:

- `unresolved_difference`: creator has not handled it.
- `accepted_difference`: creator accepts path-dependent presentation after merge.
- `normalized_state`: creator sets a unified stage state at or before the merge.

Unresolved differences are diagnostics. Export policy may block or warn depending on severity.

## Display Mode

A display mode defines how content appears.

Examples:

- Dialogue bubble
- Narration panel
- Center text
- Phone chat
- Background hotspot overlay

Display mode owns presentation rules and may define whether text display blocks Group progression.

Display mode may also define:

- Layout and screen position.
- Entry and exit behavior.
- Text reveal behavior.
- Player click behavior for reading progression.
- How previous content is replaced, retained, or dismissed.
- How multiple same-Group content items are arranged.

Display mode click behavior is separate from interaction trigger behavior. A display click may complete text, skip a skippable wait, or enter the next Group. An interaction click emits a named trigger result that binds to visible result actions.

## Interaction Capability

An interaction capability defines how the player provides input.

Examples:

- Click option
- Click hotspot
- Long press
- Drag object
- Choose reply

Interaction capability emits named trigger results. Trigger results bind to visible Taro result actions.

## Result Action

Result actions map triggers to story effects.

Examples:

- Continue
- Continue current Group
- Enter next Group
- Jump to position
- Write record
- Play instant effect
- Wait
- Open nested choice

Critical result actions must be visible in Writing, Canvas, or Inspector.

Return-to-choice behavior should not be a hidden runtime stack by default. Templates may generate explicit return jumps and targets, and those generated structures remain ordinary editable story structure.

## Resource Reference

Resources include images, audio, fonts, plugin assets, and export files.

Rules:

- Resource references must be stable.
- Missing resources create diagnostics.
- Export resolves resources from Document references, not from ad hoc UI state.

## Diagnostics Model

A diagnostic contains:

- `code`
- `severity`
- `message`
- `source`
- `surface`
- `blocking_export`
- `suggested_fix`
- `trace`

Diagnostics are derived from the Document and can link back to Writing, Canvas, Inspector, Library, Plugins, or Export.

## Runtime Snapshot Direction

Save/load is not part of the current MVP, but the model should not block it.

Future player saves may include position, current Group, story records, path history, current path context, necessary stage snapshots, current Group execution progress, display-mode runtime state, unresolved trigger context, and plugin private state declared as save-required.

Necessary snapshots are restore aids, not a second authoring source of truth. Any state that affects later story conditions should be represented as Records or visible actions.
