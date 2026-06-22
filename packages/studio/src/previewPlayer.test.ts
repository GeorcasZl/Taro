import { applyDocumentCommand, createMvp1Document, type TaroDocument } from "@taro/core";
import { describe, expect, test } from "vitest";

import {
  buildPreviewPlayerView,
  getNextPreviewGroupId,
  getRestartPreviewGroupId
} from "./previewPlayer.js";

describe("Studio Preview player view model", () => {
  test("shows current Group text and source trace", () => {
    const document = createTwoGroupDocument();

    const view = buildPreviewPlayerView(document, {
      currentGroupId: "group_1",
      startGroupId: "group_1"
    });

    expect(view.currentGroupId).toBe("group_1");
    expect(view.positionId).toBe("pos_1");
    expect(view.textItems).toEqual([{ itemId: "item_1", text: "A" }]);
    expect(view.trace.current_group_id).toBe("group_1");
    expect(view.trace.item_ids).toEqual(["item_1"]);
  });

  test("inherits stage state from earlier Groups and reports its source", () => {
    const document = createStageThenDialogueDocument();

    const view = buildPreviewPlayerView(document, {
      currentGroupId: "group_2",
      startGroupId: "group_2"
    });

    expect(view.backgroundLabel).toBe("Rainy street");
    expect(view.trace.stage_source).toEqual({
      group_id: "group_stage",
      item_id: "item_bg"
    });
  });

  test("advances and restarts without changing the Document", () => {
    const document = createTwoGroupDocument();

    expect(getNextPreviewGroupId(document, "group_1")).toBe("group_2");
    expect(getRestartPreviewGroupId({ currentGroupId: "group_2", startGroupId: "group_1" })).toBe(
      "group_1"
    );
    expect(document.revision).toBe(2);
  });
});

function createTwoGroupDocument(): TaroDocument {
  let document = createMvp1Document({ document_id: "doc_preview_two_groups", title: "Preview" });
  document = applyDocumentCommand(document, {
    command_id: "cmd_1",
    actor: "user",
    source_surface: "writing",
    document_id: document.document_id,
    operation: "group.create_after",
    expected_revision: document.revision,
    payload: {
      after_group_id: null,
      group_id: "group_1",
      position_id: "pos_1",
      text_item: { item_id: "item_1", text: "A" }
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_2",
    actor: "user",
    source_surface: "writing",
    document_id: document.document_id,
    operation: "group.create_after",
    expected_revision: document.revision,
    payload: {
      after_group_id: "group_1",
      group_id: "group_2",
      position_id: "pos_2",
      text_item: { item_id: "item_2", text: "B" }
    }
  }).document;
  return document;
}

function createStageThenDialogueDocument(): TaroDocument {
  let document = createMvp1Document({ document_id: "doc_preview_stage", title: "Preview Stage" });
  document = applyDocumentCommand(document, {
    command_id: "cmd_1",
    actor: "user",
    source_surface: "writing",
    document_id: document.document_id,
    operation: "group.create_after",
    expected_revision: document.revision,
    payload: {
      after_group_id: null,
      group_id: "group_stage",
      position_id: "pos_stage"
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_2",
    actor: "user",
    source_surface: "canvas",
    document_id: document.document_id,
    operation: "resource.add",
    expected_revision: document.revision,
    payload: {
      resource: { id: "res_bg_rainy_street", kind: "image", path: "assets/rainy-street.png" }
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_3",
    actor: "user",
    source_surface: "canvas",
    document_id: document.document_id,
    operation: "stage.set_background",
    expected_revision: document.revision,
    payload: {
      group_id: "group_stage",
      item_id: "item_bg",
      background_resource_id: "res_bg_rainy_street"
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_4",
    actor: "user",
    source_surface: "writing",
    document_id: document.document_id,
    operation: "group.create_after",
    expected_revision: document.revision,
    payload: {
      after_group_id: "group_stage",
      group_id: "group_2",
      position_id: "pos_2",
      text_item: { item_id: "item_2", text: "B" }
    }
  }).document;
  return document;
}
