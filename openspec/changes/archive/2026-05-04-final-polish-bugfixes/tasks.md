## 1. Profile 页面标题位置修复

- [x] 1.1 调整 `profile-scene.js` 中 `titleY` 的计算比例（从 `0.10` 增大到 `0.12` 或更合适值），确保标题不被系统组件遮挡
- [x] 1.2 同步调整 `_getListTopY()` 中的偏移量，保持表头与标题的间距一致

## 2. 方块移动动画逻辑修复

- [x] 2.1 分析 `game-scene.js` `handleSwipe` 中合并方块的源方块匹配逻辑，确认在多相同值方块场景下的 `consumed` 消费顺序是否正确
- [x] 2.2 修复匹配失败时的 fallback：当无法找到同列/同行的源方块时，改为匹配同方向最近的未消费源方块，而非跳过动画
- [x] 2.3 验证修复后各种滑动方向（上下左右）在以下场景的动画正确性：单方块滑动、多方块合并、多方块同时滑动

## 3. 排行榜数据缓存

- [x] 3.1 在 `cloud.js` 中实现内存缓存层（`{ data, timestamp }` 结构，TTL 60 秒）
- [x] 3.2 修改 `fetchRankList` 函数，增加缓存命中逻辑：未过期直接返回缓存，过期则请求云端并更新缓存
- [x] 3.3 导出 `clearRankListCache` 函数供强制刷新使用
- [x] 3.4 在 `ranklist-scene.js` 中使用缓存接口，保留手动刷新能力

## 4. 边界条件防护

- [x] 4.1 `game-core.js` `move()` 函数入口增加 board 参数校验（类型、维度）
- [x] 4.2 `storage.js` `loadGameState()` 增加 try-catch，JSON 解析失败时返回 null 而非抛异常
- [x] 4.3 `cloud.js` 确认 `fetchRankList` 的 catch 分支返回空数组，不会向上抛异常
- [x] 4.4 `game-scene.js` 检查 `_onMoveAnimationComplete` 的防重复调用机制是否可靠，确认 `_moveAnimCalled` 在 `enter`/`newGame` 时正确重置
- [x] 4.5 检查 `profile-scene.js` 和 `ranklist-scene.js` 中滚动相关的边界值（`scrollOffset` 负值、超出最大值时的回弹逻辑）
