// ============================================
// dialog.js - Canvas 对话框组件
// ============================================

export class Dialog {
  constructor({ title, message, buttons, visible = false }) {
    this.title = title
    this.message = message
    this.buttons = buttons.map(btn => ({ ...btn, rect: null }))
    this.visible = visible
  }

  draw(renderer) {
    if (!this.visible) return
    renderer.drawDialog(this.title, this.message, this.buttons)
  }

  hitTest(x, y) {
    if (!this.visible) return null
    for (const btn of this.buttons) {
      if (btn.rect) {
        if (x >= btn.rect.x && x <= btn.rect.x + btn.rect.width &&
            y >= btn.rect.y && y <= btn.rect.y + btn.rect.height) {
          return btn.id
        }
      }
    }
    return null
  }

  show() {
    this.visible = true
  }

  hide() {
    this.visible = false
  }
}
