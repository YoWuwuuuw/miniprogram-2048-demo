## ADDED Requirements

### Requirement: 合并动画时长优化
合并动画 SHALL 使用200ms时长，提供更平滑的视觉过渡。

#### Scenario: 合并动画时长
- **WHEN** 两个相同数字的方块合并
- **THEN** 合并动画持续200ms，而非原来的100ms

### Requirement: 合并动画缓动函数优化
合并动画 SHALL 使用优化的缓动函数，提供更自然的弹性效果。

#### Scenario: 缓动函数效果
- **WHEN** 合并动画播放
- **THEN** 动画使用平滑的缓动曲线，避免生硬的过渡

### Requirement: 合并动画缩放范围优化
合并动画 SHALL 使用1.0->1.15->1.0的缩放范围，提供更柔和的视觉效果。

#### Scenario: 缩放范围
- **WHEN** 方块合并时
- **THEN** 方块缩放从1.0到1.15再回到1.0，而非原来的1.0->1.2->1.0

### Requirement: 合并动画流畅度
合并动画 SHALL 保持60fps的流畅度，无卡顿或跳帧。

#### Scenario: 动画性能
- **WHEN** 合并动画播放期间
- **THEN** 动画帧率稳定在60fps，视觉效果平滑
