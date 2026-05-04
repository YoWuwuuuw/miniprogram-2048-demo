## 1. 常量定义

- [x] 1.1 在 constants.js 中添加惯性/弹性滚动相关常量（摩擦系数、弹性阻尼、速度阈值、速度缓冲区大小）

## 2. 惯性/弹性滚动基础设施

- [x] 2.1 在 InputManager 中添加速度追踪：记录最近 N 帧的 {dy, timestamp}，提供 getVelocity() 方法
- [x] 2.2 创建滚动物理引擎模块（或在场景中内联）：实现惯性衰减逻辑（velocity *= friction^dt）和边界检测

## 3. 排行榜场景改造

- [x] 3.1 调整排行榜标题和表头位置：titleY 下移或 headerY 下移，确保间距 >= 32px
- [x] 3.2 将 ranklist-scene.js 的滚动逻辑改为惯性模式：onTouchMove 更新速度缓冲，onTouchEnd 启动惯性
- [x] 3.3 在 ranklist-scene.js 的 update(dt) 中驱动惯性动画和边界弹性回弹

## 4. "我的"页面样式改造

- [x] 4.1 增大 profile-scene.js 中用户数据卡片的字体和内边距
- [x] 4.2 将 "我的" 页面列表项高度从 52px 增加到 60px（卡片 56px + 4px 间距）
- [x] 4.3 适配 renderer.js 中 drawRankItem 和 drawUserStats 以支持新尺寸

## 5. "我的"页面滚动改造

- [x] 5.1 将 profile-scene.js 的滚动逻辑改为与排行榜相同的惯性/弹性模式

## 6. 测试与调优

- [x] 6.1 在真机上测试惯性手感，调整摩擦系数
- [x] 6.2 测试边界弹性效果，调整阻尼系数
- [x] 6.3 验证惯性滚动中触摸能立即停止
