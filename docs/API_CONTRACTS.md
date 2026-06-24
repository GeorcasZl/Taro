# Taro API 契约

## 目的

本文档定义了 Taro 系统各模块之间通信的标准边界。它明确了对 Document 的合法修改方式、视图如何订阅状态更新、以及组件如何与核心引擎交互。所有模块（甚至未来的第三方模块）只要遵守这些契约，就能无缝集成到 Taro 生态中。

## Document Command 信封格式

Taro 中所有对 Document 的修改都必须通过发送 `Document Command` 来完成。命令的通用信封格式如下：

```json
{
  "type": "command_namespace.action_name",
  "payload": { ... },
  "position_id": "optional_target_position_id",
  "timestamp": 1690000000,
  "client_id": "studio_local"
}
```
引擎的核心接收到命令后，会进行校验（Validation），应用状态变更（Patch），并将结果广播给所有派生视图。

## 命令分类

### Group 命令
管理基础的内容组织块。
- `group.create`: 在指定位置创建一个新的 Group，可设定初始的 `advance_mode`。
- `group.delete`: 删除指定的 Group 及其内部的所有事件绑定。
- `group.set_advance_mode`: 更改 Group 的结束条件（`click` / `trigger` / `auto`）。
- `group.set_metadata`: 更新 Group 的元数据（如编辑器中的标签颜色）。

### 事件绑定命令
直接管理底层事件流转（高级用法）。
- `event.add_binding`: 在某个 Group 内添加一条 Trigger → Response 的绑定。
- `event.remove_binding`: 移除某条绑定。
- `event.reorder`: 重新排列 Group 内绑定的优先级/执行顺序。

### 内容命令（语法糖层）
为了让创作者操作更自然，Taro 提供了一组高级内容命令。在写入 Document 之前，这些命令会被**自动展开（Desugar）**为底层的事件绑定。
- `content.add_dialogue`: 自动生成触发器为 `group_enter`、响应为显示文本的事件绑定。
- `content.add_narration`: 类似对话，但采用旁白显示模式。
- `content.add_choice`: 自动生成按钮 UI 渲染响应及对应的跳转触发器。
- `content.add_condition`: 自动生成针对记录的条件检查触发器。
- `content.add_jump`: 自动生成强制跳转至目标位置的响应。

### 记录命令
管理用于追踪游戏状态的变量。
- `record.define`: 声明一个新的记录变量，定义其名称、数据类型（基础或结构化）及初始值。
- `record.write`: 在故事流中插入一个修改记录变量的事件绑定。
- `record.delete`: 删除记录定义。

### 资源命令
- `resource.add`: 将外部文件引入项目并分配内部引用 ID。
- `resource.remove`: 移除资源引用。

### 舞台命令
在底层，舞台指令实际上也是事件绑定的语法糖，但从创作者视角，它们直接操控视觉效果。
- `stage.set_background`: 生成在当前 Group 进入时切换背景的事件绑定。
- `stage.set_character`: 生成显示或隐藏角色的事件。
- `stage.move_character`: 生成移动角色的事件。
- `stage.set_expression`: 改变角色表情。
- `stage.set_bgm`: 切换背景音乐。
- `stage.set_ambience`: 播放环境音效。

### 组件命令
- `component.register`: 向当前项目注册一个新的自定义组件。
- `component.configure`: 修改组件的全局配置参数。

### 分组命令
管理纯组织的目录树。
- `folder.create`: 新建分组文件夹。
- `folder.move`: 移动分组或改变层级。
- `folder.rename`: 重命名分组。
- `folder.delete`: 删除分组（可选择是否连带删除内容）。

## 查询契约

为了渲染派生视图，前端 Studio 可以向后端/核心发起查询：
- **Document 查询**：请求整个故事树的结构，用于渲染剧本流。
- **舞台状态派生查询**：传入一个特定的 `Position`，请求引擎推演出在该位置的视觉状态快照。
- **记录状态查询**：获取在某个位置时，各变量的预计当前值。
- **诊断查询**：获取项目中当前存在的所有错误和警告列表。

## 编辑器状态契约

包含并非存储在 Document 中的纯 UI 状态（如：选中了哪个 Group，折叠了哪个 Folder）。这些状态仅在客户端会话内维持，或者仅保存在本地的 `workspace.json` 中，不随项目导出。

## Document Schema（taro.document.v1）

所有数据最终序列化为一个 JSON 结构（`document.taro.json`），它的模式版本为 `v1`。
它包含：项目元数据、以 `Group` 为节点的图结构、每个 Group 内嵌的事件绑定数组、记录字典、资源字典和分组树。

## 预览契约

### 事件驱动的预览模式
Studio 的预览模式直接实例化引擎的 Runtime 对象。当启动预览时，它并不“逐行执行”文本，而是激活当前 Group 的 `group_enter` 事件，等待所有后续的 trigger（比如玩家点击或定时器到期）来推动执行。

### 预览暴露的状态
为了辅助调试，预览环境除了渲染游戏画面，还会向外暴露当前的临时状态（如哪些变量发生了变化），以便 Studio 的时间线和属性面板能够高亮当前正在执行的动作。

## 组件契约

### 组件清单（Manifest）格式
每个自定义组件必须提供一个 JSON 清单，包含组件名称、版本、入口文件以及配置参数的 Schema。

### 事件声明格式
组件必须显式声明其**交互边界**：
- `inputs`：组件能接收的响应类型（例如：`receive_chat_message`）。
- `outputs`：组件能触发的事件类型（例如：`chat_option_selected`）。
Taro 核心会根据这些声明在 Studio 中自动生成对应的交互 UI。

### 组件生命周期
组件暴露 `mount`, `update`, `unmount` 生命周期方法，供 Taro 引擎在合适的叙事节点调用和销毁组件。

## 诊断契约

诊断器（Diagnostics）作为一个后台运行的纯函数观察者。它接收 Document 的 Patch，并输出一组格式化的 `DiagnosticItem`（包含错误级别、消息说明、以及可导航点击的定位信息）。它**永远不会**反过来修改 Document。

## 导出契约

### 桌面应用导出（Electron/Tauri）
导出机制会将整个 Taro 运行引擎（Web 格式）、已注册的组件、所需资源文件，以及最新的 `document.taro.json` 打包。最终封入 Electron 或 Tauri 的外壳中，生成无缝的桌面可执行文件（如 `.exe`, `.app`）。

### 导出阶段
1. **数据清理**：移除编辑器专属的未绑定元数据。
2. **资源打包**：复制引用的资源，生成映射表。
3. **引擎绑定**：将 `taro.document.v1` 绑定至 Player Runtime。
4. **外壳构建**：调用本地或云端的打包工具输出独立应用。
