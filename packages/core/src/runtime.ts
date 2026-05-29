import { preflightExport, validateDocumentForExport } from "./diagnostics.js";
import type {
  Group,
  LocalExportFile,
  LocalExportOptions,
  LocalExportPackage,
  LocalRuntimeManifest,
  PreviewRequest,
  PreviewTrace,
  StageState,
  TaroDocument
} from "./types.js";

export interface LinearStageStateTarget {
  group_id?: string;
  position_id?: string;
  group_index?: number;
}

export function previewDocument(
  document: TaroDocument,
  request: PreviewRequest = { mode: "full_preview" }
): PreviewTrace {
  const groups = getPlayableGroups(document, request);
  const firstGroup = groups[0];
  const lastGroup = groups.at(-1);
  const events: PreviewTrace["events"] = [];

  events.push(
    firstGroup
      ? {
          type: "preview.started",
          group_id: firstGroup.id,
          position_id: firstGroup.position_id
        }
      : {
          type: "preview.started"
        }
  );

  for (const group of groups) {
    events.push({
      type: "group.started",
      group_id: group.id,
      position_id: group.position_id
    });

    for (const item of group.items) {
      events.push({
        type: "item.started",
        group_id: group.id,
        item_id: item.id,
        kind: item.kind
      });
      events.push({
        type: "item.completed",
        group_id: group.id,
        item_id: item.id,
        kind: item.kind
      });

      if (item.kind === "jump") {
        break;
      }
    }

    events.push({
      type: "group.completed",
      group_id: group.id,
      position_id: group.position_id
    });
  }

  events.push(
    lastGroup
      ? {
          type: "preview.completed",
          group_id: lastGroup.id,
          position_id: lastGroup.position_id
        }
      : {
          type: "preview.completed"
        }
  );

  return {
    mode: request.mode,
    events,
    diagnostics: validateDocumentForExport(document)
  };
}

export function buildLocalExportPackage(
  document: TaroDocument,
  options: LocalExportOptions
): LocalExportPackage {
  const diagnostics = validateDocumentForExport(document);
  const preview = previewDocument(document, { mode: "full_preview" });
  const runtimeManifest: LocalRuntimeManifest = {
    format: "taro.local-playable.v0",
    document_id: document.document_id,
    entry_group_id: document.story.entry_group_id,
    preview_trace: preview.events,
    resources: document.resources,
    files: ["index.html", "runtime-manifest.json", "document.taro.json"]
  };
  const files: LocalExportFile[] = [
    {
      path: "index.html",
      kind: "html",
      contents: renderMvp1Html(runtimeManifest, document)
    },
    {
      path: "runtime-manifest.json",
      kind: "json",
      contents: JSON.stringify(runtimeManifest, null, 2)
    },
    {
      path: "document.taro.json",
      kind: "json",
      contents: JSON.stringify(document, null, 2)
    }
  ];

  return {
    ok: diagnostics.every((diagnostic) => !diagnostic.blocking_export),
    artifact_path: options.artifact_path,
    diagnostics,
    runtime_manifest: runtimeManifest,
    files
  };
}

export { preflightExport };

export function deriveLinearStageState(
  document: TaroDocument,
  target: LinearStageStateTarget = {}
): StageState {
  const targetIndex = getStageStateTargetIndex(document, target);
  if (targetIndex === -1) {
    return {};
  }

  const entryIndex = document.story.entry_group_id
    ? document.story.groups.findIndex((group) => group.id === document.story.entry_group_id)
    : 0;
  const startIndex = entryIndex === -1 ? 0 : entryIndex;
  const endIndex = Math.max(startIndex, targetIndex);
  const stageState: StageState = {};

  for (const group of document.story.groups.slice(startIndex, endIndex + 1)) {
    for (const item of group.items) {
      if (item.kind === "stage_change" && item.background_resource_id) {
        stageState.background_resource_id = item.background_resource_id;
      }
    }
  }

  return stageState;
}

function renderMvp1Html(manifest: LocalRuntimeManifest, document: TaroDocument): string {
  const manifestJson = serializeForScript(manifest);
  const documentJson = serializeForScript(document);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Taro MVP1 Export</title>
  </head>
  <body>
    <main id="app"></main>
    <script type="application/json" id="taro-runtime-manifest">${manifestJson}</script>
    <script type="application/json" id="taro-document">${documentJson}</script>
    <script>
      const manifest = JSON.parse(document.getElementById("taro-runtime-manifest").textContent);
      const taroDocument = JSON.parse(document.getElementById("taro-document").textContent);
      const app = document.getElementById("app");
      const groups = taroDocument.story.groups;
      const entryIndex = Math.max(
        0,
        groups.findIndex((group) => group.id === taroDocument.story.entry_group_id)
      );
      let groupIndex = 0;

      function renderGroup() {
        app.textContent = "";
        const title = document.createElement("h1");
        title.textContent = "Taro Local Playable";
        app.append(title);

        const format = document.createElement("p");
        format.textContent = manifest.format;
        app.append(format);

        const absoluteGroupIndex = entryIndex + groupIndex;
        const group = groups[absoluteGroupIndex];
        if (!group) {
          const done = document.createElement("p");
          done.textContent = "End of preview.";
          app.append(done);
          return;
        }

        const stageState = deriveStageStateForIndex(absoluteGroupIndex);
        if (stageState.background_resource_id) {
          const stageLine = document.createElement("p");
          stageLine.textContent = "Background: " + stageState.background_resource_id;
          app.append(stageLine);
        }

        for (const item of group.items) {
          if (item.kind === "text") {
            const line = document.createElement("p");
            line.textContent = item.text;
            app.append(line);
          }
        }

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = absoluteGroupIndex + 1 < groups.length ? "Next" : "Finish";
        button.addEventListener("click", () => {
          groupIndex += 1;
          renderGroup();
        });
        app.append(button);
      }

      renderGroup();

      function deriveStageStateForIndex(targetIndex) {
        const stageState = {};
        for (let index = entryIndex; index <= targetIndex && index < groups.length; index += 1) {
          const group = groups[index];
          for (const item of group.items) {
            if (item.kind === "stage_change" && item.background_resource_id) {
              stageState.background_resource_id = item.background_resource_id;
            }
          }
        }
        return stageState;
      }
    </script>
  </body>
</html>`;
}

function serializeForScript(value: unknown): string {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function getPlayableGroups(document: TaroDocument, request: PreviewRequest): Group[] {
  const startGroup = findPreviewStartGroup(document, request);
  if (!startGroup) {
    return [];
  }

  const groups: Group[] = [];
  const visited = new Set<string>();
  let currentGroup: Group | undefined = startGroup;

  while (currentGroup && !visited.has(currentGroup.id)) {
    groups.push(currentGroup);
    visited.add(currentGroup.id);

    if (request.mode === "current_group") {
      break;
    }

    const jumpTarget = findTerminalJumpTarget(currentGroup);
    if (jumpTarget) {
      currentGroup = findGroupByPosition(document, jumpTarget);
      continue;
    }

    currentGroup = findNextLinearGroup(document, currentGroup.id);
  }

  return groups;
}

function findPreviewStartGroup(document: TaroDocument, request: PreviewRequest): Group | undefined {
  if (request.group_id) {
    return document.story.groups.find((group) => group.id === request.group_id);
  }

  if (request.position_id) {
    return findGroupByPosition(document, request.position_id);
  }

  if (document.story.entry_group_id) {
    return document.story.groups.find((group) => group.id === document.story.entry_group_id);
  }

  return document.story.groups[0];
}

function findTerminalJumpTarget(group: Group): string | undefined {
  return group.items.find((item) => item.kind === "jump")?.target_position_id;
}

function findGroupByPosition(document: TaroDocument, positionId: string): Group | undefined {
  return document.story.groups.find((group) => group.position_id === positionId);
}

function findNextLinearGroup(document: TaroDocument, groupId: string): Group | undefined {
  const index = document.story.groups.findIndex((group) => group.id === groupId);
  if (index === -1) {
    return undefined;
  }

  return document.story.groups[index + 1];
}

function getStageStateTargetIndex(
  document: TaroDocument,
  target: LinearStageStateTarget
): number {
  if (typeof target.group_index === "number") {
    return target.group_index >= 0 && target.group_index < document.story.groups.length
      ? target.group_index
      : -1;
  }

  if (target.group_id) {
    return document.story.groups.findIndex((group) => group.id === target.group_id);
  }

  if (target.position_id) {
    return document.story.groups.findIndex((group) => group.position_id === target.position_id);
  }

  return document.story.groups.length - 1;
}
