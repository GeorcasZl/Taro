# Taro 加速推进计划

Created: 2026-05-29 15:48 CST

## 1. 目标

把 Taro 从“方向很多、每次推进偏大”切换到“短切片、快验证、可回滚”的节奏。

本计划覆盖未来约 1–2 周，重点不是扩大产品范围，而是把当前 MVP1.1 与最小 dogfood loop 收口到可持续迭代状态。

核心目标：

1. 建立可 review、可回滚的工程基线。
2. 固定日常 fast loop 与 milestone full gate。
3. 收口 MVP1.1 Writing surface 的核心编辑语义。
4. 把 Preview 从 trace evidence 推进到最小可玩预览。
5. 让当前作者文档可以保存、恢复、导出。
6. 在前面稳定后，再做最小 branching proof。

## 2. 当前上下文

项目路径：`/Users/lxxxzl/Documents/Taro`

当前产品定位：

- Taro 是 text-first branching narrative studio。
- Writing is the source of truth。
- Group 是玩家一次推进的单位。
- Canvas、Preview、Export 都应从同一份 Document 派生。
- 逻辑、状态、跳转、关键舞台变化必须可见、可搜索、可编辑、可诊断。

当前仓库信号：

- `package.json` 已有：
  - `npm run docs:check`
  - `npm run typecheck`
  - `npm test`
  - `npm run check`
  - `npm run test:browser`
  - `npm run export:mvp1`
- 当前 repo 仍处于初始状态，之前检查显示大量文件为 untracked，甚至还没有首个 commit。
- 已有 core / studio / browser tests，但开发节奏需要更明确的验证分层。
- 当前最应收口的是 MVP1.1 Writing surface，而不是扩到插件、完整 Canvas、完整 branching 或高保真 UI。

## 3. 推进原则

### 3.1 每次只做一个窄切片

每张实现卡必须明确：

- 用户工作流变了什么；
- 哪个 source-of-truth 对象变了；
- API contract 是否变；
- 哪些测试证明它；
- 哪些 docs 需要同步。

如果不能在一张卡里说明验收，就拆小。

### 3.2 日常验证和 milestone 验证分开

日常不应每次跑完整 heavy gate。建议分层：

日常 fast loop：

```bash
npm run docs:check
npm run typecheck
npm test
```

浏览器 smoke：

```bash
npm run test:browser -- -g "MVP1 ordinary dialogue loop reaches export parity"
```

milestone full gate：

```bash
npm run check
npm run test:browser
npm run export:mvp1
```

### 3.3 先闭环，再扩面

优先证明：

```text
Writing -> Preview -> Export -> reload / dogfood
```

不要在这个闭环稳定前扩展到完整 plugin、template、Canvas story map、完整 conditions / records manager。

### 3.4 docs 与实现同步

如果修改产品行为，需要同步：

- `docs/MVP.md`
- 相关 `docs/spec/`
- 必要时更新 `docs/API_CONTRACTS.md` / `docs/STATE_MODEL.md`
- `CHANGELOG.md`

### 3.5 交接必须有新鲜证据

每个实现切片最终报告必须包含：

- changed files；
- commands run；
- pass / fail 结果；
- 未验证项；
- 如果有 UI 行为，说明用户如何手动复现。

## 4. 阶段安排

## Phase 0：建立工程基线

目标：让后续所有改动都有清晰 diff、review 和回滚点。

### 任务 0.1：确认当前基线可验证

建议执行：

```bash
npm run docs:check
npm run typecheck
npm test
git status --short --untracked-files=all
```

验收：

- docs check 通过。
- typecheck 通过。
- Vitest 通过。
- 明确记录当前未跟踪文件列表。

### 任务 0.2：建立首个 baseline commit

建议在确认 0.1 后执行：

```bash
git add .
git commit -m "chore: establish Taro MVP baseline"
```

验收：

- `git status --short` 为空，或只剩明确不应提交的本地文件。
- 后续开发可以用 `git diff` 清楚看到本次切片改动。

注意：这个动作会改变 git 历史状态，需要执行前由项目 owner 确认。

### 任务 0.3：增加验证脚本分层

建议新增或调整 scripts：

```json
{
  "check:fast": "npm run docs:check && npm run typecheck && npm test",
  "check:full": "npm run check && npm run test:browser && npm run export:mvp1",
  "verify:mvp1": "npm run build && npm run test:browser && node scripts/export-mvp1-fixture.mjs"
}
```

验收：

- `npm run check:fast` 能作为日常默认 gate。
- `npm run check:full` 能作为 milestone gate。
- README 或开发文档说明什么时候跑哪个命令。

## Phase 1：MVP1.1 Writing surface 收口

目标：把 Writing surface 的最小文档编辑器语义做实。

这阶段不做：

- 完整 branching；
- 完整 Canvas story map；
- plugin/template；
- 高保真 UI；
- full rich text editor；
- drag/drop；
- multi-selection；
- full undo/redo。

### 任务 1.1：same-Group insertion after current item

目标：`Alt/Option+Enter` 不再 append 到 Group 底部，而是插入到当前 text item 后面。

验收场景：

```text
Group 1:
A
C

focus A
press Alt/Option+Enter
type B

result:
A
B
C
```

验收标准：

- Document item order 为 A, B, C。
- Preview / Export 使用同一顺序。
- selection / focus 变化不增加 `document.revision`。
- 对应 unit test 与 browser/interaction test 覆盖。

可能涉及文件：

- `packages/studio/src/studioState.ts`
- `packages/studio/src/insertionModel.ts`
- `packages/studio/src/App.tsx`
- `packages/studio/src/*.test.tsx`
- `tests` 或 Playwright specs
- `docs/MVP.md`
- 相关 `docs/spec/`

### 任务 1.2：transient blank editing position

目标：允许“临时空白编辑位”，但不允许“持久空 text item 内容”。

产品规则：

- 空白不是内容。
- 空白是插入位置或编辑暂态。
- Preview / Export 不应包含 empty text event。
- 叙事停顿未来用 explicit wait / beat 表达，不靠空 text item。

验收：

- 创建 same-Group 空编辑位后，如果输入文本，它变成真实 text item。
- 如果 blur 时仍为空，它消失。
- 如果已有 text item 被删空并 blur，它从 Document 移除，除非这是完全空文档的唯一临时入口。
- stage-only Group 不被强行塞入空 text item。
- UI 不显示持续的 `Write ordinary dialogue...` body placeholder 噪声。

可能涉及文件：

- `packages/studio/src/studioState.ts`
- `packages/studio/src/App.tsx`
- `packages/core/src/document.ts`，仅当 core command 需要补语义时
- tests
- `docs/MVP.md`

### 任务 1.3：delete line / cancel empty editing position

目标：最小删除语义成立。

验收：

- focus 在空白编辑位时按 Backspace，取消该编辑位。
- focus 在 empty text item 时按 Backspace，删除该 item。
- 删除后 focus 移到合理邻居：优先 previous text item，其次 next text item，其次 Group-level insertion target。
- 不误删 stage_change、wait、record_write 等非 text structural items。

不进入范围：

- 跨 Group merge；
- 多选删除；
- rich text selection deletion；
- 完整 undo stack。

### 任务 1.4：between-item insertion affordance

目标：用户能在同 Group 两个 text items 中间建立插入目标。

验收：

- Group 1 有 A 和 C。
- 用户可以把 insertion target 放在 A 与 C 之间。
- 使用 Add/Search 或 same-Group action 插入 B。
- Document 顺序为 A, B, C。
- 不依赖永久 plus button 作为主 authoring path。

可接受的低保真实现：

- focus current item + keyboard action；
- subtle insertion line；
- hover/focus 才出现的低噪声 gap affordance。

不可接受：

- 常驻 row-local plus button 成为主要交互；
- 只能 append 到 Group 底部。

### 任务 1.5：Group marker 降噪

目标：Group 仍可见，但不压过正文。

验收：

- Group marker 是 quiet gutter metadata 或 hover/selection/debug metadata。
- 不像表单 row label 那样主导 Writing surface。
- 自动化测试可以通过 role/text 只弱约束，避免把视觉样式锁死过早。

## Phase 2：最小可玩 Preview

目标：Preview 不只是事件列表，而是可供创作者判断节奏的最小播放表面。

### 任务 2.1：Preview current Group player view

验收：

- Preview 显示当前 Group 的实际文本。
- Preview 显示当前继承背景或 stage state label。
- 提供 `Next` / `Restart`。
- Preview 操作不修改 Document revision。
- 显示最小 source trace：current group id、item ids、stage source。

可能涉及文件：

- `packages/core/src/preview*`
- `packages/studio/src/App.tsx`
- `packages/studio/src/studioState.ts`
- tests

### 任务 2.2：Preview / Export parity 继续作为证据

验收：

- 写入两个文本 Groups，中间插入 stage-only background Group。
- Preview 按 Group 推进时能看到背景继承。
- Export manifest trace 与 Preview 顺序一致。
- Browser smoke 覆盖 author -> preview next -> export parity。

不进入范围：

- 完整 player skin；
- 高保真动画；
- Auto Mode；
- rollback/history。

## Phase 3：当前文档可保存 / 恢复 / 导出

目标：让 Taro 可以真实 dogfood 一个小作品，而不是每次从空白 demo 开始。

### 任务 3.1：最小 persistence

两种可选路径：

路径 A：localStorage auto-save

- 优点：最快进入 dogfood。
- 风险：测试需要稳定 reset。

路径 B：import/export `document.taro.json`

- 优点：source-of-truth 更清楚。
- 风险：文件交互实现稍重。

建议先做路径 A，再补路径 B 的最小导入导出。

验收：

- 写 3–5 个 Groups，插入背景。
- 刷新页面后内容仍在，或通过导出再导入恢复。
- 有明确 `New blank document` / `Reset sample`，避免测试受本地状态污染。
- Playwright 覆盖 save/reload 或 import/export roundtrip。

### 任务 3.2：Studio export 当前文档

目标：Studio 里的 Export 针对当前作者 Document，而不是只依赖 fixture。

验收：

- 当前 Studio 文档可以生成 `taro.local-playable.v0`。
- package 行为与 Preview 一致。
- fixture export smoke 仍保留。
- 新增当前文档 export 的 browser 侧验证。

## Phase 4：最小 branching proof

目标：证明 Taro 是 branching studio，但不做完整分支系统。

前置条件：Phase 1 和 Phase 2 基本稳定。

### 任务 4.1：visible jump item

范围：

- Add/Search 插入 visible jump item。
- 目标可以是已有 Group / stable position。
- jump item 在 Writing 中可见、可选中。
- broken jump 有 source-linked diagnostic。

验收：

```text
A -> B -> Ending
在 A 后插入 jump to Ending
Preview 跳过 B
Export parity 通过
```

broken target 验收：

- Preview / Export 报 `BROKEN_JUMP_TARGET` 或等价诊断。
- Export 对 broken jump 阻塞。
- 诊断能定位回 Writing source。

不进入范围：

- choice UI；
- conditions builder；
- records manager；
- branching Canvas map。

## 5. 建议任务卡模板

每个实现任务使用这个结构：

```text
Title:

Goal:

Scope:
- In:
- Out:

Product behavior:

Source-of-truth impact:

Files likely to change:

Acceptance:
1.
2.
3.

Verification commands:

Docs to update:

Final handoff must include:
- changed files
- tests run
- pass/fail
- unverified items
```

## 6. 推荐执行顺序

1. Phase 0.1：确认当前基线可验证。
2. Phase 0.2：建立 baseline commit。
3. Phase 0.3：增加 `check:fast` / `check:full` 或等价验证分层。
4. Phase 1.1：same-Group insertion after current item。
5. Phase 1.2：transient blank editing position。
6. Phase 1.3：delete line / cancel empty editing position。
7. Phase 1.4：between-item insertion affordance。
8. Phase 2.1：Preview current Group player view。
9. Phase 2.2：Preview / Export parity smoke。
10. Phase 3.1：最小 persistence。
11. Phase 3.2：Studio export 当前文档。
12. Phase 4.1：visible jump item。

## 7. 风险与处理

### 风险 1：继续扩范围

处理：任何新需求先归类到 Phase 4 之后，除非它直接影响 MVP1.1 Writing 收口。

### 风险 2：测试太重导致迭代慢

处理：坚持 fast loop / browser smoke / full gate 分层。

### 风险 3：docs 已声明但 UI 未实现

处理：每张任务卡都显式检查 docs 与实现差异。实现未完成时不要在文档中写成已完成事实。

### 风险 4：空白行语义反复

处理：采用稳定规则：允许 transient blank editing position，不允许 persistent empty text item 作为 authored content。

### 风险 5：stale build artifacts 影响判断

处理：在工程基线任务中检查 `packages/core/dist` 与 studio dev/test 的关系，必要时把 Studio test/dev alias 到 core source，避免用旧 dist。

## 8. 暂不进入范围

未来 1–2 周内不主动做：

- 完整插件系统；
- 完整模板系统；
- 完整 Canvas story map；
- 完整 choices / conditions / records manager；
- 高保真 UI / 完整 design system；
- marketplace / publishing；
- cloud collaboration；
- mobile editor；
- player Auto Mode；
- player rollback/history；
- 完整 rich text editor；
- multi-cursor / drag-drop / full undo-redo。

## 9. 下一步建议

最直接的下一步是执行 Phase 0：

1. 跑 fast baseline verification。
2. 确认是否允许创建 baseline commit。
3. 增加或确认验证脚本分层。
4. 之后立刻进入 Phase 1.1。

如果不想先 commit，也可以先做 Phase 1.1，但这会让后续 review 和回滚继续困难。
