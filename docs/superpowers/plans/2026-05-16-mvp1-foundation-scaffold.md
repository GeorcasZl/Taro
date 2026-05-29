# MVP1 Foundation Scaffold Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Make the docs-only Taro repo ready for MVP1 implementation by adding an executable core scaffold, MVP1 fixtures, and verification commands.

**Architecture:** The first scaffold is `packages/core`, not the full Studio UI. It owns `taro.document.v0`, Document commands, source-linked diagnostics, Preview traces, and local Export compilation. Writing, Canvas, and later UI packages should call this core instead of mutating their own private story state.

**Tech Stack:** npm workspaces, TypeScript, Vitest, strict `tsc`.

---

### Task 1: Establish Repo Tooling

**Files:**

- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.base.json`
- Create: `.gitignore`
- Create: `scripts/check-docs.sh`
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/tsconfig.build.json`

- [x] Add root npm scripts for `docs:check`, `typecheck`, `test`, `build`, and `check`.
- [x] Add strict TypeScript compiler defaults.
- [x] Keep generated build output ignored.
- [x] Keep docs verification in a script so `docs/TESTING.md` and CI can call the same command.

### Task 2: Add MVP1 Core Contract

**Files:**

- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/document.ts`
- Create: `packages/core/src/diagnostics.ts`
- Create: `packages/core/src/runtime.ts`
- Create: `packages/core/src/index.ts`

- [x] Define `TaroDocument` for `taro.document.v0`.
- [x] Define Group, ContentItem, DisplayMode, Diagnostic, PreviewTrace, and local export manifest types.
- [x] Implement `createMvp1Document`.
- [x] Implement `applyDocumentCommand` for `group.create_after`, `group.insert_item`, and `text.update`.
- [x] Implement `validateDocumentForExport`.
- [x] Implement `previewDocument`.
- [x] Implement `buildLocalExportPackage`.

### Task 3: Add MVP1 Fixture And Tests

**Files:**

- Create: `packages/core/src/mvp1.test.ts`
- Create: `fixtures/mvp1/ordinary-dialogue/document.taro.json`
- Create: `fixtures/mvp1/ordinary-dialogue/expected/preview-trace.json`
- Create: `fixtures/mvp1/ordinary-dialogue/expected/export-manifest.json`

- [x] Write the failing test for Group creation and same-Group insertion.
- [x] Run the test and confirm it fails before core implementation exists.
- [x] Add the minimal implementation.
- [x] Prove Preview and Export use the same ordered Group semantics.
- [x] Prove broken jump targets produce source-linked blocking diagnostics.
- [x] Prove terminal jumps drive Preview/Export traversal instead of raw array order.
- [x] Prove missing resources and invalid schema versions block export.
- [x] Keep branch-aware `path_preview` out of the MVP1 executable type surface.

### Task 4: Tighten Product Docs

**Files:**

- Modify: `docs/MVP.md`
- Modify: `docs/API_CONTRACTS.md`
- Modify: `docs/spec/canvas-path-preview.md`
- Modify: `docs/spec/investigation-hotspot-loop.md`
- Modify: `docs/TESTING.md`
- Modify: `README.md`
- Modify: `CHANGELOG.md`

- [x] Split MVP1-required add/search and command operations from later plugin/template capabilities.
- [x] Document `taro.document.v0`.
- [x] Document `taro.local-playable.v0`.
- [x] De-scope advanced Canvas editing from MVP1.
- [x] Mark investigation hotspot as an alpha/later loop.
- [x] Add executable scaffold verification commands.
- [x] Add a docs check that catches trailing whitespace in untracked scaffold files.

### Task 5: Verify

**Commands:**

```bash
npm run typecheck
npm test
npm run build
npm run docs:check
npm run check
```

**Expected result:** all commands exit 0, with Vitest reporting the MVP1 core tests passing.
