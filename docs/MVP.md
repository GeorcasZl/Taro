# Taro MVP Definition

Last updated: 2026-05-17

## Purpose

This document defines the current MVP cut. It does not erase later product directions. Later directions are captured here or in linked specs so they remain available without entering the first implementation scope by accident.

## Current MVP Cut

The MVP proves:

1. Writing can author ordinary visual novel dialogue as structured Groups.
2. Canvas can perform minimal visual editing for the current Group while writing back to the same Document.
3. Preview can play the authored Groups with the same runtime semantics used by export.
4. Export can produce a minimal local playable package for the ordinary VN dialogue loop.

The first representative creator scenario is ordinary visual novel dialogue, not investigation rooms, phone chat, plugin-driven interactions, or marketplace workflows. MVP1 is a technical vertical slice for that ordinary-dialogue loop: it proves Document commands, Group semantics, minimal Canvas write-back, Preview trace generation, and local Export parity before broader authoring ergonomics.

## MVP Creator Workflow

The creator should be able to:

1. Create a project.
2. Write two or more dialogue Groups in Writing.
3. Set or inherit speaker and display mode.
4. Add another text item to the same Group.
5. Adjust basic visual placement or display parameters in Canvas.
6. Preview the story advance by advance.
7. Export a local playable package.
8. Open the package locally and see behavior matching Preview for the covered loop.

## MVP Authoring Input

Writing remains plain text first. Ordinary prose is never interpreted as logic unless the creator explicitly asks Taro to create structure.

MVP1.1 replaces the fixed draft append box with a minimal document-like Writing surface. Creators edit text items inline in the story body; the active text caret or selected structural item determines where new content lands. Empty and between-Group positions may exist internally, but normal authoring must not depend on persistent composer, plus, or insertion-target buttons. Cursor and selection are Studio editor state, not Document state.

Required MVP input rules:

- `Enter` creates the next Group.
- `Option/Alt+Enter` adds another text item to the same Group.
- `Shift+Enter` inserts a line break inside the current text item.
- A keyboard shortcut opens a global add/search box. The default shortcut should be `Cmd/Ctrl+K` unless implementation constraints force a documented alternative.
- The MVP1 add/search subset can search and add ordinary dialogue content, speakers, display modes, basic backgrounds or stage changes, simple waits, jumps, records, and resources needed by the ordinary VN dialogue loop.
- Templates and plugin-provided capabilities must remain searchable later, but they are not MVP1 required insertions.
- The insertion result depends on current context: selected text, selected Group, selected range, selected Canvas object, selected position, or empty insertion point.

## MVP1 Implementation Contract

The first implementation scaffold proved the source-of-truth core before broad UI work. The current MVP1 vertical slice adds a small Studio shell around that core for ordinary dialogue authoring, current-Group Canvas editing, Preview evidence, and local Export.

Required MVP1 scaffold:

- `packages/core` owns `taro.document.v0`, Document commands, diagnostics, Preview trace generation, and local Export compilation.
- Fixtures live under `fixtures/mvp1/ordinary-dialogue/`.
- `document.taro.json` is the canonical fixture Document.
- `expected/preview-trace.json` records the expected Preview trace.
- `expected/export-manifest.json` records the expected local export manifest.
- Preview and Export must use the same ordered Group and item semantics for the covered fixture.

Required MVP1 vertical-slice Studio behavior:

- Writing creates Groups through Document commands.
- `Enter`, `Option/Alt+Enter`, and `Shift+Enter` follow the MVP input rules.
- `Cmd/Ctrl+K` opens a transient add/search surface.
- Add/Search can add a minimal rainy-street background through `resource.add` and `stage.set_background`; the current cursor or selection decides whether it lands in the current Group, an empty Group, or a new stage-only Group at a between-Group insertion point.
- Studio Preview shows a minimal playable current-Group view with authored text, inherited stage/background label, local `Next` and `Restart` controls, and source trace for current Group, item ids, and stage source.
- Studio Preview playback state is local Preview/editor state and does not mutate the authoring Document.
- Preview and Export expose trace parity evidence.
- Browser tests cover the ordinary-dialogue creator loop.

Current MVP1.1 UI boundary:

- Writing/Add/Search placement is intentionally narrow and temporary.
- A new document opens with an editable text block in Group 1, so the blank page is still the document body rather than a separate composer.
- Add/Search exposes one rainy-street background action. It chooses what to insert; the cursor or selection chooses where it lands.
- Group markers remain visible as quiet gutter metadata. Empty unfocused text items render as blank editor space instead of repeated placeholder body copy.
- Same-Group insertion can target the space between two existing text items; the committed Document item order is the runtime order consumed by Preview and Export.
- Empty Groups, stage-only Groups, repeated stage changes, and linear inherited stage state are valid MVP1 behavior and must remain visible in Writing, Canvas, Preview, and Export evidence.

## MVP Records And Conditions

The MVP uses basic record types and basic comparisons.

In scope:

- Boolean records.
- Number records.
- Text records when needed for simple equality checks.
- Basic comparison operators: equals, not equals, greater than, less than, greater or equal, less or equal.
- Conditions primarily read Records.

Out of scope for MVP:

- Advanced expressions.
- Conditions that depend on stage state by default.
- Custom plugin-provided condition types.

## MVP Canvas Boundary

Canvas is part of the MVP only as a minimal visual editor for the current Group.

In scope:

- Show the current Group's player-facing preview.
- Show the current path context when it matters.
- Show current stage state derived from the selected path.
- Show the current Group's ordered content items.
- Edit basic visual parameters that map back to Document items, such as display mode parameters, character placement, background choice, or text box placement.
- Keep Writing and Canvas selection synchronized.

Out of scope for MVP:

- Freeform node graph authoring.
- Full story-map editing for large works.
- Timeline editing.
- Choice, condition, jump, interaction binding, and hotspot-region editing from Canvas unless a later task explicitly promotes one of those operations into the MVP cut.
- Plugin-provided Canvas tools.
- Rich hotspot editing beyond a documented later direction.

## MVP Export Boundary

MVP Export means a minimal local playable package.

In scope:

- Package the ordinary VN dialogue loop.
- Include the resources required by that loop.
- Use the same Group ordering, display mode, click progression, record, and jump semantics as Preview for covered content.
- Fail with source-linked diagnostics for broken jump targets, missing required resources, invalid record references, and schema errors.

Concrete MVP1 export target:

- Format: `taro.local-playable.v0`.
- Required files: `index.html`, `runtime-manifest.json`, and `document.taro.json`.
- The runtime manifest includes `document_id`, `entry_group_id`, `resources`, file list, and the Preview trace used for parity evidence.
- The MVP1 `index.html` embeds enough Document data to advance through ordinary-dialogue Groups locally.
- The export smoke check compares the Preview trace against the trace embedded in the runtime manifest.

Out of scope for MVP:

- Marketplace publishing.
- Payment or distribution flows.
- Full plugin runtime bundling.
- Multi-target build matrix.
- Cloud save, cloud hosting, or collaboration.

## Captured Later Directions

These directions are real product ideas but are not MVP commitments:

- Investigation room templates with hotspots, viewed records, return jumps, and all-viewed continuation.
- Phone chat and other plugin-provided display modes.
- Plugin installation, upgrade, migration, permissions, and missing-plugin recovery.
- Plugin SDK, capability manifests, runtime renderer integrations, and Canvas tool schemas.
- Smart selection across ranges, content kinds, display modes, effects, records, jumps, and plugin capabilities.
- Branch and key-position naming as a stronger authoring aid.
- Project settings for default display mode, text speed, click behavior, canvas size, no-background appearance, no-sound appearance, input behavior, and export defaults.
- Auto Mode as a later runtime feature.
- Player rollback/history as a later runtime feature.
- Named Preview test configurations saved from temporary record overrides.
- Save/load runtime snapshots for player-facing projects.

## Product Non-Negotiables

Even in the MVP:

- Writing remains the source of truth.
- Group remains the player advance unit.
- Canvas edits must write back to Document items, parameters, relations, stage changes, or action bindings.
- Preview state must not silently persist to the Document.
- Export behavior must match Preview for the covered loop.
- Selection, focus, hover, scroll, zoom, and open panels are editor state, not story truth.
