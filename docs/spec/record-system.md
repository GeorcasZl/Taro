# 结构化记录系统规范

## 1. 记录字典定义

所有的记录（变量）必须在 Document 的 `Records` 字典中集中定义，方可在触发器和响应中使用。

### 数据类型支持
- **`boolean`**: true / false（例如：`has_met_alice`）
- **`number`**: 浮点数（例如：`gold_coins`, `affection_score`）
- **`text`**: 字符串（例如：`player_name`）
- **`object`**: 键值对字典。用于封装一组相关的属性（例如：`player_stats: { str: 10, int: 5 }`）
- **`array`**: 列表类型。用于处理多项收集品或记录历史（例如：`inventory_items: ['key', 'potion']`）

## 2. 记录的作用域 (Scope)

- **`global` (全局)**：该记录跨越多个周目或存档生效。例如“玩家是否达成过隐藏结局”。这类变量在读取普通游戏存档时不会被覆盖。
- **`run` (单次游玩)**：默认作用域。每次从头开始新游戏时重置。它的当前状态随同玩家存档一起被保存。例如当前金币数。

## 3. 条件表达式语法

引擎内建了一个微型表达式解析器，用于处理条件判断。在 `condition_met` 触发器中，创作者（或 UI 面板）可以输入以下合法表达式：

- 简单比较：`gold_coins >= 100`
- 布尔判断：`has_met_alice` 等同于 `has_met_alice == true`
- 复合逻辑：`has_met_alice && affection_score > 50`
- 数组检查：`inventory_items.includes('key')`
- 对象访问：`player_stats.str > 15`

在 Taro Studio 的 UI 中，大部分常见的比较会被转化为下拉框和输入框（类似常见的可视化条件编辑器），但底部始终提供直接编辑文本表达式的选项，以照顾复杂逻辑需求。

## 4. 记录的读写响应

引擎提供专用的内置响应来改变记录状态：

- **`set_record`**: 直接赋值。例如 `set_record('player_name', 'Hero')`。
- **`math_op`**: 针对数值的快捷运算。例如 `math_op('gold_coins', '+', 50)`。
- **`array_push` / `array_remove`**: 针对列表的快捷操作。例如 `array_push('inventory_items', 'sword')`。

## 5. 调试与检查 (Inspector)

在 Studio 的统一界面中，提供一个“状态监视器”侧边栏（通常与属性面板切换）：
- 当处于非预览编辑状态时，监视器显示所有记录的默认值。
- 当处于预览状态（Preview）时，监视器实时追踪并高亮显示当前发生变化的记录值。创作者可以在监视器中直接强行修改某个变量，以实时测试特定条件分支的走向，而无需真的跑一遍前面流程。
