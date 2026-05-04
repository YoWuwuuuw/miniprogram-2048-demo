// ============================================
// game-scene.js - 游戏主场景
// ============================================

import { createEmptyBoard, addRandomTile, move, canMove, getMaxTile, cloneBoard } from '../game-core.js'
import { saveGameState, loadGameState, clearGameState, saveBestScore, getBestScore } from '../storage.js'
import { TILE_COLORS } from '../constants.js'
import { createAppearAnimation, createMoveAnimation, createMergeAnimation, createFlashAnimation, createButtonPressAnimation } from '../animation.js'
import { Button } from '../ui/button.js'

export class GameScene {
  constructor(renderer, inputManager, animationManager, sceneManager) {
    this.renderer = renderer
    this.inputManager = inputManager
    this.animationManager = animationManager
    this.sceneManager = sceneManager
    this.layout = renderer.layout

    this.board = createEmptyBoard()
    this.score = 0
    this.bestScore = 0
    this.moveCount = 0
    this.gameOver = false

    // 方块渲染状态 Map: key "row-col" => { x, y, scale, opacity, animData }
    this.tileStates = {}

    // 合并闪光效果状态
    this.flashEffects = []

    // 按钮（2x2 网格）
    const { buttonX, buttonY, buttonY2, buttonWidth, buttonHeight, buttonGap } = this.layout
    this.newGameBtn = new Button({
      x: buttonX,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      text: '新游戏'
    })
    this.rankBtn = new Button({
      x: buttonX + buttonWidth + buttonGap,
      y: buttonY,
      width: buttonWidth,
      height: buttonHeight,
      text: '排行榜'
    })
    this.myBtn = new Button({
      x: buttonX,
      y: buttonY2,
      width: buttonWidth,
      height: buttonHeight,
      text: '我的'
    })
    this.settingsBtn = new Button({
      x: buttonX + buttonWidth + buttonGap,
      y: buttonY2,
      width: buttonWidth,
      height: buttonHeight,
      text: '设置'
    })

    this._isProcessing = false
    this._showConfirmNewGame = false
  }

  enter() {
    this._isProcessing = false
    this._moveAnimCalled = false
    this.bestScore = getBestScore()
    const saved = loadGameState()
    if (saved && saved.board) {
      this.board = saved.board
      this.score = saved.score || 0
      this.moveCount = saved.moveCount || 0
    } else {
      this.newGame()
    }
    this._initTileStates()
  }

  exit() {
    // 清理
  }

  newGame() {
    this.board = createEmptyBoard()
    const { board: b1 } = addRandomTile(this.board)
    this.board = b1
    const { board: b2 } = addRandomTile(this.board)
    this.board = b2
    this.score = 0
    this.moveCount = 0
    this.gameOver = false
    this._initTileStates()
    this._saveState()
  }

  _initTileStates() {
    this.tileStates = {}
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] !== 0) {
          this.tileStates[`${r}-${c}`] = {
            x: this._getTileX(c),
            y: this._getTileY(r),
            scale: 1,
            opacity: 1
          }
        }
      }
    }
  }

  _getTileX(col) {
    const { boardX, boardPadding, tileGap, tileWidth } = this.layout
    return boardX + boardPadding + tileGap + col * (tileWidth + tileGap)
  }

  _getTileY(row) {
    const { boardY, boardPadding, tileGap, tileWidth } = this.layout
    return boardY + boardPadding + tileGap + row * (tileWidth + tileGap)
  }

  handleSwipe(direction) {
    if (this._isProcessing) return
    if (this.animationManager.isActive()) return

    const oldBoard = cloneBoard(this.board)
    const result = move(this.board, direction)

    if (!result.moved) return

    this._isProcessing = true
    this.inputManager.lock()
    this._moveAnimCalled = false

    // 记录旧位置：value -> [{row, col}, ...]
    const oldTiles = {}
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (oldBoard[r][c] !== 0) {
          const v = oldBoard[r][c]
          if (!oldTiles[v]) oldTiles[v] = []
          oldTiles[v].push({ row: r, col: c })
        }
      }
    }

    // 更新棋盘数据
    this.board = result.newBoard
    this.score += result.scoreGained
    this.moveCount++

    // 构建合并位置集合
    const mergeSet = new Set()
    result.merges.forEach(m => mergeSet.add(`${m.row}-${m.col}`))

    const isVertical = direction === 'up' || direction === 'down'

    let activeAnims = 0
    const onAnimComplete = () => {
      activeAnims--
      if (activeAnims === 0) {
        this._onMoveAnimationComplete()
      }
    }

    // 用于跟踪已消费的旧位置
    const consumed = {}
    for (const v in oldTiles) {
      consumed[v] = oldTiles[v].map(() => false)
    }

    // 按移动方向排序源方块：不动的排前面
    const sortByDirection = (list) => {
      const sorted = [...list]
      switch (direction) {
        case 'left':  sorted.sort((a, b) => a.col - b.col); break   // 左边的不动
        case 'right': sorted.sort((a, b) => b.col - a.col); break   // 右边的不动
        case 'up':    sorted.sort((a, b) => a.row - b.row); break   // 上边的不动
        case 'down':  sorted.sort((a, b) => b.row - a.row); break   // 下边的不动
      }
      return sorted
    }

    // 辅助：创建移动 + 设置初始位置
    const createMoveAnim = (key, fromRow, fromCol, toRow, toCol) => {
      const fromX = this._getTileX(fromCol)
      const fromY = this._getTileY(fromRow)
      const toX = this._getTileX(toCol)
      const toY = this._getTileY(toRow)
      if (fromRow !== toRow || fromCol !== toCol) {
        activeAnims++
        this.tileStates[key] = { x: fromX, y: fromY, scale: 1, opacity: 1 }
        const anim = createMoveAnimation(fromX, fromY, toX, toY, onAnimComplete, (pos) => {
          if (this.tileStates[key]) { this.tileStates[key].x = pos.x; this.tileStates[key].y = pos.y }
        })
        this.animationManager.add(anim.tween)
      } else {
        this.tileStates[key] = { x: toX, y: toY, scale: 1, opacity: 1 }
      }
    }

    // 第一轮：处理合并方块（优先消费，避免非合并方块误消费源方块）
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (!mergeSet.has(`${r}-${c}`)) continue
        const sourceVal = this.board[r][c] / 2
        const key = `${r}-${c}`
        const toX = this._getTileX(c)
        const toY = this._getTileY(r)

        // 找未消费的源方块，按方向+对齐过滤
        const list = oldTiles[sourceVal]
        if (!list) continue
        const available = []
        for (let i = 0; i < list.length; i++) {
          if (consumed[sourceVal][i]) continue
          // 必须同列（上下合并）或同行（左右合并）
          if (isVertical ? list[i].col === c : list[i].row === r) {
            available.push({ ...list[i], idx: i })
          }
        }
        if (available.length < 2) continue
        const sorted = sortByDirection(available)
        const stationary = sorted[0]  // 方向排序后第一个 = 不动的
        const moving = sorted[1]      // 第二个 = 滑入的

        consumed[sourceVal][stationary.idx] = true
        consumed[sourceVal][moving.idx] = true

        // 不动的方块直接定位到合并点
        this.tileStates[key] = { x: toX, y: toY, scale: 1, opacity: 1 }

        // 移动的方块滑入合并点
        const mx = this._getTileX(moving.col)
        const my = this._getTileY(moving.row)
        if (moving.row !== r || moving.col !== c) {
          activeAnims++
          const anim = createMoveAnimation(mx, my, toX, toY, onAnimComplete, (pos) => {
            if (this.tileStates[key]) { this.tileStates[key].x = pos.x; this.tileStates[key].y = pos.y }
          })
          this.animationManager.add(anim.tween)
        }

        // 合并脉冲动画（确保每次合并都触发）
        activeAnims++
        const mergeAnim = createMergeAnimation(toX, toY, onAnimComplete, (state) => {
          if (this.tileStates[key]) { this.tileStates[key].scale = state.scale }
        })
        this.animationManager.add(mergeAnim.tween)

        // 合并闪光效果
        const flashKey = `flash-${r}-${c}`
        this.flashEffects.push({
          key: flashKey,
          x: toX,
          y: toY,
          opacity: 0,
          scale: 1
        })
        const flashAnim = createFlashAnimation(toX, toY, () => {
          // 移除闪光效果
          this.flashEffects = this.flashEffects.filter(f => f.key !== flashKey)
        }, (state) => {
          const flash = this.flashEffects.find(f => f.key === flashKey)
          if (flash) {
            flash.opacity = state.opacity
            flash.scale = state.scale
          }
        })
        this.animationManager.add(flashAnim.tween)
      }
    }

    // 第二轮：处理非合并方块（匹配同位置或同方向的旧方块）
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const newVal = this.board[r][c]
        if (newVal === 0 || mergeSet.has(`${r}-${c}`)) continue
        const list = oldTiles[newVal]
        if (!list) { this.tileStates[`${r}-${c}`] = { x: this._getTileX(c), y: this._getTileY(r), scale: 1, opacity: 1 }; continue }
        // 优先同位置，再同行/同列，最后沿移动方向搜索最近的
        let idx = list.findIndex((p, i) => !consumed[newVal][i] && p.row === r && p.col === c)
        if (idx === -1) idx = list.findIndex((p, i) => !consumed[newVal][i] && (isVertical ? p.col === c : p.row === r))
        // 方向 fallback：沿移动方向搜索可到达目标的最近源方块
        if (idx === -1) {
          let bestDist = Infinity
          for (let i = 0; i < list.length; i++) {
            if (consumed[newVal][i]) continue
            const p = list[i]
            let canReach = false
            let dist = 0
            if (!isVertical && p.row === r && p.col >= c) {
              canReach = true; dist = p.col - c
            } else if (isVertical && p.col === c && p.row >= r) {
              canReach = true; dist = p.row - r
            }
            if (canReach && dist < bestDist) { bestDist = dist; idx = i }
          }
        }
        if (idx !== -1) {
          consumed[newVal][idx] = true
          createMoveAnim(`${r}-${c}`, list[idx].row, list[idx].col, r, c)
        } else {
          this.tileStates[`${r}-${c}`] = { x: this._getTileX(c), y: this._getTileY(r), scale: 1, opacity: 1 }
        }
      }
    }

    if (activeAnims === 0) {
      this._onMoveAnimationComplete()
    }
  }

  _onMoveAnimationComplete() {
    if (this._moveAnimCalled) return
    this._moveAnimCalled = true
    // 添加新方块
    const { board: newBoard, tile } = addRandomTile(this.board)
    this.board = newBoard

    // 初始化新方块位置
    this.tileStates = {}
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (this.board[r][c] !== 0) {
          this.tileStates[`${r}-${c}`] = {
            x: this._getTileX(c),
            y: this._getTileY(r),
            scale: 1,
            opacity: 1
          }
        }
      }
    }

    // 为新方块创建出现动画
    if (tile) {
      const key = `${tile.row}-${tile.col}`
      if (this.tileStates[key]) {
        this.tileStates[key].scale = 0.5
      }
      const anim = createAppearAnimation(
        this._getTileX(tile.col),
        this._getTileY(tile.row),
        null,
        (state) => {
          if (this.tileStates[key]) {
            this.tileStates[key].scale = state.scale
          }
        }
      )
      this.animationManager.add(anim.tween)
    }

    // 更新最高分
    if (this.score > this.bestScore) {
      this.bestScore = this.score
      saveBestScore(this.score)
    }

    this._saveState()
    this._isProcessing = false
    this.inputManager.unlock()

    // 检测游戏结束
    this._checkGameEnd()
  }

  handleTap(x, y) {
    if (this._isProcessing) return

    // 确认弹窗处理
    if (this._showConfirmNewGame) {
      const { dialogWidth, dialogHeight, dialogX, dialogY } = this.layout
      const btnWidth = dialogWidth * 0.36
      const btnHeight = 44
      const btnY = dialogY + dialogHeight - btnHeight - 20
      const totalBtnWidth = 2 * btnWidth + 16
      const firstBtnX = dialogX + (dialogWidth - totalBtnWidth) / 2

      // 确定按钮（第一个）
      const confirmX = firstBtnX
      if (x >= confirmX && x <= confirmX + btnWidth && y >= btnY && y <= btnY + btnHeight) {
        this._showConfirmNewGame = false
        this.newGame()
        return
      }
      // 取消按钮（第二个）
      const cancelX = firstBtnX + btnWidth + 16
      if (x >= cancelX && x <= cancelX + btnWidth && y >= btnY && y <= btnY + btnHeight) {
        this._showConfirmNewGame = false
        return
      }
      return
    }

    if (this.newGameBtn.hitTest(x, y)) {
      const anim = createButtonPressAnimation(() => {
        this._showConfirmNewGame = true
      }, (state) => {
        this.newGameBtn.scale = state.scale
      })
      this.animationManager.add(anim.tween)
      return
    }

    if (this.rankBtn.hitTest(x, y)) {
      const anim = createButtonPressAnimation(() => {
        this.sceneManager.pushScene('ranklist')
      }, (state) => {
        this.rankBtn.scale = state.scale
      })
      this.animationManager.add(anim.tween)
      return
    }

    if (this.myBtn.hitTest(x, y)) {
      const anim = createButtonPressAnimation(() => {
        this.sceneManager.pushScene('profile')
      }, (state) => {
        this.myBtn.scale = state.scale
      })
      this.animationManager.add(anim.tween)
      return
    }

    if (this.settingsBtn.hitTest(x, y)) {
      const anim = createButtonPressAnimation(() => {
        // TODO: 推入设置场景
      }, (state) => {
        this.settingsBtn.scale = state.scale
      })
      this.animationManager.add(anim.tween)
      return
    }
  }

  _checkGameEnd() {
    if (!canMove(this.board)) {
      this.gameOver = true
      this.sceneManager.pushScene('overlay')
    }
  }

  _saveState() {
    saveGameState({
      board: this.board,
      score: this.score,
      moveCount: this.moveCount
    })
  }

  update(dt) {
    // 更新方块动画状态
    // 由 AnimationManager 在主循环中处理
  }

  render(ctx) {
    this.renderer.drawBackground()
    this.renderer.drawTitle()
    this.renderer.drawScore(this.score, this.bestScore)
    this.renderer.drawBoard()

    // 批量绘制空格子背景
    const emptyPositions = []
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        emptyPositions.push({ x: this._getTileX(c), y: this._getTileY(r) })
      }
    }
    this.renderer.drawEmptyTiles(emptyPositions)

    // 绘制方块
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const val = this.board[r][c]
        if (val !== 0) {
          const key = `${r}-${c}`
          const state = this.tileStates[key]
          const x = state ? state.x : this._getTileX(c)
          const y = state ? state.y : this._getTileY(r)
          const scale = state ? state.scale : 1
          this.renderer.drawTile(x, y, val, scale)
        }
      }
    }

    // 绘制合并闪光效果
    this.flashEffects.forEach(flash => {
      if (flash.opacity > 0) {
        this.renderer.drawFlash(flash.x, flash.y, flash.opacity, flash.scale)
      }
    })

    // 绘制按钮
    this.newGameBtn.draw(this.renderer)
    this.rankBtn.draw(this.renderer)
    this.myBtn.draw(this.renderer)
    this.settingsBtn.draw(this.renderer)

    // 确认新游戏弹窗
    if (this._showConfirmNewGame) {
      this.renderer.drawDialog('确认', '确定要开始新游戏吗？当前进度将丢失', [
        { text: '确定' },
        { text: '取消' }
      ])
    }
  }
}
