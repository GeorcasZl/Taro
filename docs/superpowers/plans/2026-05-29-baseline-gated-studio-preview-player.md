# Baseline-Gated Studio Preview Player Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a reviewable engineering baseline, formalize verification tiers, then implement the Phase 2.1 Studio Preview player without reopening already-landed MVP1.1 Writing work.

**Architecture:** Keep `packages/core` as the shared Document and runtime-semantics layer. Start with a Gate 0 low-fi Figma checkpoint for Preview editor posture only; it may clarify rough surface relationships and negative examples, but it does not define final UI, design tokens, component APIs, or implementation acceptance. Add a small Studio-local preview player view model that derives visible playback state from the same Document ordering and stage-state semantics used by Export; Preview controls update only local Preview UI state and never mutate `document.revision`.

**Tech Stack:** npm workspaces, TypeScript, React, Vite, Vitest, Testing Library, Playwright, `@taro/core` runtime helpers.

---

## Parent Plan

This plan expands the immediate next step from `docs/plans/2026-05-29-taro-acceleration-plan.md`.

The parent plan orders the work as:

- Phase 0: establish baseline verification, baseline commit, and verification layers.
- Phase 1: finish MVP1.1 Writing surface.
- Phase 2: make Preview minimally playable.

Current checkout inspection shows Phase 1 Writing semantics already exist in code and tests:

- `packages/studio/src/insertionModel.ts`
- `packages/studio/src/insertionModel.test.ts`
- `packages/studio/src/studioState.ts`
- `packages/studio/src/App.test.tsx`
- `packages/studio/e2e/mvp1-ordinary-dialogue.spec.ts`

Therefore this plan gates on Phase 0, runs a focused Phase 1 readiness check, and then implements Phase 2.1: a minimal Studio Preview player view.

## Product Source

Read before implementation:

- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/ARCHITECTURE.md`
- `docs/MVP.md`
- `docs/STATE_MODEL.md`
- `docs/API_CONTRACTS.md`
- `docs/TESTING.md`
- `docs/UI_DESIGN.md`
- `docs/spec/figma-workflow.md`
- `docs/spec/writing-source-flow.md`
- `docs/spec/group-content-execution.md`
- `docs/spec/runtime-semantics.md`
- `docs/adr/0001-writing-is-source-of-truth.md`
- `docs/adr/0002-group-is-player-advance-unit.md`
- `docs/adr/0003-stage-state-is-path-driven.md`
- `docs/adr/0004-canvas-is-not-second-source.md`

## Scope

In scope:

- Capture fresh baseline evidence.
- Start the Gate 0 low-fi Figma workflow before Preview implementation.
- Ask for explicit owner approval before creating the baseline commit.
- Add `check:fast`, `check:full`, and `verify:mvp1` npm scripts.
- Document when to use those verification tiers.
- Run focused MVP1.1 Writing readiness checks before Preview work.
- Replace the Studio Preview event-type list with a minimal playable Preview surface.
- Show current Group text, inherited stage/background label, `Next`, `Restart`, and source trace.
- Prove Preview controls do not mutate the Document.
- Preserve Preview/Export parity evidence for the ordinary-dialogue loop.

Out of scope:

- Reimplementing MVP1.1 Writing ergonomics.
- Persistence, current-document import/export UI, or browser storage.
- Branching authoring, choices UI, conditions builder, records manager, plugins, templates, Canvas story map, Auto Mode, rollback, high-fidelity player skin, or visual redesign.
- Figma high-fidelity screens, final UI handoff, component libraries, tokens, Code Connect, or design-system work.
- Creating a new branch or worktree.

## Files

Create:

- `packages/studio/src/previewPlayer.ts` for a pure Studio-local Preview view model and playback helpers.
- `packages/studio/src/previewPlayer.test.ts` for focused Preview player tests.

Modify:

- `package.json` to add verification script aliases.
- `README.md` to document fast, full, and MVP1 verification usage.
- `docs/TESTING.md` to define command tiers and Preview-player evidence.
- `docs/MVP.md` to describe the minimally playable Studio Preview boundary.
- `CHANGELOG.md` to record the verification-tier and Preview-player changes.
- `packages/studio/src/App.tsx` to render the Preview player.
- `packages/studio/src/App.test.tsx` to cover Preview controls and non-mutation behavior.
- `packages/studio/e2e/mvp1-ordinary-dialogue.spec.ts` to cover authoring to Preview to Export parity.

Review only:

- `scripts/check-docs.sh`
- `packages/core/src/runtime.ts`
- `packages/core/src/document.ts`
- `packages/studio/src/studioState.ts`
- `packages/studio/src/insertionModel.ts`
- `docs/API_CONTRACTS.md`
- `docs/UI_DESIGN.md`
- `docs/spec/figma-workflow.md`

## Current Group Rule

For this slice, Studio Preview defines the current Group as the Group resolved from the active Writing insertion target or selection.

Preview playback behavior:

- When Writing selection changes, Preview resets to the newly current Group.
- `Next` advances local Preview playback to the next linear Group in Document order.
- `Restart` returns local Preview playback to the Group that was current when the current playback session began.
- If there is no next Group, `Next` becomes disabled and the Preview shows an end state.
- This slice does not implement jump-aware Preview stepping; jumps remain Phase 4 scope.

Document behavior:

- Preview playback state is local React state.
- Preview controls must not call Document commands.
- `document.revision` must not change when pressing `Next` or `Restart`.

## Task 0: Start Gate 0 Low-Fi Figma Workflow

**Files:**

- Review only: `docs/UI_DESIGN.md`
- Review only: `docs/spec/figma-workflow.md`
- Review only: `docs/MVP.md`
- Review only: `docs/TESTING.md`

- [ ] **Step 1: Read the current Figma boundary**

Run:

```bash
sed -n '211,237p' docs/UI_DESIGN.md
sed -n '1,230p' docs/spec/figma-workflow.md
```

Expected:

- The current phase is Gate 0 / low-fi reference only.
- Figma is not a final UI, high-fidelity prototype, component library, token source, Code Connect source, or implementation acceptance gate.
- Browser proof remains required for Writing, Preview, and Export behavior.

- [ ] **Step 2: Create or open the exploratory Figma reference artifact**

Use Figma only as explicitly allowed by `docs/spec/figma-workflow.md`.

Expected artifact:

- File name: `Taro Studio Low-Fi References`, or an existing owner-approved equivalent.
- Gate label: `Gate 0`.
- Status label: `Exploratory`.
- Page: `03 Lo-Fi Sketches`.
- Frame: `Preview player - low-fi checkpoint`.

If a Figma tool call is needed, load the mandatory Figma skill first:

- Use `figma-create-new-file` before creating a new Figma file.
- Use `figma-use` before reading or writing Figma file content.
- Use `figma-generate-design` only if creating a clearly labeled low-fi exploratory reference frame.

If Figma auth, file permission, or connector access is unavailable, do not block this implementation plan. Record the Figma checkpoint as deferred in the handoff and continue with browser-first implementation.

- [ ] **Step 3: Add only low-fi Preview posture content**

The low-fi frame should answer only these questions:

```text
What should the minimal Preview player feel like beside Writing?
Which source trace is useful without turning Preview into a debug dashboard?
Which controls are necessary for the ordinary-dialogue loop?
What should the Preview player avoid becoming during this slice?
```

Allowed rough content:

- A coarse Studio relationship sketch showing Writing, Canvas, and Preview.
- A rough Preview area with authored text, background label, source trace, `Preview Next`, and `Preview Restart`.
- A small `Not Taro for this slice` note listing high-fidelity player skin, timeline controls, node graph controls, dashboard cards, and persistent helper-button bars.

Forbidden content:

- Final colors, typography, spacing tokens, component anatomy, or reusable variants.
- A polished player skin.
- New behavior not already in this plan.
- Any implication that the Figma frame replaces browser tests.

- [ ] **Step 4: Record the checkpoint before code work**

The implementation handoff must include:

- Figma file name and link if created or updated.
- Page and frame names.
- Status: `Exploratory`.
- Gate: `Gate 0`.
- Whether Figma work was completed or deferred.
- A short note confirming that implementation acceptance still depends on tests and browser evidence, not Figma.

Expected:

- Continue to Task 1 after the checkpoint is completed or explicitly deferred.

## Task 1: Capture Baseline Evidence

**Files:**

- Review only: `package.json`
- Review only: `scripts/check-docs.sh`
- Review only: `docs/plans/2026-05-29-taro-acceleration-plan.md`

- [ ] **Step 1: Confirm repository state**

Run:

```bash
git status --short --branch --untracked-files=all
```

Expected:

- Output starts with `## No commits yet on main` unless the owner already created a baseline commit.
- If no baseline commit exists, source files appear as `??` entries.
- No branch or worktree is created.

- [ ] **Step 2: Run fast baseline checks**

Run:

```bash
npm run docs:check
npm run typecheck
npm test
```

Expected:

- Docs check passes.
- Core and Studio typecheck pass.
- Core and Studio Vitest suites pass.

- [ ] **Step 3: Run focused browser smoke**

Run:

```bash
npm run test:browser -- -g "MVP1 ordinary dialogue loop reaches export parity"
```

Expected:

- Playwright passes the ordinary-dialogue export-parity smoke.

- [ ] **Step 4: Record evidence in the implementation handoff**

The handoff for this task must include:

- Exact commands run.
- Pass/fail result for each command.
- The first line of `git status --short --branch --untracked-files=all`.
- Whether the repository still lacks a baseline commit.

## Task 2: Gate The Baseline Commit With Owner Approval

**Files:**

- Review only: full repository

- [ ] **Step 1: Present the baseline evidence to the owner**

Report:

- Current branch and commit state.
- Whether docs check, typecheck, unit tests, and focused browser smoke passed.
- That the baseline commit will stage the current source tree.
- That the commit creates the review and rollback point for later small slices.

- [ ] **Step 2: Ask for explicit approval before committing**

Use this exact question:

```text
Do you want me to create the baseline commit now with message `chore: establish Taro MVP baseline`?
```

Expected:

- If the owner says yes, continue to Step 3.
- If the owner does not approve, stop commit work and mark the baseline commit as deferred in the handoff.

- [ ] **Step 3: Create the baseline commit only after approval**

Run:

```bash
git add .
git commit -m "chore: establish Taro MVP baseline"
git status --short --branch
```

Expected:

- Commit succeeds.
- `git status --short --branch` has no source-file changes after the branch line.

## Task 3: Add Verification Script Layers

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Confirm the aliases are absent**

Run:

```bash
node -e 'const p=require("./package.json"); console.log(["check:fast","check:full","verify:mvp1"].map((k)=>`${k}=${p.scripts[k] ?? ""}`).join("\n"))'
```

Expected:

```text
check:fast=
check:full=
verify:mvp1=
```

- [ ] **Step 2: Add the aliases**

Edit `package.json` so the `scripts` object includes:

```json
{
  "check:fast": "npm run docs:check && npm run typecheck && npm test",
  "check:full": "npm run check && npm run test:browser && npm run export:mvp1",
  "verify:mvp1": "npm run build && npm run test:browser && node scripts/export-mvp1-fixture.mjs"
}
```

Keep existing scripts unchanged. Place the aliases near `check` and `export:mvp1`.

- [ ] **Step 3: Validate package JSON parsing**

Run:

```bash
node -e 'const p=require("./package.json"); console.log(p.scripts["check:fast"]); console.log(p.scripts["check:full"]); console.log(p.scripts["verify:mvp1"]);'
```

Expected:

```text
npm run docs:check && npm run typecheck && npm test
npm run check && npm run test:browser && npm run export:mvp1
npm run build && npm run test:browser && node scripts/export-mvp1-fixture.mjs
```

## Task 4: Document The Verification Tiers

**Files:**

- Modify: `README.md`
- Modify: `docs/TESTING.md`
- Modify: `CHANGELOG.md`

- [ ] **Step 1: Update README current-status guidance**

In `README.md`, replace the single-command current-status snippet with this text:

````markdown
For daily development, use the fast gate:

```bash
npm run check:fast
```

For milestone handoff, use the full gate:

```bash
npm run check:full
```

For the MVP1 creator loop specifically, use:

```bash
npm run verify:mvp1
```
````

- [ ] **Step 2: Add command tiers to docs/TESTING.md**

Add this section after `## Required Evidence Types`:

````markdown
## Verification Command Tiers

Use the fast gate during ordinary implementation:

```bash
npm run check:fast
```

This runs docs checks, TypeScript checks, and unit tests.

Use the full gate for milestone handoff:

```bash
npm run check:full
```

This runs the existing full repository check, all browser tests, and MVP1 export smoke.

Use the MVP1 vertical-loop gate when a change touches Writing, Canvas, Preview, or Export parity:

```bash
npm run verify:mvp1
```

This builds the packages, runs browser creator-loop coverage, and exports the MVP1 fixture.
````

- [ ] **Step 3: Add changelog entry**

Add this entry above the existing `2026-05-28` section in `CHANGELOG.md`:

```markdown
## 2026-05-29

### Added

- Added explicit `check:fast`, `check:full`, and `verify:mvp1` verification tiers for daily development, milestone handoff, and MVP1 creator-loop parity.

### Changed

- Documented when to use each verification tier in the README and testing strategy.
```

- [ ] **Step 4: Run docs check**

Run:

```bash
npm run docs:check
```

Expected:

- Command exits with status 0.
- No docs scan match appears.
- Whitespace checks pass.

## Task 5: Run MVP1.1 Writing Readiness Gate

**Files:**

- Review only: `packages/studio/src/insertionModel.ts`
- Review only: `packages/studio/src/studioState.ts`
- Review only: `packages/studio/src/App.tsx`
- Review only: `packages/studio/src/insertionModel.test.ts`
- Review only: `packages/studio/src/studioState.test.ts`
- Review only: `packages/studio/src/App.test.tsx`
- Review only: `packages/studio/e2e/mvp1-ordinary-dialogue.spec.ts`

- [ ] **Step 1: Run focused Studio unit tests**

Run:

```bash
npm run test:studio -- insertionModel
npm run test:studio -- studioState
npm run test:studio -- App
```

Expected:

- Tests prove text caret, Group whitespace, empty Group, between-Groups, between-items, same-Group ordering, empty item cleanup, repeated stage-change visibility, and selection-without-revision behavior.

- [ ] **Step 2: Run MVP1.1 browser coverage**

Run:

```bash
npm run test:browser -- -g "MVP1.1|MVP1 ordinary dialogue loop reaches export parity|MVP1 Canvas derives|MVP1 repeated|MVP1 exported playable"
```

Expected:

- Playwright proves same-Group insertion after the focused item.
- Playwright proves transient empty text cleanup and Backspace deletion.
- Playwright proves between-item insertion.
- Playwright proves quiet Group markers and no persistent composer or plus controls.
- Playwright proves Preview/Export trace parity and inherited stage-state export behavior.

- [ ] **Step 3: Apply the gate**

Expected:

- If all commands pass, continue to Task 6.
- If any command fails, stop Preview implementation and write a narrow repair task for the failing Phase 1 behavior.

## Task 6: Add A Pure Preview Player View Model

**Files:**

- Create: `packages/studio/src/previewPlayer.ts`
- Create: `packages/studio/src/previewPlayer.test.ts`

- [ ] **Step 1: Add failing tests for the Preview view model**

Create `packages/studio/src/previewPlayer.test.ts` with tests covering:

```ts
import { applyDocumentCommand, createMvp1Document, type TaroDocument } from "@taro/core";
import { describe, expect, test } from "vitest";

import {
  buildPreviewPlayerView,
  getNextPreviewGroupId,
  getRestartPreviewGroupId
} from "./previewPlayer.js";

describe("Studio Preview player view model", () => {
  test("shows current Group text and source trace", () => {
    const document = createTwoGroupDocument();

    const view = buildPreviewPlayerView(document, { currentGroupId: "group_1", startGroupId: "group_1" });

    expect(view.currentGroupId).toBe("group_1");
    expect(view.positionId).toBe("pos_1");
    expect(view.textItems).toEqual([{ itemId: "item_1", text: "A" }]);
    expect(view.trace.current_group_id).toBe("group_1");
    expect(view.trace.item_ids).toEqual(["item_1"]);
  });

  test("inherits stage state from earlier Groups and reports its source", () => {
    const document = createStageThenDialogueDocument();

    const view = buildPreviewPlayerView(document, { currentGroupId: "group_2", startGroupId: "group_2" });

    expect(view.backgroundLabel).toBe("Rainy street");
    expect(view.trace.stage_source).toEqual({
      group_id: "group_stage",
      item_id: "item_bg"
    });
  });

  test("advances and restarts without changing the Document", () => {
    const document = createTwoGroupDocument();

    expect(getNextPreviewGroupId(document, "group_1")).toBe("group_2");
    expect(getRestartPreviewGroupId({ currentGroupId: "group_2", startGroupId: "group_1" })).toBe("group_1");
    expect(document.revision).toBe(2);
  });
});

function createTwoGroupDocument(): TaroDocument {
  let document = createMvp1Document({ document_id: "doc_preview_two_groups", title: "Preview" });
  document = applyDocumentCommand(document, {
    command_id: "cmd_1",
    actor: "user",
    source_surface: "writing",
    document_id: document.document_id,
    operation: "group.create_after",
    expected_revision: document.revision,
    payload: {
      after_group_id: null,
      group_id: "group_1",
      position_id: "pos_1",
      text_item: { item_id: "item_1", text: "A" }
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_2",
    actor: "user",
    source_surface: "writing",
    document_id: document.document_id,
    operation: "group.create_after",
    expected_revision: document.revision,
    payload: {
      after_group_id: "group_1",
      group_id: "group_2",
      position_id: "pos_2",
      text_item: { item_id: "item_2", text: "B" }
    }
  }).document;
  return document;
}

function createStageThenDialogueDocument(): TaroDocument {
  let document = createMvp1Document({ document_id: "doc_preview_stage", title: "Preview Stage" });
  document = applyDocumentCommand(document, {
    command_id: "cmd_1",
    actor: "user",
    source_surface: "writing",
    document_id: document.document_id,
    operation: "group.create_after",
    expected_revision: document.revision,
    payload: {
      after_group_id: null,
      group_id: "group_stage",
      position_id: "pos_stage"
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_2",
    actor: "user",
    source_surface: "canvas",
    document_id: document.document_id,
    operation: "resource.add",
    expected_revision: document.revision,
    payload: {
      resource: { id: "res_bg_rainy_street", kind: "image", path: "assets/rainy-street.png" }
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_3",
    actor: "user",
    source_surface: "canvas",
    document_id: document.document_id,
    operation: "stage.set_background",
    expected_revision: document.revision,
    payload: {
      group_id: "group_stage",
      item_id: "item_bg",
      background_resource_id: "res_bg_rainy_street"
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_4",
    actor: "user",
    source_surface: "writing",
    document_id: document.document_id,
    operation: "group.create_after",
    expected_revision: document.revision,
    payload: {
      after_group_id: "group_stage",
      group_id: "group_2",
      position_id: "pos_2",
      text_item: { item_id: "item_2", text: "B" }
    }
  }).document;
  return document;
}
```

Use local test helpers in the same test file to create the two small Documents with `applyDocumentCommand`.

Run:

```bash
npm run test:studio -- previewPlayer
```

Expected:

- Tests fail because `previewPlayer.ts` does not exist.

- [ ] **Step 2: Implement the view model**

Create `packages/studio/src/previewPlayer.ts` with these exported types and helpers:

```ts
import { deriveLinearStageState, type TaroDocument } from "@taro/core";

export interface PreviewPlaybackState {
  currentGroupId: string | null;
  startGroupId: string | null;
}

export interface PreviewPlayerView {
  currentGroupId: string | null;
  positionId: string | null;
  textItems: Array<{ itemId: string; text: string }>;
  backgroundLabel: string;
  canAdvance: boolean;
  isEnd: boolean;
  trace: {
    current_group_id: string | null;
    item_ids: string[];
    stage_source: { group_id: string; item_id: string } | null;
  };
}

export function createPreviewPlaybackState(currentGroupId: string | null): PreviewPlaybackState {
  return { currentGroupId, startGroupId: currentGroupId };
}

export function buildPreviewPlayerView(
  document: TaroDocument,
  playback: PreviewPlaybackState
): PreviewPlayerView {
  const group = document.story.groups.find((candidate) => candidate.id === playback.currentGroupId);
  if (!group) {
    return {
      currentGroupId: null,
      positionId: null,
      textItems: [],
      backgroundLabel: "None set",
      canAdvance: false,
      isEnd: true,
      trace: { current_group_id: null, item_ids: [], stage_source: null }
    };
  }

  const stageState = deriveLinearStageState(document, { group_id: group.id });
  const textItems = group.items
    .filter((item) => item.kind === "text")
    .map((item) => ({ itemId: item.id, text: item.text }));

  return {
    currentGroupId: group.id,
    positionId: group.position_id,
    textItems,
    backgroundLabel: getBackgroundLabel(document, stageState.background_resource_id),
    canAdvance: getNextPreviewGroupId(document, group.id) !== null,
    isEnd: false,
    trace: {
      current_group_id: group.id,
      item_ids: group.items.map((item) => item.id),
      stage_source: getStageSource(document, group.id)
    }
  };
}

export function getNextPreviewGroupId(document: TaroDocument, currentGroupId: string | null): string | null {
  const index = document.story.groups.findIndex((group) => group.id === currentGroupId);
  return index === -1 ? null : document.story.groups[index + 1]?.id ?? null;
}

export function getRestartPreviewGroupId(playback: PreviewPlaybackState): string | null {
  return playback.startGroupId;
}
```

Add the private helpers `getBackgroundLabel` and `getStageSource` in the same file. `getStageSource` should scan from `entry_group_id` or the first Group through the current Group and return the last `stage_change` item with `background_resource_id`.

- [ ] **Step 3: Run focused Preview view-model tests**

Run:

```bash
npm run test:studio -- previewPlayer
```

Expected:

- Preview player view-model tests pass.

## Task 7: Render The Studio Preview Player

**Files:**

- Modify: `packages/studio/src/App.tsx`
- Modify: `packages/studio/src/App.test.tsx`

- [ ] **Step 1: Add failing App tests**

Add tests to `packages/studio/src/App.test.tsx` proving:

```ts
test("Preview shows current Group text, inherited background, and source trace", async () => {
  const user = userEvent.setup();
  render(<App />);

  const firstText = screen.getByRole("textbox", { name: "Text item in Group 1" });
  await user.type(firstText, "A");
  await user.keyboard("{Meta>}k{/Meta}");
  await user.click(screen.getByRole("button", { name: "Set rainy street background" }));
  await user.keyboard("{Enter}");
  await user.type(screen.getByRole("textbox", { name: "Text item in Group 2" }), "B");
  await user.click(firstText);

  const preview = screen.getByRole("region", { name: "Preview" });
  expect(within(preview).getByText("A")).toBeInTheDocument();
  expect(within(preview).getByText("Background: Rainy street")).toBeInTheDocument();
  expect(within(preview).getByText("Current Group: group_1")).toBeInTheDocument();
  expect(within(preview).getByText(/item_1/)).toBeInTheDocument();
  expect(within(preview).getByText(/Stage source:/)).toBeInTheDocument();
});

test("Preview Next and Restart use local state without changing export parity", async () => {
  const user = userEvent.setup();
  render(<App />);

  const firstText = screen.getByRole("textbox", { name: "Text item in Group 1" });
  await user.type(firstText, "A");
  await user.keyboard("{Enter}");
  await user.type(screen.getByRole("textbox", { name: "Text item in Group 2" }), "B");
  await user.click(firstText);

  const preview = screen.getByRole("region", { name: "Preview" });
  expect(within(preview).getByText("A")).toBeInTheDocument();

  await user.click(within(preview).getByRole("button", { name: "Preview Next" }));
  expect(within(preview).getByText("B")).toBeInTheDocument();

  await user.click(within(preview).getByRole("button", { name: "Preview Restart" }));
  expect(within(preview).getByText("A")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Export local package" }));
  expect(screen.getByText("Preview/export trace matched")).toBeInTheDocument();
});
```

Run:

```bash
npm run test:studio -- App
```

Expected:

- Tests fail because Studio Preview still renders only event types.

- [ ] **Step 2: Add local Preview playback state**

In `packages/studio/src/App.tsx`:

- Import helpers from `./previewPlayer.js`.
- Add local React state for `PreviewPlaybackState`.
- When `selectedGroup?.id` changes, reset Preview playback with `createPreviewPlaybackState(selectedGroup.id)`.
- Do not update `state.document` from Preview controls.

- [ ] **Step 3: Replace the Preview event-type list**

Replace the current Preview `<ul className="event-list">` surface with:

- Current Group text.
- Background label.
- Source trace:
  - current Group id
  - current position id
  - item ids
  - stage source Group/item when available
- `Preview Next` button.
- `Preview Restart` button.

Use compact labels and ordinary buttons. Do not introduce high-fidelity player skin or unrelated layout redesign.

- [ ] **Step 4: Run focused App tests**

Run:

```bash
npm run test:studio -- App
```

Expected:

- App tests pass.
- Preview controls do not create Document command side effects.

## Task 8: Add Browser Coverage For Author To Preview To Export

**Files:**

- Modify: `packages/studio/e2e/mvp1-ordinary-dialogue.spec.ts`

- [ ] **Step 1: Add failing Playwright scenario**

Add or extend a browser test that performs this workflow:

```text
1. Open Studio.
2. Write A in Group 1.
3. Add rainy street background.
4. Press Enter to create Group 2.
5. Write B in Group 2.
6. Select Group 1.
7. Confirm Preview shows A and Rainy street.
8. Click Preview Next.
9. Confirm Preview shows B and still shows Rainy street.
10. Click Preview Restart.
11. Confirm Preview shows A.
12. Export local package.
13. Confirm Preview/export trace matched.
```

Run:

```bash
npm run test:browser -- -g "Preview"
```

Expected:

- Test fails before the Preview player implementation and passes after Task 7.

- [ ] **Step 2: Run focused browser coverage**

Run:

```bash
npm run test:browser -- -g "Preview|MVP1 ordinary dialogue loop reaches export parity"
```

Expected:

- New Preview player browser test passes.
- Existing ordinary-dialogue export-parity smoke still passes.

## Task 9: Sync Product And Testing Docs

**Files:**

- Modify: `docs/MVP.md`
- Modify: `docs/TESTING.md`
- Modify: `CHANGELOG.md`
- Review only: `docs/API_CONTRACTS.md`

- [ ] **Step 1: Update MVP Preview boundary**

In `docs/MVP.md`, update the Preview or MVP1 Studio behavior section to state:

```markdown
- Studio Preview shows a minimal playable current-Group view with authored text, inherited stage/background label, local `Next` and `Restart` controls, and source trace for current Group, item ids, and stage source.
- Studio Preview playback state is local Preview/editor state and does not mutate the authoring Document.
```

- [ ] **Step 2: Update testing evidence**

In `docs/TESTING.md`, add Preview-player evidence under the MVP loop pass evidence:

```markdown
- Studio Preview shows the current Group's authored text, inherited stage/background label, source trace, and local `Next` / `Restart` controls without mutating the Document.
```

- [ ] **Step 3: Update changelog**

Add to the `2026-05-29` changelog entry:

```markdown
- Added a minimal Studio Preview player surface with current-Group text, inherited stage label, local playback controls, and source trace.
```

- [ ] **Step 4: Decide whether API contracts changed**

Read `docs/API_CONTRACTS.md`.

Expected:

- If the implementation only uses local React Preview state and existing Document queries, do not edit `docs/API_CONTRACTS.md`.
- If a new formal editor event or command is introduced, document it in `docs/API_CONTRACTS.md` in the same change.

- [ ] **Step 5: Run docs check**

Run:

```bash
npm run docs:check
```

Expected:

- Command exits with status 0.
- No docs scan match appears.

## Task 10: Run Final Verification

**Files:**

- Review only: full repository

- [ ] **Step 1: Run fast gate**

Run:

```bash
npm run check:fast
```

Expected:

- Docs check, typecheck, and unit tests pass.

- [ ] **Step 2: Run full browser tests**

Run:

```bash
npm run test:browser
```

Expected:

- All Playwright tests pass.

- [ ] **Step 3: Run MVP1 export smoke**

Run:

```bash
npm run export:mvp1
```

Expected:

- Packages build.
- MVP1 fixture export succeeds.
- Export artifact is written by `scripts/export-mvp1-fixture.mjs`.

- [ ] **Step 4: Run milestone gate**

Run:

```bash
npm run check:full
```

Expected:

- Full repository check passes.
- Browser tests pass.
- MVP1 export smoke passes.

- [ ] **Step 5: Check final diff hygiene**

Run:

```bash
git diff --check
git status --short --branch
```

Expected:

- `git diff --check` exits with status 0.
- `git status` shows only intended changes if a baseline commit exists.
- If the baseline commit was deferred, the handoff explicitly says the tree remains broadly untracked.

## Acceptance Criteria

- Gate 0 low-fi Figma checkpoint is completed or explicitly deferred with a concrete reason before Preview implementation starts.
- Baseline verification has fresh command evidence.
- Baseline commit is created only after explicit owner approval, or clearly deferred.
- `package.json` exposes `check:fast`, `check:full`, and `verify:mvp1`.
- README and `docs/TESTING.md` explain when to use each verification tier.
- MVP1.1 Writing readiness passes before Preview work begins.
- Studio Preview shows current Group text, inherited stage/background label, source trace, `Next`, and `Restart`.
- Preview controls do not mutate `document.revision`.
- Preview/Export parity evidence still passes.
- No Writing rewrite, persistence, branching, plugin/template, Canvas story-map, or UI redesign work is bundled into this slice.
- No Figma high-fidelity screen, final UI handoff, component library, token set, Code Connect mapping, or design-system work is bundled into this slice.

## Final Handoff Requirements

The implementation handoff must include:

- Whether the Gate 0 low-fi Figma checkpoint was completed or deferred, including file/frame link when available.
- Whether Phase 0 can close.
- Whether the baseline commit was created or deferred.
- Changed files.
- Exact verification commands and pass/fail results.
- Whether MVP1.1 Writing readiness passed.
- Whether Studio Preview can now be considered minimally playable for the ordinary-dialogue loop.
- Any deferred Preview limitations, especially jump-aware stepping and high-fidelity player skin.
