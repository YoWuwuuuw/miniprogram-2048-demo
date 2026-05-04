// ============================================
// ranklist-scene.js - 云端排行榜场景
// ============================================

import { fetchRankList, seedTestData } from '../cloud.js'
import { Button } from '../ui/button.js'
import { COLORS, FONTS, SCROLL_PHYSICS } from '../constants.js'

export class RanklistScene {
  constructor(renderer, inputManager, animationManager, sceneManager) {
    this.renderer = renderer
    this.inputManager = inputManager
    this.animationManager = animationManager
    this.sceneManager = sceneManager
    this.layout = renderer.layout

    this.rankList = []
    this.isLoading = true

    // 滚动状态
    this.scrollOffset = 0
    this._scrollAtTouchStart = 0
    this._velocity = 0         // 惯性速度（px/s）
    this._isTouching = false   // 是否正在触摸
    this._onScroll = this._onScroll.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onScrollEnd = this._onScrollEnd.bind(this)

    const { boardX, boardWidth, buttonWidth, buttonHeight } = this.layout
    this.backBtn = new Button({
      x: boardX + (boardWidth - buttonWidth) / 2,
      y: this.layout.screenHeight * 0.85,
      width: buttonWidth,
      height: buttonHeight,
      text: '返回'
    })
  }

  async enter() {
    this.isLoading = true
    this.rankList = []
    this.scrollOffset = 0
    this._scrollAtTouchStart = 0
    this._velocity = 0
    this._isTouching = false
    this.inputManager.onScroll(this._onScroll)
    this.inputManager.onTouchStart(this._onTouchStart)
    this.inputManager.onScrollEnd(this._onScrollEnd)

    this.rankList = await fetchRankList(50)
    // 数据不足时补充测试数据
    if (this.rankList.length < 10) {
      this.rankList = seedTestData(20)
    }
    this.isLoading = false
  }

  exit() {
    this.inputManager.offScroll(this._onScroll)
    this.inputManager.offTouchStart(this._onTouchStart)
    this.inputManager.offScrollEnd(this._onScrollEnd)
  }

  _onTouchStart(pos) {
    this._scrollAtTouchStart = this.scrollOffset
    this._isTouching = true
    this._velocity = 0 // 触摸时停止惯性
  }

  _onScroll(cumulativeDeltaY) {
    const maxScroll = this._getMaxScroll()
    const target = this._scrollAtTouchStart + cumulativeDeltaY

    if (target < 0) {
      // 超出顶部：弹性阻尼
      this.scrollOffset = target * SCROLL_PHYSICS.elasticDamping
    } else if (target > maxScroll) {
      // 超出底部：弹性阻尼
      this.scrollOffset = maxScroll + (target - maxScroll) * SCROLL_PHYSICS.elasticDamping
    } else {
      this.scrollOffset = target
    }
  }

  _onScrollEnd(velocity) {
    this._isTouching = false
    // 如果当前在越界区域，不启动惯性，直接回弹
    const maxScroll = this._getMaxScroll()
    if (this.scrollOffset < 0 || this.scrollOffset > maxScroll) {
      this._velocity = 0
    } else {
      this._velocity = velocity
    }
  }

  _getMaxScroll() {
    const { screenHeight } = this.layout
    const itemHeight = 52
    const listTopY = this._getListTopY()
    const visibleHeight = screenHeight * 0.85 - listTopY - 20
    return Math.max(0, this.rankList.length * itemHeight - visibleHeight)
  }

  update(dt) {
    if (this._isTouching) return
    if (this.isLoading) return

    const maxScroll = this._getMaxScroll()

    // 边界回弹
    if (this.scrollOffset < 0) {
      this.scrollOffset *= 0.85
      if (Math.abs(this.scrollOffset) < 0.5) this.scrollOffset = 0
      return
    }
    if (this.scrollOffset > maxScroll) {
      const over = this.scrollOffset - maxScroll
      this.scrollOffset = maxScroll + over * 0.85
      if (Math.abs(this.scrollOffset - maxScroll) < 0.5) this.scrollOffset = maxScroll
      return
    }

    // 惯性滚动
    if (Math.abs(this._velocity) < SCROLL_PHYSICS.velocityThreshold) {
      this._velocity = 0
      return
    }

    this.scrollOffset += this._velocity * dt
    this._velocity *= Math.pow(SCROLL_PHYSICS.friction, dt * 60) // 归一化到 60fps

    // 到达边界时停止
    if (this.scrollOffset < 0) {
      this.scrollOffset = 0
      this._velocity = 0
    } else if (this.scrollOffset > maxScroll) {
      this.scrollOffset = maxScroll
      this._velocity = 0
    }
  }

  handleTap(x, y) {
    if (this.backBtn.hitTest(x, y)) {
      this.sceneManager.popScene()
    }
  }

  _getListTopY() {
    const { screenHeight } = this.layout
    return screenHeight * 0.06 + 56
  }

  render(ctx) {
    this.renderer.drawBackground()

    const { boardX, boardWidth, screenWidth, screenHeight } = this.layout

    // 标题（安全区域，上移避免与表头重叠）
    const titleY = screenHeight * 0.06
    ctx.fillStyle = COLORS.headerText
    ctx.font = FONTS.title
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('排行榜', screenWidth / 2, titleY)

    // 表头（优化布局，与数据列对齐）
    const listTopY = this._getListTopY()
    const headerY = listTopY

    ctx.fillStyle = '#777777' // 加深表头颜色
    ctx.font = 'bold 14px Arial' // 增大表头字体
    ctx.textBaseline = 'middle'

    // 列定义（与drawCloudRankItem保持一致）
    const rankColW = boardWidth * 0.12
    const nameColW = boardWidth * 0.32
    const scoreColW = boardWidth * 0.28
    const maxTileColW = boardWidth * 0.28

    ctx.textAlign = 'center'
    ctx.fillText('排名', boardX + rankColW / 2, headerY)
    ctx.textAlign = 'left'
    ctx.fillText('昵称', boardX + rankColW + 12, headerY)
    ctx.textAlign = 'right'
    ctx.fillText('分数', boardX + rankColW + nameColW + scoreColW - 12, headerY)
    ctx.fillText('方块', boardX + boardWidth - 12, headerY)

    // 分隔线（增加间距）
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(boardX, headerY + 16)
    ctx.lineTo(boardX + boardWidth, headerY + 16)
    ctx.stroke()

    // 列表区域（增加间距）
    const listStartY = headerY + 28
    const itemHeight = 52 // 48px 卡片 + 4px 间距
    const visibleHeight = screenHeight * 0.85 - listStartY - 20

    if (this.isLoading) {
      ctx.fillStyle = '#999999'
      ctx.font = FONTS.dialogText
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('加载中...', screenWidth / 2, listStartY + 50)
    } else if (this.rankList.length === 0) {
      ctx.fillStyle = '#999999'
      ctx.font = FONTS.dialogText
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('暂无记录', screenWidth / 2, listStartY + 50)
    } else {
      // 计算可见范围
      const startIdx = Math.max(0, Math.floor(this.scrollOffset / itemHeight))
      const endIdx = Math.min(
        this.rankList.length,
        Math.ceil((this.scrollOffset + visibleHeight) / itemHeight)
      )

      // 裁剪区域（上下各多留 itemHeight 以容纳弹性越界和部分可见行）
      ctx.save()
      ctx.beginPath()
      ctx.rect(boardX - 1, listStartY - itemHeight, boardWidth + 2, visibleHeight + itemHeight * 2)
      ctx.clip()

      for (let i = startIdx; i < endIdx; i++) {
        const y = listStartY + i * itemHeight - this.scrollOffset
        this.renderer.drawCloudRankItem(y, i + 1, this.rankList[i])
      }

      ctx.restore()
    }

    // 返回按钮
    this.backBtn.draw(this.renderer)
  }
}
