import { describe, expect, test } from "vitest";

import {
  cleanupEmptyTextItem,
  createGroupFromText,
  createInitialStudioState,
  deleteFocusedEmptyTextItem,
  insertRainyStreetBackgroundGroupAfterCurrent,
  insertSameGroupText,
  selectStudioTarget,
  setRainyStreetBackground,
  setTextCaretTarget,
  updateTextItem
} from "./studioState.js";

describe("Studio editor state", () => {
  test("selection changes do not mutate the Document", () => {
    const state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");
    const selected = selectStudioTarget(state, "group_1", "item_1");

    expect(selected.selectedGroupId).toBe("group_1");
    expect(selected.selectedItemId).toBe("item_1");
    expect(selected.document).toBe(state.document);
    expect(selected.document.revision).toBe(state.document.revision);
    expect(selected.commandIndex).toBe(state.commandIndex);
  });

  test("setting the same background again creates a visible stage_change item without duplicating the resource", () => {
    let state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");

    state = setRainyStreetBackground(state);
    state = setRainyStreetBackground(state);

    const group = state.document.story.groups[0];
    const stageChanges = group?.items.filter((item) => item.kind === "stage_change");
    expect(stageChanges).toHaveLength(2);
    expect(new Set(stageChanges?.map((item) => item.id)).size).toBe(2);
    expect(
      state.document.resources.filter((resource) => resource.id === "res_bg_rainy_street")
    ).toHaveLength(1);
  });

  test("rainy street background can be inserted as a new stage-only Group after the current Group", () => {
    let state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");
    state = createGroupFromText(state, "B");
    state = selectStudioTarget(state, "group_1");

    state = insertRainyStreetBackgroundGroupAfterCurrent(state);

    expect(state.document.story.groups.map((group) => group.id)).toEqual([
      "group_1",
      "group_3",
      "group_2"
    ]);
    expect(state.selectedGroupId).toBe("group_3");
    const stageItem = state.document.story.groups[1]?.items[0];
    expect(state.selectedItemId).toBe(stageItem?.id);
    expect(stageItem).toMatchObject({
      kind: "stage_change",
      order: 0,
      blocking: false,
      background_resource_id: "res_bg_rainy_street"
    });
    expect(
      state.document.resources.filter((resource) => resource.id === "res_bg_rainy_street")
    ).toHaveLength(1);
  });

  test("same-Group insertion after a focused text item preserves item order", () => {
    let state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");
    state = insertSameGroupText(state, "C");
    state = setTextCaretTarget(state, "group_1", "item_1", 1);

    state = insertSameGroupText(state, "B");

    expect(
      state.document.story.groups[0]?.items.map((item) => (item.kind === "text" ? item.text : item.kind))
    ).toEqual(["A", "B", "C"]);
  });

  test("empty same-Group text item is removed on blur without removing structural items", () => {
    let state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");
    state = insertSameGroupText(state, "");
    const emptyItemId = state.selectedItemId;
    state = setRainyStreetBackground(state);

    state = cleanupEmptyTextItem(state, "group_1", emptyItemId!);

    const group = state.document.story.groups[0];
    expect(group?.items.map((item) => (item.kind === "text" ? item.text : item.kind))).toEqual([
      "A",
      "stage_change"
    ]);
    expect(state.selectedGroupId).toBe("group_1");
    expect(state.selectedItemId).not.toBe(emptyItemId);
  });

  test("Backspace deletes focused empty text item and moves focus to a neighbor", () => {
    let state = updateTextItem(createInitialStudioState(), "group_1", "item_1", "A");
    state = insertSameGroupText(state, "");
    const emptyItemId = state.selectedItemId;
    state = insertSameGroupText(state, "C");
    state = setTextCaretTarget(state, "group_1", emptyItemId!, 0);

    state = deleteFocusedEmptyTextItem(state, "group_1", emptyItemId!);

    expect(
      state.document.story.groups[0]?.items.map((item) => (item.kind === "text" ? item.text : item.kind))
    ).toEqual(["A", "C"]);
    expect(state.insertionTarget).toEqual({
      kind: "text_caret",
      group_id: "group_1",
      item_id: "item_1",
      offset: 1
    });
  });
});
