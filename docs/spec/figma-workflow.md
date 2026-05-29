# Figma Workflow

Last updated: 2026-05-29

## Purpose

This document defines how Taro uses Figma during UI design work.

Taro is not ready to treat Figma as a full visual-design, high-fidelity prototype, or design-system workflow.

The current product risk is premature visual fixation. The Writing surface editing model, insertion behavior, Group visibility, Add/Search flow, Preview, and Export parity need to stabilize in the browser before high-fidelity UI or reusable component work becomes useful.

For now, Figma is a very low-fi reference and discussion tool. It can help answer:

- What should this editor feel like?
- What should this editor avoid becoming?
- Which coarse surface relationships make Writing feel primary?
- Which reference patterns would accidentally push Taro toward forms, node editors, timelines, dashboards, or SDK consoles?

Figma references are exploratory unless a later product/design review explicitly promotes them.

## Authority Boundaries

### Current Phase: Low-Fi Reference Only

Figma may currently be used for:

- Rough reference boards.
- Lo-fi boxes and annotations.
- Side-by-side comparisons of "Taro-like" and "not Taro-like" editor postures.
- Discussion artifacts for Writing, Canvas, Inspector, and Preview relationships.
- Disposable sketches that help name open interaction questions.

Figma must not currently be used for:

- Final UI.
- High-fidelity Studio screens.
- Production component libraries.
- Design tokens or visual variables.
- Code Connect.
- Detailed interaction-state matrices.
- Implementation acceptance.
- Replacing browser dogfood as the proof of the editing model.

### Repo And Browser Own Product Semantics

The repository remains authoritative for:

- Product thesis and target creator.
- Writing as source of truth.
- Writing surface editing behavior.
- Group execution semantics.
- Document, Stage, Story Record, Temporary Play, and Editor state boundaries.
- Canvas as a visual editor and diagnostic surface, not a second hidden object system.
- Plugin and template flow-control visibility.
- API contracts.
- Preview and Export behavior.
- Test and dogfood acceptance.

The running browser product is the required proof surface for editor behavior. Figma may suggest a direction, but a behavior is not accepted until it is captured in the matching repository document and proven through the relevant live-app, test, or dogfood loop.

## Canonical Files

There is no required canonical production Figma file during the current phase.

If a low-fi reference file exists, it should be explicitly named as exploratory, for example:

- `Taro Studio Low-Fi References`

Recommended pages:

- `00 Cover`
- `01 References`
- `02 Not Taro`
- `03 Lo-Fi Sketches`
- `04 Open Questions`
- `90 Archive`

The file should link back to this spec and to `docs/UI_DESIGN.md`.

Do not record a low-fi exploratory file as the canonical UI source. When the project later reaches a formal Figma workflow, record that file link in `docs/UI_DESIGN.md`.

## Current Low-Fi Scope

The current Figma scope is discussion, not handoff.

Allowed low-fi references:

- Editor posture references.
- Writing-primary surface sketches.
- Coarse layout comparisons.
- Negative examples that make the product boundary clear.
- Notes about which interactions need browser proof before visual design.

Out of scope now:

- Figma MVP screens.
- Medium- or high-fidelity prototype walkthroughs.
- Complete state matrices.
- Component libraries.
- Variables, tokens, styles, and theming.
- Design-system documentation generated from Figma.
- Implementation from a Figma frame.

## Formal Figma Gates

Taro should move through Figma phases only when the product loop justifies it.

### Gate 0: Current Browser-First Phase

Status: active.

Goal:

- Stabilize MVP1.1 Writing surface semantics in the running browser product.
- Prove the minimum Writing -> Preview -> Export loop.
- Keep Figma low-fi and exploratory.

Exit evidence:

- Browser Writing loop supports inline editing, caret/selection insertion, Group visibility, Add/Search insertion, Preview trace, and Export parity.
- Product docs and specs describe the accepted editing model.
- Tests or dogfood evidence cover the loop.

### Gate 1: Formal UI Direction

Enter only after Gate 0 evidence exists.

Allowed work:

- Low- to medium-fidelity Studio shell exploration.
- Coarse state exploration for Writing, Canvas, Inspector, and Preview.
- Prototype walkthroughs for already-proven product loops.
- Screenshot comparison against the live browser product.

Still out of scope:

- Full visual polish.
- Complete design system.
- Broad component extraction.
- Code Connect.

### Gate 2: High-Fidelity And Design System

Enter closer to Alpha, after sustained dogfood reveals stable UI pressure.

Allowed work:

- High-fidelity Studio UI.
- Visual foundations and semantic tokens.
- Reusable components with meaningful states.
- Design-system documentation.
- Code Connect after component APIs stabilize.

Required evidence:

- Alpha-facing creator workflows are dogfooded repeatedly.
- Product behavior is stable enough that visual decisions will not freeze unresolved semantics.
- Implementation screenshots and tests can catch drift.

## Agent And Skill Usage

Use Figma-related agent skills according to the work type:

- During Gate 0, do not use Figma write tools unless the task explicitly asks for a low-fi reference artifact.
- Use `figma-generate-design` only after Gate 1 begins or for a clearly labeled low-fi exploratory reference.
- Do not use `figma-generate-library` until Gate 2.
- Do not use `figma-implement-design` unless a Figma design has been accepted after the relevant product behavior is proven in the browser.
- Use `figma-code-connect` only after component APIs stabilize during Gate 2.
- Use `figma-use` whenever an agent needs to read from or write to a Figma file through the Figma plugin API.

Figma write work must use checkpoints. Do not batch broad UI design or design-system work into one operation.

## Required Figma Metadata

Every Figma artifact should record:

- Figma file name and link.
- Page and frame names.
- Design owner or agent run owner.
- Review date.
- Target product loop.
- Related repo docs.
- Whether the frame is exploratory, proposed, accepted, implemented, or archived.
- Current gate: Gate 0, Gate 1, or Gate 2.

Recommended status labels:

- `Exploratory`
- `Proposed`
- `Accepted`
- `Implemented`
- `Archived`

During Gate 0, frames should normally remain `Exploratory`. Only `Accepted` and `Implemented` frames can drive implementation, and acceptance requires the matching product behavior to be documented and proven outside Figma.

## Repository Backflow

Stable decisions from any Figma discussion must be mirrored back into repo docs before they guide implementation.

Update `docs/UI_DESIGN.md` when a decision changes:

- Studio surface posture.
- Visual language.
- Interaction principles.
- Figma file link.
- Minimum UI acceptance.

Update `docs/spec/*.md` when a decision changes:

- A specific creator workflow.
- Writing or Canvas behavior.
- Preview or diagnostics behavior.
- Plugin or template authoring behavior.

Update `docs/API_CONTRACTS.md` when a decision requires:

- A new command.
- A new query.
- A changed command payload.
- A changed editor-state event.

Update `docs/STATE_MODEL.md` when a decision changes:

- Persistent Document state.
- Derived state.
- Local editor state.
- Path context rules.

Update ADRs when a decision changes a core product rule.

## Implementation Acceptance

A Figma reference is not implementation evidence.

Minimum evidence:

- A live-app screenshot or browser verification for the changed surface.
- Relevant automated tests when behavior changed.
- Documentation updates when product, state, API, or workflow semantics changed.
- A drift note if implementation intentionally differs from Figma.

Figma can help discuss visual direction. It cannot prove:

- Keyboard reachability.
- Prose safety.
- Document command correctness.
- Group execution semantics.
- Preview and Export parity.
- Plugin flow-control visibility.

Those require live app tests, dogfood loops, and repo-level verification.

## Review Checklist

Before using a Figma artifact in the current phase:

- It is clearly labeled low-fi and exploratory.
- It answers a concrete editor-posture question.
- It does not imply final UI, component tokens, or implementation acceptance.
- It does not bypass browser proof for the Writing editing model.
- It identifies which product questions remain open.

Before accepting a Figma frame in a later gate:

- The creator workflow is visible end to end.
- Writing remains the source of truth.
- Canvas changes map back to visible story structure.
- Group boundaries are understandable without overpowering prose.
- Path context is visible when state depends on prior choices.
- Diagnostics link back to editable source.
- Command surfaces are transient and do not become persistent row-local clutter.
- Keyboard ownership is plausible and later testable.
- The frame does not introduce hidden flow control, hidden stage state, or graph-first authoring.

Before implementing from Figma:

- The source frame is marked `Accepted`.
- Related product docs have no known conflict.
- The relevant browser behavior has already been proven or the implementation task explicitly includes that proof.
- Required commands, queries, and editor-state events are identified.
- The implementation test or dogfood loop is named.
- The expected screenshot comparison target is named.
