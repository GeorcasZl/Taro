import { buildLocalExportPackage, type TaroDocument } from "@taro/core";

export function buildStudioExport(document: TaroDocument) {
  return buildLocalExportPackage(document, {
    artifact_path: "browser-download"
  });
}
