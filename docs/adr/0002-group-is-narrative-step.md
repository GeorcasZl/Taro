# ADR 0002: Group 是叙事步骤

状态：已采纳（2026-06-24，取代原「Group is player advance unit」）

## 背景
Taro 需要一个基本的叙事结构单元。原设计将 Group 等同于
「一次玩家点击」，但这限制了非 VN 模式（RPG 场景、漫画等）。

## 决策
Group 是一个叙事步骤。它的结束条件（advance_mode）可配置：
- click：玩家点击推进（VN 对话，默认）
- trigger：特定条件满足时推进（RPG 场景探索）
- auto：内容展示完自动推进（过场动画）

## 后果
- 好处：统一模型支持多种叙事形态
- 代价：Group 执行逻辑更复杂；需要清晰的默认值
