import type {
  ContentItem,
  ContentItemInput,
  CreateMvp1DocumentInput,
  DocumentCommand,
  DocumentCommandResult,
  DocumentPatch,
  Group,
  ResourceReference,
  StageChangeContentItem,
  TaroDocument,
  TextContentItem,
  TextItemInput
} from "./types.js";
import { validateDocumentForExport } from "./diagnostics.js";

export function createMvp1Document(input: CreateMvp1DocumentInput): TaroDocument {
  return {
    schema_version: "taro.document.v0",
    document_id: input.document_id,
    revision: 0,
    project: {
      title: input.title
    },
    defaults: {
      display_mode_id: "dialogue_bubble"
    },
    story: {
      entry_group_id: null,
      groups: []
    },
    resources: [],
    display_modes: [
      {
        id: "dialogue_bubble",
        name: "Dialogue Bubble",
        text_blocking_default: true,
        click_behavior: "complete_text_then_next_group"
      }
    ],
    diagnostics: []
  };
}

export function applyDocumentCommand(
  document: TaroDocument,
  command: DocumentCommand
): DocumentCommandResult {
  assertCommandEnvelope(document, command);

  const nextDocument = cloneDocument(document);
  const previousDiagnostics = validateDocumentForExport(document);
  const patch: DocumentPatch[] = [];

  if (command.operation === "group.create_after") {
    assertGroupIdAvailable(nextDocument, command.payload.group_id);
    if (command.payload.text_item) {
      assertItemIdAvailable(nextDocument, command.payload.text_item.item_id);
    }

    const group: Group = {
      id: command.payload.group_id,
      position_id: command.payload.position_id,
      items: [],
      metadata: {}
    };

    const insertIndex = getGroupInsertIndex(nextDocument, command.payload.after_group_id);
    if (command.payload.text_item) {
      group.items.push(normalizeTextItem(nextDocument, group, command.payload.text_item, 0));
    }

    nextDocument.story.groups.splice(insertIndex, 0, group);
    if (nextDocument.story.entry_group_id === null) {
      nextDocument.story.entry_group_id = group.id;
    }

    patch.push({
      op: "add",
      path: `/story/groups/${insertIndex}`,
      value: group
    });
  } else if (command.operation === "group.insert_item") {
    assertItemIdAvailable(nextDocument, command.payload.item.item_id);
    const groupIndex = findGroupIndex(nextDocument, command.payload.group_id);
    const group = nextDocument.story.groups[groupIndex];
    if (!group) {
      throw new Error(`Group ${command.payload.group_id} does not exist.`);
    }

    const insertIndex = getItemInsertIndex(group, command.payload.after_item_id);
    const item = normalizeContentItem(nextDocument, group, command.payload.item, insertIndex);
    group.items.splice(insertIndex, 0, item);
    normalizeItemOrder(group);
    patch.push({
      op: "add",
      path: `/story/groups/${groupIndex}/items/${insertIndex}`,
      value: item
    });
  } else if (command.operation === "group.delete_item") {
    const groupIndex = findGroupIndex(nextDocument, command.payload.group_id);
    const group = nextDocument.story.groups[groupIndex];
    if (!group) {
      throw new Error(`Group ${command.payload.group_id} does not exist.`);
    }

    const itemIndex = group.items.findIndex((item) => item.id === command.payload.item_id);
    if (itemIndex === -1) {
      throw new Error(`Item ${command.payload.item_id} does not exist in Group ${group.id}.`);
    }

    group.items.splice(itemIndex, 1);
    normalizeItemOrder(group);
    patch.push({
      op: "remove",
      path: `/story/groups/${groupIndex}/items/${itemIndex}`
    });
  } else if (command.operation === "text.update") {
    const { groupIndex, itemIndex, item } = findTextItem(
      nextDocument,
      command.payload.group_id,
      command.payload.item_id
    );

    item.text = command.payload.text;
    patch.push({
      op: "replace",
      path: `/story/groups/${groupIndex}/items/${itemIndex}/text`,
      value: command.payload.text
    });
  } else if (command.operation === "text.set_speaker") {
    const { groupIndex, itemIndex, item } = findTextItem(
      nextDocument,
      command.payload.group_id,
      command.payload.item_id
    );

    item.speaker = command.payload.speaker;
    patch.push({
      op: "replace",
      path: `/story/groups/${groupIndex}/items/${itemIndex}/speaker`,
      value: command.payload.speaker
    });
  } else if (command.operation === "text.set_display_mode") {
    const { groupIndex, itemIndex, item } = findTextItem(
      nextDocument,
      command.payload.group_id,
      command.payload.item_id
    );

    item.display_mode_id = command.payload.display_mode_id;
    patch.push({
      op: "replace",
      path: `/story/groups/${groupIndex}/items/${itemIndex}/display_mode_id`,
      value: command.payload.display_mode_id
    });
  } else if (command.operation === "text.insert_line_break") {
    const { groupIndex, itemIndex, item } = findTextItem(
      nextDocument,
      command.payload.group_id,
      command.payload.item_id
    );
    if (command.payload.offset < 0 || command.payload.offset > item.text.length) {
      throw new Error(`Line break offset ${command.payload.offset} is outside item ${item.id}.`);
    }

    item.text = `${item.text.slice(0, command.payload.offset)}\n${item.text.slice(
      command.payload.offset
    )}`;
    patch.push({
      op: "replace",
      path: `/story/groups/${groupIndex}/items/${itemIndex}/text`,
      value: item.text
    });
  } else if (command.operation === "resource.add") {
    assertResourceIdAvailable(nextDocument, command.payload.resource.id);
    const resource = cloneResource(command.payload.resource);
    nextDocument.resources.push(resource);
    patch.push({
      op: "add",
      path: `/resources/${nextDocument.resources.length - 1}`,
      value: resource
    });
  } else if (command.operation === "stage.set_background") {
    assertItemIdAvailable(nextDocument, command.payload.item_id);
    const groupIndex = findGroupIndex(nextDocument, command.payload.group_id);
    const group = nextDocument.story.groups[groupIndex];
    if (!group) {
      throw new Error(`Group ${command.payload.group_id} does not exist.`);
    }

    const item: StageChangeContentItem = {
      id: command.payload.item_id,
      kind: "stage_change",
      order: group.items.length,
      blocking: false,
      background_resource_id: command.payload.background_resource_id
    };

    group.items.push(item);
    patch.push({
      op: "add",
      path: `/story/groups/${groupIndex}/items/${item.order}`,
      value: item
    });
  }

  nextDocument.revision += 1;
  nextDocument.diagnostics = validateDocumentForExport(nextDocument);

  return {
    ok: true,
    revision: nextDocument.revision,
    document: nextDocument,
    patch,
    diagnostics_changed: diagnosticsChanged(previousDiagnostics, nextDocument.diagnostics)
  };
}

function assertGroupIdAvailable(document: TaroDocument, groupId: string): void {
  if (document.story.groups.some((group) => group.id === groupId)) {
    throw new Error(`Group ${groupId} already exists.`);
  }
}

function assertItemIdAvailable(document: TaroDocument, itemId: string): void {
  if (document.story.groups.some((group) => group.items.some((item) => item.id === itemId))) {
    throw new Error(`Item ${itemId} already exists.`);
  }
}

function assertResourceIdAvailable(document: TaroDocument, resourceId: string): void {
  if (document.resources.some((resource) => resource.id === resourceId)) {
    throw new Error(`Resource ${resourceId} already exists.`);
  }
}

function findTextItem(document: TaroDocument, groupId: string, itemId: string) {
  const groupIndex = findGroupIndex(document, groupId);
  const group = document.story.groups[groupIndex];
  if (!group) {
    throw new Error(`Group ${groupId} does not exist.`);
  }

  const itemIndex = group.items.findIndex((candidate) => candidate.id === itemId);
  const item = group.items[itemIndex];
  if (!item || item.kind !== "text") {
    throw new Error(`Text item ${itemId} does not exist.`);
  }

  return { groupIndex, itemIndex, item };
}

function assertCommandEnvelope(document: TaroDocument, command: DocumentCommand): void {
  if (command.document_id !== document.document_id) {
    throw new Error(`Command targets ${command.document_id}, but document is ${document.document_id}.`);
  }

  if (command.expected_revision !== document.revision) {
    throw new Error(
      `Command expected revision ${command.expected_revision}, but document is at revision ${document.revision}.`
    );
  }
}

function getGroupInsertIndex(document: TaroDocument, afterGroupId: string | null): number {
  if (afterGroupId === null) {
    return document.story.groups.length;
  }

  const afterIndex = document.story.groups.findIndex((group) => group.id === afterGroupId);
  if (afterIndex === -1) {
    throw new Error(`Group ${afterGroupId} does not exist.`);
  }

  return afterIndex + 1;
}

function getItemInsertIndex(group: Group, afterItemId: string | undefined): number {
  if (!afterItemId) {
    return group.items.length;
  }

  const afterIndex = group.items.findIndex((item) => item.id === afterItemId);
  if (afterIndex === -1) {
    throw new Error(`Item ${afterItemId} does not exist in Group ${group.id}.`);
  }

  return afterIndex + 1;
}

function normalizeItemOrder(group: Group): void {
  group.items.forEach((item, index) => {
    item.order = index;
  });
}

function normalizeContentItem(
  document: TaroDocument,
  group: Group,
  input: ContentItemInput,
  order: number
): ContentItem {
  if (input.kind === "jump") {
    return {
      id: input.item_id,
      kind: "jump",
      order,
      blocking: false,
      target_position_id: input.target_position_id
    };
  }

  if (input.kind === "stage_change") {
    const item = {
      id: input.item_id,
      kind: "stage_change" as const,
      order,
      blocking: false
    };

    if (input.background_resource_id) {
      return {
        ...item,
        background_resource_id: input.background_resource_id
      };
    }

    return item;
  }

  return normalizeTextItem(document, group, input, order);
}

function normalizeTextItem(
  document: TaroDocument,
  group: Group,
  input: TextItemInput,
  order: number
): TextContentItem {
  const inherited = findLastTextItem(group);
  const item: TextContentItem = {
    id: input.item_id,
    kind: "text",
    order,
    text: input.text,
    display_mode_id:
      input.display_mode_id ?? inherited?.display_mode_id ?? document.defaults.display_mode_id,
    blocking: true
  };

  const speaker = input.speaker ?? inherited?.speaker;
  if (speaker) {
    item.speaker = speaker;
  }

  return item;
}

function findLastTextItem(group: Group): TextContentItem | undefined {
  for (let index = group.items.length - 1; index >= 0; index -= 1) {
    const item = group.items[index];
    if (item?.kind === "text") {
      return item;
    }
  }

  return undefined;
}

function findGroupIndex(document: TaroDocument, groupId: string): number {
  const index = document.story.groups.findIndex((candidate) => candidate.id === groupId);
  if (index === -1) {
    throw new Error(`Group ${groupId} does not exist.`);
  }

  return index;
}

function cloneDocument(document: TaroDocument): TaroDocument {
  return JSON.parse(JSON.stringify(document)) as TaroDocument;
}

function cloneResource(resource: ResourceReference): ResourceReference {
  return JSON.parse(JSON.stringify(resource)) as ResourceReference;
}

function diagnosticsChanged(
  previousDiagnostics: TaroDocument["diagnostics"],
  nextDiagnostics: TaroDocument["diagnostics"]
): boolean {
  return JSON.stringify(previousDiagnostics) !== JSON.stringify(nextDiagnostics);
}
