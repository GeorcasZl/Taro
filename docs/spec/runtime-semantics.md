# Spec: Runtime Semantics

Last updated: 2026-05-15

## Goal

Define the runtime behavior that Preview and Export must share. This spec captures confirmed operating rules even when some capabilities are deferred beyond MVP.

## Player Runtime

Taro should expose one clear Player Runtime concept.

Player Runtime owns:

- Story advancement.
- Group execution.
- Text display.
- Choices, conditions, jumps, records, and result actions.
- Stage state derivation.
- Waits and instant effects.
- Input handling.
- Preview and Export parity.

The runtime may contain multiple internal modules, but product and architecture documents should not split creator-facing semantics into separate narrative and stage runtimes.

## Group Execution Defaults

A Group executes ordered content items after one player advance.

Confirmed defaults:

- Ordinary text is blocking by default.
- Special display modes may make text non-blocking.
- Wait items are blocking by default.
- Ordinary waits are skippable by player click unless marked as critical.
- Critical transitions, critical animations, and strong rhythm waits may be marked non-skippable.
- Interaction items block until a trigger result is emitted, cancelled, or otherwise resolved.
- Record writes apply immediately and are non-blocking after application.
- Stage changes are non-blocking unless their transition duration blocks.
- Sound changes are non-blocking.
- Instant effects are non-blocking unless marked blocking.
- Jump actions end the current Group flow unless explicitly modeled as a queued action.

Inspector must expose the source of blocking behavior when it is not obvious: project default, display mode default, Group setting, or local item override.

## Group Completion

The project default is to wait for player advance after a Group completes.

Group or display mode settings may explicitly auto-advance to the next Group. Auto-advance is not the default for ordinary VN dialogue.

## Display Mode Click Priority

Display mode clicks handle reading progression, not story branching.

Confirmed priority:

1. If current text is not fully revealed, click completes the text.
2. Else if current wait is skippable, click skips the wait.
3. Else if the Group has completed and is waiting, click enters the next Group.
4. Else the click is ignored or handled by the current display mode without changing story flow.

Auto Mode must not change this priority. It only replaces player click with a timer for allowed progression points.

## Interaction Input

Interaction capabilities produce named trigger results.

Examples:

- `clicked:cabinet`
- `clicked:window`
- `longPress:photo`
- `reply:selected:angry`
- `chat:finished`

Trigger results do not silently change story flow. They bind to visible result actions, such as:

- Continue current Group.
- Enter next Group.
- Jump to position.
- Return to a visible generated target.
- Write record.
- Change state.
- Play effect.
- Wait.

The binding must explicitly declare whether it continues the current Group, enters the next Group, jumps, returns to a visible target, or stops.

## Display Clicks vs Interaction Clicks

Taro must keep two click meanings distinct:

- Display mode click: advances or completes reading behavior.
- Interaction click: emits a story-relevant trigger result.

For example, clicking a dialogue bubble may complete text or enter the next Group. Clicking a cabinet hotspot may emit `clicked:cabinet`, which then runs visible bound actions.

## Stage State Derivation

Stage state is primarily explained by:

```text
position + path context
```

Current screen state for Preview and Canvas is derived from:

```text
path-derived stage state + current Group stage changes + active display modes + currently executing content items
```

Canvas must not pretend there is only one screen result when multiple inbound paths create meaningful stage-state differences.

## Branch Merge Severity

Multiple inbound paths can produce different stage state.

Confirmed severity policy:

- Multi-path stage-state differences are warnings by default.
- Key state differences, missing resources, missing character references, or state that cannot be derived may become errors or blockers.
- Export may continue with accepted or non-critical differences.
- Export must fail when the state needed for playable behavior cannot be resolved safely.

## Records And Conditions

Story logic should primarily read Records.

Ordinary conditions should not depend on stage state by default. If a condition must read stage state or runtime context, it belongs to an advanced path and must be marked clearly in UI and diagnostics.

MVP conditions use basic record types and basic comparison operators.

## Return To Choice

Taro should not provide a hidden runtime stack for "return to current choice" or "return to previous investigation point" by default.

Investigation, map, phone chat, and similar loops should use templates that generate visible jumps and targets. Generated return behavior remains visible, searchable, editable, and deletable.

## Preview State

Preview uses the same runtime semantics as Export.

Preview may add editor-only overlays and controls:

- Current Group.
- Current item.
- Current records.
- Current stage state.
- Active path context.
- Source trace.
- Diagnostics.

Preview temporary record overrides affect only the current Preview session by default. Later versions may allow saving named test configurations. Test configurations must not affect project default state or player save data.

## Save And Restore Direction

Save/load is not in the current MVP, but the runtime model should not block it.

Direction:

- Save position/current Group.
- Save story records.
- Save path history and current path context.
- Save current Group execution progress if saving can occur mid-Group.
- Save necessary stage snapshots for stable restore, performance, plugin compatibility, and migration.
- Save plugin private state only when the plugin declares schema, migration, Preview behavior, Export behavior, and missing-plugin fallback.

Necessary snapshots are restore aids, not a second authoring source of truth. If a state affects later story logic, it should be written as a Record or visible action, not hidden only in a snapshot.

## Deferred Runtime Features

These are directionally supported but not MVP requirements:

- Auto Mode as a player feature.
- Player rollback/history.
- Multiple simultaneous interaction regions.
- Plugin-provided condition types.
- Named Preview test configurations.
- Full save/load UI.
