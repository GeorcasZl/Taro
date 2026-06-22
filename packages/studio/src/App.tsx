import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { previewDocument, type Group } from "@taro/core";

import { MVP1_ADD_SEARCH_ACTIONS } from "./addSearch.js";
import { buildStudioExport } from "./exportDownload.js";
import {
  cleanupEmptyTextItem,
  createInitialStudioState,
  deleteFocusedEmptyTextItem,
  getDerivedBackgroundLabel,
  getSelectedGroup,
  insertSameGroupText,
  selectBetweenItemsTarget,
  selectStudioTarget,
  setTextCaretTarget,
  setRainyStreetBackground,
  splitTextItemIntoNextGroup,
  updateTextItem,
  type StudioState
} from "./studioState.js";
import {
  isLineBreakEnter,
  isNextGroupEnter,
  isPrimaryK,
  isSameGroupEnter
} from "./keyboard.js";
import {
  buildPreviewPlayerView,
  createPreviewPlaybackState,
  getNextPreviewGroupId,
  getRestartPreviewGroupId,
  type PreviewPlaybackState
} from "./previewPlayer.js";

type ExportState = ReturnType<typeof buildStudioExport>;

interface DisplayGroup {
  group: Group;
  ariaLabel: string;
  markerLabel: string;
  items: DisplayItem[];
}

type DisplayItem =
  | { kind: "text"; id: string; text: string }
  | { kind: "stage_change"; id: string; text: string };

export function App() {
  const [state, setState] = useState(createInitialStudioState);
  const [addSearchOpen, setAddSearchOpen] = useState(false);
  const [exported, setExported] = useState<ExportState | null>(null);
  const [focusedTextItemId, setFocusedTextItemId] = useState<string | null>(null);
  const [previewPlayback, setPreviewPlayback] = useState<PreviewPlaybackState>(() =>
    createPreviewPlaybackState(getSelectedGroup(createInitialStudioState())?.id ?? null)
  );
  const textEditorRefs = useRef(new Map<string, HTMLTextAreaElement>());
  const preview = useMemo(
    () => previewDocument(state.document, { mode: "full_preview" }),
    [state.document]
  );
  const displayGroups = useMemo(() => buildDisplayGroups(state), [state]);
  const selectedGroup = getSelectedGroup(state);
  const previewPlayerView = useMemo(
    () => buildPreviewPlayerView(state.document, previewPlayback),
    [state.document, previewPlayback]
  );
  const exportTraceMatches =
    exported?.ok === true &&
    JSON.stringify(preview.events) === JSON.stringify(exported.runtime_manifest.preview_trace);

  useEffect(() => {
    function onWindowKeyDown(event: KeyboardEvent) {
      if (isPrimaryK(event)) {
        event.preventDefault();
        setAddSearchOpen(true);
      }
    }

    window.addEventListener("keydown", onWindowKeyDown);
    return () => window.removeEventListener("keydown", onWindowKeyDown);
  }, []);

  useEffect(() => {
    setPreviewPlayback(createPreviewPlaybackState(selectedGroup?.id ?? null));
  }, [selectedGroup?.id]);

  useEffect(() => {
    if (state.insertionTarget?.kind !== "text_caret") {
      return;
    }
    if (state.commandIndex === 1 && state.insertionTarget.offset === 0) {
      return;
    }

    const editor = textEditorRefs.current.get(state.insertionTarget.item_id);
    if (!editor) {
      return;
    }

    if (document.activeElement !== editor) {
      editor.focus();
    }

    const offset = Math.min(state.insertionTarget.offset, editor.value.length);
    editor.setSelectionRange(offset, offset);
  }, [state.insertionTarget, state.document]);

  function applyRainyStreetBackground() {
    setState((current) => setRainyStreetBackground(current));
    setAddSearchOpen(false);
    setExported(null);
  }

  return (
    <main className="studio-shell">
      <section className="writing-panel" aria-label="Writing surface">
        <div className="panel-heading">
          <h1>Writing</h1>
          <span className="shortcut">Cmd/Ctrl+K</span>
        </div>
        <ol className="group-list" aria-label="Groups">
          {displayGroups.map((displayGroup) => (
            <li
              key={displayGroup.group.id}
              className={
                displayGroup.group.id === selectedGroup?.id ? "group-row selected" : "group-row"
              }
            >
              <span
                className="group-marker"
                data-testid={`group-marker-${displayGroup.group.id}`}
                aria-label={displayGroup.ariaLabel}
              >
                {displayGroup.markerLabel}
              </span>
              <div className="group-content">
                {displayGroup.items.map((item, index) => {
                  const previousItem = displayGroup.items[index - 1];

                  return (
                    <Fragment key={item.id}>
                      {previousItem ? (
                        <button
                          type="button"
                          className={
                            state.insertionTarget?.kind === "between_items" &&
                            state.insertionTarget.group_id === displayGroup.group.id &&
                            state.insertionTarget.before_item_id === previousItem.id &&
                            state.insertionTarget.after_item_id === item.id
                              ? "between-item-target selected"
                              : "between-item-target"
                          }
                          aria-label={`Insertion point between items in ${displayGroup.ariaLabel}`}
                          onClick={() => {
                            setState((current) =>
                              selectBetweenItemsTarget(
                                current,
                                displayGroup.group.id,
                                previousItem.id,
                                item.id
                              )
                            );
                          }}
                          onKeyDown={(event) => {
                            if (isPrimaryK(event)) {
                              event.preventDefault();
                              setAddSearchOpen(true);
                              return;
                            }
                            if (isSameGroupEnter(event)) {
                              event.preventDefault();
                              setState((current) => insertSameGroupText(current, ""));
                              setExported(null);
                            }
                          }}
                        />
                      ) : null}
                      {item.kind === "text" ? (
                        <textarea
                      ref={(element) => {
                        if (element) {
                          textEditorRefs.current.set(item.id, element);
                        } else {
                          textEditorRefs.current.delete(item.id);
                        }
                      }}
                      className="content-item text-item-editor"
                      aria-label={`Text item in ${displayGroup.ariaLabel}`}
                      value={item.text}
                      placeholder={
                        focusedTextItemId === item.id && item.text === ""
                          ? "Write ordinary dialogue..."
                          : undefined
                      }
                      rows={Math.max(1, item.text.split("\n").length)}
                      onFocus={(event) => {
                        setFocusedTextItemId(item.id);
                        const offset = event.currentTarget.selectionStart ?? item.text.length;
                        setState((current) =>
                          setTextCaretTarget(
                            current,
                            displayGroup.group.id,
                            item.id,
                            offset
                          )
                        );
                      }}
                      onBlur={() => {
                        setFocusedTextItemId((current) => (current === item.id ? null : current));
                        setState((current) =>
                          cleanupEmptyTextItem(current, displayGroup.group.id, item.id)
                        );
                      }}
                      onClick={(event) => {
                        const offset = event.currentTarget.selectionStart ?? item.text.length;
                        setState((current) =>
                          setTextCaretTarget(
                            current,
                            displayGroup.group.id,
                            item.id,
                            offset
                          )
                        );
                      }}
                      onChange={(event) => {
                        const offset = event.currentTarget.selectionStart ?? event.currentTarget.value.length;
                        const text = event.currentTarget.value;
                        setState((current) =>
                          updateTextItem(
                            current,
                            displayGroup.group.id,
                            item.id,
                            text,
                            offset
                          )
                        );
                        setExported(null);
                      }}
                      onKeyDown={(event) => {
                        if (isPrimaryK(event)) {
                          event.preventDefault();
                          setAddSearchOpen(true);
                          return;
                        }
                        if (
                          event.key === "Backspace" &&
                          event.currentTarget.value === "" &&
                          event.currentTarget.selectionStart === 0 &&
                          event.currentTarget.selectionEnd === 0
                        ) {
                          event.preventDefault();
                          setState((current) =>
                            deleteFocusedEmptyTextItem(current, displayGroup.group.id, item.id)
                          );
                          setExported(null);
                          return;
                        }
                        if (isSameGroupEnter(event)) {
                          event.preventDefault();
                          setState((current) => insertSameGroupText(current, ""));
                          setExported(null);
                          return;
                        }
                        if (isLineBreakEnter(event)) {
                          return;
                        }
                        if (isNextGroupEnter(event)) {
                          event.preventDefault();
                          const offset = event.currentTarget.selectionStart ?? item.text.length;
                          setState((current) =>
                            splitTextItemIntoNextGroup(
                              current,
                              displayGroup.group.id,
                              item.id,
                              offset
                            )
                          );
                          setExported(null);
                        }
                      }}
                    />
                  ) : (
                    <button
                      key={item.id}
                      type="button"
                      className="content-item stage-change"
                      aria-pressed={state.selectedItemId === item.id}
                      onClick={() => {
                        setState((current) =>
                          selectStudioTarget(current, displayGroup.group.id, item.id)
                        );
                      }}
                    >
                      {item.text}
                    </button>
                  )}
                    </Fragment>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="canvas-panel" aria-label="Canvas">
        <h2>Canvas</h2>
        <p className="canvas-focus">{selectedGroup ? selectedGroup.id : "No selection"}</p>
        <p>Background: {getDerivedBackgroundLabel(state)}</p>
      </section>

      <section className="preview-panel" aria-label="Preview">
        <h2>Preview</h2>
        {previewPlayerView.isEnd ? (
          <p>End of preview.</p>
        ) : (
          <div className="preview-player">
            <div className="preview-stage">
              {previewPlayerView.textItems.length > 0 ? (
                previewPlayerView.textItems.map((item) => <p key={item.itemId}>{item.text}</p>)
              ) : (
                <p>No text in this Group.</p>
              )}
            </div>
            <p>Background: {previewPlayerView.backgroundLabel}</p>
            <div className="preview-trace">
              <p>Current Group: {previewPlayerView.currentGroupId}</p>
              <p>Current Position: {previewPlayerView.positionId}</p>
              <p>Items: {previewPlayerView.trace.item_ids.join(", ") || "None"}</p>
              <p>
                Stage source:{" "}
                {previewPlayerView.trace.stage_source
                  ? `${previewPlayerView.trace.stage_source.group_id} / ${previewPlayerView.trace.stage_source.item_id}`
                  : "None"}
              </p>
            </div>
            <div className="preview-controls">
              <button
                type="button"
                disabled={!previewPlayerView.canAdvance}
                onClick={() => {
                  setPreviewPlayback((current) => ({
                    ...current,
                    currentGroupId: getNextPreviewGroupId(state.document, current.currentGroupId)
                  }));
                }}
              >
                Preview Next
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewPlayback((current) => ({
                    ...current,
                    currentGroupId: getRestartPreviewGroupId(current)
                  }));
                }}
              >
                Preview Restart
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="export-panel" aria-label="Export">
        <h2>Export</h2>
        <button type="button" onClick={() => setExported(buildStudioExport(state.document))}>
          Export local package
        </button>
        {exported ? (
          <div className="export-result">
            {exported.ok ? <p>Export ready</p> : <p>Export blocked</p>}
            <p>{exported.runtime_manifest.format}</p>
            {exportTraceMatches ? <p>Preview/export trace matched</p> : null}
            {!exported.ok ? (
              <ul>
                {exported.diagnostics.map((diagnostic) => (
                  <li key={diagnostic.code}>{diagnostic.message}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>

      {addSearchOpen ? (
        <div className="add-search" role="dialog" aria-label="Add search">
          <div className="add-search-panel">
            <h2>Add search</h2>
            {MVP1_ADD_SEARCH_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                aria-label={action.label}
                onClick={() => {
                  if (action.id === "set-rainy-street-background") {
                    applyRainyStreetBackground();
                  }
                }}
              >
                <span>{action.label}</span>
                <small>{action.description}</small>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}

function buildDisplayGroups(state: StudioState): DisplayGroup[] {
  return state.document.story.groups.map((group, index) => ({
    group,
    ariaLabel: `Group ${index + 1}`,
    markerLabel: `G${index + 1}`,
    items: group.items.flatMap<DisplayItem>((item) => {
      if (item.kind === "text") {
        return [{ kind: "text" as const, id: item.id, text: item.text }];
      }

      if (item.kind === "stage_change" && item.background_resource_id === "res_bg_rainy_street") {
        return [
          {
            kind: "stage_change" as const,
            id: item.id,
            text: "Stage change: Rainy street background"
          }
        ];
      }

      return [];
    })
  }));
}
