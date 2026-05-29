import {
  applyDocumentCommand,
  createMvp1Document,
  deriveLinearStageState,
  type Group,
  type TaroDocument
} from "@taro/core";
import {
  resolveGroupInsertionTarget,
  resolveBetweenGroupsInsertionTarget,
  resolveBetweenItemsInsertionTarget,
  resolveTextInsertionTarget,
  type WritingInsertionTarget
} from "./insertionModel.js";

export interface StudioState {
  document: TaroDocument;
  insertionTarget: WritingInsertionTarget | null;
  selectedGroupId: string | null;
  selectedItemId: string | null;
  commandIndex: number;
}

export function createInitialStudioState(): StudioState {
  const emptyDocument = createMvp1Document({ document_id: "doc_studio", title: "Untitled" });
  const result = applyDocumentCommand(emptyDocument, {
    command_id: "cmd_1",
    actor: "user",
    source_surface: "writing",
    document_id: emptyDocument.document_id,
    operation: "group.create_after",
    expected_revision: emptyDocument.revision,
    payload: {
      after_group_id: null,
      group_id: "group_1",
      position_id: "pos_1",
      text_item: { item_id: "item_1", text: "" }
    }
  });

  return {
    document: result.document,
    insertionTarget: { kind: "text_caret", group_id: "group_1", item_id: "item_1", offset: 0 },
    selectedGroupId: "group_1",
    selectedItemId: "item_1",
    commandIndex: 1
  };
}

export function nextCommandId(state: StudioState): string {
  return `cmd_${state.commandIndex + 1}`;
}

export function commitDocument(state: StudioState, document: TaroDocument): StudioState {
  return {
    ...state,
    document,
    commandIndex: state.commandIndex + 1
  };
}

export function createGroupFromText(state: StudioState, text: string): StudioState {
  const afterGroupId = getGroupCreationAnchor(state);
  const groupId = nextGroupId(state.document);
  const itemId = nextItemId(state);
  const result = applyDocumentCommand(state.document, {
    command_id: nextCommandId(state),
    actor: "user",
    source_surface: "writing",
    document_id: state.document.document_id,
    operation: "group.create_after",
    expected_revision: state.document.revision,
    payload: {
      after_group_id: afterGroupId,
      group_id: groupId,
      position_id: nextPositionId(state.document),
      text_item: { item_id: itemId, text }
    }
  });

  return {
    ...commitDocument(state, result.document),
    insertionTarget: {
      kind: "text_caret",
      group_id: groupId,
      item_id: itemId,
      offset: text.length
    },
    selectedGroupId: groupId,
    selectedItemId: itemId
  };
}

export function createEmptyGroupAtInsertionTarget(state: StudioState): StudioState {
  const afterGroupId = getGroupCreationAnchor(state);
  const groupId = nextGroupId(state.document);
  const result = applyDocumentCommand(state.document, {
    command_id: nextCommandId(state),
    actor: "user",
    source_surface: "writing",
    document_id: state.document.document_id,
    operation: "group.create_after",
    expected_revision: state.document.revision,
    payload: {
      after_group_id: afterGroupId,
      group_id: groupId,
      position_id: nextPositionId(state.document)
    }
  });

  return {
    ...commitDocument(state, result.document),
    insertionTarget: { kind: "empty_group", group_id: groupId },
    selectedGroupId: groupId,
    selectedItemId: null
  };
}

export function insertSameGroupText(state: StudioState, text: string): StudioState {
  const groupId = getCurrentGroupId(state);
  if (!groupId) {
    return state;
  }

  const itemId = nextItemId(state);
  const result = applyDocumentCommand(state.document, {
    command_id: nextCommandId(state),
    actor: "user",
    source_surface: "writing",
    document_id: state.document.document_id,
    operation: "group.insert_item",
    expected_revision: state.document.revision,
    payload: {
      group_id: groupId,
      ...getSameGroupAfterItemPayload(state),
      item: { kind: "text", item_id: itemId, text }
    }
  });

  return {
    ...commitDocument(state, result.document),
    insertionTarget: {
      kind: "text_caret",
      group_id: groupId,
      item_id: itemId,
      offset: text.length
    },
    selectedGroupId: groupId,
    selectedItemId: itemId
  };
}

export function insertTextAtInsertionTarget(state: StudioState, text: string): StudioState {
  if (state.insertionTarget?.kind === "between_groups" || !getCurrentGroupId(state)) {
    return createGroupFromText(state, text);
  }

  return insertSameGroupText(state, text);
}

export function updateTextItem(
  state: StudioState,
  groupId: string,
  itemId: string,
  text: string,
  offset = text.length
): StudioState {
  const result = applyDocumentCommand(state.document, {
    command_id: nextCommandId(state),
    actor: "user",
    source_surface: "writing",
    document_id: state.document.document_id,
    operation: "text.update",
    expected_revision: state.document.revision,
    payload: {
      group_id: groupId,
      item_id: itemId,
      text
    }
  });

  return {
    ...commitDocument(state, result.document),
    insertionTarget: { kind: "text_caret", group_id: groupId, item_id: itemId, offset },
    selectedGroupId: groupId,
    selectedItemId: itemId
  };
}

export function insertLineBreakAtTextCaret(
  state: StudioState,
  groupId: string,
  itemId: string,
  offset: number
): StudioState {
  const result = applyDocumentCommand(state.document, {
    command_id: nextCommandId(state),
    actor: "user",
    source_surface: "writing",
    document_id: state.document.document_id,
    operation: "text.insert_line_break",
    expected_revision: state.document.revision,
    payload: {
      group_id: groupId,
      item_id: itemId,
      offset
    }
  });

  return {
    ...commitDocument(state, result.document),
    insertionTarget: { kind: "text_caret", group_id: groupId, item_id: itemId, offset: offset + 1 },
    selectedGroupId: groupId,
    selectedItemId: itemId
  };
}

export function cleanupEmptyTextItem(
  state: StudioState,
  groupId: string,
  itemId: string
): StudioState {
  const group = state.document.story.groups.find((candidate) => candidate.id === groupId);
  const itemIndex = group?.items.findIndex((candidate) => candidate.id === itemId) ?? -1;
  const item = group?.items[itemIndex];
  if (!group || !item || item.kind !== "text" || item.text !== "") {
    return state;
  }

  if (isOnlyInitialTextAffordance(state.document, groupId, itemId)) {
    return state;
  }

  const focusTarget = getNeighborFocusTarget(group, itemIndex);
  const result = applyDocumentCommand(state.document, {
    command_id: nextCommandId(state),
    actor: "user",
    source_surface: "writing",
    document_id: state.document.document_id,
    operation: "group.delete_item",
    expected_revision: state.document.revision,
    payload: {
      group_id: groupId,
      item_id: itemId
    }
  });
  const nextState = commitDocument(state, result.document);
  const updatedGroup = nextState.document.story.groups.find((candidate) => candidate.id === groupId);

  if (focusTarget) {
    return {
      ...nextState,
      insertionTarget: {
        kind: "text_caret",
        group_id: groupId,
        item_id: focusTarget.itemId,
        offset: focusTarget.offset
      },
      selectedGroupId: groupId,
      selectedItemId: focusTarget.itemId
    };
  }

  return {
    ...nextState,
    insertionTarget: updatedGroup
      ? resolveGroupInsertionTarget(nextState.document, groupId)
      : nextState.insertionTarget,
    selectedGroupId: updatedGroup ? groupId : null,
    selectedItemId: null
  };
}

export function deleteFocusedEmptyTextItem(
  state: StudioState,
  groupId: string,
  itemId: string
): StudioState {
  if (
    state.insertionTarget?.kind !== "text_caret" ||
    state.insertionTarget.group_id !== groupId ||
    state.insertionTarget.item_id !== itemId
  ) {
    return state;
  }

  return cleanupEmptyTextItem(state, groupId, itemId);
}

export function splitTextItemIntoNextGroup(
  state: StudioState,
  groupId: string,
  itemId: string,
  offset: number
): StudioState {
  const group = state.document.story.groups.find((candidate) => candidate.id === groupId);
  const item = group?.items.find((candidate) => candidate.id === itemId);
  if (!item || item.kind !== "text") {
    return state;
  }

  const safeOffset = Math.max(0, Math.min(offset, item.text.length));
  const beforeText = item.text.slice(0, safeOffset);
  const afterText = item.text.slice(safeOffset);
  const currentState =
    beforeText === item.text ? state : updateTextItem(state, groupId, itemId, beforeText, safeOffset);

  return createGroupFromText(currentState, afterText);
}

export function setRainyStreetBackground(state: StudioState): StudioState {
  if (state.insertionTarget?.kind === "between_groups") {
    const groupState = createEmptyGroupAtInsertionTarget(state);
    return setRainyStreetBackgroundInGroup(groupState, groupState.selectedGroupId);
  }

  const groupId = getCurrentGroupId(state);
  return setRainyStreetBackgroundInGroup(state, groupId);
}

function setRainyStreetBackgroundInGroup(state: StudioState, groupId: string | null): StudioState {
  if (!groupId) {
    return state;
  }

  const resourceState = hasRainyStreetResource(state)
    ? state
    : commitDocument(
        state,
        applyDocumentCommand(state.document, {
          command_id: nextCommandId(state),
          actor: "user",
          source_surface: "canvas",
          document_id: state.document.document_id,
          operation: "resource.add",
          expected_revision: state.document.revision,
          payload: {
            resource: {
              id: "res_bg_rainy_street",
              kind: "image",
              path: "assets/rainy-street.png"
            }
          }
        }).document
      );

  const stageResult = applyDocumentCommand(resourceState.document, {
    command_id: nextCommandId(resourceState),
    actor: "user",
    source_surface: "canvas",
    document_id: resourceState.document.document_id,
    operation: "stage.set_background",
    expected_revision: resourceState.document.revision,
    payload: {
      group_id: groupId,
      item_id: `item_${resourceState.commandIndex + 1}`,
      background_resource_id: "res_bg_rainy_street"
    }
  });

  return {
    ...commitDocument(resourceState, stageResult.document),
    insertionTarget: { kind: "item_selected", group_id: groupId, item_id: `item_${resourceState.commandIndex + 1}` },
    selectedGroupId: groupId,
    selectedItemId: `item_${resourceState.commandIndex + 1}`
  };
}

export function insertRainyStreetBackgroundGroupAfterCurrent(state: StudioState): StudioState {
  const afterGroupId = getCurrentGroupId(state);
  if (!afterGroupId) {
    return state;
  }

  const stageGroupId = nextGroupId(state.document);
  const stagePositionId = nextPositionId(state.document);
  const groupResult = applyDocumentCommand(state.document, {
    command_id: nextCommandId(state),
    actor: "user",
    source_surface: "canvas",
    document_id: state.document.document_id,
    operation: "group.create_after",
    expected_revision: state.document.revision,
    payload: {
      after_group_id: afterGroupId,
      group_id: stageGroupId,
      position_id: stagePositionId
    }
  });
  const groupState = commitDocument(state, groupResult.document);

  const resourceState = hasRainyStreetResource(groupState)
    ? groupState
    : commitDocument(
        groupState,
        applyDocumentCommand(groupState.document, {
          command_id: nextCommandId(groupState),
          actor: "user",
          source_surface: "canvas",
          document_id: groupState.document.document_id,
          operation: "resource.add",
          expected_revision: groupState.document.revision,
          payload: {
            resource: {
              id: "res_bg_rainy_street",
              kind: "image",
              path: "assets/rainy-street.png"
            }
          }
        }).document
      );

  const itemId = `item_${resourceState.commandIndex + 1}`;
  const stageResult = applyDocumentCommand(resourceState.document, {
    command_id: nextCommandId(resourceState),
    actor: "user",
    source_surface: "canvas",
    document_id: resourceState.document.document_id,
    operation: "stage.set_background",
    expected_revision: resourceState.document.revision,
    payload: {
      group_id: stageGroupId,
      item_id: itemId,
      background_resource_id: "res_bg_rainy_street"
    }
  });

  return {
    ...commitDocument(resourceState, stageResult.document),
    selectedGroupId: stageGroupId,
    selectedItemId: itemId
  };
}

export function getSelectedGroup(state: StudioState): Group | undefined {
  const groupId = getCurrentGroupId(state);
  if (!groupId) {
    return undefined;
  }

  return state.document.story.groups.find((group) => group.id === groupId);
}

export function selectStudioTarget(
  state: StudioState,
  groupId: string,
  itemId: string | null = null
): StudioState {
  const group = state.document.story.groups.find((candidate) => candidate.id === groupId);
  const item = group?.items.find((candidate) => candidate.id === itemId);
  const insertionTarget =
    item?.kind === "text"
      ? resolveTextInsertionTarget(state.document, {
          groupId,
          itemId: item.id,
          offset: item.text.length
        })
      : item
        ? ({ kind: "item_selected", group_id: groupId, item_id: item.id } as const)
        : resolveGroupInsertionTarget(state.document, groupId);

  return {
    ...state,
    insertionTarget,
    selectedGroupId: groupId,
    selectedItemId: itemId
  };
}

export function setTextCaretTarget(
  state: StudioState,
  groupId: string,
  itemId: string,
  offset: number
): StudioState {
  return {
    ...state,
    insertionTarget: resolveTextInsertionTarget(state.document, { groupId, itemId, offset }),
    selectedGroupId: groupId,
    selectedItemId: itemId
  };
}

export function selectBetweenGroupsTarget(
  state: StudioState,
  beforeGroupId: string | null,
  afterGroupId: string | null
): StudioState {
  return {
    ...state,
    insertionTarget: resolveBetweenGroupsInsertionTarget(state.document, beforeGroupId, afterGroupId),
    selectedGroupId: beforeGroupId ?? afterGroupId,
    selectedItemId: null
  };
}

export function selectBetweenItemsTarget(
  state: StudioState,
  groupId: string,
  beforeItemId: string,
  afterItemId: string
): StudioState {
  return {
    ...state,
    insertionTarget: resolveBetweenItemsInsertionTarget(
      state.document,
      groupId,
      beforeItemId,
      afterItemId
    ),
    selectedGroupId: groupId,
    selectedItemId: null
  };
}

export function hasRainyStreetBackground(state: StudioState): boolean {
  return getDerivedBackgroundResourceId(state) === "res_bg_rainy_street";
}

export function getDerivedBackgroundLabel(state: StudioState): string {
  const resourceId = getDerivedBackgroundResourceId(state);
  if (!resourceId) {
    return "None set";
  }

  if (resourceId === "res_bg_rainy_street") {
    return "Rainy street";
  }

  const resource = state.document.resources.find((candidate) => candidate.id === resourceId);
  return resource?.path ?? resourceId;
}

function hasRainyStreetResource(state: StudioState): boolean {
  return state.document.resources.some((resource) => resource.id === "res_bg_rainy_street");
}

function getSameGroupAfterItemPayload(state: StudioState): { after_item_id?: string } {
  if (state.insertionTarget?.kind === "between_items") {
    return { after_item_id: state.insertionTarget.before_item_id };
  }
  if (
    state.insertionTarget?.kind === "text_caret" ||
    state.insertionTarget?.kind === "item_selected"
  ) {
    return { after_item_id: state.insertionTarget.item_id };
  }

  return {};
}

function isOnlyInitialTextAffordance(
  document: TaroDocument,
  groupId: string,
  itemId: string
): boolean {
  if (document.story.groups.length !== 1) {
    return false;
  }

  const group = document.story.groups[0];
  const item = group?.items[0];
  return (
    group?.id === groupId &&
    group.items.length === 1 &&
    item?.id === itemId &&
    item.kind === "text" &&
    item.text === ""
  );
}

function getNeighborFocusTarget(group: Group, removedItemIndex: number): { itemId: string; offset: number } | null {
  for (let index = removedItemIndex - 1; index >= 0; index -= 1) {
    const item = group.items[index];
    if (item?.kind === "text") {
      return { itemId: item.id, offset: item.text.length };
    }
  }

  for (let index = removedItemIndex + 1; index < group.items.length; index += 1) {
    const item = group.items[index];
    if (item?.kind === "text") {
      return { itemId: item.id, offset: 0 };
    }
  }

  return null;
}

function getDerivedBackgroundResourceId(state: StudioState): string | undefined {
  const groupId = getCurrentGroupId(state);
  if (!groupId) {
    return undefined;
  }

  return deriveLinearStageState(state.document, { group_id: groupId }).background_resource_id;
}

function getCurrentGroupId(state: StudioState): string | null {
  if (state.insertionTarget?.kind === "text_caret") {
    return state.insertionTarget.group_id;
  }
  if (state.insertionTarget?.kind === "item_selected") {
    return state.insertionTarget.group_id;
  }
  if (
    state.insertionTarget?.kind === "group_inside" ||
    state.insertionTarget?.kind === "empty_group" ||
    state.insertionTarget?.kind === "between_items"
  ) {
    return state.insertionTarget.group_id;
  }
  if (state.insertionTarget?.kind === "between_groups") {
    return state.insertionTarget.before_group_id ?? state.insertionTarget.after_group_id;
  }

  if (
    state.selectedGroupId &&
    state.document.story.groups.some((group) => group.id === state.selectedGroupId)
  ) {
    return state.selectedGroupId;
  }

  return state.document.story.groups.at(-1)?.id ?? null;
}

function getGroupCreationAnchor(state: StudioState): string | null {
  if (state.insertionTarget?.kind === "between_groups") {
    return state.insertionTarget.before_group_id;
  }

  return getCurrentGroupId(state);
}

function nextGroupId(document: TaroDocument): string {
  return `group_${document.story.groups.length + 1}`;
}

function nextPositionId(document: TaroDocument): string {
  return `pos_${document.story.groups.length + 1}`;
}

function nextItemId(state: StudioState): string {
  return `item_${state.commandIndex + 1}`;
}
