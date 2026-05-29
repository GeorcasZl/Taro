# Taro UI Design

Last updated: 2026-05-29

## Design Goal

Taro should feel like a focused narrative studio: text-first, structure-aware, visually capable, and calm enough for long writing sessions.

The interface must make structure visible without overpowering prose.

## Product Posture

Taro is:

- A writing-first creative environment.
- A path-aware visual editor.
- A structured narrative IDE.
- A plugin-capable studio.

Taro is not:

- A dashboard.
- A free node graph as the primary screen.
- A timeline suite.
- A form-heavy database editor.
- A plugin SDK console for ordinary creators.

## Studio Surfaces

### Writing

Primary surface.

Design requirements:

- Large central writing area.
- Readable story flow.
- Quiet structural indicators for Groups, choices, records, stage changes, and jumps.
- Keyboard-first editing.
- Inline transformations that feel like editing story content, not filling backend forms.
- Visible but low-noise Group boundaries.

Input requirements:

- `Enter` creates the next Group.
- `Option/Alt+Enter` adds another text item to the same Group.
- `Shift+Enter` creates a line break inside the current text item.
- A low-noise left rail or equivalent marker shows which items belong to the same Group.
- The Group marker should be selectable and later may become a light operation handle for split, merge, add wait, or add effect actions.

### Global Add Search

The primary structured insertion path is a keyboard-invoked add/search box, not slash commands in prose.

Default shortcut:

- `Cmd/Ctrl+K`

The search box should find and add:

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

Insertion is context-sensitive:

- Selected text: transform or apply to the selection.
- Selected Group: insert into the current Group.
- Selected range: apply or batch-change content across the range.
- Selected Canvas object: add or edit visual content for the current Group.
- Empty insertion point: create new content at that position.

### Canvas

Visual structure and stage surface.

Design requirements:

- Zoom from story structure to current Group.
- Show selected path context.
- Show branch merge differences.
- Sync selection with Writing.
- Keep structural edits explainable in story-flow terms.
- Avoid becoming a freeform node board.

Zoom levels:

- Structure view: story shape, choices, conditions, jumps, loops, merge points, unfinished paths, and unreachable paths.
- Path view: selected path, current route, branch alternatives, Group summaries, and stage-state differences.
- Group view: current Group editor with player-facing Preview, ordered content list, path-derived current stage state, current Group changes, and Inspector.

Canvas visual editing may adjust character placement, text box placement, display-mode parameters, basic stage changes, and later hotspot regions or plugin tools. Every meaningful edit must map back to Document items, parameters, stage changes, or action bindings.

### Inspector

Contextual detail surface.

Design requirements:

- Show only parameters relevant to the current selection.
- Show parameter source: project default, display-mode default, plugin default, or local value.
- Provide explicit actions for saving defaults.
- Avoid persistent helper-button clutter inside the writing flow.

Inspector must show the scope of edits:

- Current content item.
- Current Group.
- Current selection.
- Display-mode default.
- Project default.

Saving a local adjustment as a default must require an explicit action such as "set as default" or "save as display mode".

### Preview

Playable simulation and debugging surface.

Design requirements:

- Show active path context.
- Show current Group and current item when debugging.
- Allow replay, step, skip wait, reset, and state inspection.
- Link interaction results and diagnostics back to source.

Preview controls should include replay current Group, step next item, skip wait, pause/resume, reset, inspect records, inspect stage state, and follow diagnostics back to source.

### Library

Resource and capability surface.

Design requirements:

- Organize assets, display modes, effects, plugins, and templates.
- Clearly mark built-in, project, and plugin sources.
- Show usage before deletion.

### Records

Story state management surface.

Design requirements:

- Use creator-facing language.
- Show record type, default value, references, and diagnostics.
- Support conditions without forcing code-first expression editing.

The first condition builder should support basic record types and simple comparisons. Advanced expressions are a later path and must be visually marked when introduced.

### Issues

Diagnostics surface.

Design requirements:

- Group issues by source and severity.
- Link each issue to Writing, Canvas, Inspector, Library, Plugins, or Export.
- Explain why an issue matters and how to fix it.

### Export

Build and validation surface.

Design requirements:

- Show preflight checks.
- Explain blocking issues.
- Confirm plugin and resource inclusion.
- Provide Preview parity evidence.

## Interaction Principles

### Text First

The creator's eye should land on story content before tooling.

### Structure Persistent But Subordinate

Groups, branches, records, jumps, and stage changes are visible, but their visual weight stays below the prose unless selected or in diagnostic focus.

### Commands Are Transient

Autocomplete, command search, snippets, quick fixes, and contextual actions should appear when invoked or relevant. They should not become permanent row-local button bars.

The global add/search box is the preferred command surface. It is a transient content insertion and transformation tool, not a slash-command writing syntax.

### Editing Happens In Place

The best edit is close to the content it changes. Inspector handles details, not basic authoring.

Selection is editor state. Selecting a row, Group, Canvas object, or Inspector field should synchronize surfaces without mutating the story Document.

### Path Context Is Explicit

When state depends on prior choices, the interface must show which path is currently active.

### Diagnostics Are Navigational

An issue is not just a message. It is a way back to the editable source.

## Figma Usage

Taro should not introduce Figma as a full visual-design or design-system workflow during the current phase.

The current priority is to stabilize product interaction semantics in the browser, especially the Writing surface editing model. Moving too early into high-fidelity Figma risks freezing an interaction model that has not been proven in the live creator loop.

For now, Figma may be used only as a very low-fi reference and discussion tool for judging what the editor should and should not feel like. These references are exploratory; they do not define final UI, component APIs, visual tokens, or implementation acceptance.

Repository docs and the running browser product remain authoritative for:

- Story model semantics.
- Group execution rules.
- Writing surface behavior.
- Plugin flow-control boundaries.
- API contracts.
- Export behavior.
- Implementation evidence.

Recommended Figma sequence:

1. Use very low-fi Figma references only when they clarify editor posture, negative examples, or coarse surface relationships.
2. Stabilize the core Writing loop in the browser: inline editing, caret/selection insertion, Group visibility, Add/Search behavior, Preview, and Export parity.
3. Introduce a formal Figma workflow after the core writing loop is running and product behavior is stable enough to evaluate against live evidence.
4. Defer high-fidelity design, visual tokens, and complete design-system work until closer to Alpha, when sustained dogfood creates reliable UI pressure.
5. Mirror any accepted product or interaction decision back into the relevant repository docs before implementation depends on it.

See `docs/spec/figma-workflow.md` for the current low-fi-only boundary, later Figma gates, agent-skill usage, and repo backflow rules.

## Visual Language

Taro should be quiet, precise, and editorial.

Preferred qualities:

- High readability.
- Stable spacing.
- Modest contrast.
- Clear selection and focus states.
- Lightweight structure marks.
- Strong keyboard affordance.
- Rare, purposeful motion.

Avoid:

- Decorative gradients as the main identity.
- Oversized marketing-style panels inside the app.
- Dense persistent button bars.
- Node-editor visual dominance.
- Overly colorful state badges competing with prose.
- Form-heavy editing for common authoring actions.

## Minimum UI Acceptance

Before a UI change ships, verify:

- Core authoring can be performed by keyboard.
- Text does not overflow controls or panels.
- Focus state is visible.
- Diagnostic state links to source.
- Canvas and Writing selections stay synchronized when both are affected.
- Preview exposes path context when path context matters.

## Captured Later UI Directions

These directions should be preserved for later design, but they are not MVP requirements:

- Smart selection: select a range, then filter to a speaker, display mode, sound, jump, same-Group content, or plugin capability.
- Branch and key-position naming flows for easier search, jump targets, and Canvas labels.
- Canvas breadcrumbs, minimap, path selector, and branch filtering for larger works.
- Full Library, Records, Plugins, Templates, Issues, Project Settings, and Export surfaces.
- Auto Mode and player rollback controls.
