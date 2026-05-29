import { describe, expect, test } from "vitest";
import { readFileSync } from "node:fs";

import {
  applyDocumentCommand,
  buildLocalExportPackage,
  createMvp1Document,
  deriveLinearStageState,
  previewDocument,
  validateDocumentForExport,
  type TaroDocument
} from "./index.js";

const fixtureUrl = new URL("../../../fixtures/mvp1/ordinary-dialogue/document.taro.json", import.meta.url);
const expectedPreviewUrl = new URL(
  "../../../fixtures/mvp1/ordinary-dialogue/expected/preview-trace.json",
  import.meta.url
);
const expectedExportUrl = new URL(
  "../../../fixtures/mvp1/ordinary-dialogue/expected/export-manifest.json",
  import.meta.url
);

function readJson<T>(url: URL): T {
  return JSON.parse(readFileSync(url, "utf8")) as T;
}

describe("MVP1 document foundation", () => {
  test("creates new Groups for player advances and inserts same-Group text explicitly", () => {
    let document = createMvp1Document({
      document_id: "doc_mvp1",
      title: "Ordinary Dialogue"
    });

    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_mvp1",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: {
          item_id: "item_intro_1",
          text: "Mira: The rain stopped.",
          speaker: "Mira",
          display_mode_id: "dialogue_bubble"
        }
      }
    }).document;

    const insertResult = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_mvp1",
      operation: "group.insert_item",
      expected_revision: 1,
      payload: {
        group_id: "group_intro",
        item: {
          kind: "text",
          item_id: "item_intro_2",
          text: "Listen. The city is finally quiet."
        }
      }
    });
    document = insertResult.document;

    expect(insertResult.patch).toEqual([
      {
        op: "add",
        path: "/story/groups/0/items/1",
        value: {
          id: "item_intro_2",
          kind: "text",
          order: 1,
          text: "Listen. The city is finally quiet.",
          speaker: "Mira",
          display_mode_id: "dialogue_bubble",
          blocking: true
        }
      }
    ]);

    document = applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_mvp1",
      operation: "group.create_after",
      expected_revision: 2,
      payload: {
        after_group_id: "group_intro",
        group_id: "group_reply",
        position_id: "pos_reply",
        text_item: {
          item_id: "item_reply_1",
          text: "Ren: Quiet never lasts here.",
          speaker: "Ren",
          display_mode_id: "dialogue_bubble"
        }
      }
    }).document;

    expect(document.revision).toBe(3);
    expect(document.story.entry_group_id).toBe("group_intro");
    expect(document.story.groups.map((group) => group.id)).toEqual(["group_intro", "group_reply"]);
    expect(document.story.groups[0]?.items.map((item) => item.id)).toEqual([
      "item_intro_1",
      "item_intro_2"
    ]);

    const insertedItem = document.story.groups[0]?.items[1];
    expect(insertedItem).toMatchObject({
      kind: "text",
      speaker: "Mira",
      display_mode_id: "dialogue_bubble"
    });
  });

  test("text commands update speaker, display mode, and line breaks without changing Group identity", () => {
    let document = createMvp1Document({
      document_id: "doc_text_commands",
      title: "Text Commands"
    });

    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_text_commands",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: {
          item_id: "item_intro",
          text: "Mira: First line.",
          speaker: "Mira",
          display_mode_id: "dialogue_bubble"
        }
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_text_commands",
      operation: "text.insert_line_break",
      expected_revision: 1,
      payload: {
        group_id: "group_intro",
        item_id: "item_intro",
        offset: "Mira: First".length
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_text_commands",
      operation: "text.set_speaker",
      expected_revision: 2,
      payload: {
        group_id: "group_intro",
        item_id: "item_intro",
        speaker: "Ren"
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_4",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_text_commands",
      operation: "text.set_display_mode",
      expected_revision: 3,
      payload: {
        group_id: "group_intro",
        item_id: "item_intro",
        display_mode_id: "narration_panel"
      }
    }).document;

    const [group] = document.story.groups;
    expect(group?.id).toBe("group_intro");
    expect(group?.items).toHaveLength(1);
    expect(group?.items[0]).toMatchObject({
      kind: "text",
      text: "Mira: First\n line.",
      speaker: "Ren",
      display_mode_id: "narration_panel"
    });
  });

  test("group.insert_item can insert between existing same-Group text items", () => {
    let document = createMvp1Document({
      document_id: "doc_between_items",
      title: "Between Items"
    });

    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_between_items",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: { item_id: "item_a", text: "A" }
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_between_items",
      operation: "group.insert_item",
      expected_revision: 1,
      payload: {
        group_id: "group_intro",
        item: { kind: "text", item_id: "item_c", text: "C" }
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_between_items",
      operation: "group.insert_item",
      expected_revision: 2,
      payload: {
        group_id: "group_intro",
        after_item_id: "item_a",
        item: { kind: "text", item_id: "item_b", text: "B" }
      }
    }).document;

    const group = document.story.groups[0];
    expect(group?.items.map((item) => item.id)).toEqual(["item_a", "item_b", "item_c"]);
    expect(group?.items.map((item) => item.order)).toEqual([0, 1, 2]);
  });

  test("group.delete_item removes a text item and preserves structural items", () => {
    let document = createMvp1Document({
      document_id: "doc_delete_item",
      title: "Delete Item"
    });

    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_delete_item",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: { item_id: "item_a", text: "A" }
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_delete_item",
      operation: "group.insert_item",
      expected_revision: 1,
      payload: {
        group_id: "group_intro",
        item: { kind: "text", item_id: "item_empty", text: "" }
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_delete_item",
      operation: "stage.set_background",
      expected_revision: 2,
      payload: {
        group_id: "group_intro",
        item_id: "item_stage",
        background_resource_id: "res_bg_rainy_street"
      }
    }).document;

    const result = applyDocumentCommand(document, {
      command_id: "cmd_4",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_delete_item",
      operation: "group.delete_item",
      expected_revision: 3,
      payload: {
        group_id: "group_intro",
        item_id: "item_empty"
      }
    });

    const group = result.document.story.groups[0];
    expect(group?.items.map((item) => item.id)).toEqual(["item_a", "item_stage"]);
    expect(group?.items.map((item) => item.order)).toEqual([0, 1]);
    expect(group?.items[1]).toMatchObject({ kind: "stage_change" });
    expect(result.patch).toEqual([
      {
        op: "remove",
        path: "/story/groups/0/items/1"
      }
    ]);
  });

  test("document commands reject duplicate Group and item IDs", () => {
    let document = createMvp1Document({
      document_id: "doc_duplicates",
      title: "Duplicates"
    });
    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_duplicates",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: { item_id: "item_intro", text: "Hello." }
      }
    }).document;

    expect(() =>
      applyDocumentCommand(document, {
        command_id: "cmd_2",
        actor: "user",
        source_surface: "writing",
        document_id: "doc_duplicates",
        operation: "group.create_after",
        expected_revision: 1,
        payload: {
          after_group_id: "group_intro",
          group_id: "group_intro",
          position_id: "pos_repeat"
        }
      })
    ).toThrow("Group group_intro already exists.");

    expect(() =>
      applyDocumentCommand(document, {
        command_id: "cmd_3",
        actor: "user",
        source_surface: "writing",
        document_id: "doc_duplicates",
        operation: "group.insert_item",
        expected_revision: 1,
        payload: {
          group_id: "group_intro",
          item: { kind: "text", item_id: "item_intro", text: "Again." }
        }
      })
    ).toThrow("Item item_intro already exists.");
  });

  test("resource.add and stage.set_background support the MVP1 Canvas edit", () => {
    let document = createMvp1Document({
      document_id: "doc_canvas",
      title: "Canvas Edit"
    });
    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_canvas",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: { item_id: "item_intro", text: "Mira: Rain again." }
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_canvas",
      operation: "resource.add",
      expected_revision: 1,
      payload: {
        resource: {
          id: "res_bg_rain_street",
          kind: "image",
          path: "assets/rain-street.png"
        }
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_canvas",
      operation: "stage.set_background",
      expected_revision: 2,
      payload: {
        group_id: "group_intro",
        item_id: "item_bg",
        background_resource_id: "res_bg_rain_street"
      }
    }).document;

    expect(document.resources).toEqual([
      { id: "res_bg_rain_street", kind: "image", path: "assets/rain-street.png" }
    ]);
    expect(document.story.groups[0]?.items[1]).toMatchObject({
      id: "item_bg",
      kind: "stage_change",
      background_resource_id: "res_bg_rain_street"
    });
    expect(validateDocumentForExport(document)).toEqual([]);
  });

  test("linear stage state inherits previous backgrounds and allows later overrides", () => {
    let document = createMvp1Document({
      document_id: "doc_linear_stage",
      title: "Linear Stage"
    });
    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_linear_stage",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: { item_id: "item_intro", text: "A" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_linear_stage",
      operation: "group.create_after",
      expected_revision: 1,
      payload: {
        after_group_id: "group_intro",
        group_id: "group_reply",
        position_id: "pos_reply",
        text_item: { item_id: "item_reply", text: "B" }
      }
    }).document;

    expect(deriveLinearStageState(document, { group_id: "group_reply" })).toEqual({});

    document = applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_linear_stage",
      operation: "resource.add",
      expected_revision: 2,
      payload: {
        resource: { id: "res_bg_rainy_street", kind: "image", path: "assets/rainy-street.png" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_4",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_linear_stage",
      operation: "stage.set_background",
      expected_revision: 3,
      payload: {
        group_id: "group_intro",
        item_id: "item_bg_intro",
        background_resource_id: "res_bg_rainy_street"
      }
    }).document;

    expect(deriveLinearStageState(document, { group_id: "group_reply" })).toEqual({
      background_resource_id: "res_bg_rainy_street"
    });

    document = applyDocumentCommand(document, {
      command_id: "cmd_5",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_linear_stage",
      operation: "resource.add",
      expected_revision: 4,
      payload: {
        resource: { id: "res_bg_sunset_roof", kind: "image", path: "assets/sunset-roof.png" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_6",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_linear_stage",
      operation: "stage.set_background",
      expected_revision: 5,
      payload: {
        group_id: "group_reply",
        item_id: "item_bg_reply",
        background_resource_id: "res_bg_sunset_roof"
      }
    }).document;

    expect(deriveLinearStageState(document, { group_id: "group_reply" })).toEqual({
      background_resource_id: "res_bg_sunset_roof"
    });
  });

  test("stage_change can be inserted as a new stage-only Group after the current Group", () => {
    let document = createMvp1Document({
      document_id: "doc_stage_only_group",
      title: "Stage Only Group"
    });
    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_stage_only_group",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: { item_id: "item_intro", text: "A" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_stage_only_group",
      operation: "resource.add",
      expected_revision: 1,
      payload: {
        resource: { id: "res_bg_rainy_street", kind: "image", path: "assets/rainy-street.png" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_stage_only_group",
      operation: "group.create_after",
      expected_revision: 2,
      payload: {
        after_group_id: "group_intro",
        group_id: "group_stage",
        position_id: "pos_stage"
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_4",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_stage_only_group",
      operation: "stage.set_background",
      expected_revision: 3,
      payload: {
        group_id: "group_stage",
        item_id: "item_bg_stage",
        background_resource_id: "res_bg_rainy_street"
      }
    }).document;

    expect(document.story.groups.map((group) => group.id)).toEqual(["group_intro", "group_stage"]);
    expect(document.story.groups[1]?.items).toEqual([
      {
        id: "item_bg_stage",
        kind: "stage_change",
        order: 0,
        blocking: false,
        background_resource_id: "res_bg_rainy_street"
      }
    ]);
    expect(validateDocumentForExport(document)).toEqual([]);
  });

  test("stage-only Group participates in linear stage state continuation", () => {
    let document = createMvp1Document({
      document_id: "doc_stage_only_continuation",
      title: "Stage Only Continuation"
    });
    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_stage_only_continuation",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: { item_id: "item_intro", text: "A" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_stage_only_continuation",
      operation: "group.create_after",
      expected_revision: 1,
      payload: {
        after_group_id: "group_intro",
        group_id: "group_reply",
        position_id: "pos_reply",
        text_item: { item_id: "item_reply", text: "B" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_stage_only_continuation",
      operation: "resource.add",
      expected_revision: 2,
      payload: {
        resource: { id: "res_bg_rainy_street", kind: "image", path: "assets/rainy-street.png" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_4",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_stage_only_continuation",
      operation: "group.create_after",
      expected_revision: 3,
      payload: {
        after_group_id: "group_intro",
        group_id: "group_stage",
        position_id: "pos_stage"
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_5",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_stage_only_continuation",
      operation: "stage.set_background",
      expected_revision: 4,
      payload: {
        group_id: "group_stage",
        item_id: "item_bg_stage",
        background_resource_id: "res_bg_rainy_street"
      }
    }).document;

    expect(document.story.groups.map((group) => group.id)).toEqual([
      "group_intro",
      "group_stage",
      "group_reply"
    ]);
    expect(deriveLinearStageState(document, { group_id: "group_reply" })).toEqual({
      background_resource_id: "res_bg_rainy_street"
    });
    expect(previewDocument(document, { mode: "full_preview" }).events).toContainEqual({
      type: "item.started",
      group_id: "group_stage",
      item_id: "item_bg_stage",
      kind: "stage_change"
    });
  });

  test("linear stage state starts at the entry Group", () => {
    let document = createMvp1Document({
      document_id: "doc_entry_stage",
      title: "Entry Stage"
    });
    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_entry_stage",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_prelude",
        position_id: "pos_prelude",
        text_item: { item_id: "item_prelude", text: "Prelude" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_entry_stage",
      operation: "group.create_after",
      expected_revision: 1,
      payload: {
        after_group_id: "group_prelude",
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: { item_id: "item_intro", text: "A" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_entry_stage",
      operation: "group.create_after",
      expected_revision: 2,
      payload: {
        after_group_id: "group_intro",
        group_id: "group_reply",
        position_id: "pos_reply",
        text_item: { item_id: "item_reply", text: "B" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_4",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_entry_stage",
      operation: "resource.add",
      expected_revision: 3,
      payload: {
        resource: { id: "res_bg_prelude", kind: "image", path: "assets/prelude.png" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_5",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_entry_stage",
      operation: "stage.set_background",
      expected_revision: 4,
      payload: {
        group_id: "group_prelude",
        item_id: "item_bg_prelude",
        background_resource_id: "res_bg_prelude"
      }
    }).document;

    document = {
      ...document,
      story: {
        ...document.story,
        entry_group_id: "group_intro"
      }
    };

    expect(deriveLinearStageState(document, { group_id: "group_reply" })).toEqual({});
  });

  test("local playable inherits background while advancing through later Groups", () => {
    let document = createMvp1Document({
      document_id: "doc_playable_stage",
      title: "Playable Stage"
    });
    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_playable_stage",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: { item_id: "item_intro", text: "A" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_playable_stage",
      operation: "group.create_after",
      expected_revision: 1,
      payload: {
        after_group_id: "group_intro",
        group_id: "group_reply",
        position_id: "pos_reply",
        text_item: { item_id: "item_reply", text: "B" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_playable_stage",
      operation: "resource.add",
      expected_revision: 2,
      payload: {
        resource: { id: "res_bg_rainy_street", kind: "image", path: "assets/rainy-street.png" }
      }
    }).document;
    document = applyDocumentCommand(document, {
      command_id: "cmd_4",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_playable_stage",
      operation: "stage.set_background",
      expected_revision: 3,
      payload: {
        group_id: "group_intro",
        item_id: "item_bg_intro",
        background_resource_id: "res_bg_rainy_street"
      }
    }).document;

    const exported = buildLocalExportPackage(document, { artifact_path: "dist/playable-stage" });
    const html = exported.files.find((file) => file.path === "index.html")?.contents;

    expect(html).toContain("function deriveStageStateForIndex");
    expect(html).toContain("const entryIndex");
    expect(html).toContain("Background: \" + stageState.background_resource_id");
  });

  test("preview trace and local export package share the same Group semantics", () => {
    const document = readJson<TaroDocument>(fixtureUrl);
    const expectedPreview = readJson<ReturnType<typeof previewDocument>>(expectedPreviewUrl);
    const expectedExport = readJson<ReturnType<typeof buildLocalExportPackage>["runtime_manifest"]>(
      expectedExportUrl
    );

    const preview = previewDocument(document, { mode: "full_preview" });
    const exported = buildLocalExportPackage(document, {
      artifact_path: "dist/mvp1-dialogue"
    });

    expect(preview).toEqual(expectedPreview);
    expect(exported.ok).toBe(true);
    expect(exported.runtime_manifest).toEqual(expectedExport);
    expect(exported.runtime_manifest.preview_trace).toEqual(preview.events);
    expect(exported.files).toEqual([
      {
        path: "index.html",
        kind: "html",
        contents: expect.stringContaining("taro.local-playable.v0")
      },
      {
        path: "runtime-manifest.json",
        kind: "json",
        contents: JSON.stringify(expectedExport, null, 2)
      },
      {
        path: "document.taro.json",
        kind: "json",
        contents: JSON.stringify(document, null, 2)
      }
    ]);
  });

  test("export diagnostics identify broken jump targets with source locations", () => {
    let document = createMvp1Document({
      document_id: "doc_broken_jump",
      title: "Broken Jump"
    });

    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_broken_jump",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro"
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_broken_jump",
      operation: "group.insert_item",
      expected_revision: 1,
      payload: {
        group_id: "group_intro",
        item: {
          kind: "jump",
          item_id: "item_jump_missing",
          target_position_id: "pos_missing"
        }
      }
    }).document;

    expect(validateDocumentForExport(document)).toEqual([
      {
        code: "BROKEN_JUMP_TARGET",
        severity: "blocker",
        message: "Jump target pos_missing does not exist.",
        source: {
          group_id: "group_intro",
          item_id: "item_jump_missing",
          position_id: "pos_intro"
        },
        surface: ["writing", "preview", "export"],
        blocking_export: true,
        suggested_fix: "Choose an existing target position or create the missing target."
      }
    ]);
  });

  test("preview follows the entry Group and terminal jumps instead of raw array order", () => {
    const document = createMvp1Document({
      document_id: "doc_jump",
      title: "Jump Flow"
    });

    const withSkipped = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_jump",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_skipped",
        position_id: "pos_skipped",
        text_item: {
          item_id: "item_skipped",
          text: "This should not play from entry."
        }
      }
    }).document;

    const withIntro = applyDocumentCommand(withSkipped, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_jump",
      operation: "group.create_after",
      expected_revision: 1,
      payload: {
        after_group_id: "group_skipped",
        group_id: "group_intro",
        position_id: "pos_intro",
        text_item: {
          item_id: "item_intro",
          text: "Mira: We leave now."
        }
      }
    }).document;

    const withJump = applyDocumentCommand(withIntro, {
      command_id: "cmd_3",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_jump",
      operation: "group.insert_item",
      expected_revision: 2,
      payload: {
        group_id: "group_intro",
        item: {
          kind: "jump",
          item_id: "item_jump",
          target_position_id: "pos_ending"
        }
      }
    }).document;

    const withPostJumpText = applyDocumentCommand(withJump, {
      command_id: "cmd_4",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_jump",
      operation: "group.insert_item",
      expected_revision: 3,
      payload: {
        group_id: "group_intro",
        item: {
          kind: "text",
          item_id: "item_after_jump",
          text: "This line is after a terminal jump."
        }
      }
    }).document;

    const withEnding = applyDocumentCommand(withPostJumpText, {
      command_id: "cmd_5",
      actor: "user",
      source_surface: "writing",
      document_id: "doc_jump",
      operation: "group.create_after",
      expected_revision: 4,
      payload: {
        after_group_id: "group_intro",
        group_id: "group_ending",
        position_id: "pos_ending",
        text_item: {
          item_id: "item_ending",
          text: "Ren: Then go."
        }
      }
    }).document;

    const playableDocument: TaroDocument = {
      ...withEnding,
      story: {
        ...withEnding.story,
        entry_group_id: "group_intro"
      }
    };

    expect(previewDocument(playableDocument, { mode: "full_preview" }).events).toEqual([
      {
        type: "preview.started",
        group_id: "group_intro",
        position_id: "pos_intro"
      },
      {
        type: "group.started",
        group_id: "group_intro",
        position_id: "pos_intro"
      },
      {
        type: "item.started",
        group_id: "group_intro",
        item_id: "item_intro",
        kind: "text"
      },
      {
        type: "item.completed",
        group_id: "group_intro",
        item_id: "item_intro",
        kind: "text"
      },
      {
        type: "item.started",
        group_id: "group_intro",
        item_id: "item_jump",
        kind: "jump"
      },
      {
        type: "item.completed",
        group_id: "group_intro",
        item_id: "item_jump",
        kind: "jump"
      },
      {
        type: "group.completed",
        group_id: "group_intro",
        position_id: "pos_intro"
      },
      {
        type: "group.started",
        group_id: "group_ending",
        position_id: "pos_ending"
      },
      {
        type: "item.started",
        group_id: "group_ending",
        item_id: "item_ending",
        kind: "text"
      },
      {
        type: "item.completed",
        group_id: "group_ending",
        item_id: "item_ending",
        kind: "text"
      },
      {
        type: "group.completed",
        group_id: "group_ending",
        position_id: "pos_ending"
      },
      {
        type: "preview.completed",
        group_id: "group_ending",
        position_id: "pos_ending"
      }
    ]);
  });

  test("export diagnostics block missing resources and invalid schema versions", () => {
    let document = createMvp1Document({
      document_id: "doc_missing_resource",
      title: "Missing Resource"
    });

    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_missing_resource",
      operation: "group.create_after",
      expected_revision: 0,
      payload: {
        after_group_id: null,
        group_id: "group_intro",
        position_id: "pos_intro"
      }
    }).document;

    document = applyDocumentCommand(document, {
      command_id: "cmd_2",
      actor: "user",
      source_surface: "canvas",
      document_id: "doc_missing_resource",
      operation: "group.insert_item",
      expected_revision: 1,
      payload: {
        group_id: "group_intro",
        item: {
          kind: "stage_change",
          item_id: "item_bg",
          background_resource_id: "res_missing_bg"
        }
      }
    }).document;

    const invalidSchema = {
      ...document,
      schema_version: "taro.document.future"
    } as unknown as TaroDocument;

    expect(buildLocalExportPackage(invalidSchema, { artifact_path: "dist/broken" })).toMatchObject({
      ok: false,
      diagnostics: [
        {
          code: "INVALID_DOCUMENT_SCHEMA",
          severity: "blocker",
          message: "Document schema taro.document.future is not supported by MVP1.",
          source: {},
          surface: ["writing", "preview", "export"],
          blocking_export: true,
          suggested_fix: "Migrate the document to taro.document.v0 before exporting."
        },
        {
          code: "MISSING_RESOURCE",
          severity: "blocker",
          message: "Resource res_missing_bg is referenced but not defined.",
          source: {
            group_id: "group_intro",
            item_id: "item_bg",
            position_id: "pos_intro",
            resource_id: "res_missing_bg"
          },
          surface: ["canvas", "preview", "export"],
          blocking_export: true,
          suggested_fix: "Add the missing resource or choose an existing resource."
        }
      ]
    });
  });
});
