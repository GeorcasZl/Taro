# Spec: Plugins And Templates

Last updated: 2026-05-15

## Goal

Plugins and templates should expand Taro's expressive range while keeping story flow, records, conditions, and jumps visible.

Plugins and advanced templates are alpha or later work, not current MVP scope. Their product boundaries are still documented here so early architecture does not block them or accidentally hide story logic.

## Product Language Boundary

Creators should not think in SDK objects.

Creator-facing language:

- Display modes.
- Interactions.
- Effects.
- State changes.
- Conditions.
- Actions.
- Templates.
- Plugin-provided capabilities.

Developer-facing language:

- Plugin packages.
- Capability definitions.
- Parameter schemas.
- Event contracts.
- Inspector schemas.
- Canvas editing schemas.
- Runtime implementations.
- Resource dependencies.
- Permissions.
- Version migrations.

Studio surfaces should prefer creator-facing language. SDK and renderer terms belong in developer documentation or implementation internals.

## Plugin Capability Discovery

Installed plugins may contribute:

- Display modes
- Interaction capabilities
- Effects
- Templates
- Canvas tools
- Inspector parameter panels
- Runtime renderers

Capabilities appear in command search, Library, relevant insertion menus, display-mode lists, interaction lists, effect lists, and template lists.

Each capability must show its source:

- Built-in
- Project
- Plugin

Plugins are installation units. Capabilities are use units. Daily creation should make creators use the display modes, interactions, effects, actions, and templates provided by a plugin rather than repeatedly manipulating a plugin object.

## Plugin Insertion

When a plugin capability is inserted, Taro must know:

- What appears in Writing.
- What appears in Canvas.
- What Inspector parameters exist.
- What Preview behavior exists.
- What trigger results can be emitted.
- Which visible result actions are bound to those triggers.

Capabilities attach to the story flow. They may attach to a text item, Group, choice option, condition result, jump target, current Group screen, range, display-mode default, or template-generated structure.

They must not require creators to first create hidden engine objects, node trees, or SDK entities.

## Flow-Control Boundary

Plugins may declare trigger results and recommended actions.

Plugins must not invisibly own:

- Branch jumps
- Conditions
- Record writes
- Critical route progress
- Export-only hidden story behavior

If a plugin declares `clicked:cabinet -> jump cabinet_branch`, Taro stores that as a visible trigger binding that the creator can inspect and edit.

## Template Model

Taro templates are generators by default.

Insertion produces ordinary editable structure such as:

- Groups
- Text
- Choices
- Conditions
- Jumps
- Records
- Stage changes
- Display modes
- Interactions
- Trigger bindings

Taro does not preserve a default template-instance relationship after generation.

Plugin authors may provide instance-style editing as an advanced plugin capability, but visible generated logic remains required.

Examples of later template directions:

- Investigation hotspot screen.
- Phone chat segment.
- Chapter cover.
- Ending card.
- Flashback.
- Timed choice.
- Relationship-change prompt.
- Map point selection.
- Item acquisition prompt.

These templates may expose creator-facing parameters such as background image, hotspot list, hotspot regions, results, viewed-state appearance, all-complete action, variants, and local overrides. The generated critical logic remains ordinary Taro structure unless a future plugin instance system explicitly exposes and validates the relationship.

## Missing Plugin Behavior

If a project references a missing plugin:

- The project still opens.
- Missing capabilities appear as placeholders.
- Source locations remain navigable.
- Preview reports clear diagnostics.
- Export blocks playable content that depends on unavailable runtime behavior.

## Runtime And Renderer Direction

Player Runtime should be the creator-facing runtime concept. It owns stable playback, Preview, and Export behavior.

Renderer and SDK details are implementation mechanisms. A PixiJS-backed 2D renderer is a captured direction for rich web 2D capability, but ordinary creators should see Taro concepts such as bubbles, buttons, hotspots, flashes, shakes, backgrounds, and characters instead of renderer internals.

Plugin runtime capabilities may report trigger results, readiness, and completion, but should not directly own jumps, records, conditions, or route progress.

## Acceptance Loop: Phone Chat Plugin

1. Enable a phone-chat plugin.
2. Insert a phone-chat display mode.
3. Add messages and reply choices.
4. Bind a reply trigger to a record write and jump.
5. Preview the chat.
6. Inspect the visible trigger binding.
7. Export and verify plugin runtime inclusion.
