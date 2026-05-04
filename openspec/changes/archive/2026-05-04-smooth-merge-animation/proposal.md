## Why

当前方块合并动画效果不够丝滑，用户反馈合并时的视觉体验需要改进。现有的合并动画（100ms, scale 1.0->1.2->1.0）过于简单快速，缺乏流畅感和视觉冲击力。需要优化合并动画，使其更加平滑、有层次感，提升游戏体验。

## What Changes

- 优化合并动画的时长和缓动函数，使动画更平滑
- 改进合并动画的视觉效果，增加层次感
- 可能需要调整合并动画的缩放范围和过渡方式
- 确保动画与游戏整体风格协调

## Capabilities

### New Capabilities

- `merge-animation-optimization`: 优化方块合并动画效果，提升视觉流畅度

### Modified Capabilities

(无修改的能力)

## Impact

- animation.js: 修改createMergeAnimation函数
- 可能需要调整game-scene.js中的动画调用参数
