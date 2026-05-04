// ============================================
// input.js - 触摸手势识别（滑动方向 + 点击检测）
// ============================================

import { SWIPE_THRESHOLD, SCROLL_PHYSICS } from './constants.js'

export class InputManager {
  constructor() {
    this.startPos = null
    this.isLocked = false
    this.swipeCallbacks = []
    this.tapCallbacks = []
    this.scrollCallbacks = []
    this.scrollEndCallbacks = []
    this.touchStartCallbacks = []

    // 速度追踪
    this._velocityBuffer = []

    this._onTouchStart = this._onTouchStart.bind(this)
    this._onTouchMove = this._onTouchMove.bind(this)
    this._onTouchEnd = this._onTouchEnd.bind(this)

    wx.onTouchStart(this._onTouchStart)
    wx.onTouchMove(this._onTouchMove)
    wx.onTouchEnd(this._onTouchEnd)
  }

  onSwipe(callback) {
    this.swipeCallbacks.push(callback)
  }

  onTap(callback) {
    this.tapCallbacks.push(callback)
  }

  onScroll(callback) {
    this.scrollCallbacks.push(callback)
  }

  offScroll(callback) {
    this.scrollCallbacks = this.scrollCallbacks.filter(cb => cb !== callback)
  }

  onScrollEnd(callback) {
    this.scrollEndCallbacks.push(callback)
  }

  offScrollEnd(callback) {
    this.scrollEndCallbacks = this.scrollEndCallbacks.filter(cb => cb !== callback)
  }

  onTouchStart(callback) {
    this.touchStartCallbacks.push(callback)
  }

  offTouchStart(callback) {
    this.touchStartCallbacks = this.touchStartCallbacks.filter(cb => cb !== callback)
  }

  lock() {
    this.isLocked = true
  }

  unlock() {
    this.isLocked = false
  }

  hitTest(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.width &&
           y >= rect.y && y <= rect.y + rect.height
  }

  destroy() {
    // 微信小游戏不支持 removeTouchStart 等，置空回调即可
    this.swipeCallbacks = []
    this.tapCallbacks = []
  }

  _onTouchStart(e) {
    if (this.isLocked) return
    if (e.touches.length > 0) {
      this.startPos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
      this._lastMoveY = e.touches[0].clientY
      this._lastMoveTime = Date.now()
      this._velocityBuffer = []
      this.touchStartCallbacks.forEach(cb => cb(this.startPos))
    }
  }

  _onTouchMove(e) {
    if (this.isLocked || !this.startPos) return
    if (e.touches.length === 0) return
    const pos = { x: e.touches[0].clientX, y: e.touches[0].clientY }
    const dy = this.startPos.y - pos.y

    // 记录速度
    const now = Date.now()
    const dt = (now - this._lastMoveTime) / 1000
    if (dt > 0) {
      const vy = (this._lastMoveY - pos.y) / dt // 向上为正
      this._velocityBuffer.push({ vy, t: now })
      if (this._velocityBuffer.length > SCROLL_PHYSICS.velocityBufferSize) {
        this._velocityBuffer.shift()
      }
    }
    this._lastMoveY = pos.y
    this._lastMoveTime = now

    this.scrollCallbacks.forEach(cb => cb(dy))
  }

  getVelocity() {
    const buf = this._velocityBuffer
    if (buf.length === 0) return 0
    // 取最近几帧的加权平均
    let sum = 0
    let weight = 0
    for (let i = 0; i < buf.length; i++) {
      const w = i + 1 // 越新的帧权重越大
      sum += buf[i].vy * w
      weight += w
    }
    return sum / weight
  }

  _onTouchEnd(e) {
    if (this.isLocked) return
    if (!this.startPos) return

    if (e.changedTouches.length === 0) return
    const endPos = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
    const dx = endPos.x - this.startPos.x
    const dy = endPos.y - this.startPos.y

    if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) {
      // 点击
      this.tapCallbacks.forEach(cb => cb({ x: endPos.x, y: endPos.y }))
    } else if (Math.abs(dx) > Math.abs(dy)) {
      // 水平滑动
      const direction = dx > 0 ? 'right' : 'left'
      this.swipeCallbacks.forEach(cb => cb(direction))
    } else {
      // 垂直滑动
      const direction = dy > 0 ? 'down' : 'up'
      this.swipeCallbacks.forEach(cb => cb(direction))
    }

    // 通知滚动结束（用于惯性启动）
    const velocity = this.getVelocity()
    this.scrollEndCallbacks.forEach(cb => cb(velocity))

    this.startPos = null
  }
}
