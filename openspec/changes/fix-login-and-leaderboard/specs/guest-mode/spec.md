## ADDED Requirements

### Requirement: 游客模式支持
系统 SHALL 支持游客模式，允许用户在不登录的情况下使用基本功能。

#### Scenario: 以游客身份进入
- **WHEN** 用户选择不登录或拒绝授权时
- **THEN** 系统 SHALL 允许用户以游客身份进入游戏

#### Scenario: 游客状态标识
- **WHEN** 用户处于游客模式时
- **THEN** 系统 SHALL 在界面中明确显示当前为游客状态

#### Scenario: 游客功能限制提示
- **WHEN** 游客尝试使用需要登录的功能时
- **THEN** 系统 SHALL 显示提示信息说明需要登录

### Requirement: 登出功能
系统 SHALL 提供登出功能，允许已登录用户切换到游客模式。

#### Scenario: 用户登出
- **WHEN** 已登录用户点击登出按钮
- **THEN** 系统 SHALL 清除登录状态并切换到游客模式

#### Scenario: 登出确认
- **WHEN** 用户点击登出时
- **THEN** 系统 SHALL 显示确认对话框防止误操作

#### Scenario: 登出后状态更新
- **WHEN** 用户成功登出后
- **THEN** 系统 SHALL 更新界面显示游客状态并清除用户信息

### Requirement: 游客分数管理
系统 SHALL 在游客模式下管理分数，确保分数不计入排行榜但保留本地记录。

#### Scenario: 游客游戏分数记录
- **WHEN** 游客完成一局游戏时
- **THEN** 系统 SHALL 将分数保存到本地缓存

#### Scenario: 游客分数不同步
- **WHEN** 游客获得新分数时
- **THEN** 系统 SHALL NOT 将分数同步到云端排行榜

#### Scenario: 游客本地排行榜
- **WHEN** 游客查看排行榜时
- **THEN** 系统 SHALL 显示云端排行榜数据，但游客分数不在其中

#### Scenario: 游客个人记录查看
- **WHEN** 游客查看个人记录时
- **THEN** 系统 SHALL 显示本地缓存的历史最高分和游戏记录

### Requirement: 登录状态切换
系统 SHALL 支持游客模式和登录模式之间的无缝切换。

#### Scenario: 游客转登录
- **WHEN** 游客选择登录时
- **THEN** 系统 SHALL 保留本地游戏记录并合并到登录账户

#### Scenario: 登录后本地记录同步
- **WHEN** 游客登录后
- **THEN** 系统 SHALL 将本地缓存的分数记录同步到云端（如果高于云端记录）

#### Scenario: 切换时数据一致性
- **WHEN** 用户在游客和登录模式间切换时
- **THEN** 系统 SHALL 确保数据一致性，避免重复或丢失记录
