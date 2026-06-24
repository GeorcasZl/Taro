# 组件系统规范

## 1. 组件清单 (Manifest) 格式

每个 Taro 组件都是一个包含清单文件的包。清单文件 (`manifest.json`) 定义了组件的身份和它向外界暴露的接口。

```json
{
  "name": "taro-component-rpg-move",
  "version": "1.0.0",
  "type": "visual",
  "entry": "./dist/index.js",
  "parameters": {
    "map_image": { "type": "resource", "required": true },
    "grid_size": { "type": "number", "default": 32 }
  },
  "inputs": [
    {
      "name": "move_character",
      "args": { "target_x": "number", "target_y": "number" }
    }
  ],
  "outputs": [
    {
      "name": "destination_reached",
      "args": { "x": "number", "y": "number" }
    }
  ]
}
```

## 2. 事件声明 (Inputs / Outputs)

为了让“黑盒”组件的流程逻辑对 Taro 透明，组件必须声明其事件接口。

- **Inputs (接收的事件/响应)**：引擎或其他绑定可以向组件发送这些信号。例如，引擎在触发器满足后，调用组件的 `move_character`。
- **Outputs (发出的事件/触发器)**：组件向引擎广播这些信号。例如，玩家在组件的 UI 里走到终点，组件发出 `destination_reached`，Taro 可以捕获这个触发器，并执行后续响应（如 `advance`）。

在 Studio 中，如果创作者添加了上述组件，界面的事件编辑器里会自动识别出这些 Inputs 和 Outputs。

## 3. 组件生命周期

当一个含有特定组件响应的 Group 被激活时，引擎会实例化组件，并调用其生命周期钩子：

- `mount(container, context)`: 组件将自身的 HTML/DOM 挂载到舞台的特定容器中，并接收当前的记录状态等上下文。
- `update(patch)`: 当组件关注的数据（如位置变量）被外部改变时调用。
- `unmount()`: 当前 Group 结束，或者组件的存活期结束时，清理所有 DOM 节点和监听器。

## 4. 内置组件列表

Taro 官方提供并内置了几种基础组件（不可被完全移除，因为基础语法糖依赖它们）：
- `taro-text-adv`: 底部气泡对话框。
- `taro-text-nvl`: 全屏小说对话框。
- `taro-choices`: 基础的多选一按钮面板。
- `taro-stage-basic`: 基础的背景和角色立绘层管理。

## 5. 自定义组件开发指南

1. 使用你熟悉的 Web 前端技术栈（React, Vue, 或纯 Vanilla JS）开发组件内部逻辑。
2. 将构建产物打包为单个或少数几个静态 JS/CSS 文件。
3. 确保你的组件是**受控的**。即组件不应该自己偷偷修改全局状态，而应该发出 `Outputs` 信号，让 Taro 的事件引擎来决定如何修改 Document 的状态。

## 6. 组件缺失的降级行为

如果在打开一个他人的项目时缺少了某个自定义组件：
1. Studio 无法渲染该组件的特殊界面，将显示一个“缺失组件”的红框占位符。
2. 但是，**故事结构的编辑不受影响**。因为组件声明的 Inputs/Outputs 已经保存在了 Document 的事件绑定中。创作者依然可以看懂逻辑：“哦，这里触发了一个我没有的 `open_lock` 事件”。
3. 引擎可以选择在诊断面板中警告此缺失。
