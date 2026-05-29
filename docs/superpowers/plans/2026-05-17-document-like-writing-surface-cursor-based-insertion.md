# Document-like Writing Surface / Cursor-Based Insertion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace MVP1's fixed input append mode with a minimal document-like Writing surface where cursor and selection define the insertion target.

**Architecture:** Keep `packages/core` as the only persistent story-truth layer. Add a local Studio selection/insertion model in `packages/studio` that maps creator actions to existing or narrowly extended Document commands; Canvas, Preview, and Export continue to derive from the Document.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, Playwright, `@taro/core` Document commands.

---

## Product Source

Read before implementation:

- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/MVP.md`
- `docs/STATE_MODEL.md`
- `docs/API_CONTRACTS.md`
- `docs/TESTING.md`
- `docs/spec/writing-source-flow.md`
- `docs/spec/canvas-path-preview.md`
- `docs/spec/runtime-semantics.md`
- `docs/adr/0001-writing-is-source-of-truth.md`
- `docs/adr/0002-group-is-player-advance-unit.md`
- `docs/adr/0004-canvas-is-not-second-source.md`

## Goal And Non-Goals

MVP1.1 changes Writing from a fixed draft input append mode into a document-like editing surface:

- Creators primarily click in the story body, move the cursor, edit inline, and insert content at the active insertion target.
- Writing remains source of truth. Canvas, Preview, and Export continue to derive from the Document.
- Cursor and selection are editor state, not Document state.
- Add/Search decides what to insert; cursor or selection decides where it lands.

Out of scope:

- Branching, choices, conditions, records, plugins, templates, renderer polish, timeline editing, node-editor-first authoring, SDK-first authoring.
- Full ProseMirror or Slate migration unless Task 1 produces written evidence that simple React state plus `textarea` or `contenteditable` per item cannot meet the MVP1.1 tests.
- A complete rich text editor. MVP1.1 only needs minimal inline editing for text items and visible structural insertion points.

## Files

Create:

- `packages/studio/src/insertionModel.ts` for selection target types and pure insertion resolution helpers.
- `packages/studio/src/insertionModel.test.ts` for unit coverage of caret, Group, empty Group, and between-Group insertion rules.

Modify:

- `packages/studio/src/App.tsx` to render item-level editable Writing UI and insertion point affordances.
- `packages/studio/src/studioState.ts` to store editor selection context and route keyboard/Add/Search actions through that context.
- `packages/studio/src/App.test.tsx` to cover inline editing and selection-driven insertion.
- `packages/studio/e2e/mvp1-ordinary-dialogue.spec.ts` or a new `packages/studio/e2e/mvp1-1-document-writing.spec.ts` for browser coverage.
- `packages/studio/src/addSearch.ts` to collapse location-specific background results into one insertion action.
- `docs/MVP.md`, `docs/API_CONTRACTS.md`, `docs/TESTING.md`, and `docs/spec/writing-source-flow.md` after behavior lands.

Review only:

- `packages/core/src/document.ts`
- `packages/core/src/runtime.ts`
- `fixtures/mvp1/ordinary-dialogue/document.taro.json`

## Core Interaction Model

Define these insertion targets in local Studio editor state:

- `text_caret`: cursor inside one text item, with `group_id`, `item_id`, and text offset or range.
- `item_selected`: one structural item selected, with `group_id` and `item_id`.
- `group_inside`: the insertion target is inside a Group but not inside a text item.
- `empty_group`: a Group with no text items selected as a valid insertion target.
- `between_groups`: insertion point before or after a Group.

Interaction rules:

- Clicking a text item enters inline editing for that text item.
- Clicking a `stage_change` item selects the item and opens the path for viewing or editing its parameters.
- Clicking Group whitespace sets selection inside that Group.
- Clicking between two Groups sets a between-Groups insertion point.
- Empty Groups are legal structure and may represent stage, wait, action, record, or interaction-only Groups.
- Selection sync remains editor state and must not emit Document mutation commands.

## Insertion Rules

When the cursor is inside a text item:

- Ordinary typing updates that text item through `text.update`.
- `Enter` creates a new Group after the current Group.
- `Alt/Option+Enter` inserts a new text item in the current Group.
- `Shift+Enter` inserts a line break inside the current text item.

When the cursor is inside a Group but not inside a text item:

- Add/Search inserts the chosen item into that Group.

When the cursor is inside an empty Group:

- Add/Search inserts into that empty Group.
- Typing text creates a text item inside that Group.

When the cursor is between two Groups:

- Typing text creates a new Group at that position with a text item.
- Add/Search creates a new Group at that position when the inserted content needs a Group container.

For stage or background insertion:

- Do not provide separate "in current Group" and "as new Group" search results.
- Provide one background/stage insertion result.
- Resolve whether it becomes `stage.set_background` in an existing Group or `group.create_after` plus `stage.set_background` from the active insertion target.

## UI/UX Scope

MVP1.1 should feel like a minimal document editor, not a form-heavy append tool:

- Show current Group with a quiet marker.
- Show selected item distinctly enough to inspect and edit it.
- Show between-Group insertion points before committing new structure.
- Show Group-internal insertion points for empty Groups and Group whitespace.
- Preserve keyboard operation for moving focus, committing text, opening Add/Search, selecting Add/Search result, and dismissing transient UI.
- Avoid hidden state and implicit empty Group creation. Empty Groups only appear from explicit insertion or visible between-Group creation.
- Every structure change writes through Document commands.

## Task 1: Define Selection And Insertion Model

**Files:**

- Create: `packages/studio/src/insertionModel.ts`
- Create: `packages/studio/src/insertionModel.test.ts`
- Modify: `packages/studio/src/studioState.ts`

- [ ] **Step 1: Add failing unit tests for insertion target resolution**

Cover these exact cases in `packages/studio/src/insertionModel.test.ts`:

- Text caret resolves to current Group and text item.
- Group whitespace resolves to `group_inside`.
- Empty Group resolves to `empty_group`.
- Between two Groups resolves to `between_groups` with `before_group_id` and `after_group_id`.
- Selection changes do not mutate `document.revision`.

Run: `npm run test:studio -- insertionModel`

Expected: tests fail because `insertionModel.ts` does not exist.

- [ ] **Step 2: Implement local insertion target types**

Add discriminated union types and helpers in `packages/studio/src/insertionModel.ts`:

- `WritingInsertionTarget`
- `resolveTextInsertionTarget`
- `resolveGroupInsertionTarget`
- `resolveBetweenGroupsInsertionTarget`
- `isGroupEmpty`

These helpers must only read `TaroDocument`; they must not call `applyDocumentCommand`.

- [ ] **Step 3: Store insertion target in Studio state**

Replace the selected-only mental model with an explicit `insertionTarget` field in `StudioState`. Keep `selectedGroupId` and `selectedItemId` only if needed for compatibility during migration.

Run: `npm run test:studio -- studioState`

Expected: existing selection tests still pass, and new insertion model tests pass.

## Task 2: Refactor Writing Surface To Item-Level Editable UI

**Files:**

- Modify: `packages/studio/src/App.tsx`
- Modify: `packages/studio/src/styles.css`
- Modify: `packages/studio/src/App.test.tsx`

- [ ] **Step 1: Add failing tests for inline editing**

Add tests proving:

- Clicking an existing text item enters editable mode.
- Editing text updates the same Document text item.
- Clicking a `stage_change` item selects it instead of entering text editing.
- Clicking Group whitespace sets Group-internal insertion context.
- Clicking between Groups shows a between-Groups insertion point.

Run: `npm run test:studio -- App`

Expected: tests fail against the fixed draft input UI.

- [ ] **Step 2: Render text items as minimal inline editors**

Use simple React state with either per-item `textarea` controls or carefully scoped `contenteditable` text nodes. Prefer per-item `textarea` first unless Task 1 documents a blocker.

Each text item editor must:

- Display current item text.
- On input, emit `text.update` for that item.
- Preserve selection locally after update when practical.
- Keep `Enter`, `Alt/Option+Enter`, and `Shift+Enter` behavior scoped to the current item.

- [ ] **Step 3: Render structural items and insertion affordances**

Render `stage_change` as a selectable structural item. Render Group whitespace and between-Group insertion affordances as keyboard-focusable controls with accessible labels.

Run: `npm run test:studio -- App`

Expected: inline editing and structural selection tests pass.

## Task 3: Route Keyboard Commands Through Selection Context

**Files:**

- Modify: `packages/studio/src/keyboard.ts`
- Modify: `packages/studio/src/studioState.ts`
- Modify: `packages/studio/src/App.test.tsx`
- Modify: `packages/studio/e2e/mvp1-ordinary-dialogue.spec.ts` or create `packages/studio/e2e/mvp1-1-document-writing.spec.ts`

- [ ] **Step 1: Add regression tests for current MVP1 keyboard rules**

Keep coverage for:

- `Enter` creates a new Group after the current Group.
- `Alt/Option+Enter` inserts a text item in the current Group.
- `Shift+Enter` inserts a newline inside the current text item.
- Typing draft text does not create an empty Group.
- `Alt/Option+Enter` does not switch into a pending or empty Group by accident.

- [ ] **Step 2: Implement context-aware keyboard command handlers**

Keyboard commands should inspect `WritingInsertionTarget` and produce Document commands:

- `text_caret` + `Enter`: `group.create_after`.
- `text_caret` + `Alt/Option+Enter`: `group.insert_item`.
- `text_caret` + `Shift+Enter`: `text.insert_line_break` or equivalent text update at caret.
- `empty_group` + typing: `group.insert_item`.
- `between_groups` + typing: `group.create_after` with a text item at the insertion point.

Run: `npm run check`

Expected: typecheck, build, unit tests, and docs checks pass.

## Task 4: Make Add/Search Use Selection Context

**Files:**

- Modify: `packages/studio/src/addSearch.ts`
- Modify: `packages/studio/src/studioState.ts`
- Modify: `packages/studio/src/App.tsx`
- Modify: `packages/studio/src/App.test.tsx`

- [ ] **Step 1: Add failing tests for one background action**

Add tests proving one Add/Search result can:

- Insert `stage_change` into the current Group when selection is `group_inside`.
- Insert `stage_change` into an empty Group when selection is `empty_group`.
- Create a new stage-only Group when selection is `between_groups`.
- Create another visible `stage_change` when setting the same background again.

Run: `npm run test:studio -- App`

Expected: tests fail while the two separate MVP1 background results still exist.

- [ ] **Step 2: Collapse location-specific background results**

Replace `Set rainy street background` and `Insert rainy street background after Group` with one background insertion action. Its implementation resolves target location from `WritingInsertionTarget`.

- [ ] **Step 3: Preserve Preview/Export parity**

Run: `npm run test:browser`

Expected: browser tests pass after their assertions are updated to use selection-based insertion instead of two different action labels.

## Task 5: Browser And Regression Coverage

**Files:**

- Modify or create: `packages/studio/e2e/mvp1-1-document-writing.spec.ts`
- Modify: `docs/TESTING.md`

- [ ] **Step 1: Add MVP1.1 e2e coverage**

Cover these browser workflows:

- Click existing text and edit it inline.
- Insert a text item in the same Group.
- Insert a stage change into an empty Group.
- Create a new Group between two Groups.
- Use Add/Search based on selection, not two different location actions.
- Preview/Export parity still passes.

- [ ] **Step 2: Preserve MVP1 regressions**

Keep regression coverage for:

- Typing draft or editing text does not create an empty Group.
- `Alt/Option+Enter` does not switch to a pending or empty Group incorrectly.
- Stage state linear continuation still applies through stage-only Groups.

Run: `npm run test:browser`

Expected: all browser tests pass.

## Task 6: Update Product Docs And Run Full Verification

**Files:**

- Modify: `docs/MVP.md`
- Modify: `docs/API_CONTRACTS.md`
- Modify: `docs/TESTING.md`
- Modify: `docs/spec/writing-source-flow.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update docs for MVP1.1 behavior**

Docs must answer:

- Which creator workflow changes: Writing becomes document-like and cursor-based.
- Which source-of-truth object changes: Document remains source of truth; cursor and selection remain editor state.
- Which API contract changes: Add/Search commits through selection context instead of location-specific results.
- Which tests prove it: unit insertion model tests, browser document-writing tests, Preview/Export parity tests.
- Which docs would be stale without update: `docs/MVP.md`, `docs/API_CONTRACTS.md`, `docs/TESTING.md`, and `docs/spec/writing-source-flow.md`.

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run check
npm run test:browser
npm run export:mvp1
```

Expected:

- `npm run check` passes docs check, typecheck, build, and unit tests.
- `npm run test:browser` passes all Playwright tests.
- `npm run export:mvp1` builds and writes the MVP1 export artifact path.

## Acceptance Criteria

- Writing no longer depends on a fixed append input as the primary authoring model.
- Cursor or selection is the only insertion target.
- Add/Search decides what to insert, not where to insert it.
- Clicking text, stage items, Group whitespace, empty Groups, and between-Group locations creates the expected editor state.
- Empty Groups remain legal visible story structure.
- Structure changes use Document commands.
- Preview and Export parity remains intact for the ordinary-dialogue vertical slice.
- No node-editor-first, timeline-first, SDK-first, branching, plugin, template, or rich-text-editor migration work is bundled into MVP1.1.
