# Taro Product Description

Last updated: 2026-05-17

## One-Sentence Product

Taro is a 2D branching narrative creation studio where creators write story text as the primary flow, then shape structure, stage presentation, interaction, plugins, preview, diagnostics, and export around that same flow.

## Product Thesis

Branching narrative tools often force creators into one of two uncomfortable models:

- A plain script that cannot express rich state, interaction, visual presentation, and export reliably.
- A graph, timeline, scene database, or engine SDK that makes the creator manage production machinery before the story feels alive.

Taro takes a third path. The creator writes in a readable story flow. Taro preserves that flow as the main source while making structure, state, stage presentation, and interactions visible enough to edit, debug, preview, and export.

## Target Creator

Taro serves creators who:

- Write branching visual stories, romance games, investigation games, interactive comics, chat fiction, and lightweight visual novels.
- Think primarily in story, choices, consequences, pacing, and scene presentation.
- Need visual staging and plugin-powered interactions without becoming engine programmers.
- Need exports that behave predictably across preview, build, and player runtime.

Taro does not optimize for:

- Professional game teams building fully custom engine logic.
- Freeform graph-only interactive systems.
- Timeline-heavy animation production.
- Code-first plugin authors as the primary user.

## Product Promise

Taro should let a creator:

1. Write a story flow naturally.
2. Add choices, conditions, records, jumps, waits, effects, and stage changes without losing readability.
3. Understand which content appears together when the player advances.
4. Inspect the branch structure without turning the story into a free node graph.
5. Preview any position with the correct path context.
6. Diagnose missing resources, broken jumps, unresolved branch-state differences, and plugin issues.
7. Use plugins and templates while keeping critical story logic visible.
8. Export a playable work whose runtime behavior matches Preview.

## Current MVP

The current MVP is an ordinary-dialogue technical vertical slice:

1. Writing authors dialogue as structured Groups.
2. Canvas performs minimal visual editing for the current Group and writes changes back to the Document.
3. Preview plays the same Group semantics that Export uses.
4. Export produces a minimal local playable package.

MVP1 proves the source-of-truth path for this narrow loop. MVP1.1 moves the Studio Writing surface away from the earlier fixed input box toward a document-like surface where creators edit and insert directly in the story body. The current Add/Search subset remains narrow, but its insertion location follows the active caret or selection rather than a separate location-specific result.

Plugins, templates, investigation rooms, phone chat, marketplace flows, save/load UI, Auto Mode, and player rollback are captured future directions, not MVP requirements. See `docs/MVP.md`.

## Hard Principles

### 1. Writing Is The Source Of Truth

The story flow in Writing is the primary authoring surface and source of truth.

Canvas, Preview, Inspector, plugins, templates, diagnostics, and export all read from and write back to the same structured story flow. Any edit that affects player experience, branching, state, or stage presentation must be traceable to a visible story item, parameter, relation, or action binding.

### 2. Group Is The Player Advance Unit

A **Group** is the content executed or presented after one player advance.

A Group may contain:

- Text lines
- Stage changes
- Sound changes
- Instant effects
- Waits
- Interaction capabilities
- Record writes
- Result actions

Creator-facing language should stay light: "Group", "same Group", "next Group", "split this Group", "merge as one Group". Avoid "Beat", "Moment", "Clip", "Action", or "Scene" as the primary unit.

### 3. Canvas Is Not A Second Source

Canvas can show structure, stage, path context, preview, and diagnostics. It may also create or adjust choices, conditions, jumps, interaction-result bindings, and presentation parameters.

Every meaningful Canvas edit must map back to the story flow. Canvas must never create hidden flow objects, private graph edges, or stage state that cannot be found from Writing.

### 4. Stage State Is Path-Driven

Stage state is derived from the path that reaches a story position.

At a branch merge, two paths may imply different backgrounds, BGM, character positions, overlays, or tones. Taro should detect those differences and ask the creator to resolve them by setting a unified state, accepting path differences, or splitting later flow.

### 5. Logic Must Stay Visible

Choices, conditions, jumps, record writes, and critical state changes must remain visible, searchable, editable, and diagnosable.

Plugins may help generate or recommend flow control. They must not hide the work's main branching and state logic inside code.

### 6. Templates Generate Ordinary Structure

Taro templates are generators by default.

After insertion, a template expands into ordinary editable story structure: choices, conditions, jumps, records, display modes, interactions, effects, and bindings. Taro does not preserve a default long-lived template instance relationship. Plugin authors may provide instance-like experiences, but they must still expose generated critical logic.

## Core Concepts

### Story Flow

The ordered, structured body of the work. It contains Groups, content items, positions, relations, records, and bindings.

### Position

A stable location in the story flow. Jumps and diagnostics refer to stable positions, not line numbers. Line numbers are editor aids only.

### Group

The player advance unit. One advance executes or presents one Group.

### Content Item

An item inside a Group. Examples include text, stage change, sound change, wait, instant effect, interaction capability, record write, and result action.

### Display Mode

How content appears on stage: dialogue bubble, narration panel, phone chat, centered black-screen text, background hotspot overlay, and similar presentation choices.

Display mode is not only visual styling. It may define layout, entry and exit behavior, text reveal behavior, click-to-advance behavior, treatment of older content, and how multiple same-Group items appear together.

### Interaction Capability

How the player provides input: click, long press, drag, inspect hotspot, choose reply, select option.

### Result Action

What happens after an interaction or condition produces a result: continue, jump, record, change state, play effect, wait.

### Record

The creator-facing model for story state: flags, variables, inventory, relationship values, route progress, viewed status, and other values used by conditions and branches.

### Stage State

Persistent player-facing presentation state: background, character sprites, positions, expressions, BGM, ambience, overlays, tone, and ongoing visual context.

### Temporary Play State

Runtime-only state such as hover, focus, timer remainder, drag state, and input state. It only affects story logic when explicitly recorded.

### Path Context

The selected route through prior branches used to render and preview a story position.

## Product Surfaces

### Writing

The main authoring surface. Creators write text, group content, insert records and logic, and keep the story readable.

### Canvas

The visual structure, stage, and path-aware editing surface. It supports zooming from overall flow to a specific Group and can edit presentation or visible logic while writing back to the story flow.

### Inspector

The contextual parameter surface. It edits the selected Group, content item, display mode, interaction, action binding, record, condition, plugin capability, or resource.

### Preview

The playable simulation surface. It can run a Group, run from a position, run along a path, or run from the beginning. It shows state, diagnostics, interaction results, and links back to the editable source.

Preview shares Player Runtime semantics with Export. It may show editor-only overlays, traces, and controls, but it must not invent behavior that exported works cannot reproduce.

### Library

The asset and resource surface for images, audio, fonts, effects, display modes, templates, plugins, and reusable project content.

### Records

The story state management surface for flags, variables, inventory, route progress, relationship values, and viewed-status records.

### Plugins

The extension surface for installed capabilities, manifests, permissions, diagnostics, missing plugin handling, and migration.

### Export

The packaging surface that turns the project into a playable runtime and validates parity with Preview.

## Non-Goals

Taro is not:

- A general-purpose 2D game engine.
- A PixiJS or SDK teaching environment for ordinary creators.
- A graph-first visual programming tool.
- A timeline-first animation tool.
- A screenplay formatter.
- A plugin marketplace where plugins can own the hidden narrative flow.
- A scene database where scenes are the primary writing unit.

The MVP is also not:

- A full plugin platform.
- A marketplace or publishing system.
- A save/load product surface.
- A player Auto Mode or rollback implementation.
- A complete phone chat or investigation-template authoring system.

## First Product Proofs

The first product proofs are five creator loops. The MVP proves the first loop plus the smallest supporting Canvas, Preview, and local Export behavior. The remaining loops are alpha or later proof loops.

1. Ordinary dialogue: write two lines, inherit speaker and display mode, preview two advances.
2. Multi-content Group: add thunder, shake, two bubbles, order them, preview execution.
3. Investigate room: insert hotspot template, bind three hotspots to records and jumps, continue after all viewed.
4. Branch merge: create divergent stage states, merge, detect and resolve stage-state difference.
5. Plugin phone chat: install chat capability, insert messages and replies, bind records and jumps, preview and export.
