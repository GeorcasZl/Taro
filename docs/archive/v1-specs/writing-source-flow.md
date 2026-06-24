# Spec: Writing Source Flow

Last updated: 2026-05-15

## Goal

Writing lets creators author a readable story flow while creating structured Groups, text, records, choices, conditions, jumps, and stage changes.

## User Story

As a creator, I want the main writing surface to feel like a story document, while Taro quietly preserves enough structure to preview, diagnose, and export branching visual behavior.

## Required Behaviors

### Group Creation

- Pressing Enter after a content line creates the next Group.
- `Option/Alt+Enter` adds another text item inside the current Group.
- Shift+Enter creates an internal line break inside a text item.
- Between-Group positions may exist as editor state for later insertion, but normal authoring should reach them through caret/selection behavior instead of persistent management buttons.
- Between-item positions inside one Group may exist as editor state for same-Group insertion. They should appear as subtle document-body insertion affordances, not permanent plus-button controls.
- Empty Groups are legal visible structure. When an empty Group is selected by document navigation, the next explicit typing or Add/Search commit can fill that Group.
- Splitting a Group moves selected items into a new adjacent Group.
- Merging adjacent Groups preserves item order.
- A low-noise Group marker should show which items belong to one player advance.

### Text Editing

- Text remains ordinary prose unless the user explicitly transforms it.
- Existing text items are directly editable in Writing.
- Cursor and selection are local editor state. Moving the caret, selecting an item, or selecting a Group insertion point must not mutate the Document.
- Empty unfocused text items should render as blank document space. Placeholder copy may appear when the empty text item is focused or when an otherwise empty document needs first-run guidance.
- Commands or shortcuts must not treat `go Ending`, `if trust matters`, or similar ordinary phrases as logic.
- Speaker and display mode may be inherited from prior content, but inheritance must be visible on selection.
- Repeated speaker and display-mode metadata may be visually suppressed when safe, but must reappear on selection, hover, or inspection.

### Global Add Search

Writing uses a keyboard-invoked global add/search box as the main structured insertion path.

Default shortcut:

- `Cmd/Ctrl+K`

Search results can include:

- Characters.
- Display modes.
- Backgrounds and stage changes.
- Sound changes.
- Instant effects.
- Waits.
- Choices.
- Conditions.
- Jumps and named positions.
- Records and record writes.
- Resources.
- Templates.
- Later plugin-provided capabilities.

The add/search box commits explicit transformations. Ordinary prose remains prose until the creator selects a result or command.

Context rules:

- Cursor in text: insert at the current story position or transform the current text item.
- Group selected: insert into the selected Group.
- Group whitespace selected: insert into that Group.
- Empty Group selected: insert into that empty Group.
- Between-Groups insertion point selected: create a new Group at that position when the chosen result needs a Group container.
- Multiple items selected: apply compatible changes across the selection.
- Logic position selected: create or edit choice, condition, jump, or action binding.
- Canvas object selected: add or edit visual content for the current Group while writing back to Document.

MVP1.1 implements one concrete Add/Search item, `Set rainy street background`. It inserts one visible `stage_change` into the Group resolved from the current insertion target, creating a stage-only Group first when the target is between Groups. Repeating the action creates another visible `stage_change`; it does not disappear merely because the derived stage state already matches.

### Visible Logic

Writing must show:

- Choices and option labels.
- Conditions and their result branches.
- Jumps and their target names.
- Record writes.
- Stage changes.
- Plugin trigger bindings when they affect story flow.

Compact inline chips or foldable rows are acceptable. Hidden logic is not.

### Reference Safety

- Jumps use stable targets, not line numbers.
- Renaming a target updates visible references.
- Deleting a target shows inbound references.
- Broken references create diagnostics with source links.
- Branches, key positions, and structural targets may have creator-facing names.
- Unnamed targets may show line number, nearby text, or parent choice/condition label as an editor aid, but durable references remain stable positions or structural targets.

## Interaction Expectations

- Writing remains the primary creative surface.
- Keyboard use is first-class.
- Inspector is secondary and contextual.
- Canvas can navigate to Writing and Writing can navigate to Canvas.
- Selection sync is editor state, not Document mutation.

## Captured Later Directions

These directions are preserved for future work:

- Smart selection: select a range, then filter by speaker, display mode, sound, jump, Group membership, record write, or capability type.
- Group marker operations: select Group, drag membership, split, merge, add wait, or add effect.
- Natural-language-assisted condition creation, provided the committed condition becomes structured and visible.
- Hotspot-presented choices whose option text may be represented by visual regions rather than ordinary button text.

## Acceptance Loops

### Ordinary Dialogue

1. Create a new project.
2. Write two dialogue Groups.
3. Inherit speaker and display mode.
4. Preview both advances.
5. Confirm each player advance maps to one Group.

### Multi-Content Group

1. Write one dialogue Group.
2. Add thunder sound to the same Group.
3. Add screen shake to the same Group.
4. Add a wait before the second text item.
5. Preview ordered execution.

## Diagnostics

Writing must surface:

- Broken jump target.
- Unknown record.
- Invalid record value.
- Missing required resource.
- Plugin capability unavailable.
- Group with unresolved blocking interaction.
