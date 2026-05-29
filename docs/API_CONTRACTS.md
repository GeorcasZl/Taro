# Taro API Contracts

Last updated: 2026-05-17

## Purpose

This document defines early contracts between Taro subsystems. It is not a final wire protocol. It is the agreement implementation must preserve unless the contract is revised with matching docs, specs, tests, and ADRs.

## Contract Principles

- Commands mutate the Document through Document Core.
- Queries read derived or persistent state without mutation.
- Editor commands can synchronize selection, focus, zoom, and panel state without mutating the Document.
- Preview state never silently persists to the Document.
- Canvas edits use the same command path as Writing edits.
- Plugin-triggered flow control expands into visible Taro actions.
- Export consumes the same semantics as Preview.

## Document Command Contract

All persistent changes use document commands.

Command envelope:

```json
{
  "command_id": "cmd_01",
  "actor": "user",
  "source_surface": "writing",
  "document_id": "doc_01",
  "operation": "group.split",
  "payload": {},
  "expected_revision": 12
}
```

Response:

```json
{
  "ok": true,
  "revision": 13,
  "patch": [],
  "diagnostics_changed": true
}
```

Error response:

```json
{
  "ok": false,
  "code": "GROUP_SPLIT_EMPTY_SELECTION",
  "message": "Select at least one content item to split into a new Group.",
  "source": {
    "surface": "writing",
    "group_id": "group_12"
  }
}
```

## Required Document Operations

MVP1 implements the smallest executable subset first. Broader operations remain part of the product contract, but they must not be treated as required for the first scaffold or ordinary-dialogue vertical slice.

MVP1 required command operations:

- `group.create_after`
- `group.insert_item`
- `group.delete_item`
- `text.update`
- `text.set_speaker`
- `text.set_display_mode`
- `text.insert_line_break`
- `resource.add`
- `stage.set_background`

MVP1 required query or preflight operation:

- `export.preflight`

### Group Operations

- `group.create_after`
- `group.insert_item`
- `group.split`
- `group.merge`
- `group.reorder_item`
- `group.move_item`
- `group.delete_item`
- `group.delete`

### Text Operations

- `text.update`
- `text.set_speaker`
- `text.set_display_mode`
- `text.insert_line_break`
- `text.convert_to_choice`
- `text.convert_to_record_write`

### Flow Operations

- `choice.create`
- `choice.add_option`
- `choice.update_option`
- `choice.bind_option_target`
- `condition.create`
- `condition.update`
- `jump.create`
- `jump.update_target`
- `target.rename`
- `target.delete_with_references`

### Record Operations

- `record.create`
- `record.update_schema`
- `record.write`
- `record.compare`
- `record.rename`
- `record.delete_with_references`

### Resource Operations

- `resource.add`

### Stage Operations

- `stage.set_background`
- `stage.set_character`
- `stage.move_character`
- `stage.set_expression`
- `stage.set_bgm`
- `stage.set_ambience`
- `stage.set_overlay`
- `stage.normalize_merge_state`
- `stage.accept_merge_difference`

### Plugin And Template Operations

Deferred until alpha or later:

- `plugin.enable`
- `plugin.disable`
- `plugin.insert_capability`
- `plugin.bind_trigger_action`
- `plugin.resolve_missing_capability`
- `template.insert_generated_structure`

These operations are documented so the architecture does not block plugins and templates later. They are not required by MVP1.

## Query Contract

Queries must not mutate persistent Document state.

Common queries:

- `document.get`
- `story.get_group`
- `story.find_position`
- `story.get_inbound_references`
- `story.get_outgoing_references`
- `records.list`
- `records.get_references`
- `stage.derive_state`
- `stage.compare_paths`
- `diagnostics.list`
- `export.preflight`

Deferred queries:

- `plugins.list_capabilities`

## Editor State Contract

Editor state is not story truth. It should not use Document mutation operations.

Common editor commands or events:

- `selection.set`
- `selection.clear`
- `insertion_target.set`
- `focus.set`
- `canvas.set_zoom`
- `canvas.set_path_context`
- `panel.open`
- `panel.close`
- `preview.set_temporary_record_override`

These may be persisted as workspace preferences or Preview test configuration when explicitly supported, but they do not change the playable story Document.

Selection sync example:

```json
{
  "event": "selection.set",
  "source_surface": "writing",
  "target": {
    "group_id": "group_12",
    "item_id": "item_03"
  }
}
```

MVP1.1 Studio insertion targets are local editor state. They may identify a text caret, a selected structural item, Group whitespace, an empty Group, a position between text items in the same Group, or a position between adjacent Groups. Changing them must not increment `document.revision`.

## Add/Search Contract

The global add/search box is the primary structured insertion surface.

Search requests read available actions and content:

- Characters.
- Display modes.
- Resources.
- Stage changes.
- Sounds.
- Instant effects.
- Waits.
- Choices.
- Conditions.
- Jumps and named positions.
- Records and record writes.

Later search results:

- Templates.
- Plugin-provided capabilities when plugins are enabled.

Committing a search result creates a Document command only when it changes story truth. The command payload must include source context such as selected Group, selected item, selected range, selected Canvas object, selected position, or empty insertion point.

The MVP1.1 Studio vertical slice implements one concrete background add/search result:

- `Set rainy street background`, which commits `resource.add` if needed followed by `stage.set_background` in the Group resolved from the current insertion target.

If the insertion target is inside a text item, selected structural item, Group whitespace, or an empty Group, the background lands in that Group. If the insertion target is between Groups, Studio first commits `group.create_after` without a text item, then commits `stage.set_background` inside the new stage-only Group.

Resource insertion may be deduplicated when the same resource already exists. Stage changes must not be deduplicated only because the derived stage background already matches the requested background. A creator action to set the same background again still creates a visible `stage_change` item.

## MVP1.1 Same-Group Insertion Contract

`group.insert_item` appends by default. When Studio needs to insert a content item between two existing items in the same Group, the command payload may include `after_item_id`. Document Core inserts the new item immediately after that item and renormalizes the Group's item order.

Example:

```json
{
  "operation": "group.insert_item",
  "payload": {
    "group_id": "group_1",
    "after_item_id": "item_a",
    "item": {
      "kind": "text",
      "item_id": "item_b",
      "text": "Inserted line"
    }
  }
}
```

For an existing same-Group order `item_a`, `item_c`, this produces `item_a`, `item_b`, `item_c`. Preview and Export consume that Document item order directly.

## MVP1.1 Empty Text Item Lifecycle

Empty text items are temporary editing affordances, not authored story content.

Studio may create an empty text item while a creator is focused in the Writing surface, such as after `Alt/Option+Enter`. If that item remains empty and loses focus, Studio commits `group.delete_item` to remove it from the Document unless it is the only editable affordance for an otherwise empty document.

When a focused empty text item receives Backspace, Studio commits `group.delete_item`, renormalizes the remaining item order, and moves editor focus to the previous text item when available, otherwise the next text item, otherwise the Group insertion target. This command deletes only the addressed content item. It must not remove stage changes or other structural items in the Group.

## MVP1 Document Schema

MVP1 uses `taro.document.v0` for fixtures and core tests.

Minimum shape:

```json
{
  "schema_version": "taro.document.v0",
  "document_id": "doc_01",
  "revision": 0,
  "project": {
    "title": "Untitled"
  },
  "defaults": {
    "display_mode_id": "dialogue_bubble"
  },
  "story": {
    "entry_group_id": "group_01",
    "groups": []
  },
  "resources": [],
  "display_modes": [],
  "diagnostics": []
}
```

Minimum Group shape:

```json
{
  "id": "group_01",
  "position_id": "pos_01",
  "items": [],
  "metadata": {}
}
```

Minimum text item shape:

```json
{
  "id": "item_01",
  "kind": "text",
  "order": 0,
  "text": "Mira: The rain stopped.",
  "speaker": "Mira",
  "display_mode_id": "dialogue_bubble",
  "blocking": true
}
```

MVP1 command payloads:

```json
{
  "operation": "group.create_after",
  "payload": {
    "after_group_id": null,
    "group_id": "group_01",
    "position_id": "pos_01",
    "text_item": {
      "item_id": "item_01",
      "text": "Mira: The rain stopped.",
      "speaker": "Mira",
      "display_mode_id": "dialogue_bubble"
    }
  }
}
```

`text_item` is optional. Omitting it creates a valid stage-only, sound-only, wait-only, interaction-only, record-only, or action-only Group that can receive later content items.

```json
{
  "operation": "group.insert_item",
  "payload": {
    "group_id": "group_01",
    "item": {
      "kind": "text",
      "item_id": "item_02",
      "text": "Listen. The city is finally quiet."
    }
  }
}
```

```json
{
  "operation": "text.insert_line_break",
  "payload": {
    "group_id": "group_01",
    "item_id": "item_01",
    "offset": 11
  }
}
```

```json
{
  "operation": "text.set_speaker",
  "payload": {
    "group_id": "group_01",
    "item_id": "item_01",
    "speaker": "Ren"
  }
}
```

```json
{
  "operation": "text.set_display_mode",
  "payload": {
    "group_id": "group_01",
    "item_id": "item_01",
    "display_mode_id": "narration_panel"
  }
}
```

```json
{
  "operation": "resource.add",
  "payload": {
    "resource": {
      "id": "res_bg_rainy_street",
      "kind": "image",
      "path": "assets/rainy-street.png"
    }
  }
}
```

```json
{
  "operation": "stage.set_background",
  "payload": {
    "group_id": "group_01",
    "item_id": "item_bg_01",
    "background_resource_id": "res_bg_rainy_street"
  }
}
```

`stage.set_background` always appends a visible `stage_change` item to the target Group when the command is valid. It must not silently return the unchanged Document only because the current path-derived background is already the requested resource.

MVP1 command validation rejects duplicate Group, item, and resource IDs before mutating the Document.

## Stage Derivation Query

Request:

```json
{
  "query": "stage.derive_state",
  "document_id": "doc_01",
  "position_id": "pos_42",
  "path_context_id": "path_7"
}
```

Response:

```json
{
  "position_id": "pos_42",
  "path_context_id": "path_7",
  "stage_state": {
    "background": "res_bg_rain_street",
    "bgm": "res_bgm_rain_theme",
    "characters": []
  },
  "trace": [
    {
      "item_id": "item_09",
      "operation": "stage.set_background"
    }
  ]
}
```

## Preview Contract

Preview requests describe where simulation starts and which context is used.

Preview modes:

- `current_group`
- `from_position`
- `full_preview`

Deferred Preview mode:

- `path_preview`, once branch path contexts are implemented.

Request:

```json
{
  "mode": "from_position",
  "document_id": "doc_01",
  "position_id": "pos_42"
}
```

Later branch-aware Preview requests add `path_context_id` and `record_overrides`. MVP1 core must not expose those as implemented until the path-context and record-state models are executable.

Preview events:

- `preview.started`
- `group.started`
- `item.started`
- `item.blocked`
- `item.completed`
- `interaction.triggered`
- `action.applied`
- `diagnostic.emitted`
- `preview.completed`

Preview must expose:

- Current Group.
- Current item.
- Current records.
- Current stage state.
- Active path context.
- Source trace for visible behavior.

Preview temporary record overrides affect only the Preview session unless explicitly saved as a named test configuration in a future feature.

## Plugin Contract

Plugin manifest:

```json
{
  "plugin_id": "plugin.phone_chat",
  "name": "Phone Chat",
  "version": "1.0.0",
  "capabilities": [
    {
      "capability_id": "phone_chat.thread",
      "type": "display_mode",
      "triggers": ["reply:selected", "message:long_pressed"],
      "parameters_schema": {}
    }
  ]
}
```

Rules:

- A plugin capability declares triggers.
- Taro binds triggers to visible result actions.
- A plugin may recommend default actions.
- Inserted recommendations must expand into editable Taro bindings.
- A missing plugin creates a placeholder and diagnostic instead of corrupting the Document.

Trigger event:

```json
{
  "capability_instance_id": "cap_17",
  "trigger": "reply:selected",
  "payload": {
    "reply_id": "reply_accept"
  }
}
```

Visible binding:

```json
{
  "trigger": "reply:selected",
  "actions": [
    {
      "type": "record.write",
      "record": "record.reply",
      "value": "accept"
    },
    {
      "type": "jump",
      "target": "pos_accept_branch"
    }
  ]
}
```

## Diagnostics Contract

Diagnostic object:

```json
{
  "code": "STAGE_MERGE_DIFFERENCE",
  "severity": "warning",
  "message": "This merge can render with different backgrounds depending on the path.",
  "source": {
    "position_id": "pos_merge",
    "path_context_ids": ["path_a", "path_b"]
  },
  "surface": ["canvas", "preview"],
  "blocking_export": false,
  "suggested_fix": "Set a unified background at the merge or accept the path difference."
}
```

Severity levels:

- `info`: useful context.
- `warning`: likely issue, export can continue.
- `error`: broken behavior in Preview or export.
- `blocker`: export cannot safely complete.

## Export Contract

Export phases:

1. Validate Document schema.
2. Run diagnostics.
3. Resolve resources.
4. Resolve plugin runtimes.
5. Compile story flow.
6. Package assets.
7. Run smoke preview parity check.

Export result:

```json
{
  "ok": true,
  "artifact_path": "dist/taro-project",
  "diagnostics": [],
  "runtime_manifest": {}
}
```

MVP1 export files include materialized file contents:

```json
{
  "path": "runtime-manifest.json",
  "kind": "json",
  "contents": "{...}"
}
```

MVP Export produces a minimal local playable package for the ordinary VN dialogue loop. It does not require marketplace publishing, cloud hosting, full plugin bundling, or multi-target distribution.

MVP1 local playable manifest:

```json
{
  "format": "taro.local-playable.v0",
  "document_id": "doc_01",
  "entry_group_id": "group_01",
  "preview_trace": [],
  "resources": [],
  "files": [
    "index.html",
    "runtime-manifest.json",
    "document.taro.json"
  ]
}
```

The generated `index.html` embeds the manifest and Document JSON so it can present the ordinary-dialogue Groups locally while preserving the same Preview trace for parity evidence.

Export must fail on:

- Missing required resources.
- Broken jump targets.
- Invalid record references.
- Missing plugin runtimes used by playable content.
- Hidden plugin flow-control bindings.
- Schema migration failure.

## Compatibility Policy

Contract changes require:

- Updating this file.
- Updating affected specs.
- Adding or updating ADRs for major model changes.
- Updating tests that prove Preview and Export parity.
- Updating `CHANGELOG.md`.
