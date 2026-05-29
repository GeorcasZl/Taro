# Taro Roadmap

Last updated: 2026-05-15

## Roadmap Principle

The roadmap is organized around proving creator loops, not around accumulating isolated features.

Every milestone must make the product thesis more testable:

> A creator can write readable branching story text, add rich presentation and interaction, preview it with correct state, diagnose problems, and export a playable result.

## Current MVP Vertical Slice

Before broad alpha work, Taro should prove a narrow ordinary VN dialogue loop:

1. Writing creates structured Groups from dialogue.
2. A global keyboard add/search box inserts or changes content based on context.
3. Canvas edits minimal visual presentation for the current Group while writing back to the Document.
4. Preview plays the same Group execution and click progression that Export uses.
5. Export creates a minimal local playable package.

Plugin capabilities, investigation templates, phone chat, full Records management, save/load UI, Auto Mode, rollback, marketplace, and mobile editor remain outside this MVP slice.

## Phase 0: Product Baseline

Goal: make the product model explicit enough that implementation does not drift.

Deliverables:

- Product description
- Architecture document
- State model
- API contracts
- MVP definition
- Specs for first authoring loops
- Runtime semantics spec
- Testing and dogfood plan
- ADRs for core model decisions

Exit evidence:

- Documentation files exist and cross-link cleanly.
- No core model is described in two conflicting ways.
- The five product proofs are represented in specs and tests.

## Phase 1: Document Core And Writing Loop

Goal: creators can write ordinary VN dialogue as structured Groups, preview it, and export a minimal local playable package.

Creator loop:

1. Write ordinary dialogue.
2. Create the next Group with Enter.
3. Add content to the same Group with an explicit same-Group action.
4. Split and merge Groups.
5. Add simple record writes and jumps.
6. Adjust minimal visual presentation in Canvas.
7. Preview the written flow.
8. Export a minimal local playable package.

Key capabilities:

- Project and Document schema.
- Stable positions.
- Group and content-item editing.
- Speaker and display-mode metadata.
- Basic record definitions.
- Basic choice and jump structures.
- Minimal Canvas current-Group visual editing.
- Shared Preview and Export runtime semantics.
- Minimal local export package.
- Undo and redo over Document commands.

Exit evidence:

- Ordinary dialogue loop passes.
- Multi-content Group loop passes.
- Prose is protected from accidental command parsing.
- Preview uses Document state rather than ad hoc UI state.
- Exported local package matches Preview for the ordinary dialogue loop.

## Phase 2: Canvas And Path-Aware Preview

Goal: Canvas can inspect structure and stage while remaining tied to Writing.

Creator loop:

1. Select a story position in Writing.
2. See the same position in Canvas.
3. Choose a path context when a position has multiple predecessors.
4. Edit stage presentation in Canvas.
5. See those edits represented in the story flow.
6. Preview with traceable diagnostics.

Key capabilities:

- Structure overview.
- Path context selector.
- Current Group visual editor.
- Stage state derivation.
- Branch merge state-difference detection.
- Preview controls: play, pause, replay Group, step item, skip wait, reset, inspect state.

Exit evidence:

- Branch merge loop passes.
- Canvas edits map back to Document.
- Preview can explain which path produced the rendered stage.

## Phase 3: Records, Conditions, And Diagnostics

Goal: story state becomes powerful without exposing ordinary creators to code-first logic.

Creator loop:

1. Create records through creator-facing language.
2. Build conditions through fields, operators, values, chips, and search.
3. Bind choices and interaction results to record writes and jumps.
4. Diagnose missing records, invalid values, unreachable targets, and unresolved state differences.

Key capabilities:

- Record manager.
- Condition builder.
- Advanced expression lane.
- Reference tracking.
- Diagnostics panel.
- Source-linked issue navigation.

Exit evidence:

- Investigate-room loop passes.
- Conditions are visible and editable.
- Export blocks broken flow with actionable diagnostics.

## Phase 4: Plugins, Templates, And Library

Goal: creators can use richer interactions and templates while story logic stays visible.

Creator loop:

1. Install or enable a plugin.
2. Insert a plugin-provided capability or template.
3. See generated triggers, records, conditions, and actions.
4. Edit the generated structure as normal Taro content.
5. Preview and export with plugin diagnostics.

Key capabilities:

- Plugin manifest loading.
- Capability discovery.
- Template generation.
- Missing plugin placeholders.
- Plugin upgrade and migration diagnostics.
- Export plugin bundling.

Exit evidence:

- Plugin phone-chat loop passes.
- Plugins cannot hide critical flow control.
- Templates generate ordinary editable structure.

## Phase 5: Alpha Studio Hardening

Goal: Taro becomes coherent enough for sustained creator dogfood.

Creator loop:

1. Start a project.
2. Write a branching story with records and interactions.
3. Navigate through Writing, Canvas, Preview, Library, Records, Plugins, Issues, Settings, and Export.
4. Fix diagnostics.
5. Export a playable build.
6. Reopen the project and continue editing.

Key capabilities:

- Project persistence.
- Asset handling.
- Import and export robustness.
- Keyboard-first authoring flows.
- Accessibility and text overflow checks.
- Error recovery.
- Dogfood friction log.

Exit evidence:

- A small complete project can be authored from scratch.
- Preview and export behavior match.
- Blocking diagnostics have source links.
- The product can be tested by browser automation and manual creator walkthroughs.

## Deferrals

These are intentionally outside the first alpha proof:

- Full marketplace and payment flows.
- Multi-user collaboration.
- Full custom game-engine scripting.
- Timeline animation editor.
- Mobile editor.
- Long-lived template instance system as a default Taro feature.
