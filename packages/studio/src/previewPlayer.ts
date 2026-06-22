import { deriveLinearStageState, type TaroDocument } from "@taro/core";

export interface PreviewPlaybackState {
  currentGroupId: string | null;
  startGroupId: string | null;
}

export interface PreviewPlayerView {
  currentGroupId: string | null;
  positionId: string | null;
  textItems: Array<{ itemId: string; text: string }>;
  backgroundLabel: string;
  canAdvance: boolean;
  isEnd: boolean;
  trace: {
    current_group_id: string | null;
    item_ids: string[];
    stage_source: { group_id: string; item_id: string } | null;
  };
}

export function createPreviewPlaybackState(currentGroupId: string | null): PreviewPlaybackState {
  return { currentGroupId, startGroupId: currentGroupId };
}

export function buildPreviewPlayerView(
  document: TaroDocument,
  playback: PreviewPlaybackState
): PreviewPlayerView {
  const group = document.story.groups.find((candidate) => candidate.id === playback.currentGroupId);
  if (!group) {
    return {
      currentGroupId: null,
      positionId: null,
      textItems: [],
      backgroundLabel: "None set",
      canAdvance: false,
      isEnd: true,
      trace: { current_group_id: null, item_ids: [], stage_source: null }
    };
  }

  const stageState = deriveLinearStageState(document, { group_id: group.id });
  const textItems = group.items
    .filter((item) => item.kind === "text")
    .map((item) => ({ itemId: item.id, text: item.text }));

  return {
    currentGroupId: group.id,
    positionId: group.position_id,
    textItems,
    backgroundLabel: getBackgroundLabel(document, stageState.background_resource_id),
    canAdvance: getNextPreviewGroupId(document, group.id) !== null,
    isEnd: false,
    trace: {
      current_group_id: group.id,
      item_ids: group.items.map((item) => item.id),
      stage_source: getStageSource(document, group.id)
    }
  };
}

export function getNextPreviewGroupId(
  document: TaroDocument,
  currentGroupId: string | null
): string | null {
  const index = document.story.groups.findIndex((group) => group.id === currentGroupId);
  return index === -1 ? null : document.story.groups[index + 1]?.id ?? null;
}

export function getRestartPreviewGroupId(playback: PreviewPlaybackState): string | null {
  return playback.startGroupId;
}

function getBackgroundLabel(document: TaroDocument, backgroundResourceId: string | undefined): string {
  if (!backgroundResourceId) {
    return "None set";
  }

  if (backgroundResourceId === "res_bg_rainy_street") {
    return "Rainy street";
  }

  return document.resources.find((resource) => resource.id === backgroundResourceId)?.id ?? backgroundResourceId;
}

function getStageSource(
  document: TaroDocument,
  currentGroupId: string
): { group_id: string; item_id: string } | null {
  const entryIndex = document.story.entry_group_id
    ? document.story.groups.findIndex((group) => group.id === document.story.entry_group_id)
    : 0;
  const targetIndex = document.story.groups.findIndex((group) => group.id === currentGroupId);
  if (targetIndex === -1) {
    return null;
  }

  const startIndex = entryIndex === -1 ? 0 : entryIndex;
  let stageSource: { group_id: string; item_id: string } | null = null;

  for (const group of document.story.groups.slice(startIndex, targetIndex + 1)) {
    for (const item of group.items) {
      if (item.kind === "stage_change" && item.background_resource_id) {
        stageSource = { group_id: group.id, item_id: item.id };
      }
    }
  }

  return stageSource;
}
