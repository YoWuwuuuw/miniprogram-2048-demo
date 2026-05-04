// ============================================
// profile-scene.js - 个人数据页面（本地）
// ============================================

import { getRankHistory, getStatistics, getNickname, saveNickname } from '../storage.js'
import { saveUserInfo } from '../cloud.js'
import { Button } from '../ui/button.js'
import { COLORS, FONTS, SCROLL_PHYSICS } from '../constants.js'

export class ProfileScene {
  constructor(renderer, inputManager, animationManager, sceneManager) {
    this.renderer = renderer
    this.inputManager = inputManager
    this.animationManager = animationManager
    this.sceneManager = sceneManager
    this.layout = renderer.layout

    this.rankHistory = []
    this.statistics = {}

    // 滚动状态
    this.scrollOffset = 0
    this._scrollAtTouchStart = 0
    this._velocity = 0
    this._isTouching = false
    this._onScroll = this._onScroll.bind(this)
    this._onTouchStart = this._onTouchStart.bind(this)
    this._onScrollEnd = this._onScrollEnd.bind(this)

    const { boardX, boardWidth, buttonWidth, buttonHeight } = this.layout

    // 登录状态
    this.isLoggedIn = false
    this._isLoggingIn = false

    // 登录按钮
    const loginBtnWidth = boardWidth * 0.4
    const loginBtnHeight = 36
    this.loginBtn = new Button({
      x: boardX + (boardWidth - loginBtnWidth) / 2,
      y: 0, // 在 enter() 中动态计算
      width: loginBtnWidth,
      height: loginBtnHeight,
      text: '登录'
    })

    this.backBtn = new Button({
      x: boardX + (boardWidth - buttonWidth) / 2,
      y: this.layout.screenHeight * 0.85,
      width: buttonWidth,
      height: buttonHeight,
      text: '返回'
    })
  }

  enter() {
    this.rankHistory = getRankHistory()
    this.statistics = getStatistics()
    this.scrollOffset = 0

    // 检查登录状态
    const nickname = getNickname()
    this.isLoggedIn = !!nickname && nickname !== '匿名用户'
    this.loginBtn.text = this.isLoggedIn ? '已登录' : '登录'

    // 动态计算登录按钮 Y 位置（标题下方）
    const titleY = this.layout.screenHeight * 0.12
    this.loginBtn.y = titleY + 36
    this._scrollAtTouchStart = 0
    this._velocity = 0
    this._isTouching = false
    this.inputManager.onScroll(this._onScroll)
    this.inputManager.onTouchStart(this._onTouchStart)
    this.inputManager.onScrollEnd(this._onScrollEnd)
  }

  exit() {
    this.inputManager.offScroll(this._onScroll)
    this.inputManager.offTouchStart(this._onTouchStart)
    this.inputManager.offScrollEnd(this._onScrollEnd)
  }

  _onTouchStart(pos) {
    this._scrollAtTouchStart = this.scrollOffset
    this._isTouching = true
    this._velocity = 0
  }

  _onScrollEnd(velocity) {
    this._isTouching = false
    const maxScroll = this._getMaxScroll()
    if (this.scrollOffset < 0 || this.scrollOffset > maxScroll) {
      this._velocity = 0
    } else {
      this._velocity = velocity
    }
  }

  _getMaxScroll() {
    const { screenHeight } = this.layout
    const itemHeight = 60 // 56px 卡片 + 4px 间距
    const listTopY = this._getListTopY()
    const visibleHeight = screenHeight * 0.85 - listTopY - 20
    return Math.max(0, this.rankHistory.length * itemHeight - visibleHeight)
  }

  _onScroll(cumulativeDeltaY) {
    const maxScroll = this._getMaxScroll()
    const target = this._scrollAtTouchStart + cumulativeDeltaY

    if (target < 0) {
      this.scrollOffset = target * SCROLL_PHYSICS.elasticDamping
    } else if (target > maxScroll) {
      this.scrollOffset = maxScroll + (target - maxScroll) * SCROLL_PHYSICS.elasticDamping
    } else {
      this.scrollOffset = target
    }
  }

  update(dt) {
    if (this._isTouching) return

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
    this._velocity *= Math.pow(SCROLL_PHYSICS.friction, dt * 60)

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
      return
    }

    // 登录按钮
    if (!this.isLoggedIn && !this._isLoggingIn && this.loginBtn.hitTest(x, y)) {
      this._isLoggingIn = true
      wx.getUserProfile({
        desc: '用于排行榜昵称显示',
        success: (res) => {
          const nick = res.userInfo.nickName || '匿名用户'
          saveNickname(nick)
          saveUserInfo(nick)
          this.isLoggedIn = true
          this.loginBtn.text = '已登录'
          this._isLoggingIn = false
        },
        fail: () => {
          saveNickname('匿名用户')
          saveUserInfo('匿名用户')
          this._isLoggingIn = false
        }
      })
      return
    }
  }

  _getListTopY() {
    const { screenHeight } = this.layout
    const titleY = screenHeight * 0.12
    return titleY + 80 + 56 + 32
  }

  render(ctx) {
    this.renderer.drawBackground()

    const { boardX, boardWidth, screenWidth, screenHeight } = this.layout

    // 标题（安全区域）
    const titleY = screenHeight * 0.12
    ctx.fillStyle = COLORS.headerText
    ctx.font = FONTS.title
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('我的', screenWidth / 2, titleY)

    // 登录按钮
    this.loginBtn.draw(this.renderer)

    // 用户数据卡片（登录按钮下方）
    const statsY = titleY + 80
    this.renderer.drawUserStats(this.statistics, statsY, { large: true })

    // 表头（与排行榜风格统一）
    const listTopY = this._getListTopY()
    const headerY = listTopY

    ctx.fillStyle = '#777777'
    ctx.font = 'bold 14px Arial'
    ctx.textBaseline = 'middle'

    const colW = boardWidth / 3
    ctx.textAlign = 'left'
    ctx.fillText('时间', boardX + 12, headerY)
    ctx.fillText('分数', boardX + colW + 14, headerY)
    ctx.fillText('步数', boardX + colW * 2 + 14, headerY)

    // 分隔线
    ctx.strokeStyle = '#ddd'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(boardX, headerY + 14)
    ctx.lineTo(boardX + boardWidth, headerY + 14)
    ctx.stroke()

    // 历史记录列表（可滚动）
    const listStartY = headerY + 24
    const itemHeight = 60 // 56px 卡片 + 4px 间距
    const visibleHeight = screenHeight * 0.85 - listStartY - 20

    if (this.rankHistory.length === 0) {
      ctx.fillStyle = '#999999'
      ctx.font = FONTS.dialogText
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('暂无记录', screenWidth / 2, listStartY + 50)
    } else {
      // 计算可见范围
      const startIdx = Math.max(0, Math.floor(this.scrollOffset / itemHeight))
      const endIdx = Math.min(
        this.rankHistory.length,
        Math.ceil((this.scrollOffset + visibleHeight) / itemHeight)
      )

      // 裁剪区域（上下各多留 itemHeight 以容纳弹性越界和部分可见行）
      ctx.save()
      ctx.beginPath()
      ctx.rect(boardX - 1, listStartY - itemHeight, boardWidth + 2, visibleHeight + itemHeight * 2)
      ctx.clip()

      for (let i = startIdx; i < endIdx; i++) {
        const y = listStartY + i * itemHeight - this.scrollOffset
        this.renderer.drawRankItem(y, i, this.rankHistory[i], 56)
      }

      ctx.restore()
    }

    // 未登录提示
    ctx.fillStyle = '#999999'
    ctx.font = '12px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('未登录用户的分数不会计入排行榜', screenWidth / 2, this.backBtn.y - 16)

    // 返回按钮
    this.backBtn.draw(this.renderer)
  }
}
