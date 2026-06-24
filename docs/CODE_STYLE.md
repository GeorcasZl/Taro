# Taro 代码风格与规范

## TypeScript 核心准则

1. **强类型优先**：Taro 的核心数据结构（如 Document、Group、Event Binding）必须具有严格的 TypeScript 接口定义。避免在核心引擎层使用 `any` 或未声明的推导类型。
2. **不可变数据更新**：对 `Document` 及其衍生状态的更新，必须产生一个新的只读对象。这保证了状态推演、撤销/重做机制的可靠性。
3. **副作用隔离**：
   - 核心引擎（Runtime/StateMgr）必须是纯函数：给定相同的 Document 和相同的输入事件序列，必须产生完全一致的派生状态。
   - 所有副作用（DOM 渲染、文件 I/O、音频播放）必须限制在 Component 层和最外层的宿主环境中。

## React 组件规范

1. **视图即纯函数**：UI 组件（如剧本流节点、画布上的角色图片）应该是无状态或状态极小的。它们只负责接收来自 Store 的 Props 并渲染。
2. **事件上报原则**：当用户在组件上发生交互（拖拽、输入内容）时，组件不要自己去修改底层状态，而是发出带有对应有效载荷（Payload）的事件，让外层控制器转化为 `Document Command`。
3. **避免深层 Prop 传递**：合理使用 Context 或状态管理库，避免将全局状态一层层传递给深层 UI 组件。

## 命名约定

- **接口与类型**：使用大驼峰式，不加 `I` 前缀。如 `Document`, `EventBinding`, `Group`。
- **不可变命令**：使用动名词结构表示执行的动作，如 `CreateGroupCommand`, `MoveCharacterCommand`。
- **事件名称**：统一使用蛇形命名法（snake_case），以匹配 JSON 序列化格式和配置体验。如 `group_enter`, `show_text`。
- **UI 组件**：使用大驼峰式，如 `ScriptFlow`, `StageCanvas`, `ActionTimeline`。

## 文件组织

- **模块内聚**：相关的逻辑应当放在一起。如果某个特性同时涉及数据结构、执行引擎和 UI，它的代码尽量收敛到该特性所属的模块文件夹中，而不是简单粗暴地按照“所有的 UI 放一个文件夹，所有的 Model 放一个文件夹”来切分。
