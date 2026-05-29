import { render, screen, waitFor, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { App } from "./App.js";

describe("MVP1.1 Studio document-like writing loop", () => {
  test("starts in the document body without a separate composer or plus controls", () => {
    render(<App />);

    expect(screen.queryByRole("textbox", { name: "Empty document insertion" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Insert inside Group 1" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create empty Group after Group 1" })).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Text item in Group 1" })).toBeInTheDocument();
  });

  test("empty unfocused text items do not show persistent body placeholder copy", async () => {
    const user = userEvent.setup();
    render(<App />);

    const textItem = screen.getByRole("textbox", { name: "Text item in Group 1" });
    expect(textItem).not.toHaveAttribute("placeholder", "Write ordinary dialogue...");

    await user.click(textItem);

    expect(textItem).toHaveAttribute("placeholder", "Write ordinary dialogue...");
    await user.type(textItem, "A");
    expect(textItem).not.toHaveAttribute("placeholder", "Write ordinary dialogue...");
  });

  test("Group markers are quiet gutter metadata rather than primary row labels", () => {
    render(<App />);

    expect(screen.queryByText(/^Group 1$/)).not.toBeInTheDocument();
    expect(screen.getByTestId("group-marker-group_1")).toHaveTextContent("G1");
  });

  test("editing text updates the existing Document text item", async () => {
    const user = userEvent.setup();
    render(<App />);

    const textItem = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(textItem, "A edited");

    expect(textItem).toHaveValue("A edited");
    expect(within(screen.getByRole("list", { name: "Groups" })).getAllByRole("listitem")).toHaveLength(1);
  });

  test("Enter creates the next Group and moves focus there", async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstText = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(firstText, "A");
    await user.keyboard("{Enter}");

    const secondText = screen.getByRole("textbox", { name: "Text item in Group 2" });
    expect(secondText).toHaveFocus();
    await user.type(secondText, "B");

    const groups = within(screen.getByRole("list", { name: "Groups" })).getAllByRole("listitem");
    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveTextContent("A");
    expect(groups[1]).toHaveTextContent("B");
  });

  test("Alt+Enter creates a same-Group text item and moves focus there", async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstText = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(firstText, "A");
    await user.keyboard("{Alt>}{Enter}{/Alt}");

    const groupOneEditors = screen.getAllByRole("textbox", { name: "Text item in Group 1" });
    expect(groupOneEditors).toHaveLength(2);
    expect(groupOneEditors[1]).toHaveFocus();
    await user.type(groupOneEditors[1]!, "B");

    const group = within(screen.getByRole("list", { name: "Groups" })).getByRole("listitem");
    expect(group).toHaveTextContent("A");
    expect(group).toHaveTextContent("B");
  });

  test("Alt+Enter inserts same-Group text immediately after the focused item", async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstText = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(firstText, "A");
    await user.keyboard("{Alt>}{Enter}{/Alt}");
    await user.type(screen.getAllByRole("textbox", { name: "Text item in Group 1" })[1]!, "C");

    const groupOneEditorsBeforeInsert = screen.getAllByRole("textbox", { name: "Text item in Group 1" });
    await user.click(groupOneEditorsBeforeInsert[0]!);
    await user.keyboard("{Alt>}{Enter}{/Alt}");

    const groupOneEditors = screen.getAllByRole("textbox", { name: "Text item in Group 1" });
    expect(groupOneEditors).toHaveLength(3);
    expect(groupOneEditors[1]).toHaveFocus();
    await user.type(groupOneEditors[1]!, "B");

    expect(
      screen
        .getAllByRole("textbox", { name: "Text item in Group 1" })
        .map((editor) => (editor as HTMLTextAreaElement).value)
    ).toEqual(["A", "B", "C"]);
  });

  test("empty same-Group inserted text item is removed on blur", async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstText = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(firstText, "A");
    await user.keyboard("{Alt>}{Enter}{/Alt}");

    expect(screen.getAllByRole("textbox", { name: "Text item in Group 1" })).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Export local package" }));

    await waitFor(() =>
      expect(screen.getAllByRole("textbox", { name: "Text item in Group 1" })).toHaveLength(1)
    );
    expect(screen.getByRole("textbox", { name: "Text item in Group 1" })).toHaveValue("A");
  });

  test("Backspace deletes a focused empty text item without leaving a placeholder row", async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstText = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(firstText, "A");
    await user.keyboard("{Alt>}{Enter}{/Alt}");
    await user.type(screen.getAllByRole("textbox", { name: "Text item in Group 1" })[1]!, "C");

    await user.click(screen.getAllByRole("textbox", { name: "Text item in Group 1" })[0]!);
    await user.keyboard("{Alt>}{Enter}{/Alt}");
    await user.keyboard("{Backspace}");

    const groupOneEditors = screen.getAllByRole("textbox", { name: "Text item in Group 1" });
    expect(groupOneEditors).toHaveLength(2);
    expect(groupOneEditors.map((editor) => (editor as HTMLTextAreaElement).value)).toEqual(["A", "C"]);
    expect(screen.queryByText("Write ordinary dialogue...")).not.toBeInTheDocument();
  });

  test("same-Group insertion target can place a text item between two existing text items", async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstText = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(firstText, "A");
    await user.keyboard("{Alt>}{Enter}{/Alt}");
    await user.type(screen.getAllByRole("textbox", { name: "Text item in Group 1" })[1]!, "C");

    const insertionPoint = screen.getByRole("button", {
      name: "Insertion point between items in Group 1"
    });
    await user.click(insertionPoint);
    await waitFor(() => expect(insertionPoint).toHaveClass("selected"));
    await user.keyboard("{Alt>}{Enter}{/Alt}");

    const groupOneEditors = screen.getAllByRole("textbox", { name: "Text item in Group 1" });
    expect(groupOneEditors).toHaveLength(3);
    expect(groupOneEditors[1]).toHaveFocus();
    await user.type(groupOneEditors[1]!, "B");

    expect(groupOneEditors.map((editor) => (editor as HTMLTextAreaElement).value)).toEqual([
      "A",
      "B",
      "C"
    ]);
  });

  test("Shift+Enter inserts a newline inside the same text item", async () => {
    const user = userEvent.setup();
    render(<App />);

    const textItem = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(textItem, "First");
    await user.keyboard("{Shift>}{Enter}{/Shift}");
    await user.type(textItem, "Second");

    expect(textItem).toHaveValue("First\nSecond");
    expect(within(screen.getByRole("list", { name: "Groups" })).getAllByRole("listitem")).toHaveLength(1);
  });

  test("Cmd+K inserts the background action at the current text caret location", async () => {
    const user = userEvent.setup();
    render(<App />);

    const textItem = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(textItem, "A");
    await user.keyboard("{Meta>}k{/Meta}");
    await user.click(screen.getByRole("button", { name: "Set rainy street background" }));

    const group = within(screen.getByRole("list", { name: "Groups" })).getByRole("listitem");
    expect(group).toHaveTextContent("A");
    expect(group).toHaveTextContent("Stage change: Rainy street background");
    expect(screen.getByText("Background: Rainy street")).toBeInTheDocument();
  });

  test("repeating the same background action creates another visible stage_change item", async () => {
    const user = userEvent.setup();
    render(<App />);

    const textItem = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(textItem, "A");
    await user.keyboard("{Meta>}k{/Meta}");
    await user.click(screen.getByRole("button", { name: "Set rainy street background" }));
    await user.click(textItem);
    await user.keyboard("{Meta>}k{/Meta}");
    await user.click(screen.getByRole("button", { name: "Set rainy street background" }));

    const group = within(screen.getByRole("list", { name: "Groups" })).getByRole("listitem");
    expect(within(group).getAllByText("Stage change: Rainy street background")).toHaveLength(2);
  });

  test("Preview and Export panels expose parity evidence", async () => {
    const user = userEvent.setup();
    render(<App />);

    const firstText = screen.getByRole("textbox", { name: "Text item in Group 1" });
    await user.type(firstText, "Mira: The rain stopped.");
    await user.keyboard("{Enter}");
    await user.type(screen.getByRole("textbox", { name: "Text item in Group 2" }), "Ren: Quiet never lasts here.");

    expect(screen.getByText("preview.started")).toBeInTheDocument();
    expect(screen.getByText("group.completed")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Export local package" }));

    expect(screen.getByText("Export ready")).toBeInTheDocument();
    expect(screen.getByText("taro.local-playable.v0")).toBeInTheDocument();
    expect(screen.getByText("Preview/export trace matched")).toBeInTheDocument();
  });
});
