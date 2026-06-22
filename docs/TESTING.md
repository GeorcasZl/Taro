# Taro Testing Strategy

Last updated: 2026-05-16

## Testing Principle

Taro testing is organized around creator loops and source-of-truth invariants.

A feature is not ready because the UI renders. It is ready when Writing, Canvas, Preview, Diagnostics, and Export agree on the same Document semantics.

## Required Evidence Types

Use the smallest evidence set that proves the change:

- Unit tests for pure Document, state, condition, and command logic.
- Contract tests for API request and response behavior.
- Integration tests for Writing, Canvas, Preview, Plugin, and Export flows.
- Browser tests for visible creator workflows.
- Manual dogfood notes for interaction quality and friction.
- Export smoke tests for runtime parity.
- Documentation checks for product-contract changes.

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

## Core Test Loops

### MVP Loop: Ordinary VN Dialogue To Local Export

Proves:

- Writing creates Groups from ordinary dialogue.
- Same-Group insertion works for ordinary dialogue content.
- Canvas can adjust minimal visual presentation while writing back to Document.
- Preview and Export use the same runtime semantics.
- A minimal local playable package can run the covered dialogue loop.

Pass evidence:

- `Enter`, `Option/Alt+Enter`, and `Shift+Enter` produce the expected Group/text structure.
- Inline text editing updates the selected Document text item without creating extra Groups.
- Same-Group between-item insertion can create `A, B, C` from an existing same-Group `A, C` order, and Preview/Export consume that resulting Document order.
- Empty unfocused text items do not render repeated placeholder body copy, and Group markers stay low-noise metadata rather than primary row labels.
- Clicking text and structural items updates only Studio editor state until a creator action commits a Document command. Empty or between-Group insertion can be tested as internal editor state, but the normal Writing flow must not require persistent insertion buttons.
- `Cmd/Ctrl+K` add/search can add or change MVP content from the current insertion target without interpreting prose as commands.
- Studio Preview shows the current Group's authored text, inherited stage/background label, source trace, and local `Next` / `Restart` controls without mutating the Document.
- Preview advances according to click progression rules.
- Exported local package matches Preview for order, display mode, and Group progression.
- Selection sync does not create Document mutations.

### Loop 1: Ordinary Dialogue

Proves:

- Writing creates Groups.
- Speaker and display mode inheritance works.
- Preview advances once per Group.

Pass evidence:

- Two Groups preview in order.
- No accidental command parsing from ordinary prose.
- Exported runtime matches Preview order.

### Loop 2: Multi-Content Group

Proves:

- Same-Group insertion works.
- Ordered content items execute correctly.
- Blocking and non-blocking items behave predictably.

Pass evidence:

- Sound, effect, wait, and text execute in expected order.
- Preview step mode can show each item.
- Export runtime matches Preview.

### Loop 3: Investigation Room

Proves:

- Templates generate ordinary visible structure.
- Interaction triggers bind to records and jumps.
- Conditions can check viewed records.

Pass evidence:

- Hotspots are clickable in Preview.
- Records update visibly.
- All-complete condition continues flow.
- Missing binding creates a source-linked diagnostic.

### Loop 4: Branch Merge

Proves:

- Stage state derives from path.
- Merge differences are detected.
- Canvas requires or records a resolution.

Pass evidence:

- Two inbound paths produce different derived stage states.
- Canvas shows the difference.
- Creator can normalize or accept the difference.
- Preview reflects the chosen path context and resolution.

### Loop 5: Plugin Phone Chat

Proves:

- Plugin capability discovery works.
- Plugin triggers bind to visible Taro actions.
- Missing plugin and export behavior are diagnosable.

Pass evidence:

- Phone-chat content appears in Writing, Canvas, Inspector, and Preview.
- Reply trigger writes a record and jumps.
- Export includes required plugin runtime or blocks with a clear diagnostic.

## Documentation Checks

Run for docs-only changes:

```bash
npm run docs:check
```

The placeholder scan is expected to return no matches.

## MVP1 Scaffold Checks

Run for the first executable MVP1 core scaffold:

```bash
npm run typecheck
npm test
npm run build
npm run docs:check
```

These commands prove:

- `taro.document.v0` fixtures parse through the core TypeScript contract.
- `group.create_after` creates player-advance Groups.
- `group.insert_item` adds same-Group text without creating a new Group.
- Preview emits the expected ordered Group and item trace.
- Export produces `taro.local-playable.v0`.
- The export runtime manifest embeds the same trace produced by Preview.
- Broken jumps, invalid schema versions, and missing referenced resources block export with source-linked diagnostics.
- MVP1 Preview exposes only `current_group`, `from_position`, and `full_preview`; branch-aware `path_preview` remains later scope.

## MVP1 Vertical Slice Checks

Run after implementing the Studio vertical slice:

```bash
npm run check
npm run test:browser
npm run export:mvp1
```

These commands prove Writing keyboard authoring, current-Group Canvas background editing, Preview/Export trace parity, local export file materialization, and product-doc consistency.

## MVP1.1 Document Writing Checks

Run after changing the document-like Writing surface:

```bash
npm run check
npm run test:browser
npm run export:mvp1
```

These commands prove insertion-target unit coverage, inline Writing edits, same-Group text insertion, empty-Group stage insertion, between-Group stage-only insertion, repeated visible stage changes, Preview/Export trace parity, local export file materialization, and product-doc consistency.

## Test Data Requirements

Maintain MVP1 fixtures for:

- Ordinary dialogue.
- Runtime semantics for click progression, blocking behavior, and minimal local export parity.

Each fixture should include:

- Document file.
- Expected diagnostics.
- Preview trace.
- Export expectation.

The current MVP1 fixture set starts at:

- `fixtures/mvp1/ordinary-dialogue/document.taro.json`
- `fixtures/mvp1/ordinary-dialogue/expected/preview-trace.json`
- `fixtures/mvp1/ordinary-dialogue/expected/export-manifest.json`

Later fixture sets should cover:

- Multi-content Group.
- Investigation hotspot.
- Branch merge with divergent stage state.
- Phone-chat plugin loop.

## Bug Regression Standard

Every confirmed bug fix should add a regression test or fixture unless the bug is purely visual and can only be verified by screenshot or manual dogfood.

Regression evidence should show:

- The failing behavior before the fix when practical.
- The passing behavior after the fix.
- The affected source location or workflow.
