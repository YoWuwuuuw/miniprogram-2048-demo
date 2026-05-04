// ============================================
// button.js - Canvas 按钮组件
// ============================================

export class Button {
  constructor({ x, y, width, height, text, visible = true }) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.text = text
    this.visible = visible
    this.scale = 1.0
  }

  draw(renderer) {
    if (!this.visible) return
    renderer.drawButton(this.x, this.y, this.width, this.height, this.text, this.scale)
  }

  hitTest(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height
  }
}
