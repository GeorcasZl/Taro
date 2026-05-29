# MVP1 Ordinary Dialogue Vertical Slice Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first usable MVP1 vertical slice: a creator can write ordinary VN dialogue as Groups, adjust a minimal current-Group visual parameter, preview the same semantics, and export a local playable package.

**Architecture:** Keep `packages/core` as the only persistent story-truth layer. Add a small React/Vite Studio package for Writing, current-Group Canvas, Preview, and Export surfaces; the Studio must call core Document commands instead of owning hidden story state. Export materialization should use core-generated package contents and a Node smoke script before any broader desktop shell or renderer commitment.

**Tech Stack:** npm workspaces, TypeScript, Vitest, React, Vite, Testing Library, Playwright for the browser creator loop.

---

## Product Source

Read these before editing:

- `AGENTS.md`
- `docs/PRODUCT.md`
- `docs/MVP.md`
- `docs/ARCHITECTURE.md`
- `docs/STATE_MODEL.md`
- `docs/API_CONTRACTS.md`
- `docs/TESTING.md`
- `docs/UI_DESIGN.md`
- `docs/spec/writing-source-flow.md`
- `docs/spec/group-content-execution.md`
- `docs/spec/canvas-path-preview.md`
- `docs/spec/runtime-semantics.md`
- `docs/superpowers/plans/2026-05-16-mvp1-foundation-scaffold.md`

Repository rule for this plan: work in the current checkout. Do not create a branch or worktree unless the user explicitly asks.

## Scope

In scope:

- Writing creates and edits `Group` and `text` items through core commands.
- `Enter`, `Option/Alt+Enter`, and `Shift+Enter` map to Document commands or text edits.
- `Cmd/Ctrl+K` opens a transient add/search surface for MVP1 actions.
- Minimal Canvas shows the selected Group, its ordered items, current background, and one editable background/display parameter.
- Preview uses `previewDocument` from `packages/core`.
- Export produces `taro.local-playable.v0` files: `index.html`, `runtime-manifest.json`, and `document.taro.json`.
- Browser tests prove the ordinary dialogue creator loop.

Out of scope:

- Branch-aware `path_preview`.
- Full graph editing, hotspot editing, plugin runtime bundling, templates, marketplace, save/load UI, Auto Mode, rollback, and Tauri desktop shell.
- A committed renderer architecture. PixiJS remains a provisional later direction, not an MVP1 dependency.

## File Map

Create:

- `packages/studio/package.json`
- `packages/studio/tsconfig.json`
- `packages/studio/tsconfig.build.json`
- `packages/studio/vite.config.ts`
- `packages/studio/index.html`
- `packages/studio/src/main.tsx`
- `packages/studio/src/App.tsx`
- `packages/studio/src/studioState.ts`
- `packages/studio/src/keyboard.ts`
- `packages/studio/src/addSearch.ts`
- `packages/studio/src/exportDownload.ts`
- `packages/studio/src/App.test.tsx`
- `packages/studio/src/styles.css`
- `packages/studio/src/test/setup.ts`
- `packages/studio/e2e/mvp1-ordinary-dialogue.spec.ts`
- `playwright.config.ts`
- `scripts/export-mvp1-fixture.mjs`

Modify:

- `package.json`
- `packages/core/src/types.ts`
- `packages/core/src/document.ts`
- `packages/core/src/runtime.ts`
- `packages/core/src/index.ts`
- `packages/core/src/mvp1.test.ts`
- `fixtures/mvp1/ordinary-dialogue/expected/export-manifest.json`
- `docs/TESTING.md`
- `CHANGELOG.md`

Review only:

- `docs/MVP.md`
- `docs/API_CONTRACTS.md`
- `docs/UI_DESIGN.md`

---

### Task 1: Extend Core Commands For MVP1 Authoring

**Files:**

- Modify: `packages/core/src/types.ts`
- Modify: `packages/core/src/document.ts`
- Modify: `packages/core/src/index.ts`
- Modify: `packages/core/src/mvp1.test.ts`

- [ ] **Step 1: Write failing tests for MVP1 command coverage**

Add tests to `packages/core/src/mvp1.test.ts`:

```ts
test("text commands update speaker, display mode, and line breaks without changing Group identity", () => {
  let document = createMvp1Document({ document_id: "doc_text_commands", title: "Text Commands" });
  document = applyDocumentCommand(document, {
    command_id: "cmd_1",
    actor: "user",
    source_surface: "writing",
    document_id: "doc_text_commands",
    operation: "group.create_after",
    expected_revision: 0,
    payload: {
      after_group_id: null,
      group_id: "group_intro",
      position_id: "pos_intro",
      text_item: {
        item_id: "item_intro",
        text: "Mira: First line.",
        speaker: "Mira",
        display_mode_id: "dialogue_bubble"
      }
    }
  }).document;

  document = applyDocumentCommand(document, {
    command_id: "cmd_2",
    actor: "user",
    source_surface: "writing",
    document_id: "doc_text_commands",
    operation: "text.insert_line_break",
    expected_revision: 1,
    payload: {
      group_id: "group_intro",
      item_id: "item_intro",
      offset: "Mira: First".length
    }
  }).document;

  document = applyDocumentCommand(document, {
    command_id: "cmd_3",
    actor: "user",
    source_surface: "writing",
    document_id: "doc_text_commands",
    operation: "text.set_speaker",
    expected_revision: 2,
    payload: {
      group_id: "group_intro",
      item_id: "item_intro",
      speaker: "Ren"
    }
  }).document;

  document = applyDocumentCommand(document, {
    command_id: "cmd_4",
    actor: "user",
    source_surface: "writing",
    document_id: "doc_text_commands",
    operation: "text.set_display_mode",
    expected_revision: 3,
    payload: {
      group_id: "group_intro",
      item_id: "item_intro",
      display_mode_id: "narration_panel"
    }
  }).document;

  const [group] = document.story.groups;
  expect(group?.id).toBe("group_intro");
  expect(group?.items).toHaveLength(1);
  expect(group?.items[0]).toMatchObject({
    kind: "text",
    text: "Mira: First\n line.",
    speaker: "Ren",
    display_mode_id: "narration_panel"
  });
});
```

Add a second test for duplicate IDs:

```ts
test("document commands reject duplicate Group and item IDs", () => {
  let document = createMvp1Document({ document_id: "doc_duplicates", title: "Duplicates" });
  document = applyDocumentCommand(document, {
    command_id: "cmd_1",
    actor: "user",
    source_surface: "writing",
    document_id: "doc_duplicates",
    operation: "group.create_after",
    expected_revision: 0,
    payload: {
      after_group_id: null,
      group_id: "group_intro",
      position_id: "pos_intro",
      text_item: { item_id: "item_intro", text: "Hello." }
    }
  }).document;

  expect(() =>
    applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_duplicates",
      operation: "group.create_after",
      expected_revision: 1,
      payload: {
        after_group_id: "group_intro",
        group_id: "group_intro",
        position_id: "pos_repeat"
      }
    })
  ).toThrow("Group group_intro already exists.");

  expect(() =>
    applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_duplicates",
      operation: "group.insert_item",
      expected_revision: 1,
      payload: {
        group_id: "group_intro",
        item: { kind: "text", item_id: "item_intro", text: "Again." }
      }
    })
  ).toThrow("Item item_intro already exists.");
});
```

- [ ] **Step 2: Run the focused core test and confirm RED**

Run:

```bash
npm run test --workspace @taro/core -- src/mvp1.test.ts
```

Expected: fails because `text.insert_line_break`, `text.set_speaker`, and `text.set_display_mode` are not in `DocumentCommand`.

- [ ] **Step 3: Add core command types**

In `packages/core/src/types.ts`, extend `DocumentCommand`:

```ts
  | (DocumentCommandEnvelopeBase & {
      operation: "text.set_speaker";
      payload: {
        group_id: string;
        item_id: string;
        speaker: string;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "text.set_display_mode";
      payload: {
        group_id: string;
        item_id: string;
        display_mode_id: string;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "text.insert_line_break";
      payload: {
        group_id: string;
        item_id: string;
        offset: number;
      };
    });
```

- [ ] **Step 4: Add duplicate ID guards and text command handlers**

In `packages/core/src/document.ts`, add helpers:

```ts
function assertGroupIdAvailable(document: TaroDocument, groupId: string): void {
  if (document.story.groups.some((group) => group.id === groupId)) {
    throw new Error(`Group ${groupId} already exists.`);
  }
}

function assertItemIdAvailable(document: TaroDocument, itemId: string): void {
  if (document.story.groups.some((group) => group.items.some((item) => item.id === itemId))) {
    throw new Error(`Item ${itemId} already exists.`);
  }
}

function findTextItem(document: TaroDocument, groupId: string, itemId: string) {
  const groupIndex = findGroupIndex(document, groupId);
  const group = document.story.groups[groupIndex];
  if (!group) {
    throw new Error(`Group ${groupId} does not exist.`);
  }
  const itemIndex = group.items.findIndex((candidate) => candidate.id === itemId);
  const item = group.items[itemIndex];
  if (!item || item.kind !== "text") {
    throw new Error(`Text item ${itemId} does not exist.`);
  }
  return { groupIndex, itemIndex, item };
}
```

Use those helpers in `group.create_after`, `group.insert_item`, `text.update`, `text.set_speaker`, `text.set_display_mode`, and `text.insert_line_break`. The line-break handler should splice `\n` into the existing text at `offset` and return a `replace` patch path ending in `/text`.

- [ ] **Step 5: Run the focused core test and confirm GREEN**

Run:

```bash
npm run test --workspace @taro/core -- src/mvp1.test.ts
```

Expected: all core MVP1 tests pass.

---

### Task 2: Add Minimal Stage Resource Commands

**Files:**

- Modify: `packages/core/src/types.ts`
- Modify: `packages/core/src/document.ts`
- Modify: `packages/core/src/mvp1.test.ts`

- [ ] **Step 1: Write failing tests for resource-backed Canvas edits**

Add this test to `packages/core/src/mvp1.test.ts`:

```ts
test("resource.add and stage.set_background support the MVP1 Canvas edit", () => {
  let document = createMvp1Document({ document_id: "doc_canvas", title: "Canvas Edit" });
  document = applyDocumentCommand(document, {
    command_id: "cmd_1",
    actor: "user",
    source_surface: "writing",
    document_id: "doc_canvas",
    operation: "group.create_after",
    expected_revision: 0,
    payload: {
      after_group_id: null,
      group_id: "group_intro",
      position_id: "pos_intro",
      text_item: { item_id: "item_intro", text: "Mira: Rain again." }
    }
  }).document;

  document = applyDocumentCommand(document, {
    command_id: "cmd_2",
    actor: "user",
    source_surface: "canvas",
    document_id: "doc_canvas",
    operation: "resource.add",
    expected_revision: 1,
    payload: {
      resource: {
        id: "res_bg_rain_street",
        kind: "image",
        path: "assets/rain-street.png"
      }
    }
  }).document;

  document = applyDocumentCommand(document, {
    command_id: "cmd_3",
    actor: "user",
    source_surface: "canvas",
    document_id: "doc_canvas",
    operation: "stage.set_background",
    expected_revision: 2,
    payload: {
      group_id: "group_intro",
      item_id: "item_bg",
      background_resource_id: "res_bg_rain_street"
    }
  }).document;

  expect(document.resources).toEqual([
    { id: "res_bg_rain_street", kind: "image", path: "assets/rain-street.png" }
  ]);
  expect(document.story.groups[0]?.items[1]).toMatchObject({
    id: "item_bg",
    kind: "stage_change",
    background_resource_id: "res_bg_rain_street"
  });
  expect(validateDocumentForExport(document)).toEqual([]);
});
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
npm run test --workspace @taro/core -- src/mvp1.test.ts
```

Expected: fails because `resource.add` and `stage.set_background` are not command variants.

- [ ] **Step 3: Add command types**

Add variants to `DocumentCommand` in `packages/core/src/types.ts`:

```ts
  | (DocumentCommandEnvelopeBase & {
      operation: "resource.add";
      payload: {
        resource: ResourceReference;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "stage.set_background";
      payload: {
        group_id: string;
        item_id: string;
        background_resource_id: string;
      };
    });
```

- [ ] **Step 4: Implement command handlers**

In `packages/core/src/document.ts`:

- `resource.add` appends to `document.resources` and rejects duplicate resource IDs.
- `stage.set_background` inserts a `stage_change` item into the target Group with `blocking: false`.
- Both commands recompute diagnostics through the existing `validateDocumentForExport` flow.

- [ ] **Step 5: Run the focused test and confirm GREEN**

Run:

```bash
npm run test --workspace @taro/core -- src/mvp1.test.ts
```

Expected: all core MVP1 tests pass.

---

### Task 3: Materialize Local Export Files

**Files:**

- Modify: `packages/core/src/types.ts`
- Modify: `packages/core/src/runtime.ts`
- Modify: `packages/core/src/mvp1.test.ts`
- Modify: `fixtures/mvp1/ordinary-dialogue/expected/export-manifest.json`
- Create: `scripts/export-mvp1-fixture.mjs`
- Modify: `package.json`

- [ ] **Step 1: Write failing tests for export file contents**

In `packages/core/src/mvp1.test.ts`, update the export parity test to assert file contents:

```ts
expect(exported.files).toEqual([
  {
    path: "index.html",
    kind: "html",
    contents: expect.stringContaining("taro.local-playable.v0")
  },
  {
    path: "runtime-manifest.json",
    kind: "json",
    contents: JSON.stringify(expectedExport, null, 2)
  },
  {
    path: "document.taro.json",
    kind: "json",
    contents: JSON.stringify(document, null, 2)
  }
]);
```

- [ ] **Step 2: Run the focused test and confirm RED**

Run:

```bash
npm run test --workspace @taro/core -- src/mvp1.test.ts
```

Expected: fails because `LocalExportFile` does not include `contents`.

- [ ] **Step 3: Add file contents to export type and runtime**

Update `LocalExportFile` in `packages/core/src/types.ts`:

```ts
export interface LocalExportFile {
  path: string;
  kind: "html" | "json";
  contents: string;
}
```

In `packages/core/src/runtime.ts`, build files after `runtimeManifest` is created:

```ts
const files: LocalExportFile[] = [
  {
    path: "index.html",
    kind: "html",
    contents: renderMvp1Html(runtimeManifest)
  },
  {
    path: "runtime-manifest.json",
    kind: "json",
    contents: JSON.stringify(runtimeManifest, null, 2)
  },
  {
    path: "document.taro.json",
    kind: "json",
    contents: JSON.stringify(document, null, 2)
  }
];
```

Add:

```ts
function renderMvp1Html(manifest: LocalRuntimeManifest): string {
  const manifestJson = JSON.stringify(manifest);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Taro MVP1 Export</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="application/json" id="taro-runtime-manifest">${manifestJson}</script>
    <script>
      const manifest = JSON.parse(document.getElementById("taro-runtime-manifest").textContent);
      const app = document.getElementById("app");
      app.innerHTML = "<h1>Taro Local Playable</h1><pre>" + JSON.stringify(manifest.preview_trace, null, 2) + "</pre>";
    </script>
  </body>
</html>`;
}
```

- [ ] **Step 4: Add local export smoke script**

Create `scripts/export-mvp1-fixture.mjs`:

```js
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { buildLocalExportPackage } from "../packages/core/dist/index.js";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const fixturePath = resolve(root, "fixtures/mvp1/ordinary-dialogue/document.taro.json");
const outDir = resolve(root, "dist/mvp1-ordinary-dialogue");
const document = JSON.parse(await readFile(fixturePath, "utf8"));
const exported = buildLocalExportPackage(document, { artifact_path: outDir });

if (!exported.ok) {
  console.error(JSON.stringify(exported.diagnostics, null, 2));
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
for (const file of exported.files) {
  const target = resolve(outDir, file.path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, file.contents);
}

console.log(outDir);
```

- [ ] **Step 5: Add root script**

In `package.json`, add:

```json
"export:mvp1": "npm run build && node scripts/export-mvp1-fixture.mjs"
```

- [ ] **Step 6: Run export smoke and confirm GREEN**

Run:

```bash
npm run export:mvp1
test -s dist/mvp1-ordinary-dialogue/index.html
test -s dist/mvp1-ordinary-dialogue/runtime-manifest.json
test -s dist/mvp1-ordinary-dialogue/document.taro.json
```

Expected: all commands exit 0.

---

### Task 4: Add React/Vite Studio Package

**Files:**

- Create: `packages/studio/package.json`
- Create: `packages/studio/tsconfig.json`
- Create: `packages/studio/tsconfig.build.json`
- Create: `packages/studio/vite.config.ts`
- Create: `packages/studio/index.html`
- Create: `packages/studio/src/main.tsx`
- Create: `packages/studio/src/App.tsx`
- Create: `packages/studio/src/studioState.ts`
- Create: `packages/studio/src/styles.css`
- Modify: `package.json`

- [ ] **Step 1: Install Studio dependencies**

Run:

```bash
npm install react react-dom --workspace @taro/studio
npm install -D @vitejs/plugin-react @types/react @types/react-dom jsdom @testing-library/react @testing-library/user-event @testing-library/jest-dom --workspace @taro/studio
```

If `@taro/studio` does not exist yet, create `packages/studio/package.json` first with:

```json
{
  "name": "@taro/studio",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc -p tsconfig.build.json && vite build",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@taro/core": "0.0.0"
  }
}
```

- [ ] **Step 2: Add Vite config**

Create `packages/studio/vite.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"]
  }
});
```

- [ ] **Step 3: Add TypeScript configs**

Create `packages/studio/tsconfig.json`:

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "types": ["vitest/globals", "node"]
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "vite.config.ts"]
}
```

Create `packages/studio/tsconfig.build.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": true
  },
  "exclude": ["src/**/*.test.ts", "src/**/*.test.tsx", "src/test/**"]
}
```

- [ ] **Step 4: Add Studio entrypoint**

Create `packages/studio/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Taro Studio</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `packages/studio/src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 5: Add root scripts**

In root `package.json`, add:

```json
"dev": "npm run dev --workspace @taro/studio",
"build:studio": "npm run build --workspace @taro/studio",
"test:studio": "npm run test --workspace @taro/studio",
"typecheck:studio": "npm run typecheck --workspace @taro/studio"
```

Also update root `build`, `typecheck`, `test`, and `check` so they include both `@taro/core` and `@taro/studio`.

---

### Task 5: Implement Studio State And Keyboard Writing

**Files:**

- Create: `packages/studio/src/studioState.ts`
- Create: `packages/studio/src/keyboard.ts`
- Create: `packages/studio/src/App.test.tsx`
- Modify: `packages/studio/src/App.tsx`

- [ ] **Step 1: Write failing Studio keyboard tests**

Create `packages/studio/src/test/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `packages/studio/src/App.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { App } from "./App";

describe("MVP1 Studio writing loop", () => {
  test("Enter creates Groups and Alt+Enter inserts same-Group text", async () => {
    const user = userEvent.setup();
    render(<App />);

    const editor = screen.getByRole("textbox", { name: "Writing" });
    await user.click(editor);
    await user.type(editor, "Mira: The rain stopped.");
    await user.keyboard("{Enter}");
    await user.type(editor, "Ren: Quiet never lasts here.");
    await user.keyboard("{Alt>}{Enter}{/Alt}");
    await user.type(editor, "Listen.");

    expect(screen.getByText("Group 1")).toBeInTheDocument();
    expect(screen.getByText("Group 2")).toBeInTheDocument();
    expect(screen.getByText("Mira: The rain stopped.")).toBeInTheDocument();
    expect(screen.getByText("Ren: Quiet never lasts here.")).toBeInTheDocument();
    expect(screen.getByText("Listen.")).toBeInTheDocument();
  });

  test("Shift+Enter inserts a line break inside the current text item", async () => {
    const user = userEvent.setup();
    render(<App />);

    const editor = screen.getByRole("textbox", { name: "Writing" });
    await user.click(editor);
    await user.type(editor, "Mira: First");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(editor, "Second");

    expect(screen.getByText(/Mira: First\s+Second/)).toBeInTheDocument();
    expect(screen.getAllByText(/Group/)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run Studio tests and confirm RED**

Run:

```bash
npm run test --workspace @taro/studio
```

Expected: fails because `App` has no Writing behavior yet.

- [ ] **Step 3: Implement Studio state reducer**

Create `packages/studio/src/studioState.ts`:

```ts
import {
  applyDocumentCommand,
  createMvp1Document,
  type TaroDocument
} from "@taro/core";

export interface StudioState {
  document: TaroDocument;
  selectedGroupId: string | null;
  selectedItemId: string | null;
  commandIndex: number;
}

export function createInitialStudioState(): StudioState {
  return {
    document: createMvp1Document({ document_id: "doc_studio", title: "Untitled" }),
    selectedGroupId: null,
    selectedItemId: null,
    commandIndex: 0
  };
}

export function nextCommandId(state: StudioState): string {
  return `cmd_${state.commandIndex + 1}`;
}

export function commitDocument(state: StudioState, document: TaroDocument): StudioState {
  return {
    ...state,
    document,
    commandIndex: state.commandIndex + 1
  };
}

export function createGroupFromText(state: StudioState, text: string): StudioState {
  const groupId = `group_${state.document.story.groups.length + 1}`;
  const itemId = `item_${state.commandIndex + 1}`;
  const result = applyDocumentCommand(state.document, {
    command_id: nextCommandId(state),
    actor: "user",
    source_surface: "writing",
    document_id: state.document.document_id,
    operation: "group.create_after",
    expected_revision: state.document.revision,
    payload: {
      after_group_id: state.selectedGroupId,
      group_id: groupId,
      position_id: `pos_${state.document.story.groups.length + 1}`,
      text_item: { item_id: itemId, text }
    }
  });
  return {
    ...commitDocument(state, result.document),
    selectedGroupId: groupId,
    selectedItemId: itemId
  };
}

export function insertSameGroupText(state: StudioState, text: string): StudioState {
  if (!state.selectedGroupId) {
    return createGroupFromText(state, text);
  }
  const itemId = `item_${state.commandIndex + 1}`;
  const result = applyDocumentCommand(state.document, {
    command_id: nextCommandId(state),
    actor: "user",
    source_surface: "writing",
    document_id: state.document.document_id,
    operation: "group.insert_item",
    expected_revision: state.document.revision,
    payload: {
      group_id: state.selectedGroupId,
      item: { kind: "text", item_id: itemId, text }
    }
  });
  return {
    ...commitDocument(state, result.document),
    selectedItemId: itemId
  };
}
```

- [ ] **Step 4: Implement keyboard helpers**

Create `packages/studio/src/keyboard.ts`:

```ts
export function isPrimaryK(event: KeyboardEvent | React.KeyboardEvent): boolean {
  return (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
}

export function isSameGroupEnter(event: KeyboardEvent | React.KeyboardEvent): boolean {
  return event.key === "Enter" && event.altKey;
}

export function isLineBreakEnter(event: KeyboardEvent | React.KeyboardEvent): boolean {
  return event.key === "Enter" && event.shiftKey;
}

export function isNextGroupEnter(event: KeyboardEvent | React.KeyboardEvent): boolean {
  return event.key === "Enter" && !event.altKey && !event.shiftKey;
}
```

- [ ] **Step 5: Implement minimal `App` Writing surface**

Implement `packages/studio/src/App.tsx` with:

```tsx
import { useMemo, useState } from "react";
import { previewDocument } from "@taro/core";
import { createInitialStudioState, createGroupFromText, insertSameGroupText } from "./studioState";
import { isLineBreakEnter, isNextGroupEnter, isPrimaryK, isSameGroupEnter } from "./keyboard";

export function App() {
  const [state, setState] = useState(createInitialStudioState);
  const [draft, setDraft] = useState("");
  const [addSearchOpen, setAddSearchOpen] = useState(false);
  const preview = useMemo(() => previewDocument(state.document, { mode: "full_preview" }), [state.document]);

  function commitNextGroup() {
    const text = draft.trim();
    if (!text) return;
    setState((current) => createGroupFromText(current, text));
    setDraft("");
  }

  function commitSameGroup() {
    const text = draft.trim();
    if (!text) return;
    setState((current) => insertSameGroupText(current, text));
    setDraft("");
  }

  return (
    <main className="studio-shell">
      <section className="writing-panel" aria-label="Writing surface">
        <textarea
          aria-label="Writing"
          value={draft}
          onChange={(event) => setDraft(event.currentTarget.value)}
          onKeyDown={(event) => {
            if (isPrimaryK(event)) {
              event.preventDefault();
              setAddSearchOpen(true);
              return;
            }
            if (isSameGroupEnter(event)) {
              event.preventDefault();
              commitSameGroup();
              return;
            }
            if (isLineBreakEnter(event)) {
              event.preventDefault();
              setDraft((current) => `${current}\n`);
              return;
            }
            if (isNextGroupEnter(event)) {
              event.preventDefault();
              commitNextGroup();
            }
          }}
        />
        <ol className="group-list">
          {state.document.story.groups.map((group, index) => (
            <li key={group.id} className="group-row">
              <span className="group-marker">Group {index + 1}</span>
              {group.items.map((item) =>
                item.kind === "text" ? <p key={item.id}>{item.text}</p> : null
              )}
            </li>
          ))}
        </ol>
      </section>
      <section className="canvas-panel" aria-label="Canvas">
        <h2>Canvas</h2>
        <p>Current Group</p>
      </section>
      <section className="preview-panel" aria-label="Preview">
        <h2>Preview</h2>
        <pre>{JSON.stringify(preview.events, null, 2)}</pre>
      </section>
      {addSearchOpen ? <div role="dialog" aria-label="Add search">Add Search</div> : null}
    </main>
  );
}
```

- [ ] **Step 6: Run Studio tests and confirm GREEN**

Run:

```bash
npm run test --workspace @taro/studio
```

Expected: Studio Writing tests pass.

---

### Task 6: Add MVP1 Add/Search And Canvas Background Edit

**Files:**

- Create: `packages/studio/src/addSearch.ts`
- Modify: `packages/studio/src/studioState.ts`
- Modify: `packages/studio/src/App.tsx`
- Modify: `packages/studio/src/App.test.tsx`

- [ ] **Step 1: Write failing test for `Cmd/Ctrl+K` and Canvas background**

Add to `packages/studio/src/App.test.tsx`:

```tsx
test("Cmd+K opens add search and background insertion updates Canvas through Document", async () => {
  const user = userEvent.setup();
  render(<App />);

  const editor = screen.getByRole("textbox", { name: "Writing" });
  await user.click(editor);
  await user.type(editor, "Mira: The rain stopped.");
  await user.keyboard("{Enter}");
  await user.keyboard("{Meta>}k{/Meta}");

  const dialog = screen.getByRole("dialog", { name: "Add search" });
  expect(dialog).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Set rainy street background" }));

  expect(screen.getByText("Background: Rainy street")).toBeInTheDocument();
  expect(screen.queryByRole("dialog", { name: "Add search" })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Run Studio tests and confirm RED**

Run:

```bash
npm run test --workspace @taro/studio
```

Expected: fails because add/search has no actions.

- [ ] **Step 3: Add add/search action definitions**

Create `packages/studio/src/addSearch.ts`:

```ts
export interface AddSearchAction {
  id: string;
  label: string;
  description: string;
}

export const MVP1_ADD_SEARCH_ACTIONS: AddSearchAction[] = [
  {
    id: "set-rainy-street-background",
    label: "Set rainy street background",
    description: "Adds a project background resource and a current-Group stage change."
  }
];
```

- [ ] **Step 4: Add Studio state command for background**

In `packages/studio/src/studioState.ts`, add:

```ts
export function setRainyStreetBackground(state: StudioState): StudioState {
  if (!state.selectedGroupId) {
    return state;
  }

  const resourceResult = applyDocumentCommand(state.document, {
    command_id: nextCommandId(state),
    actor: "user",
    source_surface: "canvas",
    document_id: state.document.document_id,
    operation: "resource.add",
    expected_revision: state.document.revision,
    payload: {
      resource: {
        id: "res_bg_rainy_street",
        kind: "image",
        path: "assets/rainy-street.png"
      }
    }
  });

  const afterResource = commitDocument(state, resourceResult.document);
  const stageResult = applyDocumentCommand(afterResource.document, {
    command_id: nextCommandId(afterResource),
    actor: "user",
    source_surface: "canvas",
    document_id: afterResource.document.document_id,
    operation: "stage.set_background",
    expected_revision: afterResource.document.revision,
    payload: {
      group_id: state.selectedGroupId,
      item_id: `item_${afterResource.commandIndex + 1}`,
      background_resource_id: "res_bg_rainy_street"
    }
  });

  return commitDocument(afterResource, stageResult.document);
}
```

- [ ] **Step 5: Render add/search actions and Canvas state**

In `App.tsx`:

- Render `MVP1_ADD_SEARCH_ACTIONS` inside the dialog.
- On button click, call `setRainyStreetBackground`.
- In Canvas, show `Background: Rainy street` when selected/current Group includes a `stage_change` with `background_resource_id: "res_bg_rainy_street"`.

- [ ] **Step 6: Run Studio tests and confirm GREEN**

Run:

```bash
npm run test --workspace @taro/studio
```

Expected: all Studio unit tests pass.

---

### Task 7: Add Preview And Export UI Evidence

**Files:**

- Modify: `packages/studio/src/exportDownload.ts`
- Modify: `packages/studio/src/App.tsx`
- Modify: `packages/studio/src/App.test.tsx`

- [ ] **Step 1: Write failing test for Preview and Export panels**

Add to `packages/studio/src/App.test.tsx`:

```tsx
test("Preview and Export panels expose parity evidence", async () => {
  const user = userEvent.setup();
  render(<App />);

  const editor = screen.getByRole("textbox", { name: "Writing" });
  await user.click(editor);
  await user.type(editor, "Mira: The rain stopped.");
  await user.keyboard("{Enter}");
  await user.type(editor, "Ren: Quiet never lasts here.");
  await user.keyboard("{Enter}");

  expect(screen.getByText("preview.started")).toBeInTheDocument();
  expect(screen.getByText("group.completed")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Export local package" }));

  expect(screen.getByText("Export ready")).toBeInTheDocument();
  expect(screen.getByText("taro.local-playable.v0")).toBeInTheDocument();
  expect(screen.getByText("Preview/export trace matched")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run Studio tests and confirm RED**

Run:

```bash
npm run test --workspace @taro/studio
```

Expected: fails because the Export panel does not exist.

- [ ] **Step 3: Add export helper**

Create `packages/studio/src/exportDownload.ts`:

```ts
import { buildLocalExportPackage, type TaroDocument } from "@taro/core";

export function buildStudioExport(document: TaroDocument) {
  return buildLocalExportPackage(document, {
    artifact_path: "browser-download"
  });
}
```

- [ ] **Step 4: Add Preview and Export panels**

In `App.tsx`:

- Render Preview trace as a list of event names.
- Add an `Export local package` button.
- On click, call `buildStudioExport(state.document)`.
- Render `Export ready` if `ok`.
- Render diagnostics if `ok` is false.
- Render `Preview/export trace matched` when `JSON.stringify(preview.events) === JSON.stringify(exported.runtime_manifest.preview_trace)`.

- [ ] **Step 5: Run Studio tests and confirm GREEN**

Run:

```bash
npm run test --workspace @taro/studio
```

Expected: all Studio tests pass.

---

### Task 8: Add Browser Creator Workflow Test

**Files:**

- Create: `playwright.config.ts`
- Create: `packages/studio/e2e/mvp1-ordinary-dialogue.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Playwright**

Run:

```bash
npm install -D @playwright/test
npx playwright install chromium
```

- [ ] **Step 2: Add Playwright config**

Create `playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "packages/studio/e2e",
  webServer: {
    command: "npm run dev --workspace @taro/studio -- --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:5173"
  }
});
```

- [ ] **Step 3: Add browser test**

Create `packages/studio/e2e/mvp1-ordinary-dialogue.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("MVP1 ordinary dialogue loop reaches export parity", async ({ page }) => {
  await page.goto("/");

  const editor = page.getByRole("textbox", { name: "Writing" });
  await editor.fill("Mira: The rain stopped.");
  await editor.press("Enter");
  await editor.fill("Ren: Quiet never lasts here.");
  await editor.press("Alt+Enter");
  await editor.fill("Listen.");

  await expect(page.getByText("Group 1")).toBeVisible();
  await expect(page.getByText("Group 2")).toBeVisible();

  await page.keyboard.press(process.platform === "darwin" ? "Meta+K" : "Control+K");
  await page.getByRole("button", { name: "Set rainy street background" }).click();
  await expect(page.getByText("Background: Rainy street")).toBeVisible();

  await page.getByRole("button", { name: "Export local package" }).click();
  await expect(page.getByText("Export ready")).toBeVisible();
  await expect(page.getByText("Preview/export trace matched")).toBeVisible();
});
```

- [ ] **Step 4: Add browser script**

In root `package.json`, add:

```json
"test:browser": "playwright test"
```

- [ ] **Step 5: Run browser test and confirm GREEN**

Run:

```bash
npm run test:browser
```

Expected: Playwright passes the MVP1 ordinary dialogue loop in Chromium.

---

### Task 9: Update Documentation And Final Verification

**Files:**

- Modify: `docs/TESTING.md`
- Modify: `CHANGELOG.md`
- Modify: `README.md`

- [ ] **Step 1: Update testing docs**

In `docs/TESTING.md`, add an `MVP1 Vertical Slice Checks` section:

```md
## MVP1 Vertical Slice Checks

Run after implementing the Studio vertical slice:

```bash
npm run check
npm run test:browser
npm run export:mvp1
```

These commands prove Writing keyboard authoring, current-Group Canvas background editing, Preview/Export trace parity, local export file materialization, and product-doc consistency.
```

- [ ] **Step 2: Update README**

In `README.md`, add:

```md
## Run MVP1 Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.
```

- [ ] **Step 3: Update changelog**

In `CHANGELOG.md`, add under `2026-05-16`:

```md
- Planned the MVP1 ordinary-dialogue vertical slice from core scaffold to Writing, Canvas, Preview, Export, and browser evidence.
```

When the plan is executed, add implementation bullets in the same date section.

- [ ] **Step 4: Run full verification**

Run:

```bash
npm run docs:check
npm run typecheck
npm test
npm run build
npm run check
npm run test:browser
npm run export:mvp1
```

Expected:

- `docs:check` exits 0.
- `typecheck` exits 0.
- Vitest exits 0 for `@taro/core` and `@taro/studio`.
- Build exits 0 for `@taro/core` and `@taro/studio`.
- Browser test passes in Chromium.
- `dist/mvp1-ordinary-dialogue/index.html`, `runtime-manifest.json`, and `document.taro.json` exist and are non-empty.

---

## Execution Notes

- Follow TDD. Each task starts with a failing test before implementation.
- Keep UI state local. Selection, draft text, add/search visibility, and export panel open state must not become Document fields.
- Do not add plugins, templates, branch path context, or graph editing while executing this MVP1 plan.
- Do not convert the runtime core wholesale to a renderer-specific architecture. The MVP1 Studio can use DOM/CSS for Canvas until a renderer decision is made deliberately.
- If a behavior change modifies Document semantics, update `docs/API_CONTRACTS.md`, `docs/STATE_MODEL.md`, or relevant `docs/spec/*.md` in the same task.
