## ADDED Requirements

### Requirement: 微信账号登录
系统 SHALL 在"我的"页面提供登录按钮，用户主动点击后触发微信授权获取昵称。

#### Scenario: 未登录状态显示
- **WHEN** 玩家进入"我的"页面且未登录
- **THEN** 系统 SHALL 在标题下方显示"登录"按钮

#### Scenario: 已登录状态显示
- **WHEN** 玩家进入"我的"页面且已登录
- **THEN** 系统 SHALL 在标题下方显示"已登录"状态（不可点击）

#### Scenario: 点击登录按钮
- **WHEN** 玩家点击"登录"按钮
- **THEN** 系统 SHALL 调用 `wx.getUserProfile({desc: '用于排行榜昵称显示'})` 获取微信昵称

#### Scenario: 获取昵称成功
- **WHEN** `wx.getUserProfile` 返回成功
- **THEN** 系统 SHALL 将昵称存入本地缓存（`wx.storage` key: `user_nickname`），并上传至云端 `users` 集合，按钮变为"已登录"

#### Scenario: 获取昵称失败或用户拒绝
- **WHEN** `wx.getUserProfile` 返回失败或用户拒绝授权
- **THEN** 系统 SHALL 使用默认昵称"匿名用户"存入本地缓存

#### Scenario: 未登录用户分数限制
- **WHEN** 游戏结束且用户未登录（昵称为空或"匿名用户"）
- **THEN** 系统 SHALL 跳过分数上传，不计入排行榜

### Requirement: 昵称本地缓存
系统 SHALL 在本地持久化存储用户昵称，避免重复请求授权。

#### Scenario: 读取缓存昵称
- **WHEN** 系统需要获取用户昵称时
- **THEN** 系统 SHALL 优先从 `wx.storage` 读取 `user_nickname`，若存在则直接使用

#### Scenario: 写入缓存昵称
- **WHEN** 用户完成登录（同意或拒绝）
- **THEN** 系统 SHALL 将昵称写入 `wx.storage` 的 `user_nickname` key

### Requirement: 昵称云端持久化
系统 SHALL 将用户昵称与 openid 关联存储在云端，作为排行榜显示名称。

#### Scenario: 云端存储用户信息
- **WHEN** 用户首次登录成功
- **THEN** 系统 SHALL 在云端 `users` 集合中创建或更新记录，包含 `openid`、`nickname`、`createdAt` 字段

### Requirement: 未登录提示
系统 SHALL 在"我的"页面底部显示说明文字，告知未登录用户的排行榜限制。

#### Scenario: 显示未登录提示
- **WHEN** 玩家进入"我的"页面
- **THEN** 系统 SHALL 在页面底部显示小字："未登录用户的分数不会计入排行榜"
