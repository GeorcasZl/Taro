# 事件驱动执行模型规范

## 1. 事件总线架构 (Event Bus Architecture)

Taro 引擎的核心是一个中心化的事件总线。它负责接收来自各个模块（核心运行时、玩家输入、组件回调）的事件，匹配对应的触发器，并调度后续的响应执行。

## 2. 触发器 (Trigger)

触发器定义了“什么情况下”应该执行一段逻辑。

### 内置触发器
- `group_enter`：当故事流转进入当前 Group 时立即触发。常用于初始化场景或显示文本。
- `click`：当引擎接收到“推进操作”（鼠标点击、空格键、回车键等）时触发。
- `text_complete`：当前打字机效果的文本显示完毕时触发。
- `condition_met(condition)`：当指定的条件表达式求值为 `true` 时触发。
- `timer(ms)`：从上一个相关动作开始，经过指定的毫秒数后触发。
- `group_exit`：当当前 Group 即将被销毁、进入下一个 Group 时触发。用于清理操作。

### 触发器组合
触发器可以通过逻辑运算符组合：
- `text_complete + click`：必须在文本显示完之后，并且玩家点击了，才触发（对话的常规行为）。

## 3. 响应 (Response)

响应是触发器激活后执行的具体指令。它们要么改变舞台的视觉状态，要么改变数据的内部状态。

### 内置响应
- `show_text(speaker_id, text, display_mode)`：在指定模式下显示文本。
- `set_background(image_id, transition)`：更换背景图。
- `play_sound(audio_id, loop)`：播放音频。
- `advance(target_group_id?)`：结束当前 Group。如果不提供目标 ID，则按树状结构顺序进入下一个 Group。
- `set_record(record_id, value)`：写入变量状态。

## 4. 语法糖展开规则 (Desugaring Rules)

创作者在 Studio 的剧本流中直接打字的“语法糖”，在保存进 Document 前会自动展开。

**输入内容**：
```
小明: 你好啊！
```

**展开后的内部事件绑定**：
```json
[
  {
    "id": "binding_1",
    "trigger": "group_enter",
    "response": "show_text('小明', '你好啊！', 'ADV')"
  },
  {
    "id": "binding_2",
    "trigger": "text_complete + click",
    "response": "advance()"
  }
]
```

## 5. Group 生命周期

当执行流进入某个 `Group` 时，遵循以下生命周期：
1. **Enter 阶段**：系统派发 `group_enter` 事件。任何挂载了此触发器的绑定被激活（通常是舞台布置和首句台词显示）。
2. **Event Loop 阶段**：引擎开始等待和监听。玩家的交互（`click`）或计时器（`timer`）会不断派发新事件，触发更多绑定。
3. **Advance 触发**：当某个绑定执行了 `advance()` 响应，或者 Group 自身的 `advance_mode === auto` 且所有动画完成时，结束 Event Loop。
4. **Exit 阶段**：系统派发 `group_exit` 事件。执行清理工作。
5. **Flow 阶段**：引擎查询故事结构树，确定下一个目标 Group 并跳转。

## 6. 预览与导出的一致性

在 Studio 的统一界面中点击“预览”按钮时，系统会从当前的 `Position` 启动相同的核心 Runtime 实例。这意味着只要事件绑定相同，Studio 里的预览行为与打包出的 Electron 桌面应用行为保证 100% 一致。
