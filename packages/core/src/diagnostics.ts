import type { Diagnostic, TaroDocument } from "./types.js";

export function validateDocumentForExport(document: TaroDocument): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];

  if (document.schema_version !== "taro.document.v0") {
    diagnostics.push({
      code: "INVALID_DOCUMENT_SCHEMA",
      severity: "blocker",
      message: `Document schema ${document.schema_version} is not supported by MVP1.`,
      source: {},
      surface: ["writing", "preview", "export"],
      blocking_export: true,
      suggested_fix: "Migrate the document to taro.document.v0 before exporting."
    });
  }

  const positions = new Set(document.story.groups.map((group) => group.position_id));
  const resources = new Set(document.resources.map((resource) => resource.id));

  for (const group of document.story.groups) {
    for (const item of group.items) {
      if (item.kind === "jump" && !positions.has(item.target_position_id)) {
        diagnostics.push({
          code: "BROKEN_JUMP_TARGET",
          severity: "blocker",
          message: `Jump target ${item.target_position_id} does not exist.`,
          source: {
            group_id: group.id,
            item_id: item.id,
            position_id: group.position_id
          },
          surface: ["writing", "preview", "export"],
          blocking_export: true,
          suggested_fix: "Choose an existing target position or create the missing target."
        });
      }

      if (
        item.kind === "stage_change" &&
        item.background_resource_id &&
        !resources.has(item.background_resource_id)
      ) {
        diagnostics.push({
          code: "MISSING_RESOURCE",
          severity: "blocker",
          message: `Resource ${item.background_resource_id} is referenced but not defined.`,
          source: {
            group_id: group.id,
            item_id: item.id,
            position_id: group.position_id,
            resource_id: item.background_resource_id
          },
          surface: ["canvas", "preview", "export"],
          blocking_export: true,
          suggested_fix: "Add the missing resource or choose an existing resource."
        });
      }
    }
  }

  return diagnostics;
}

export function preflightExport(document: TaroDocument) {
  const diagnostics = validateDocumentForExport(document);

  return {
    ok: diagnostics.every((diagnostic) => !diagnostic.blocking_export),
    diagnostics
  };
}
