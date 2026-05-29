import { applyDocumentCommand, createMvp1Document } from "@taro/core";
import { describe, expect, test } from "vitest";

import {
  isGroupEmpty,
  resolveBetweenItemsInsertionTarget,
  resolveBetweenGroupsInsertionTarget,
  resolveGroupInsertionTarget,
  resolveTextInsertionTarget
} from "./insertionModel.js";
import {
  createGroupFromText,
  createInitialStudioState,
  insertSameGroupText,
  selectBetweenItemsTarget,
  selectStudioTarget,
  updateTextItem
} from "./studioState.js";

describe("Writing insertion model", () => {
  test("text caret resolves to the current Group and text item", () => {
    const state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");

    expect(
      resolveTextInsertionTarget(state.document, {
        groupId: "group_1",
        itemId: "item_1",
        offset: 1
      })
    ).toEqual({
      kind: "text_caret",
      group_id: "group_1",
      item_id: "item_1",
      offset: 1
    });
  });

  test("Group whitespace resolves to a group-inside target", () => {
    const state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");

    expect(resolveGroupInsertionTarget(state.document, "group_1")).toEqual({
      kind: "group_inside",
      group_id: "group_1"
    });
  });

  test("empty Group resolves to an empty-group target", () => {
    let document = createMvp1Document({ document_id: "doc_empty_group", title: "Empty Group" });
    document = applyDocumentCommand(document, {
      command_id: "cmd_1",
      actor: "user",
      source_surface: "writing",
      document_id: document.document_id,
      operation: "group.create_after",
      expected_revision: document.revision,
      payload: {
        after_group_id: null,
        group_id: "group_empty",
        position_id: "pos_empty"
      }
    }).document;

    expect(isGroupEmpty(document, "group_empty")).toBe(true);
    expect(resolveGroupInsertionTarget(document, "group_empty")).toEqual({
      kind: "empty_group",
      group_id: "group_empty"
    });
  });

  test("between adjacent Groups resolves with before and after Group ids", () => {
    let state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");
    state = createGroupFromText(state, "B");

    expect(resolveBetweenGroupsInsertionTarget(state.document, "group_1", "group_2")).toEqual({
      kind: "between_groups",
      before_group_id: "group_1",
      after_group_id: "group_2"
    });
  });

  test("between same-Group text items resolves with neighboring item ids", () => {
    let state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");
    state = insertSameGroupText(state, "C");
    const [, itemC] = state.document.story.groups[0]!.items;

    expect(resolveBetweenItemsInsertionTarget(state.document, "group_1", "item_1", itemC!.id)).toEqual({
      kind: "between_items",
      group_id: "group_1",
      before_item_id: "item_1",
      after_item_id: itemC!.id
    });
  });

  test("same-Group insertion can target the gap between two text items", () => {
    let state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");
    state = insertSameGroupText(state, "C");
    const [, itemC] = state.document.story.groups[0]!.items;
    state = selectBetweenItemsTarget(state, "group_1", "item_1", itemC!.id);

    expect(state.insertionTarget).toEqual({
      kind: "between_items",
      group_id: "group_1",
      before_item_id: "item_1",
      after_item_id: itemC!.id
    });

    state = insertSameGroupText(state, "B");

    expect(
      state.document.story.groups[0]?.items.map((item) => (item.kind === "text" ? item.text : item.kind))
    ).toEqual(["A", "B", "C"]);
  });

  test("selection changes do not mutate document revision", () => {
    const state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");
    const selected = selectStudioTarget(state, "group_1", "item_1");

    expect(selected.document.revision).toBe(state.document.revision);
    expect(selected.document).toBe(state.document);
  });
});
