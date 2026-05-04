// ============================================
// game-core.js - 纯逻辑层，棋盘操作、移动合并、状态检测
// ============================================

// 创建 4x4 空棋盘
export function createEmptyBoard() {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0]
  ]
}

// 在随机空位放置新方块
export function addRandomTile(board) {
  const newBoard = cloneBoard(board)
  const emptyPositions = []
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (newBoard[r][c] === 0) {
        emptyPositions.push({ row: r, col: c })
      }
    }
  }
  if (emptyPositions.length === 0) return { board: newBoard, tile: null }

  const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)]
  const value = Math.random() < 0.7 ? 2 : 4
  newBoard[pos.row][pos.col] = value

  return { board: newBoard, tile: { row: pos.row, col: pos.col, value } }
}

// 单行向左合并（优化版，减少数组操作）
function mergeRow(row) {
  // 使用固定大小数组，避免动态扩容
  const result = [0, 0, 0, 0]
  let score = 0
  const merges = []
  let writeIndex = 0
  let lastValue = 0

  // 第一步：压缩非零元素
  for (let i = 0; i < 4; i++) {
    const val = row[i]
    if (val === 0) continue

    if (lastValue === val) {
      // 合并
      const mergedValue = val * 2
      result[writeIndex - 1] = mergedValue
      score += mergedValue
      merges.push(writeIndex - 1)
      lastValue = 0
    } else {
      result[writeIndex] = val
      lastValue = val
      writeIndex++
    }
  }

  return { newRow: result, score, merges }
}

// 棋盘转置（行变列，列变行）
function transpose(board) {
  const result = createEmptyBoard()
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      result[c][r] = board[r][c]
    }
  }
  return result
}

// 核心移动逻辑（四个方向独立处理，无旋转）
export function move(board, direction) {
  if (!Array.isArray(board) || board.length !== 4 || !board.every(r => Array.isArray(r) && r.length === 4)) {
    return { newBoard: board, scoreGained: 0, moved: false, merges: [] }
  }
  const newBoard = cloneBoard(board)
  let scoreGained = 0
  const merges = []

  switch (direction) {
    case 'left': {
      for (let r = 0; r < 4; r++) {
        const { newRow, score, merges: m } = mergeRow(newBoard[r])
        newBoard[r] = newRow
        scoreGained += score
        m.forEach(col => merges.push({ row: r, col, value: newRow[col] }))
      }
      break
    }
    case 'right': {
      for (let r = 0; r < 4; r++) {
        const reversed = [...newBoard[r]].reverse()
        const { newRow, score, merges: m } = mergeRow(reversed)
        newBoard[r] = newRow.reverse()
        scoreGained += score
        // 合并位置映射回原始列号
        m.forEach(col => merges.push({ row: r, col: 3 - col, value: newRow[3 - col] }))
      }
      break
    }
    case 'up': {
      const t = transpose(newBoard)
      for (let c = 0; c < 4; c++) {
        const { newRow, score, merges: m } = mergeRow(t[c])
        t[c] = newRow
        scoreGained += score
        // 转置后 [c][r] → 原始 [r][c]
        m.forEach(r => merges.push({ row: r, col: c, value: newRow[r] }))
      }
      // 转置回来
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          newBoard[r][c] = t[c][r]
        }
      }
      break
    }
    case 'down': {
      const t = transpose(newBoard)
      for (let c = 0; c < 4; c++) {
        const reversed = [...t[c]].reverse()
        const { newRow, score, merges: m } = mergeRow(reversed)
        t[c] = newRow.reverse()
        scoreGained += score
        // 反转后的合并位置映射回原始行号
        m.forEach(r => merges.push({ row: 3 - r, col: c, value: newRow[3 - r] }))
      }
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          newBoard[r][c] = t[c][r]
        }
      }
      break
    }
    default:
      return { newBoard: board, scoreGained: 0, moved: false, merges: [] }
  }

  // 检测是否有移动
  let moved = false
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] !== newBoard[r][c]) {
        moved = true
        break
      }
    }
    if (moved) break
  }

  return { newBoard, scoreGained, moved, merges }
}

// 判断是否还能移动（优化版）
export function canMove(board) {
  // 检查是否存在空格子
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] === 0) return true
    }
  }
  // 检查是否存在相邻相同数字（优化：减少边界检查）
  for (let r = 0; r < 4; r++) {
    const row = board[r]
    for (let c = 0; c < 3; c++) {
      if (row[c] === row[c + 1]) return true
    }
  }
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 3; r++) {
      if (board[r][c] === board[r + 1][c]) return true
    }
  }
  return false
}

// 判断是否达到 2048（优化版）
export function hasWon(board) {
  for (let r = 0; r < 4; r++) {
    const row = board[r]
    for (let c = 0; c < 4; c++) {
      if (row[c] >= 2048) return true
    }
  }
  return false
}

// 获取棋盘最大数字
export function getMaxTile(board) {
  let max = 0
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 4; c++) {
      if (board[r][c] > max) max = board[r][c]
    }
  }
  return max
}

// 深拷贝棋盘
export function cloneBoard(board) {
  return board.map(row => [...row])
}
