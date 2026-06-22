# Changelog

All notable changes to Taro will be documented in this file.

## 2026-05-29

### Added

- Added explicit `check:fast`, `check:full`, and `verify:mvp1` verification tiers for daily development, milestone handoff, and MVP1 creator-loop parity.
- Added a minimal Studio Preview player surface with current-Group text, inherited stage label, local playback controls, and source trace.

### Changed

- Documented when to use each verification tier in the README and testing strategy.

## 2026-05-28

### Added

- Added a Chinese comprehensive product overview at `docs/PRODUCT_OVERVIEW.zh.md` for onboarding readers to Taro's current direction, MVP1/MVP1.1 scope, design principles, implementation evidence, later roadmap, and open product questions.

### Changed

- Linked the Chinese product overview from the README documentation map.

## 2026-05-15

### Added

- Established the initial product-document baseline.
- Added product description, architecture, roadmap, state model, API contracts, testing strategy, UI design, code style, task template, specs, and ADRs.
- Defined Writing as source of truth.
- Defined Group as the player advance unit.
- Defined path-driven stage state.
- Defined Canvas as a visual editor that writes back to the Document.
- Defined templates as generators by default.
- Defined plugin flow-control visibility rules.
- Added explicit MVP definition for Writing, minimal Canvas visual editing, Preview, and local Export.
- Added runtime semantics for Group blocking, click progression, interaction triggers, Preview, Export, and deferred runtime features.
- Restored confirmed product directions for keyboard add/search, display modes, Canvas Group view, branch naming, smart selection, project settings, and plugin/runtime boundaries.

## 2026-05-16

### Added

- Added the first executable MVP1 TypeScript core scaffold under `packages/core`.
- Added `taro.document.v0` and `taro.local-playable.v0` fixtures for ordinary dialogue.
- Added MVP1 tests for Group creation, same-Group insertion, Preview trace generation, Export parity, and broken jump diagnostics.
- Added root npm scripts for docs checks, type checking, tests, build, and full scaffold verification.
- Added the MVP1 ordinary-dialogue vertical slice implementation plan under `docs/superpowers/plans/`.
- Added MVP1 Document commands for text speaker/display edits, text line breaks, resource insertion, and current-Group background stage changes.
- Added a React/Vite Studio package for the ordinary-dialogue Writing, Canvas, Preview, and Export loop.
- Added Studio unit tests and a Playwright browser test for the MVP1 ordinary-dialogue creator workflow.
- Added local export file materialization and the `export:mvp1` smoke script.

### Changed

- Split MVP1-required operations from deferred plugin, template, hotspot, and advanced Canvas behavior in the MVP and API docs.
- Clarified that selection is editor state, not a Document mutation.
- Updated MVP1 docs and API contracts for the implemented Studio vertical slice and expanded command/export surfaces.

## 2026-05-17

### Added

- Added the MVP1.1 Document-like Writing Surface / Cursor-Based Insertion implementation plan under `docs/superpowers/plans/`.
- Added a local Studio insertion model for text carets, selected items, Group whitespace, empty Groups, and between-Group insertion points.
- Added MVP1.1 unit and browser coverage for inline text editing, same-Group text insertion, empty-Group insertion, between-Group stage insertion, repeated visible stage changes, and Preview/Export parity.

### Changed

- Clarified that MVP1 is an ordinary-dialogue technical vertical slice.
- Recorded the fixed Writing input and two-result Add/Search placement as superseded MVP1 scaffolding rather than the target Writing model.
- Replaced the fixed append-style Writing input with a minimal document-like Writing surface where text items are editable inline and caret or selection chooses where new structure lands.
- Collapsed the two location-specific rainy-street Add/Search results into one action that resolves its location from cursor or selection context.
