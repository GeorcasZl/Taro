import type { ContentItem, Group, TaroDocument } from "@taro/core";

export type WritingInsertionTarget =
  | {
      kind: "text_caret";
      group_id: string;
      item_id: string;
      offset: number;
      range?: { start: number; end: number };
    }
  | {
      kind: "item_selected";
      group_id: string;
      item_id: string;
    }
  | {
      kind: "group_inside";
      group_id: string;
    }
  | {
      kind: "between_items";
      group_id: string;
      before_item_id: string;
      after_item_id: string;
    }
  | {
      kind: "empty_group";
      group_id: string;
    }
  | {
      kind: "between_groups";
      before_group_id: string | null;
      after_group_id: string | null;
    };

export interface TextInsertionInput {
  groupId: string;
  itemId: string;
  offset: number;
  range?: { start: number; end: number };
}

export function resolveTextInsertionTarget(
  document: TaroDocument,
  input: TextInsertionInput
): WritingInsertionTarget {
  const item = findItem(document, input.groupId, input.itemId);
  if (item.kind !== "text") {
    throw new Error(`Item ${input.itemId} is not editable text.`);
  }
  if (input.offset < 0 || input.offset > item.text.length) {
    throw new Error(`Text caret offset ${input.offset} is outside item ${input.itemId}.`);
  }
  if (
    input.range &&
    (input.range.start < 0 || input.range.end < input.range.start || input.range.end > item.text.length)
  ) {
    throw new Error(`Text range is outside item ${input.itemId}.`);
  }

  return {
    kind: "text_caret",
    group_id: input.groupId,
    item_id: input.itemId,
    offset: input.offset,
    ...(input.range ? { range: input.range } : {})
  };
}

export function resolveGroupInsertionTarget(
  document: TaroDocument,
  groupId: string
): WritingInsertionTarget {
  const group = findGroup(document, groupId);
  if (group.items.length === 0) {
    return { kind: "empty_group", group_id: group.id };
  }

  return { kind: "group_inside", group_id: group.id };
}

export function resolveBetweenGroupsInsertionTarget(
  document: TaroDocument,
  beforeGroupId: string | null,
  afterGroupId: string | null
): WritingInsertionTarget {
  if (beforeGroupId === null && afterGroupId === null) {
    throw new Error("Between-Groups insertion target needs at least one neighboring Group.");
  }

  const beforeIndex = beforeGroupId
    ? document.story.groups.findIndex((group) => group.id === beforeGroupId)
    : -1;
  const afterIndex = afterGroupId
    ? document.story.groups.findIndex((group) => group.id === afterGroupId)
    : document.story.groups.length;

  if (beforeGroupId && beforeIndex === -1) {
    throw new Error(`Group ${beforeGroupId} does not exist.`);
  }
  if (afterGroupId && afterIndex === -1) {
    throw new Error(`Group ${afterGroupId} does not exist.`);
  }
  if (beforeGroupId && afterGroupId && afterIndex !== beforeIndex + 1) {
    throw new Error(`Groups ${beforeGroupId} and ${afterGroupId} are not adjacent.`);
  }

  return {
    kind: "between_groups",
    before_group_id: beforeGroupId,
    after_group_id: afterGroupId
  };
}

export function resolveBetweenItemsInsertionTarget(
  document: TaroDocument,
  groupId: string,
  beforeItemId: string,
  afterItemId: string
): WritingInsertionTarget {
  const group = findGroup(document, groupId);
  const beforeIndex = group.items.findIndex((item) => item.id === beforeItemId);
  const afterIndex = group.items.findIndex((item) => item.id === afterItemId);

  if (beforeIndex === -1) {
    throw new Error(`Item ${beforeItemId} does not exist.`);
  }
  if (afterIndex === -1) {
    throw new Error(`Item ${afterItemId} does not exist.`);
  }
  if (afterIndex !== beforeIndex + 1) {
    throw new Error(`Items ${beforeItemId} and ${afterItemId} are not adjacent.`);
  }

  return {
    kind: "between_items",
    group_id: group.id,
    before_item_id: beforeItemId,
    after_item_id: afterItemId
  };
}

export function isGroupEmpty(document: TaroDocument, groupId: string): boolean {
  return findGroup(document, groupId).items.length === 0;
}

function findGroup(document: TaroDocument, groupId: string): Group {
  const group = document.story.groups.find((candidate) => candidate.id === groupId);
  if (!group) {
    throw new Error(`Group ${groupId} does not exist.`);
  }

  return group;
}

function findItem(document: TaroDocument, groupId: string, itemId: string): ContentItem {
  const group = findGroup(document, groupId);
  const item = group.items.find((candidate) => candidate.id === itemId);
  if (!item) {
    throw new Error(`Item ${itemId} does not exist.`);
  }

  return item;
}
