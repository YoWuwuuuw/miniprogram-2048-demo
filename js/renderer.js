// ============================================
// renderer.js - Canvas 绘制封装
// ============================================

import { TILE_COLORS, COLORS, FONTS } from './constants.js'

export class Renderer {
  constructor(ctx, layout) {
    this.ctx = ctx
    this.layout = layout
    // 缓存常用值，避免重复计算
    this._cachedColors = new Map()
    this._cachedFonts = new Map()
  }

  clear() {
    const { screenWidth, screenHeight } = this.layout
    this.ctx.clearRect(0, 0, screenWidth, screenHeight)
  }

  drawBackground() {
    const { screenWidth, screenHeight } = this.layout
    this.ctx.fillStyle = COLORS.pageBackground
    this.ctx.fillRect(0, 0, screenWidth, screenHeight)
  }

  drawBoard() {
    const { ctx } = this
    const { boardX, boardY, boardWidth, borderRadius } = this.layout
    ctx.fillStyle = COLORS.boardBackground
    this.roundRect(boardX, boardY, boardWidth, boardWidth, borderRadius)
    ctx.fill()
  }

  drawTile(x, y, value, scale = 1, opacity = 1) {
    const { ctx } = this
    const { tileWidth, borderRadius } = this.layout
    const colors = TILE_COLORS[value] || TILE_COLORS.super

    // 只在需要时保存状态
    const needTransform = scale !== 1 || opacity !== 1
    if (needTransform) {
      ctx.save()
      ctx.globalAlpha = opacity

      // 缩放绘制
      if (scale !== 1) {
        ctx.translate(x + tileWidth / 2, y + tileWidth / 2)
        ctx.scale(scale, scale)
        ctx.translate(-(x + tileWidth / 2), -(y + tileWidth / 2))
      }
    }

    // 绘制圆角矩形背景
    ctx.fillStyle = colors.bg
    this.roundRect(x, y, tileWidth, tileWidth, borderRadius)
    ctx.fill()

    // 绘制数字文字
    if (value > 0) {
      ctx.fillStyle = colors.color
      const font = this._getTileFont(value)
      ctx.font = font
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(value), x + tileWidth / 2, y + tileWidth / 2)
    }

    if (needTransform) {
      ctx.restore()
    }
  }

  drawEmptyTile(x, y) {
    const { ctx } = this
    const { tileWidth, borderRadius } = this.layout
    ctx.fillStyle = '#cdc1b4'
    this.roundRect(x, y, tileWidth, tileWidth, borderRadius)
    ctx.fill()
  }

  // 批量绘制空格子，减少状态切换
  drawEmptyTiles(positions) {
    const { ctx } = this
    const { tileWidth, borderRadius } = this.layout
    ctx.fillStyle = '#cdc1b4'
    positions.forEach(({ x, y }) => {
      this.roundRect(x, y, tileWidth, tileWidth, borderRadius)
      ctx.fill()
    })
  }

  drawScore(score, bestScore) {
    const { ctx } = this
    const { boardX, boardWidth, scoreBoxY, scoreBoxWidth, scoreBoxHeight } = this.layout

    // 绘制 SCORE 框
    const scoreBoxX = boardX + boardWidth - scoreBoxWidth * 2 - 10
    ctx.fillStyle = COLORS.boardBackground
    this.roundRect(scoreBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight, 4)
    ctx.fill()
    ctx.textBaseline = 'middle'
    ctx.fillStyle = COLORS.scoreLabel
    ctx.font = FONTS.scoreLabel
    ctx.textAlign = 'center'
    ctx.fillText('分数', scoreBoxX + scoreBoxWidth / 2, scoreBoxY + 15)
    ctx.fillStyle = COLORS.scoreValue
    ctx.font = FONTS.scoreValue
    ctx.fillText(String(score), scoreBoxX + scoreBoxWidth / 2, scoreBoxY + 36)

    // 绘制 BEST 框
    const bestBoxX = boardX + boardWidth - scoreBoxWidth
    ctx.fillStyle = COLORS.boardBackground
    this.roundRect(bestBoxX, scoreBoxY, scoreBoxWidth, scoreBoxHeight, 4)
    ctx.fill()
    ctx.fillStyle = COLORS.scoreLabel
    ctx.font = FONTS.scoreLabel
    ctx.textAlign = 'center'
    ctx.fillText('最高分', bestBoxX + scoreBoxWidth / 2, scoreBoxY + 15)
    ctx.fillStyle = COLORS.scoreValue
    ctx.font = FONTS.scoreValue
    ctx.fillText(String(bestScore), bestBoxX + scoreBoxWidth / 2, scoreBoxY + 36)
    ctx.textBaseline = 'alphabetic'
  }

  drawTitle() {
    // 无标题绘制
  }

  drawButton(x, y, width, height, text, scale = 1) {
    const { ctx } = this
    ctx.save()
    if (scale !== 1) {
      ctx.translate(x + width / 2, y + height / 2)
      ctx.scale(scale, scale)
      ctx.translate(-(x + width / 2), -(y + height / 2))
    }
    ctx.fillStyle = COLORS.buttonBackground
    this.roundRect(x, y, width, height, 6)
    ctx.fill()
    ctx.fillStyle = COLORS.buttonTextColor
    ctx.font = FONTS.button
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, x + width / 2, y + height / 2)
    ctx.restore()
  }

  drawDialog(title, message, buttons, opacity = 1, scale = 1) {
    const { ctx } = this
    const { screenWidth, screenHeight } = this.layout
    const { dialogWidth, dialogHeight, dialogX, dialogY } = this.layout

    ctx.save()
    ctx.globalAlpha = opacity

    // 半透明遮罩
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
    ctx.fillRect(0, 0, screenWidth, screenHeight)

    // 弹窗缩放（从中心缩放）
    const cx = dialogX + dialogWidth / 2
    const cy = dialogY + dialogHeight / 2
    if (scale !== 1) {
      ctx.translate(cx, cy)
      ctx.scale(scale, scale)
      ctx.translate(-cx, -cy)
    }

    // 弹窗背景（暖白色 + 多层阴影）
    ctx.save()
    ctx.shadowColor = 'rgba(0, 0, 0, 0.12)'
    ctx.shadowBlur = 30
    ctx.shadowOffsetY = 8
    ctx.fillStyle = '#faf8ef'
    const dRadius = 20
    this.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, dRadius)
    ctx.fill()
    ctx.restore()

    // 内层边框（微妙的边框线）
    ctx.strokeStyle = 'rgba(187, 173, 160, 0.3)'
    ctx.lineWidth = 1
    this.roundRect(dialogX + 0.5, dialogY + 0.5, dialogWidth - 1, dialogHeight - 1, dRadius)
    ctx.stroke()

    // 标题
    ctx.fillStyle = '#776e65'
    ctx.font = 'bold 28px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(title, dialogX + dialogWidth / 2, dialogY + 45)

    // 标题装饰线
    ctx.strokeStyle = '#eee4da'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(dialogX + dialogWidth * 0.25, dialogY + 65)
    ctx.lineTo(dialogX + dialogWidth * 0.75, dialogY + 65)
    ctx.stroke()

    // 说明文字（自动换行）
    ctx.fillStyle = '#776e65'
    ctx.font = '16px Arial'
    const maxLineWidth = dialogWidth - 40
    const lines = this._wrapText(message, maxLineWidth)
    const lineHeight = 22
    const textStartY = dialogY + 90
    lines.forEach((line, i) => {
      ctx.fillText(line, dialogX + dialogWidth / 2, textStartY + i * lineHeight)
    })

    // 按钮
    const btnHeight = 44
    const btnY = dialogY + dialogHeight - btnHeight - 20
    const btnWidth = dialogWidth * 0.36
    const gap = 16
    const totalBtnWidth = buttons.length * btnWidth + (buttons.length - 1) * gap
    let btnX = dialogX + (dialogWidth - totalBtnWidth) / 2

    buttons.forEach((btn, i) => {
      const isPrimary = i === 0
      if (isPrimary) {
        // 主按钮：深色填充 + 轻微内阴影
        ctx.save()
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)'
        ctx.shadowBlur = 4
        ctx.shadowOffsetY = 2
        ctx.fillStyle = '#8f7a66'
        this.roundRect(btnX, btnY, btnWidth, btnHeight, 10)
        ctx.fill()
        ctx.restore()
        ctx.fillStyle = '#f9f6f2'
      } else {
        // 次按钮：描边样式
        ctx.strokeStyle = '#8f7a66'
        ctx.lineWidth = 1.5
        ctx.fillStyle = 'transparent'
        this.roundRect(btnX, btnY, btnWidth, btnHeight, 10)
        ctx.fill()
        ctx.stroke()
        ctx.fillStyle = '#8f7a66'
      }
      ctx.font = 'bold 17px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(btn.text, btnX + btnWidth / 2, btnY + btnHeight / 2)
      btn.rect = { x: btnX, y: btnY, width: btnWidth, height: btnHeight }
      btnX += btnWidth + gap
    })

    ctx.restore()
  }

  // 文本自动换行
  _wrapText(text, maxWidth) {
    const { ctx } = this
    const lines = []
    let line = ''
    for (let i = 0; i < text.length; i++) {
      const testLine = line + text[i]
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && line.length > 0) {
        lines.push(line)
        line = text[i]
      } else {
        line = testLine
      }
    }
    if (line) lines.push(line)
    return lines
  }

  drawRankItem(y, index, record, rowHeight = 48) {
    const { ctx } = this
    const { boardX, boardWidth } = this.layout
    const cardPad = 4 // 卡片左右内缩
    const cardX = boardX + cardPad
    const cardW = boardWidth - cardPad * 2
    const cardR = 8

    // 卡片背景（圆角）
    ctx.fillStyle = index % 2 === 0 ? '#f5f0e8' : '#ffffff'
    this.roundRect(cardX, y, cardW, rowHeight, cardR)
    ctx.fill()

    // 列定义：三等分
    const colW = cardW / 3
    const col1X = cardX + 14
    const col2X = cardX + colW + 14
    const col3X = cardX + colW * 2 + 14
    const textY = y + rowHeight / 2

    // 字体大小随行高缩放
    const fontSize = rowHeight > 52 ? 15 : 13
    const valueFontSize = rowHeight > 52 ? 17 : 15

    // 时间/日期
    ctx.fillStyle = '#888888'
    ctx.font = `${fontSize}px Arial`
    ctx.textAlign = 'left'
    ctx.textBaseline = 'middle'
    ctx.fillText(record.date || '-', col1X, textY)

    // 分数
    ctx.fillStyle = '#776e65'
    ctx.font = `bold ${valueFontSize}px Arial`
    ctx.textAlign = 'left'
    ctx.fillText(String(record.score), col2X, textY)

    // 步数
    ctx.fillStyle = '#888888'
    ctx.font = `${fontSize}px Arial`
    ctx.textAlign = 'left'
    ctx.fillText(record.moveCount != null ? String(record.moveCount) : '-', col3X, textY)
  }

  // 云端排行榜列表项（排名 / 昵称 / 分数 / 最大方块）
  drawCloudRankItem(y, rank, record) {
    const { ctx } = this
    const { boardX, boardWidth } = this.layout
    const rowHeight = 48
    const cardPad = 4
    const cardX = boardX + cardPad
    const cardW = boardWidth - cardPad * 2
    const cardR = 8

    // Top 3 渐变背景
    const top3Gradients = [
      { stops: ['#FFD700', '#FFA500'] }, // 金
      { stops: ['#C0C0C0', '#A0A0A0'] }, // 银
      { stops: ['#CD7F32', '#8B5A2B'] }  // 铜
    ]

    if (rank >= 1 && rank <= 3) {
      const grad = ctx.createLinearGradient(cardX, y, cardX + cardW, y + rowHeight)
      grad.addColorStop(0, top3Gradients[rank - 1].stops[0])
      grad.addColorStop(1, top3Gradients[rank - 1].stops[1])
      ctx.fillStyle = grad
    } else {
      ctx.fillStyle = rank % 2 === 0 ? '#f5f0e8' : '#ffffff'
    }
    this.roundRect(cardX, y, cardW, rowHeight, cardR)
    ctx.fill()

    // 列定义
    const rankColW = cardW * 0.12
    const nameColW = cardW * 0.32
    const scoreColW = cardW * 0.28
    const textY = y + rowHeight / 2

    // 排名
    ctx.fillStyle = rank <= 3 ? '#ffffff' : '#666666'
    ctx.font = rank <= 3 ? 'bold 18px Arial' : 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(String(rank), cardX + rankColW / 2, textY)

    // 昵称
    ctx.fillStyle = rank <= 3 ? '#ffffff' : '#555555'
    ctx.font = '15px Arial'
    ctx.textAlign = 'left'
    const nickname = record.nickname || '匿名玩家'
    const maxLen = 8
    ctx.fillText(nickname.length > maxLen ? nickname.slice(0, maxLen) + '..' : nickname, cardX + rankColW + 12, textY)

    // 分数
    ctx.fillStyle = rank <= 3 ? '#ffffff' : '#333333'
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'right'
    ctx.fillText(String(record.score), cardX + rankColW + nameColW + scoreColW - 12, textY)

    // 最大方块
    ctx.fillStyle = rank <= 3 ? 'rgba(255,255,255,0.85)' : '#666666'
    ctx.font = '14px Arial'
    ctx.textAlign = 'right'
    ctx.fillText(String(record.maxTile), cardX + cardW - 12, textY)
  }

  // 用户数据卡片（3 列：总局数 / 最高分 / 总步数）
  drawUserStats(stats, y, opts = {}) {
    const { ctx } = this
    const { boardX, boardWidth } = this.layout
    const large = opts.large || false
    const gap = 6
    const cardHeight = large ? 68 : 56
    const cardWidth = (boardWidth - gap * 2) / 3
    const labelFont = large ? '13px Arial' : '11px Arial'
    const valueFont = large ? 'bold 22px Arial' : 'bold 18px Arial'

    const items = [
      { label: '总局数', value: stats.totalGames },
      { label: '最高分', value: stats.bestScore },
      { label: '总步数', value: stats.totalMoves }
    ]

    items.forEach((item, i) => {
      const x = boardX + i * (cardWidth + gap)
      // 卡片背景
      ctx.fillStyle = '#eee4da'
      this.roundRect(x, y, cardWidth, cardHeight, 6)
      ctx.fill()

      // 标签
      ctx.fillStyle = '#776e65'
      ctx.font = labelFont
      ctx.textAlign = 'center'
      ctx.textBaseline = 'top'
      ctx.fillText(item.label, x + cardWidth / 2, y + (large ? 10 : 8))

      // 数值
      ctx.fillStyle = '#776e65'
      ctx.font = valueFont
      ctx.textBaseline = 'bottom'
      ctx.fillText(String(item.value), x + cardWidth / 2, y + cardHeight - (large ? 8 : 6))
    })
  }

  // 绘制合并闪光效果
  drawFlash(x, y, opacity, scale) {
    const { ctx } = this
    const { tileWidth } = this.layout

    ctx.save()
    ctx.globalAlpha = opacity

    // 绘制闪光圆形
    const centerX = x + tileWidth / 2
    const centerY = y + tileWidth / 2
    const radius = tileWidth * 0.4 * scale

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)')
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }

  // 辅助方法：绘制圆角矩形路径
  roundRect(x, y, w, h, r) {
    const { ctx } = this
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.arcTo(x + w, y, x + w, y + r, r)
    ctx.lineTo(x + w, y + h - r)
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
    ctx.lineTo(x + r, y + h)
    ctx.arcTo(x, y + h, x, y + h - r, r)
    ctx.lineTo(x, y + r)
    ctx.arcTo(x, y, x + r, y, r)
    ctx.closePath()
  }

  // 获取方块字体大小
  _getTileFont(value) {
    if (value < 100) return FONTS.tileSmall
    if (value < 1000) return FONTS.tileMedium
    if (value < 10000) return FONTS.tileLarge
    return FONTS.tileXLarge
  }
}
