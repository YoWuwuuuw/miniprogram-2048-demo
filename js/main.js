// ============================================
// main.js - 场景管理器 + 游戏循环 + Canvas 初始化
// ============================================

import { createLayout } from './constants.js'
import { Renderer } from './renderer.js'
import { InputManager } from './input.js'
import { AnimationManager } from './animation.js'
import { GameScene } from './scenes/game-scene.js'
import { OverlayScene } from './scenes/overlay-scene.js'
import { RanklistScene } from './scenes/ranklist-scene.js'
import { ProfileScene } from './scenes/profile-scene.js'
import { initCloud } from './cloud.js'

// ============================================
// SceneManager - 场景栈管理
// ============================================
class SceneManager {
  constructor() {
    this.scenes = {}
    this.sceneStack = []
  }

  registerScene(name, scene) {
    this.scenes[name] = scene
  }

  pushScene(name, ...args) {
    const scene = this.scenes[name]
    if (scene) {
      this.sceneStack.push({ name, scene })
      scene.enter(...args)
    }
  }

  popScene() {
    if (this.sceneStack.length <= 1) return
    const top = this.sceneStack.pop()
    top.scene.exit()
    // 不需要再 enter 底层场景，因为底层场景一直在运行
  }

  switchScene(name, ...args) {
    if (this.sceneStack.length > 0) {
      const top = this.sceneStack.pop()
      top.scene.exit()
    }
    const scene = this.scenes[name]
    if (scene) {
      this.sceneStack.push({ name, scene })
      scene.enter(...args)
    }
  }

  update(dt) {
    if (this.sceneStack.length > 0) {
      this.sceneStack[this.sceneStack.length - 1].scene.update(dt)
    }
  }

  render(ctx) {
    // 从底到顶渲染所有场景
    for (let i = 0; i < this.sceneStack.length; i++) {
      this.sceneStack[i].scene.render(ctx)
    }
  }

  getTopScene() {
    if (this.sceneStack.length > 0) {
      return this.sceneStack[this.sceneStack.length - 1].scene
    }
    return null
  }
}

// ============================================
// 初始化
// ============================================

// 初始化云开发
initCloud()

// 获取 Canvas（小游戏自动创建）
const canvas = wx.createCanvas()
const ctx = canvas.getContext('2d')

// 获取屏幕尺寸
const { windowWidth, windowHeight } = wx.getSystemInfoSync()
const layout = createLayout(windowWidth, windowHeight)

// 创建管理器
const renderer = new Renderer(ctx, layout)
const inputManager = new InputManager()
const animationManager = new AnimationManager()
const sceneManager = new SceneManager()

// 创建场景
const gameScene = new GameScene(renderer, inputManager, animationManager, sceneManager)
const overlayScene = new OverlayScene(renderer, inputManager, animationManager, sceneManager, gameScene)
const ranklistScene = new RanklistScene(renderer, inputManager, animationManager, sceneManager)
const profileScene = new ProfileScene(renderer, inputManager, animationManager, sceneManager)

// 注册场景
sceneManager.registerScene('game', gameScene)
sceneManager.registerScene('overlay', overlayScene)
sceneManager.registerScene('ranklist', ranklistScene)
sceneManager.registerScene('profile', profileScene)

// 初始场景：推入游戏场景
sceneManager.pushScene('game')

// ============================================
// 输入事件绑定
// ============================================

inputManager.onSwipe((direction) => {
  const topScene = sceneManager.getTopScene()
  if (topScene && topScene.handleSwipe) {
    topScene.handleSwipe(direction)
  }
})

inputManager.onTap(({ x, y }) => {
  const topScene = sceneManager.getTopScene()
  if (topScene && topScene.handleTap) {
    topScene.handleTap(x, y)
  }
})

// ============================================
// 游戏循环
// ============================================

let lastTime = 0
let running = true
let frameCount = 0
let fps = 0
let fpsUpdateTime = 0

// 性能监控对象
const performanceStats = {
  fps: 0,
  frameTime: 0,
  animationCount: 0,
  // 可以添加更多统计信息
}

function gameLoop(timestamp) {
  if (!running) return

  const dt = timestamp - lastTime
  lastTime = timestamp

  // 更新FPS计算
  frameCount++
  if (timestamp - fpsUpdateTime >= 1000) {
    fps = frameCount
    frameCount = 0
    fpsUpdateTime = timestamp
    performanceStats.fps = fps
  }
  performanceStats.frameTime = dt

  // 1. 更新动画管理器
  animationManager.update(dt)
  performanceStats.animationCount = animationManager.getStats ? animationManager.getStats().active : 0

  // 2. 更新当前场景逻辑
  sceneManager.update(dt)

  // 3. 清空 Canvas
  renderer.clear()

  // 4. 从底到顶渲染场景栈
  sceneManager.render(ctx)

  // 5. 继续循环
  requestAnimationFrame(gameLoop)
}

requestAnimationFrame(gameLoop)

// ============================================
// 小游戏生命周期
// ============================================

wx.onShow(() => {
  running = true
  lastTime = Date.now()
  requestAnimationFrame(gameLoop)
})

wx.onHide(() => {
  running = false
})
