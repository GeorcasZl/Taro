# Taro 系统架构

## 架构目标

Taro 的架构目标是实现：**以 Document 为单一数据源，多视图协同编辑，事件驱动执行。**
通过明确的数据流和边界，保证复杂的叙事逻辑在编辑器中可读可控，同时在运行时具备极高的扩展性。

## 系统总览

```mermaid
graph TD
    %% 创作层
    subgraph Studio[创作层 Studio]
        Flow[剧本流]
        Canvas[舞台画布]
        Timeline[动作时间线]
        Library[素材库]
    end

    %% 数据流向下
    Studio -- Document Command --> DocCore

    %% 数据层
    subgraph DocumentLayer[数据层 Document]
        DocCore((Document\n单一数据源))
        Groups[Groups\n(叙事步骤)]
        Events[事件绑定\n(Trigger/Response)]
        Records[结构化记录]
        Resources[资源引用]
        
        DocCore --- Groups
        DocCore --- Events
        DocCore --- Records
        DocCore --- Resources
    end

    %% 派生视图向上
    DocCore -. 派生更新 .-> Flow
    DocCore -. 派生更新 .-> Canvas
    DocCore -. 派生更新 .-> Timeline

    %% 运行时与组件向下
    DocCore -- 事件调度 --> Runtime

    %% 引擎层
    subgraph Engine[引擎层 Runtime]
        EventBus[事件总线]
        TriggerMatch[触发器匹配]
        StateMgr[状态管理 / 条件求值]
        
        EventBus --- TriggerMatch
        EventBus --- StateMgr
    end

    %% 组件层
    Engine -- 事件接口 --> Components

    subgraph ComponentsLayer[组件层 Components]
        Builtin[内置组件\n对话框/选项等]
        Custom[自定义组件\nRPG场景/漫画等]
    end

    %% 反馈循环
    ComponentsLayer -. 触发事件 .-> Engine
```

## 四层架构

### 1. 创作层（Studio）
即统一编辑界面。剧本流、舞台画布、时间线、素材库等区域**本身不存储任何故事逻辑**。它们完全是 Document 的视图（Views）和控制器（Controllers）。创作者在这些表面上的所有交互（如拖拽角色、修改文本、调整时序）最终都转化为统一的 **Document Command** 发送给下层。

### 2. 数据层（Document）
系统的唯一持久化数据源（Single Source of Truth）。它存储了项目的所有实际数据：
- **Groups（叙事步骤）**：内容组织单元及其结束条件（advance_mode）。
- **事件绑定（Event Bindings）**：Trigger 与 Response 的映射表。
- **结构化记录（Records）**：用于追踪故事状态的变量定义。
- **资源引用（Resources）**：图片、音频等外部素材的引用。
- **分组结构（Folder Tree）**：纯组织性质的目录树。

### 3. 引擎层（Runtime）
处理游戏执行逻辑的核心。它监听和匹配**触发器（Trigger）**，执行相应的**响应（Response）**。它维护当前的故事进度、路径上下文、记录的当前值，并负责条件表达式的求值。当创作者在 Studio 中“预览”时，或者玩家运行最终导出的游戏时，执行的都是这一层逻辑。

### 4. 组件层（Components）
负责最终的视觉渲染和交互扩展。每个组件由 HTML/CSS/JS 和一个事件声明（Manifest）组成。
- 组件通过监听引擎层派发的事件来更新自身（例如：听到 `show_text` 事件后打字机显示文字）。
- 组件通过向引擎层发送事件来推进流程（例如：玩家点击按钮后，向引擎发送 `click` 事件）。

## 数据源边界

Taro 严格区分以下三种状态边界：

1. **持久化数据源（Persistent Source）**
   只有 `Document` 属于这一类。所有会被保存到磁盘的项目数据都在这里。它只接受 Command 修改，不接受直接的状态赋值。

2. **派生视图（Derived Views）**
   这些状态可以通过计算 `Document` 得出，不需持久化存储：
   - 当前位置的**舞台状态（Stage State）**
   - 包含分支结构的**流程图（Flowchart）**
   - **时间线（Timeline）** 的渲染序列

3. **本地 UI 状态（Local UI State）**
   与项目内容无关的纯编辑器状态，例如：当前选中的 Group、光标在剧本流中的位置、舞台画布的缩放级别。这些状态不触及 `Document`，仅在前端内存中维护。

## 数据流

当创作者在界面上进行编辑时，系统遵循单向数据流：

1. **用户操作**：创作者在舞台上拖拽一个角色。
2. **生成命令**：画布组件将操作转换为 `Document Command`（如 `stage.move_character`）。
3. **命令校验**：Document 核心验证命令合法性（例如：引用的角色是否存在）。
4. **应用补丁**：Document 状态更新，产生一次不可变的变更（Patch）。
5. **派生更新**：Document 发出状态更新通知，舞台画布、剧本流、时间线等所有派生视图重新计算并渲染最新状态。
6. **诊断检查**：后台诊断器运行，检查修改是否引发了新的错误（如：破坏了下游分支的逻辑），更新 UI 提示。

## 架构不变量

1. **绝对单一数据源**：只有 Document Core 有权限（也只通过特定的持久化机制）读写项目磁盘文件。其他任何模块（包括 Canvas、组件）不可以直接存储数据。
2. **事件流转的强制可见性**：自定义组件不能隐蔽地阻断或改变故事主干流转。所有推动故事前进的操作必须转换为 Taro 的公开事件（例如不能在组件内部私自写死一个隐藏的分支跳转逻辑而不暴露为 Taro 事件绑定）。
3. **一致的运行时代价**：由于引擎层和组件层完全解耦，Studio 中的“实时预览”和最终导出的“玩家版本”使用的是完全相同的 Runtime 与 Component 组合，确保所见即所得。

## 错误策略

- **用户侧防错**：通过命令合法性校验（Command Validation），非法操作（如删除不存在的 Group）会被直接拦截，不会污染 Document 状态。
- **渐进式诊断**：不阻止创作者的“草稿式”修改。如果修改导致引用断裂（如删除了某个角色，但后续剧情还在使用），这会产生一个非阻塞的**诊断警告（Diagnostic Warning）**，而不是抛出系统崩溃异常。
- **快照回滚**：由于所有的修改都基于不可变的命令和补丁（Patch），发生系统级异常时，可以安全地回滚到上一个稳定的 Document 快照。

## 架构非目标

1. **不设计为云原生多人实时协作架构（CRDT/OT）**：MVP 阶段的不可变命令设计是为了可追溯性和回滚，而非实时同步。基于 Git 等外部版本控制仍是推荐的协作方式。
2. **不内置物理引擎或复杂的实时帧同步**：Taro 的引擎层是一个高层次的事件状态机，而不是面向每秒 60 帧的实时渲染循环。高度复杂的实时动作游戏并非其目标。
