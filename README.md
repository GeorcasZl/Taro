# Taro

Taro is a 2D branching narrative creation studio centered on story text.

Creators write the work in **Writing**. Taro then gives the same work a visual **Canvas**, playable **Preview**, structured **Inspector**, reusable templates, plugin capabilities, diagnostics, and export pipeline. The product is not a node editor, timeline editor, scene database, or SDK-first game engine. Its core promise is that creators can write a story as a readable flow while still authoring rich visual presentation, state, branching, and interaction.

## Product Position

Taro is built for creators who want to make branching visual stories without turning the whole work into code or a hidden graph.

The durable product model is:

- **Writing is the source of truth.** All meaningful story flow, state changes, choices, conditions, jumps, interaction results, and visible stage changes must be traceable back to the story flow.
- **A Group is the player-facing advance unit.** One player advance presents or executes one Group. A Group may contain text, stage changes, sound, effects, waits, interaction capabilities, records, and result actions.
- **Canvas is a powerful view, not a second source.** Canvas can inspect, preview, and edit structure or presentation, but its edits must map back into the structured story flow.
- **Stage state is path-driven.** The same story position can render differently depending on the path context that reaches it.
- **Plugins extend expression, not hidden control.** Plugins may provide display modes, interactions, effects, templates, and recommended actions. Critical story flow remains visible and editable in Taro.

## Documentation Map

Start here:

- [docs/PRODUCT_OVERVIEW.zh.md](docs/PRODUCT_OVERVIEW.zh.md) is a Chinese comprehensive product overview that consolidates the current direction, MVP cuts, design principles, implementation evidence, and open product questions.
- [docs/PRODUCT.md](docs/PRODUCT.md) defines the product, creator model, hard principles, terminology, and non-goals.
- [docs/MVP.md](docs/MVP.md) defines the current MVP cut and captures later directions that must not be lost.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) defines the conceptual system architecture and source-of-truth boundaries.
- [docs/ROADMAP.md](docs/ROADMAP.md) defines the product path from documentation baseline to alpha proof.
- [docs/STATE_MODEL.md](docs/STATE_MODEL.md) defines the core document, story, state, Group, path, plugin, and preview models.
- [docs/API_CONTRACTS.md](docs/API_CONTRACTS.md) defines early contracts between editor, document core, preview, plugins, diagnostics, and export.
- [docs/TESTING.md](docs/TESTING.md) defines the validation loops and evidence required before claiming a feature is ready.

Design and implementation guidance:

- [docs/UI_DESIGN.md](docs/UI_DESIGN.md) defines the Studio surfaces, interaction posture, and Figma usage boundary.
- [docs/CODE_STYLE.md](docs/CODE_STYLE.md) defines engineering style, naming, data-flow, and documentation expectations.
- [docs/TASK_TEMPLATE.md](docs/TASK_TEMPLATE.md) gives the standard task shape for implementation and review.
- [docs/spec](docs/spec) contains product specs for the first authoring loops and runtime semantics.
- [docs/adr](docs/adr) records product and architecture decisions.
- [CHANGELOG.md](CHANGELOG.md) tracks product-document and implementation changes.

## Current Status

This repository contains the product-document baseline, the executable MVP1 core scaffold, and the first ordinary-dialogue Studio vertical slice. The implementation proves the source-of-truth Document core plus a browser-visible Writing, Canvas, Preview, and Export loop:

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

## Run MVP1 Locally

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`.

The current vertical slice proves the first MVP creator loop:

1. Write story content in Writing.
2. Group multiple content items into one player advance.
3. Adjust minimal visual presentation in Canvas while writing back to the Document.
4. Preview the result with shared runtime semantics.
5. Export a minimal local playable package with visible story logic preserved.
