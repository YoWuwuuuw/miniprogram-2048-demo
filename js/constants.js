// ============================================
// constants.js - 颜色/尺寸/阈值/字体常量
// ============================================

// 方块颜色映射：key 为方块数值，value 为 { bg, color }
export const TILE_COLORS = {
  0:     { bg: '#cdc1b4', color: 'transparent' },
  2:     { bg: '#eee4da', color: '#776e65' },
  4:     { bg: '#ede0c8', color: '#776e65' },
  8:     { bg: '#f2b179', color: '#f9f6f2' },
  16:    { bg: '#f59563', color: '#f9f6f2' },
  32:    { bg: '#f67c5f', color: '#f9f6f2' },
  64:    { bg: '#f65e3b', color: '#f9f6f2' },
  128:   { bg: '#edcf72', color: '#f9f6f2' },
  256:   { bg: '#edcc61', color: '#f9f6f2' },
  512:   { bg: '#edc850', color: '#f9f6f2' },
  1024:  { bg: '#edc53f', color: '#f9f6f2' },
  2048:  { bg: '#edc22e', color: '#f9f6f2' },
  super: { bg: '#3c3a32', color: '#f9f6f2' }
}

// 页面/棋盘/文字颜色
export const COLORS = {
  pageBackground: '#faf8ef',
  boardBackground: '#bbada0',
  headerText: '#776e65',
  scoreValue: '#ffffff',
  scoreLabel: '#eee4da',
  buttonBackground: '#8f7a66',
  buttonTextColor: '#f9f6f2'
}

// 字体规格
export const FONTS = {
  title: 'bold 36px Arial',
  scoreLabel: '14px Arial',
  scoreValue: 'bold 24px Arial',
  tileSmall: 'bold 36px Arial',
  tileMedium: 'bold 30px Arial',
  tileLarge: 'bold 24px Arial',
  tileXLarge: 'bold 18px Arial',
  button: 'bold 18px Arial',
  dialogTitle: 'bold 32px Arial',
  dialogText: '18px Arial'
}

// 本地存储键名
export const STORAGE_KEYS = {
  CURRENT_GAME: 'current_game_state',
  BEST_SCORE: 'best_score',
  RANK_HISTORY: 'rank_history',
  STATISTICS: 'game_statistics',
  SETTINGS: 'game_settings'
}

// 滑动阈值（像素）
export const SWIPE_THRESHOLD = 30

// 滚动物理参数
export const SCROLL_PHYSICS = {
  friction: 0.96,        // 惯性摩擦系数（每帧衰减）
  elasticDamping: 0.4,   // 越界弹性阻尼（0-1，越小拉扯感越强）
  velocityThreshold: 50, // 低于此速度停止惯性（px/s）
  velocityBufferSize: 4  // 速度缓冲区帧数
}

// 动画时长（毫秒）
export const ANIMATION = {
  appear: 150,
  move: 120,
  merge: 100,
  button: 80
}

// 布局工厂函数：根据屏幕尺寸计算所有布局参数
export function createLayout(screenWidth, screenHeight) {
  const boardPadding = screenWidth * 0.02
  const boardWidth = screenWidth * 0.85
  const tileGap = screenWidth * 0.02
  const tileWidth = (boardWidth - boardPadding * 2 - tileGap * 5) / 4
  const boardX = (screenWidth - boardWidth) / 2
  const borderRadius = 6

  // Logo 尺寸
  const logoSize = 60

  // 安全区域顶部偏移（避开刘海/灵动岛）
  const topOffset = screenHeight * 0.06

  // 计算内容总高度并垂直居中
  const headerH = logoSize + 10
  const scoreH = 50
  const gapAboveBoard = 8
  const boardH = boardWidth
  const gapBelowBoard = screenHeight * 0.06
  const btnH = 40
  const totalContentH = headerH + scoreH + gapAboveBoard + boardH + gapBelowBoard + btnH

  // 垂直居中起始 Y
  const contentStartY = Math.max(topOffset, (screenHeight - totalContentH) / 2)

  // Logo 位置
  const logoY = contentStartY

  // 分数区域（棋盘上方右侧）
  const scoreBoxWidth = boardWidth * 0.35
  const scoreBoxHeight = 50
  const scoreBoxY = contentStartY + headerH + gapAboveBoard

  // 棋盘位置
  const boardY = scoreBoxY + scoreBoxHeight + 8

  // 按钮位置（底部，2x2 网格）
  const buttonWidth = boardWidth * 0.42
  const buttonHeight = 38
  const buttonGap = boardWidth * 0.04
  const totalBtnWidth = buttonWidth * 2 + buttonGap
  const buttonX = boardX + (boardWidth - totalBtnWidth) / 2
  const buttonY = boardY + boardWidth + gapBelowBoard
  const buttonY2 = buttonY + buttonHeight + buttonGap

  // 弹窗布局
  const dialogWidth = screenWidth * 0.75
  const dialogHeight = 220
  const dialogX = (screenWidth - dialogWidth) / 2
  const dialogY = (screenHeight - dialogHeight) / 2

  return {
    screenWidth,
    screenHeight,
    boardPadding,
    boardWidth,
    tileGap,
    tileWidth,
    boardX,
    boardY,
    borderRadius,
    logoSize,
    logoY,
    buttonWidth,
    buttonHeight,
    buttonGap,
    buttonX,
    buttonY,
    buttonY2,
    scoreBoxWidth,
    scoreBoxHeight,
    scoreBoxY,
    dialogWidth,
    dialogHeight,
    dialogX,
    dialogY
  }
}
