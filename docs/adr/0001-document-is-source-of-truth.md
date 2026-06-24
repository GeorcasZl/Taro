# ADR 0001: Document 是唯一数据源

状态：已采纳（2026-06-24，取代原「Writing is SoT」）

## 背景
Taro 有多个编辑表面（剧本流、舞台画布、时间线、素材库），
需要一个明确的数据权威。

## 决策
Document 是唯一的持久化数据源。所有编辑表面都是 Document 的视图，
所有修改都通过 Document Command 写入。没有任何表面拥有 Document
之外的持久化状态。

## 后果
- 好处：数据一致性有保证；任何表面的操作结果可预测
- 代价：所有表面操作都需要转化为 Document Command
