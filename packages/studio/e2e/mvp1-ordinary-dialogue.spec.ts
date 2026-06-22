import { expect, test } from "@playwright/test";
import {
  applyDocumentCommand,
  buildLocalExportPackage,
  createMvp1Document
} from "@taro/core";

const primaryK = process.platform === "darwin" ? "Meta+K" : "Control+K";

test("MVP1 ordinary dialogue loop reaches export parity", async ({ page }) => {
  await page.goto("/");

  const groups = page.getByRole("list", { name: "Groups" }).getByRole("listitem");
  const firstText = page.getByRole("textbox", { name: "Text item in Group 1" });
  await expect(page.getByRole("textbox", { name: "Empty document insertion" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Create empty Group after Group 1" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Insert inside Group 1" })).toHaveCount(0);
  await expect(firstText).not.toHaveAttribute("placeholder", "Write ordinary dialogue...");
  await expect(page.getByText("Group 1", { exact: true })).toHaveCount(0);

  await firstText.fill("A");
  await expect(groups).toHaveCount(1);
  await expect(groups.first()).toContainText("A");

  await firstText.press("Alt+Enter");
  const groupOneTextItems = page.getByRole("textbox", { name: "Text item in Group 1" });
  await expect(groupOneTextItems).toHaveCount(2);
  await expect(groupOneTextItems.nth(1)).toBeFocused();

  await groupOneTextItems.nth(1).press(primaryK);
  await page.getByRole("button", { name: "Set rainy street background" }).click();
  await expect(page.getByRole("region", { name: "Canvas" }).getByText("Background: Rainy street")).toBeVisible();

  await page.getByRole("button", { name: "Export local package" }).click();
  await expect(page.getByText("Export ready")).toBeVisible();
  await expect(page.getByText("Preview/export trace matched")).toBeVisible();
});

test("MVP1.1 clicking text edits the existing Document text item", async ({ page }) => {
  await page.goto("/");

  const firstText = page.getByRole("textbox", { name: "Text item in Group 1" });
  await firstText.fill("A");
  await firstText.click();
  await firstText.type(" edited");

  await expect(page.getByRole("list", { name: "Groups" }).getByRole("listitem")).toHaveCount(1);
  await expect(firstText).toHaveValue("A edited");
});

test("MVP1.1 Enter creates next Group and moves focus to its text", async ({ page }) => {
  await page.goto("/");

  const firstText = page.getByRole("textbox", { name: "Text item in Group 1" });
  const groups = page.getByRole("list", { name: "Groups" }).getByRole("listitem");
  await firstText.fill("A");
  await firstText.press("Enter");

  const secondText = page.getByRole("textbox", { name: "Text item in Group 2" });
  await expect(groups).toHaveCount(2);
  await expect(secondText).toBeFocused();
  await secondText.fill("B");
  await expect(groups.nth(0)).toContainText("A");
  await expect(groups.nth(1)).toContainText("B");
});

test("MVP1.1 Alt+Enter inserts same-Group text and moves focus there", async ({ page }) => {
  await page.goto("/");

  const firstText = page.getByRole("textbox", { name: "Text item in Group 1" });
  const groups = page.getByRole("list", { name: "Groups" }).getByRole("listitem");
  await firstText.fill("A");
  await firstText.press("Alt+Enter");

  const groupOneTextItems = page.getByRole("textbox", { name: "Text item in Group 1" });
  await expect(groups).toHaveCount(1);
  await expect(groupOneTextItems).toHaveCount(2);
  await expect(groupOneTextItems.nth(1)).toBeFocused();
  await groupOneTextItems.nth(1).fill("B");
  await expect(groups.first()).toContainText("A");
  await expect(groups.first()).toContainText("B");
});

test("MVP1.1 Alt+Enter inserts same-Group text after the focused item", async ({ page }) => {
  await page.goto("/");

  const firstText = page.getByRole("textbox", { name: "Text item in Group 1" });
  await firstText.fill("A");
  await firstText.press("Alt+Enter");

  const groupOneTextItems = page.getByRole("textbox", { name: "Text item in Group 1" });
  await groupOneTextItems.nth(1).fill("C");
  await groupOneTextItems.nth(0).click();
  await groupOneTextItems.nth(0).press("Alt+Enter");

  await expect(groupOneTextItems).toHaveCount(3);
  await expect(groupOneTextItems.nth(1)).toBeFocused();
  await groupOneTextItems.nth(1).fill("B");
  await expect(groupOneTextItems.nth(0)).toHaveValue("A");
  await expect(groupOneTextItems.nth(1)).toHaveValue("B");
  await expect(groupOneTextItems.nth(2)).toHaveValue("C");
});

test("MVP1.1 empty same-Group text is removed when it blurs", async ({ page }) => {
  await page.goto("/");

  const firstText = page.getByRole("textbox", { name: "Text item in Group 1" });
  await firstText.fill("A");
  await firstText.press("Alt+Enter");

  const groupOneTextItems = page.getByRole("textbox", { name: "Text item in Group 1" });
  await expect(groupOneTextItems).toHaveCount(2);
  await page.getByRole("button", { name: "Export local package" }).click();

  await expect(groupOneTextItems).toHaveCount(1);
  await expect(groupOneTextItems.first()).toHaveValue("A");
  await expect(page.getByPlaceholder("Write ordinary dialogue...")).toHaveCount(0);
});

test("MVP1.1 Backspace deletes a focused empty same-Group text item", async ({ page }) => {
  await page.goto("/");

  const firstText = page.getByRole("textbox", { name: "Text item in Group 1" });
  await firstText.fill("A");
  await firstText.press("Alt+Enter");

  const groupOneTextItems = page.getByRole("textbox", { name: "Text item in Group 1" });
  await groupOneTextItems.nth(1).fill("C");
  await groupOneTextItems.nth(0).click();
  await groupOneTextItems.nth(0).press("Alt+Enter");
  await expect(groupOneTextItems).toHaveCount(3);

  await groupOneTextItems.nth(1).press("Backspace");

  await expect(groupOneTextItems).toHaveCount(2);
  await expect(groupOneTextItems.nth(0)).toHaveValue("A");
  await expect(groupOneTextItems.nth(1)).toHaveValue("C");
});

test("MVP1.1 can insert a same-Group text item between two existing text items", async ({ page }) => {
  await page.goto("/");

  const firstText = page.getByRole("textbox", { name: "Text item in Group 1" });
  await firstText.fill("A");
  await firstText.press("Alt+Enter");

  const groupOneTextItems = page.getByRole("textbox", { name: "Text item in Group 1" });
  await groupOneTextItems.nth(1).fill("C");
  await page.getByRole("button", { name: "Insertion point between items in Group 1" }).click();
  await page.keyboard.press("Alt+Enter");

  await expect(groupOneTextItems).toHaveCount(3);
  await expect(groupOneTextItems.nth(1)).toBeFocused();
  await groupOneTextItems.nth(1).fill("B");

  await expect(groupOneTextItems.nth(0)).toHaveValue("A");
  await expect(groupOneTextItems.nth(1)).toHaveValue("B");
  await expect(groupOneTextItems.nth(2)).toHaveValue("C");
});

test("MVP1.1 Shift+Enter creates a newline inside the same text item", async ({ page }) => {
  await page.goto("/");

  const editor = page.getByRole("textbox", { name: "Text item in Group 1" });
  const groups = page.getByRole("list", { name: "Groups" }).getByRole("listitem");
  await editor.fill("First");
  await editor.press("Shift+Enter");
  await editor.type("Second");

  await expect(groups).toHaveCount(1);
  await expect(editor).toHaveValue("First\nSecond");
});

test("MVP1.1 Cmd/Ctrl+K inserts stage change at current text caret", async ({ page }) => {
  await page.goto("/");

  const editor = page.getByRole("textbox", { name: "Text item in Group 1" });
  const groups = page.getByRole("list", { name: "Groups" }).getByRole("listitem");
  await editor.fill("A");
  await editor.press(primaryK);
  await page.getByRole("button", { name: "Set rainy street background" }).click();

  await expect(groups).toHaveCount(1);
  await expect(groups.first()).toContainText("A");
  await expect(groups.first()).toContainText("Stage change: Rainy street background");
  await expect(page.getByRole("region", { name: "Canvas" }).getByText("Background: Rainy street")).toBeVisible();
});

test("MVP1 Canvas derives linear stage background for later Groups", async ({ page }) => {
  await page.goto("/");

  const editor = page.getByRole("textbox", { name: "Text item in Group 1" });
  await expect(page.getByRole("region", { name: "Canvas" }).getByText("Background: None set")).toBeVisible();

  await editor.fill("A");
  await editor.press(primaryK);
  await page.getByRole("button", { name: "Set rainy street background" }).click();
  await expect(page.getByRole("region", { name: "Canvas" }).getByText("Background: Rainy street")).toBeVisible();

  await editor.press("Enter");
  await page.getByRole("textbox", { name: "Text item in Group 2" }).fill("B");
  await expect(page.getByRole("region", { name: "Canvas" }).getByText("group_2")).toBeVisible();
  await expect(page.getByRole("region", { name: "Canvas" }).getByText("Background: Rainy street")).toBeVisible();

  await page.getByRole("button", { name: "Export local package" }).click();
  await expect(page.getByText("Export ready")).toBeVisible();
  await expect(page.getByText("Preview/export trace matched")).toBeVisible();
});

test("MVP1 Preview player advances locally and preserves export parity", async ({ page }) => {
  await page.goto("/");

  const firstText = page.getByRole("textbox", { name: "Text item in Group 1" });
  await firstText.fill("A");
  await firstText.press(primaryK);
  await page.getByRole("button", { name: "Set rainy street background" }).click();

  await firstText.click();
  await firstText.press("Enter");
  await page.getByRole("textbox", { name: "Text item in Group 2" }).fill("B");
  await firstText.click();

  const preview = page.getByRole("region", { name: "Preview" });
  await expect(preview.getByText("A", { exact: true })).toBeVisible();
  await expect(preview.getByText("Background: Rainy street")).toBeVisible();

  await preview.getByRole("button", { name: "Preview Next" }).click();
  await expect(preview.getByText("B", { exact: true })).toBeVisible();
  await expect(preview.getByText("Background: Rainy street")).toBeVisible();

  await preview.getByRole("button", { name: "Preview Restart" }).click();
  await expect(preview.getByText("A", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Export local package" }).click();
  await expect(page.getByText("Preview/export trace matched")).toBeVisible();
});

test("MVP1 repeated same background insertion creates visible stage changes", async ({ page }) => {
  await page.goto("/");

  const editor = page.getByRole("textbox", { name: "Text item in Group 1" });
  await editor.fill("A");

  await editor.press(primaryK);
  await page.getByRole("button", { name: "Set rainy street background" }).click();
  await editor.press(primaryK);
  await page.getByRole("button", { name: "Set rainy street background" }).click();

  await expect(page.getByText("Stage change: Rainy street background")).toHaveCount(2);
  await expect(page.getByRole("region", { name: "Canvas" }).getByText("Background: Rainy street")).toBeVisible();
});

test("MVP1.1 normal authoring does not require visible composer or plus controls", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("textbox", { name: "Empty document insertion" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Insert inside Group 1" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Create empty Group after Group 1" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Insertion point between Group 1 and Group 2" })).toHaveCount(0);
  await expect(page.getByPlaceholder("Write ordinary dialogue...")).toHaveCount(0);
  await expect(page.getByTestId("group-marker-group_1")).toHaveText("G1");
});

test("MVP1 exported playable renders inherited linear background", async ({ page }) => {
  let document = createMvp1Document({
    document_id: "doc_export_stage",
    title: "Export Stage"
  });
  document = applyDocumentCommand(document, {
    command_id: "cmd_1",
    actor: "user",
    source_surface: "writing",
    document_id: "doc_export_stage",
    operation: "group.create_after",
    expected_revision: 0,
    payload: {
      after_group_id: null,
      group_id: "group_prelude",
      position_id: "pos_prelude",
      text_item: { item_id: "item_prelude", text: "Prelude" }
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_2",
    actor: "user",
    source_surface: "writing",
    document_id: "doc_export_stage",
    operation: "group.create_after",
    expected_revision: 1,
    payload: {
      after_group_id: "group_prelude",
      group_id: "group_intro",
      position_id: "pos_intro",
      text_item: { item_id: "item_intro", text: "A" }
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_3",
    actor: "user",
    source_surface: "writing",
    document_id: "doc_export_stage",
    operation: "group.create_after",
    expected_revision: 2,
    payload: {
      after_group_id: "group_intro",
      group_id: "group_reply",
      position_id: "pos_reply",
      text_item: { item_id: "item_reply", text: "B" }
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_4",
    actor: "user",
    source_surface: "canvas",
    document_id: "doc_export_stage",
    operation: "resource.add",
    expected_revision: 3,
    payload: {
      resource: { id: "res_bg_rainy_street", kind: "image", path: "assets/rainy-street.png" }
    }
  }).document;
  document = applyDocumentCommand(document, {
    command_id: "cmd_5",
    actor: "user",
    source_surface: "canvas",
    document_id: "doc_export_stage",
    operation: "stage.set_background",
    expected_revision: 4,
    payload: {
      group_id: "group_intro",
      item_id: "item_bg_intro",
      background_resource_id: "res_bg_rainy_street"
    }
  }).document;

  document = {
    ...document,
    story: {
      ...document.story,
      entry_group_id: "group_intro"
    }
  };

  const exported = buildLocalExportPackage(document, { artifact_path: "dist/export-stage" });
  const html = exported.files.find((file) => file.path === "index.html")?.contents;
  expect(html).toBeDefined();

  await page.setContent(html!);
  await expect(page.getByText("Prelude")).not.toBeVisible();
  await expect(page.getByText("A", { exact: true })).toBeVisible();
  await expect(page.getByText("Background: res_bg_rainy_street")).toBeVisible();

  await page.getByRole("button", { name: "Next" }).click();
  await expect(page.getByText("B", { exact: true })).toBeVisible();
  await expect(page.getByText("Background: res_bg_rainy_street")).toBeVisible();
});
