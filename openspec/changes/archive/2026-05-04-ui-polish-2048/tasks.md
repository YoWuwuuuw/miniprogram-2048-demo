## 1. 排行榜标题与布局调整

- [x] 1.1 调整 `ranklist-scene.js` 中标题 Y 坐标从 `screenHeight * 0.10` 上移至 `screenHeight * 0.06`，确保与表头间距 >= 24px
- [x] 1.2 调整 `_getListTopY()` 返回值以匹配新的标题位置

## 2. Top 3 渐变高亮实现

- [x] 2.1 在 `renderer.js` 的 `drawCloudRankItem` 中为 rank 1/2/3 绘制渐变背景（金银铜），替代当前的平铺条纹
- [x] 2.2 Top 3 文字颜色改为白色粗体，确保在深色渐变上可读

## 3. 列表项卡片样式统一

- [x] 3.1 修改 `renderer.js` 的 `drawCloudRankItem`：使用圆角矩形卡片背景（r=8px），卡片上下间距 4px
- [x] 3.2 修改 `renderer.js` 的 `drawRankItem`：使用与排行榜相同的卡片样式（圆角、间距、配色）
- [x] 3.3 统一两个列表项的字体大小、颜色方案和行高

## 4. "我的"页面样式对齐

- [x] 4.1 调整 `profile-scene.js` 中表头样式与排行榜一致（字号、颜色、对齐方式）
- [x] 4.2 确保 `profile-scene.js` 中 `itemHeight` 与卡片间距匹配新样式

## 5. 测试数据补充

- [x] 5.1 在 `cloud.js` 中添加 `seedTestData()` 函数，生成 20 条模拟排行榜数据（含不同分数、昵称、最大方块）
- [x] 5.2 在 `ranklist-scene.js` 的 `enter()` 中，若 `fetchRankList` 返回数据不足 10 条，则用测试数据补充
