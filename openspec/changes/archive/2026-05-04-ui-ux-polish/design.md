# 设计方案：UI/UX 优化

## 1. 远距离方块合并动画优化（已完成）

`animation.js` - `createMoveAnimation` 动态时长：`duration = clamp(distance / 3.5, 100, 250)`

## 2. 按钮布局优化（已完成）

`constants.js` - 3 按钮布局（新游戏、排行榜、设置），宽度 0.28。

## 3. 弹窗样式优化（已完成）

`renderer.js` - `drawDialog` 暖白底色、多层阴影、20px 圆角、描边次按钮。

## 4. 排行榜 UI bug 修复

### 问题（截图确认）

- 标题被灵动岛遮挡（y=30 太靠上）
- 用户数据卡片太窄，中文截断
- 表头文字截断
- 分数使用 24px 超大字体，列表项重叠
- 按钮文字显示异常

### 修复方案

**`renderer.js`**:
- `drawRankItem` 分数字体改为 `bold 16px Arial`（原 24px）
- `drawUserStats` 卡片宽度增大，padding 增加，确保中文不截断
- 表头和数据列使用相同的列宽定义

**`ranklist-scene.js`**:
- 标题 y 坐标改为 `screenHeight * 0.10`（更安全的区域）
- 列表区域顶部留出足够空间

## 5. 按钮拆分：排行榜 + 我的

### 布局

改为 2x2 网格布局（4 个按钮）：

```
┌────────────────────────────────────┐
│                                     │
│          [ 新游戏 ]  [ 排行榜 ]      │
│          [ 我 的 ]   [ 设 置 ]      │
│                                     │
└────────────────────────────────────┘
```

**`constants.js`**:
- `buttonWidth = boardWidth * 0.42`
- `buttonHeight = 38`
- `buttonGap = boardWidth * 0.04`
- 2x2 网格：`buttonX` 居中，第二行 `buttonY2 = buttonY + buttonHeight + buttonGap`

**`game-scene.js`**:
- 新增 `myBtn`（"我的"）按钮
- `handleTap` 增加"我的"点击处理 → pushScene('profile')
- `render` 绘制 4 个按钮

## 6. 排行榜页面（云端）

### 布局

```
┌────────────────────────────────────┐
│            排行榜                   │ y ≈ screenHeight * 0.10
│                                    │
│   排名    昵称       分数    方块   │ ← 表头
│  ──────────────────────────────── │
│    1     玩家A      12000   2048  │ ← 可滑动
│    2     玩家B       8000   1024  │
│    3     玩家C       5000    512  │
│    ...                             │
│                                    │
│         [ 返回 ]                   │
└────────────────────────────────────┘
```

### 数据结构（云数据库集合 `scores`）

```json
{
  "_id": "auto",
  "_openid": "用户openid",
  "nickname": "玩家昵称",
  "avatarUrl": "头像URL",
  "score": 12000,
  "maxTile": 2048,
  "moveCount": 156,
  "createdAt": "2026-05-04T12:00:00Z"
}
```

### 核心逻辑

**`js/cloud.js`**（新增）:
- `initCloud()` — 初始化 `wx.cloud`
- `uploadScore(score, maxTile, moveCount)` — 上传分数（先查旧记录，只在更高时更新）
- `fetchRankList(limit)` — 查询 Top 分数（按 score 降序）
- `fetchMyRank()` — 查询当前用户排名

**`ranklist-scene.js`**:
- `enter()` 调用 `fetchRankList(50)` 获取 Top 50
- 渲染排名列表（排名/昵称/分数/最大方块）
- 支持触摸滑动
- 返回按钮

**`overlay-scene.js`**:
- 游戏结束时调用 `uploadScore()` 上传分数

## 7. 我的页面（本地）

### 布局

```
┌────────────────────────────────────┐
│             我 的                   │ y ≈ screenHeight * 0.10
│                                    │
│  ┌────────┐ ┌────────┐ ┌────────┐ │
│  │ 总局数  │ │ 最高分  │ │ 总步数 │ │ ← 统计卡片
│  │   12   │ │ 12000  │ │  500   │ │
│  └────────┘ └────────┘ └────────┘ │
│                                    │
│   时间          分数      步数     │ ← 表头
│  ──────────────────────────────── │
│  2026-05-04     12000      156    │ ← 可滑动历史
│  2026-05-03      8000       98    │
│  ...                               │
│                                    │
│         [ 返回 ]                   │
└────────────────────────────────────┘
```

### 核心逻辑

**`profile-scene.js`**（新增）:
- `enter()` 从 `wx.storage` 读取统计数据和历史记录
- 渲染统计卡片 + 可滑动历史列表
- 复用 `renderer.drawUserStats()` 和 `renderer.drawRankItem()`

## 文件改动清单

| 文件 | 改动 |
|------|------|
| `game.json` | 新增 `cloud: true` |
| `main.js` | 初始化 `wx.cloud`；注册 profile 场景 |
| `js/cloud.js`（新增） | 云端分数上传/查询 |
| `constants.js` | 2x2 按钮布局参数 |
| `renderer.js` | 修复 drawRankItem 字体；修复 drawUserStats 卡片宽度 |
| `game-scene.js` | 4 个按钮（新游戏/排行榜/我的/设置） |
| `ranklist-scene.js` | 改为云端排行榜；修复 UI |
| `profile-scene.js`（新增） | 个人数据页（本地统计+历史） |
| `overlay-scene.js` | 游戏结束上传分数 |
