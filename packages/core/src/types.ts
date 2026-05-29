export type DocumentSchemaVersion = "taro.document.v0";

export type SourceSurface = "writing" | "canvas" | "inspector" | "preview" | "export";

export type DiagnosticSeverity = "info" | "warning" | "error" | "blocker";

export type DiagnosticSurface = "writing" | "canvas" | "inspector" | "preview" | "export";

export interface DiagnosticSource {
  group_id?: string;
  item_id?: string;
  position_id?: string;
  resource_id?: string;
}

export interface Diagnostic {
  code: string;
  severity: DiagnosticSeverity;
  message: string;
  source: DiagnosticSource;
  surface: DiagnosticSurface[];
  blocking_export: boolean;
  suggested_fix: string;
}

export interface DisplayMode {
  id: string;
  name: string;
  text_blocking_default: boolean;
  click_behavior: "complete_text_then_next_group";
}

export interface ResourceReference {
  id: string;
  kind: "image" | "audio" | "font" | "other";
  path: string;
}

export interface TaroDocument {
  schema_version: DocumentSchemaVersion;
  document_id: string;
  revision: number;
  project: {
    title: string;
  };
  defaults: {
    display_mode_id: string;
  };
  story: {
    entry_group_id: string | null;
    groups: Group[];
  };
  resources: ResourceReference[];
  display_modes: DisplayMode[];
  diagnostics: Diagnostic[];
}

export interface Group {
  id: string;
  position_id: string;
  items: ContentItem[];
  metadata: Record<string, string | boolean | number>;
}

export type ContentItem = TextContentItem | StageChangeContentItem | JumpContentItem;

interface ContentItemBase {
  id: string;
  order: number;
  blocking: boolean;
}

export interface TextContentItem extends ContentItemBase {
  kind: "text";
  text: string;
  display_mode_id: string;
  speaker?: string;
}

export interface StageChangeContentItem extends ContentItemBase {
  kind: "stage_change";
  background_resource_id?: string;
}

export interface StageState {
  background_resource_id?: string;
}

export interface JumpContentItem extends ContentItemBase {
  kind: "jump";
  target_position_id: string;
}

export interface CreateMvp1DocumentInput {
  document_id: string;
  title: string;
}

export interface TextItemInput {
  kind?: "text";
  item_id: string;
  text: string;
  speaker?: string;
  display_mode_id?: string;
}

export interface StageChangeItemInput {
  kind: "stage_change";
  item_id: string;
  background_resource_id?: string;
}

export interface JumpItemInput {
  kind: "jump";
  item_id: string;
  target_position_id: string;
}

export type ContentItemInput = TextItemInput | StageChangeItemInput | JumpItemInput;

export interface DocumentCommandEnvelopeBase {
  command_id: string;
  actor: "user" | "system";
  source_surface: SourceSurface;
  document_id: string;
  expected_revision: number;
}

export type DocumentCommand =
  | (DocumentCommandEnvelopeBase & {
      operation: "group.create_after";
      payload: {
        after_group_id: string | null;
        group_id: string;
        position_id: string;
        text_item?: TextItemInput;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "group.insert_item";
      payload: {
        group_id: string;
        after_item_id?: string;
        item: ContentItemInput;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "group.delete_item";
      payload: {
        group_id: string;
        item_id: string;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "text.update";
      payload: {
        group_id: string;
        item_id: string;
        text: string;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "text.set_speaker";
      payload: {
        group_id: string;
        item_id: string;
        speaker: string;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "text.set_display_mode";
      payload: {
        group_id: string;
        item_id: string;
        display_mode_id: string;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "text.insert_line_break";
      payload: {
        group_id: string;
        item_id: string;
        offset: number;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "resource.add";
      payload: {
        resource: ResourceReference;
      };
    })
  | (DocumentCommandEnvelopeBase & {
      operation: "stage.set_background";
      payload: {
        group_id: string;
        item_id: string;
        background_resource_id: string;
      };
    });

export interface DocumentCommandResult {
  ok: true;
  revision: number;
  document: TaroDocument;
  patch: DocumentPatch[];
  diagnostics_changed: boolean;
}

export interface DocumentPatch {
  op: "add" | "replace" | "remove";
  path: string;
  value?: unknown;
}

export type PreviewMode = "current_group" | "from_position" | "full_preview";

export interface PreviewRequest {
  mode: PreviewMode;
  group_id?: string;
  position_id?: string;
}

export type PreviewEvent =
  | {
      type: "preview.started";
      group_id?: string;
      position_id?: string;
    }
  | {
      type: "group.started" | "group.completed";
      group_id: string;
      position_id: string;
    }
  | {
      type: "item.started" | "item.completed";
      group_id: string;
      item_id: string;
      kind: ContentItem["kind"];
    }
  | {
      type: "preview.completed";
      group_id?: string;
      position_id?: string;
    };

export interface PreviewTrace {
  mode: PreviewMode;
  events: PreviewEvent[];
  diagnostics: Diagnostic[];
}

export interface LocalExportOptions {
  artifact_path: string;
}

export interface LocalRuntimeManifest {
  format: "taro.local-playable.v0";
  document_id: string;
  entry_group_id: string | null;
  preview_trace: PreviewEvent[];
  resources: ResourceReference[];
  files: string[];
}

export interface LocalExportFile {
  path: string;
  kind: "html" | "json";
  contents: string;
}

export interface LocalExportPackage {
  ok: boolean;
  artifact_path: string;
  diagnostics: Diagnostic[];
  runtime_manifest: LocalRuntimeManifest;
  files: LocalExportFile[];
}

export interface ExportPreflightResult {
  ok: boolean;
  diagnostics: Diagnostic[];
}
