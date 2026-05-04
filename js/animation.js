// ============================================
// animation.js - 补间动画系统（Tween + AnimationManager）
// ============================================

// 内置缓动函数
function easeOut(t) {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
}

function easeOutBack(t) {
  return 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)
}

// 更平滑的弹性缓动函数（用于合并动画）
function easeOutSmooth(t) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function linear(t) {
  return t
}

// Tween 类
class Tween {
  constructor({ startValue, endValue, duration, easing, onUpdate, onComplete }) {
    this.startValue = startValue
    this.endValue = endValue
    this.duration = duration
    this.elapsed = 0
    this.easing = easing || easeOut
    this.onUpdate = onUpdate || null
    this.onComplete = onComplete || null
    this._completed = false
  }

  update(dt) {
    if (this._completed) return
    this.elapsed += dt
    if (this.elapsed >= this.duration) {
      this.elapsed = this.duration
      this._completed = true
    }
    const t = this.easing(this.elapsed / this.duration)
    const value = this.startValue + (this.endValue - this.startValue) * t
    if (this.onUpdate) this.onUpdate(value)
    if (this._completed && this.onComplete) this.onComplete()
  }

  getValue() {
    const t = this.easing(Math.min(this.elapsed / this.duration, 1))
    return this.startValue + (this.endValue - this.startValue) * t
  }

  isComplete() {
    return this._completed
  }
}

// Tween 对象池
class TweenPool {
  constructor(initialSize = 20) {
    this.pool = []
    this.active = []
    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(new Tween({ startValue: 0, endValue: 0, duration: 0 }))
    }
  }

  acquire(config) {
    let tween
    if (this.pool.length > 0) {
      tween = this.pool.pop()
      // 重置对象状态
      tween.startValue = config.startValue
      tween.endValue = config.endValue
      tween.duration = config.duration
      tween.elapsed = 0
      tween.easing = config.easing || easeOut
      tween.onUpdate = config.onUpdate || null
      tween.onComplete = config.onComplete || null
      tween._completed = false
    } else {
      tween = new Tween(config)
    }
    this.active.push(tween)
    return tween
  }

  release(tween) {
    const index = this.active.indexOf(tween)
    if (index !== -1) {
      this.active.splice(index, 1)
      // 清理引用，帮助GC
      tween.onUpdate = null
      tween.onComplete = null
      this.pool.push(tween)
    }
  }

  clear() {
    // 将所有活跃对象返回池中
    this.active.forEach(tween => {
      tween.onUpdate = null
      tween.onComplete = null
      this.pool.push(tween)
    })
    this.active = []
  }

  getActiveCount() {
    return this.active.length
  }

  getPoolSize() {
    return this.pool.length
  }
}

// AnimationManager 类
export class AnimationManager {
  constructor() {
    this.tweenPool = new TweenPool(30)
  }

  add(config) {
    return this.tweenPool.acquire(config)
  }

  update(dt) {
    const activeTweens = this.tweenPool.active
    for (let i = activeTweens.length - 1; i >= 0; i--) {
      const tween = activeTweens[i]
      tween.update(dt)
      if (tween.isComplete()) {
        this.tweenPool.release(tween)
      }
    }
  }

  clear() {
    this.tweenPool.clear()
  }

  isActive() {
    return this.tweenPool.getActiveCount() > 0
  }

  // 获取性能统计信息
  getStats() {
    return {
      active: this.tweenPool.getActiveCount(),
      pool: this.tweenPool.getPoolSize()
    }
  }
}

// 预设动画工厂方法（优化版，使用对象池）

// 新方块出现动画：scale 从 0.5 到 1.0
export function createAppearAnimation(x, y, onComplete, onProgress) {
  let scale = 0.5
  const tween = new Tween({
    startValue: 0.5,
    endValue: 1.0,
    duration: 150,
    easing: easeOut,
    onUpdate: (val) => {
      scale = val
      if (onProgress) onProgress({ scale })
    },
    onComplete: onComplete
  })
  return { tween, getScale: () => scale }
}

// 方块移动动画（统一时长150ms，使用easeOut缓动）
export function createMoveAnimation(fromX, fromY, toX, toY, onComplete, onProgress) {
  let currentX = fromX
  let currentY = fromY
  const tween = new Tween({
    startValue: 0,
    endValue: 1,
    duration: 150, // 统一动画时长
    easing: easeOut, // 统一缓动函数
    onUpdate: (t) => {
      currentX = fromX + (toX - fromX) * t
      currentY = fromY + (toY - fromY) * t
      if (onProgress) onProgress({ x: currentX, y: currentY })
    },
    onComplete: onComplete
  })
  return { tween, getPosition: () => ({ x: currentX, y: currentY }) }
}

// 方块合并脉冲动画（统一时长200ms，使用easeOutSmooth缓动）
export function createMergeAnimation(x, y, onComplete, onProgress) {
  let scale = 1.0
  const tween = new Tween({
    startValue: 0,
    endValue: 1,
    duration: 200, // 统一动画时长
    easing: easeOutSmooth, // 统一缓动函数
    onUpdate: (t) => {
      // 从 1.0 到 1.15 再回到 1.0
      if (t < 0.5) {
        scale = 1.0 + 0.15 * (t / 0.5)
      } else {
        scale = 1.15 - 0.15 * ((t - 0.5) / 0.5)
      }
      if (onProgress) onProgress({ scale })
    },
    onComplete: onComplete
  })
  return { tween, getScale: () => scale }
}

// 合并闪光效果动画
export function createFlashAnimation(x, y, onComplete, onProgress) {
  let opacity = 1.0
  let scale = 1.0
  const tween = new Tween({
    startValue: 0,
    endValue: 1,
    duration: 150, // 短暂闪光
    easing: easeOut,
    onUpdate: (t) => {
      // 闪光效果：快速出现然后消失
      if (t < 0.3) {
        opacity = t / 0.3
        scale = 1.0 + 0.2 * (t / 0.3)
      } else {
        opacity = 1.0 - ((t - 0.3) / 0.7)
        scale = 1.2 - 0.2 * ((t - 0.3) / 0.7)
      }
      if (onProgress) onProgress({ opacity, scale })
    },
    onComplete: onComplete
  })
  return { tween, getState: () => ({ opacity, scale }) }
}

// 弹窗淡入动画（opacity 0→1，scale 0.9→1.0）
export function createFadeInAnimation(onComplete, onProgress) {
  let opacity = 0
  let scale = 0.9
  const tween = new Tween({
    startValue: 0,
    endValue: 1,
    duration: 250,
    easing: easeOut,
    onUpdate: (t) => {
      opacity = t
      scale = 0.9 + 0.1 * t
      if (onProgress) onProgress({ opacity, scale })
    },
    onComplete: onComplete
  })
  return { tween, getState: () => ({ opacity, scale }) }
}

// 按钮点击反馈动画
export function createButtonPressAnimation(onComplete, onProgress) {
  let scale = 1.0
  const tween = new Tween({
    startValue: 0,
    endValue: 1,
    duration: 80,
    easing: easeInOut,
    onUpdate: (t) => {
      if (t < 0.5) {
        scale = 1.0 - 0.05 * (t / 0.5)
      } else {
        scale = 0.95 + 0.05 * ((t - 0.5) / 0.5)
      }
      if (onProgress) onProgress({ scale })
    },
    onComplete: onComplete
  })
  return { tween, getScale: () => scale }
}
