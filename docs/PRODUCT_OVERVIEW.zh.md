# Taro 中文产品导览

Last updated: 2026-05-29

## 0. 这份文档是什么

这是一份面向一般开发者和产品协作者的中文产品导览。

它的目标不是替代所有规格文档，也不是记录每个实现细节，而是帮助读者快速理解：

- Taro 是什么；
- 它为什么要这样设计；
- 创作者在产品里大致如何工作；
- 哪些产品原则不能偏；
- 当前 MVP 正在证明什么；
- 后续方向大致在哪里。

如果要修改具体行为、实现功能或写测试，应继续阅读 `docs/PRODUCT.md`、`docs/MVP.md`、`docs/ARCHITECTURE.md`、`docs/STATE_MODEL.md`、`docs/API_CONTRACTS.md` 以及相关 `docs/spec/` 和 `docs/adr/`。

## 1. Taro 是什么

Taro 是一个 **text-first branching narrative studio**。

更直接地说，Taro 是一个以故事文本为主轴的分支叙事创作工具。创作者先像写故事一样写正文，再围绕同一条故事流处理分支、画面、角色、状态、互动、预览和导出。

Taro 不希望创作者一开始就被迫面对节点图、场景数据库、时间线或引擎代码。它的基本判断是：

> 分支叙事的主要创作入口应该仍然是可读的故事流，而不是生产机器本身。

所以 Taro 的核心不是“用代码做游戏”，也不是“用节点搭流程图”，而是：

> 让故事文本、结构逻辑、画面呈现和运行结果保持在同一个可理解的创作模型里。

## 2. Taro 要解决的问题

分支叙事工具常见两种极端：

- **纯文本脚本**：写起来直接，但画面、状态、互动、调试和导出很难稳定管理。
- **图形化工程工具**：功能强，但创作者很早就要管理节点、场景、对象、时间线和引擎概念。

Taro 想走中间路线：

- 写作仍然是主入口；
- 结构和逻辑必须可见；
- 画面和互动可以被编辑，但不能变成另一套隐藏系统；
- Preview 和 Export 应该来自同一份故事语义；
- 插件和模板可以增强表达能力，但不能替创作者偷偷控制关键剧情流程。

这意味着 Taro 更关心“创作者如何稳定写出、检查和导出一个分支故事”，而不是先追求完整游戏引擎能力。

## 3. Taro 服务谁

Taro 主要面向这些创作者：

- 分支视觉故事作者；
- 轻量视觉小说、互动漫画、恋爱/剧情游戏、调查叙事、chat fiction 作者；
- 主要思考故事、选择、后果、节奏和画面呈现的人；
- 希望用插件获得特殊表现形式，但不想自己先成为插件 SDK 开发者的人；
- 需要 Preview 和 Export 行为一致、可预测的人。

Taro 不优先服务这些场景：

- 专业游戏团队的完整自定义引擎逻辑；
- graph-only 的自由交互系统；
- timeline-heavy 的动画生产；
- 以代码和 SDK 为主入口的插件开发工作流；
- 需要从一开始就拥有完整 marketplace、云协作、发布平台的项目。

## 4. 创作者在 Taro 里如何工作

一个典型创作过程大致是：

1. 在 **Writing** 中写故事正文。
2. 用 **Group** 表达玩家一次推进后看到或发生的一组内容。
3. 在故事流里加入选择、条件、跳转、记录、舞台变化和互动。
4. 在 **Canvas** 中查看当前画面、路径上下文和分支结构。
5. 用 **Inspector** 调整被选中内容的参数。
6. 在 **Preview** 中沿某条路径测试体验。
7. 用诊断信息找到缺失资源、断开的跳转、状态差异或插件问题。
8. 导出一个行为与 Preview 一致的 playable package。

这个流程里最重要的是：

> 创作者一直在编辑同一个作品，而不是在 Writing、Canvas、Preview、Export 之间维护多份互相脱节的真相。

## 5. 必须理解的核心概念

### 5.1 Writing

Writing 是主创作表面。

它应该像一个面向分支叙事的文档编辑器：创作者直接在正文里写、选中、插入和调整内容。普通文本仍然是普通文本；只有当创作者明确插入选择、记录、条件、跳转、舞台变化或插件能力时，文本才进入结构化逻辑。

Writing 的价值是让故事保持可读，同时让结构化内容不被藏起来。

### 5.2 Group

Group 是玩家推进单位。

一个 Group 表示玩家一次推进后会看到或执行的一组内容。它可以很简单，例如一行对白；也可以包含多项内容，例如两句同屏出现的文本、一个背景变化、一段音效、一次等待或一个互动入口。

Taro 使用 Group，是为了让创作者能回答一个很基本的问题：

> 玩家这一次点击或推进之后，屏幕上到底发生了什么？

Taro 不把 Scene、Moment、Beat、Clip 或 Action 作为主创作单位，避免产品心智过早偏向场景数据库、演出时间线或引擎动作系统。

### 5.3 Story Flow 与 Position

Story Flow 是作品的故事结构主体。它包含按顺序推进的 Groups，也包含选择、条件、跳转和互动结果带来的分支关系。

Position 是故事流里的稳定位置。它用于跳转、诊断和定位问题。开发者可以把它理解为“比行号更可靠的故事位置”。

### 5.4 Canvas

Canvas 是视觉结构和舞台表面。

它可以帮助创作者查看当前 Group、当前画面、分支路径、舞台状态和结构差异。Canvas 也可以承担一部分可视化编辑，例如调整当前内容的呈现方式或编辑可见的互动区域。

但 Canvas 不是第二套 source of truth。Canvas 上任何会影响玩家体验、分支走向、状态或导出的编辑，都必须能回到可见的故事流、参数、关系或绑定里。

### 5.5 Record

Record 是 Taro 面向创作者的故事状态语言。

它可以表达：是否看过某个线索、某个角色好感度、是否拥有某个物品、当前路线进度、某个选择结果等。

条件判断应该优先读取 Records，而不是直接依赖画面表现。例如，故事逻辑更适合判断“当前地点 = 雨夜街道”，而不是判断“当前背景图片 = rain_street”。这样画面可以调整，故事逻辑仍然稳定。

### 5.6 Stage State

Stage State 是玩家看到的持续舞台状态，例如背景、角色位置、表情、BGM、环境声、覆盖层和画面氛围。

Taro 的舞台状态由路径推导。也就是说，同一个故事位置，如果通过不同分支抵达，可能会有不同的舞台状态。Taro 应该让这种差异可见，而不是假装所有路径都天然汇合成同一个画面。

### 5.7 Preview 与 Export

Preview 是创作者测试作品的地方。Export 是把作品打包成可玩的结果。

两者必须共享同一套作品语义。Preview 可以有调试信息、状态显示和 source trace，但不能创造 Export 无法复现的行为。

这个原则很重要，因为 Taro 需要让创作者相信：

> 我在 Preview 里看到的行为，就是导出后玩家会遇到的行为。

### 5.8 Plugin 与 Template

插件和模板用于扩展 Taro 的表达能力。

插件可以提供新的显示方式、互动能力、效果、Canvas 工具或运行时呈现方式。模板可以快速生成常见结构，例如调查房间、手机聊天片段或某种选择流程。

但它们有一个共同边界：

> 插件和模板可以帮创作者生成或推荐结构，但不能把关键剧情流程藏进黑盒。

模板默认是生成器。插入后，它生成普通可编辑的故事结构。插件可以声明触发结果和推荐动作，但这些动作插入作品后必须显式展开，能被创作者看到、修改、搜索和诊断。

## 6. 产品硬原则

### 6.1 Writing is the source of truth

Writing 中的故事流是作品的主源。

Canvas、Preview、Inspector、插件、模板、诊断和导出都应该围绕同一份故事结构工作。任何影响玩家体验、分支、状态或舞台呈现的内容，都必须能追溯到可见的故事项、参数、关系或动作绑定。

### 6.2 Group 是玩家推进单位

Group 是理解 Taro 运行方式的核心单位。

它不是纯 UI 分组，也不是随意的文本段落，而是“玩家一次推进后发生的一组内容”。这让 Writing、Canvas、Preview 和 Export 能用同一个单位理解作品。

### 6.3 Canvas 不是第二套系统

Canvas 可以展示结构，也可以做可视化编辑，但不能拥有脱离 Writing 的隐藏节点、隐藏边或隐藏状态。

它应该是同一故事流的另一种视角，而不是另一个作品。

### 6.4 Stage State 是 path-driven

舞台状态由当前位置和路径上下文共同决定。

分支合流时，如果不同路径留下了不同舞台状态，Taro 应该提示这种差异。创作者可以选择统一状态、接受路径差异，或让后续内容继续分开。

### 6.5 Logic must stay visible

关键逻辑必须可见、可搜索、可编辑、可诊断，包括：

- choices；
- conditions；
- jumps；
- record writes；
- critical stage changes；
- plugin trigger bindings；
- result actions。

这条原则的目的不是让界面变复杂，而是避免作品行为被藏在插件、模板、Canvas 私有状态或导出步骤里。

### 6.6 Templates are generators by default

模板默认生成普通结构，而不是长期维护一个不可见实例。

这样做的好处是：模板提高创建速度，但生成后的内容仍然属于作品本身，创作者可以理解、修改和诊断。

### 6.7 不走错误主入口

Taro 可以有快捷搜索、Canvas、运行时、插件 SDK 和导出系统，但它不应该变成：

- slash-command-first；
- node-editor-first；
- timeline-first；
- SDK-first。

这些能力可以存在，但不应该取代“以故事流为主轴”的产品模型。

## 7. 当前 MVP 在证明什么

当前 MVP 是一个 **ordinary-dialogue vertical slice**。

它不是完整产品，而是先证明最小闭环：

1. Writing 能创建结构化的普通对白 Groups。
2. Canvas 能对当前 Group 做最小视觉编辑，并把变化回到同一份作品结构。
3. Preview 能用同一套 Group 语义播放内容。
4. Export 能生成最小本地可玩包。
5. Preview 与 Export 对覆盖范围内的行为保持一致。

MVP1.1 的重点是 Writing 体验：

> Writing 要从固定输入框/append 模式，转向更像文档编辑器的 in-place、caret-based 编辑表面。

这件事的产品意义不是“多几个快捷键”，而是让创作者感觉自己在直接编辑故事正文，而不是在管理一组表单或按钮。

## 8. 当前 MVP 不包括什么

当前阶段不要把重心转向：

- 完整插件平台；
- 完整模板系统；
- marketplace / publishing；
- save/load 产品界面；
- player Auto Mode；
- player rollback；
- 完整 phone chat authoring；
- 完整 investigation room authoring；
- 完整 Canvas story map；
- timeline editor；
- node-graph-first authoring；
- mobile editor；
- collaboration / cloud publishing；
- 高保真视觉设计系统。

这些方向可以被记录和预留，但不应提前挤压当前 MVP 的核心目标。

## 9. 后续产品方向

后续方向可以按能力层次理解，而不是按单个功能堆积。

### 9.1 更强的 Canvas 与路径预览

Canvas 需要逐步支持更好的结构查看、路径上下文选择、分支合流状态差异提示，以及当前 Group 的可视化编辑。

关键边界不变：Canvas 可以增强编辑体验，但不能成为隐藏的节点工程系统。

### 9.2 Records、Conditions 与 Diagnostics

Taro 需要更强的故事状态管理、条件编辑和诊断能力。

目标不是让普通创作者写代码，而是让他们能清楚表达：哪些选择发生过、哪些状态被改变、哪些条件决定后续内容、哪里出现了断裂或冲突。

### 9.3 Plugins、Templates 与 Library

插件和模板是扩展 Taro 表达能力的重要方向。

它们可以带来 phone chat、调查热区、特殊显示方式、互动能力和可复用流程。但它们进入作品后，关键逻辑仍然需要显式展开，不能变成无法追踪的黑盒。

### 9.4 更稳健的 Preview、Export 与 dogfood

Taro 后续需要更强的 Preview 调试、导出检查、资源处理、错误恢复和持续 dogfood。

这里的核心判断是：一个创作工具是否可用，不只看它能不能创建内容，也看它能不能帮助创作者发现问题、定位问题并稳定导出。

## 10. 设计语气与产品边界

Taro 应该感觉像：

- focused narrative studio；
- text-first creative environment；
- path-aware visual editor；
- structured narrative IDE；
- plugin-capable studio。

Taro 不应该感觉像：

- dashboard；
- form-heavy database editor；
- free node graph as primary screen；
- timeline suite；
- plugin SDK console。

视觉和交互上，结构信息应该存在，但不要压过正文。Groups、records、jumps、stage changes 和 plugin bindings 都应该能被看到，但默认权重应低；当它们被选中、悬停、搜索或诊断命中时，再提高可见度。

## 11. 阅读路径

如果只是快速理解产品方向：

1. 先读本文。
2. 再读 `docs/PRODUCT.md`。
3. 然后读 `docs/MVP.md`。

如果要实现或修改具体行为：

1. 先读 `AGENTS.md`。
2. 再按产品权威顺序读 `docs/PRODUCT.md`、`docs/ARCHITECTURE.md`、`docs/STATE_MODEL.md`、`docs/API_CONTRACTS.md`。
3. 阅读相关 `docs/spec/` 和 `docs/adr/`。
4. 修改后同步相关文档、测试和实现证据。

如果要理解当前 MVP1.1：

- 从 `docs/MVP.md` 开始；
- 再读 Writing 相关 spec；
- 最后再看具体实现与测试。

## 12. 最短摘要

Taro 是一个以故事文本为主轴的分支叙事创作工具。Writing 是 source of truth；Group 是玩家一次推进的内容单位；Canvas、Preview 和 Export 都围绕同一份故事结构工作；舞台状态由路径上下文推导；关键逻辑必须可见；插件和模板只能扩展表达，不能隐藏流程。当前 MVP 先证明普通对白的最小闭环，MVP1.1 的重点是让 Writing 成为真正的文档式编辑表面，而不是表单式 append 工具。
