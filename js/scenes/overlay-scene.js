// ============================================
// overlay-scene.js - 游戏结束弹窗场景
// ============================================

import { Dialog } from '../ui/dialog.js'
import { addRankRecord, updateStatistics, clearGameState } from '../storage.js'
import { getMaxTile } from '../game-core.js'
import { createFadeInAnimation } from '../animation.js'
import { uploadScore } from '../cloud.js'

export class OverlayScene {
  constructor(renderer, inputManager, animationManager, sceneManager, gameScene) {
    this.renderer = renderer
    this.inputManager = inputManager
    this.animationManager = animationManager
    this.sceneManager = sceneManager
    this.gameScene = gameScene
    this.dialog = null
    this._animOpacity = 0
    this._animScale = 0.9
  }

  enter() {
    this._saveAndRecord()

    // 上传分数到云端
    const gs = this.gameScene
    uploadScore(gs.score, getMaxTile(gs.board), gs.moveCount)

    this._animOpacity = 0
    this._animScale = 0.9

    this.dialog = new Dialog({
      title: '游戏结束',
      message: `最终得分: ${this.gameScene.score}`,
      buttons: [
        { text: '重新开始', id: 'restart' },
        { text: '排行榜', id: 'ranklist' }
      ],
      visible: true
    })

    // 淡入动画
    const anim = createFadeInAnimation(null, (state) => {
      this._animOpacity = state.opacity
      this._animScale = state.scale
    })
    this.animationManager.add(anim.tween)
  }

  exit() {
    if (this.dialog) this.dialog.hide()
  }

  update(dt) {
    // 弹窗场景无逻辑更新
  }

  _saveAndRecord() {
    const gs = this.gameScene
    const now = new Date()
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    addRankRecord({
      score: gs.score,
      maxTile: getMaxTile(gs.board),
      moveCount: gs.moveCount,
      timestamp: Date.now(),
      date: dateStr
    })
    updateStatistics(gs.score, gs.moveCount)
    clearGameState()
  }

  handleTap(x, y) {
    if (!this.dialog || !this.dialog.visible) return

    const btnId = this.dialog.hitTest(x, y)
    if (!btnId) return

    switch (btnId) {
      case 'restart':
        this.gameScene.newGame()
        this.sceneManager.popScene()
        break
      case 'ranklist':
        this.sceneManager.pushScene('ranklist')
        break
    }
  }

  render(ctx) {
    // 绘制弹窗（含淡入动画）
    if (this.dialog) {
      this.renderer.drawDialog(
        this.dialog.title,
        this.dialog.message,
        this.dialog.buttons,
        this._animOpacity,
        this._animScale
      )
    }
  }
}
