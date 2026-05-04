// ============================================
// storage.js - wx.storage 数据持久化封装
// ============================================

import { STORAGE_KEYS } from './constants.js'

// 保存当前游戏状态
export function saveGameState(state) {
  try {
    wx.setStorageSync(STORAGE_KEYS.CURRENT_GAME, state)
  } catch (e) {
    console.warn('saveGameState failed:', e)
  }
}

// 加载上次保存的游戏状态
export function loadGameState() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.CURRENT_GAME) || null
  } catch (e) {
    console.warn('loadGameState failed:', e)
    return null
  }
}

// 清除当前游戏状态
export function clearGameState() {
  try {
    wx.removeStorageSync(STORAGE_KEYS.CURRENT_GAME)
  } catch (e) {
    console.warn('clearGameState failed:', e)
  }
}

// 保存最高分（仅当大于已保存值）
export function saveBestScore(score) {
  try {
    const current = wx.getStorageSync(STORAGE_KEYS.BEST_SCORE) || 0
    if (score > current) {
      wx.setStorageSync(STORAGE_KEYS.BEST_SCORE, score)
    }
  } catch (e) {
    console.warn('saveBestScore failed:', e)
  }
}

// 获取历史最高分
export function getBestScore() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.BEST_SCORE) || 0
  } catch (e) {
    console.warn('getBestScore failed:', e)
    return 0
  }
}

// 添加排行榜记录
export function addRankRecord(record) {
  try {
    const list = wx.getStorageSync(STORAGE_KEYS.RANK_HISTORY) || []
    list.push(record)
    // 按分数降序排列，保留最多 10 条
    list.sort((a, b) => b.score - a.score)
    if (list.length > 10) list.length = 10
    wx.setStorageSync(STORAGE_KEYS.RANK_HISTORY, list)
  } catch (e) {
    console.warn('addRankRecord failed:', e)
  }
}

// 获取排行榜列表
export function getRankHistory() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.RANK_HISTORY) || []
  } catch (e) {
    console.warn('getRankHistory failed:', e)
    return []
  }
}

// 更新统计数据
export function updateStatistics(score, moves) {
  try {
    const stats = wx.getStorageSync(STORAGE_KEYS.STATISTICS) || {
      totalGames: 0,
      totalScore: 0,
      avgScore: 0,
      bestScore: 0,
      totalMoves: 0
    }
    stats.totalGames += 1
    stats.totalScore += score
    stats.avgScore = Math.round(stats.totalScore / stats.totalGames)
    stats.totalMoves += moves
    if (score > stats.bestScore) {
      stats.bestScore = score
    }
    wx.setStorageSync(STORAGE_KEYS.STATISTICS, stats)
  } catch (e) {
    console.warn('updateStatistics failed:', e)
  }
}

// 获取统计数据
export function getStatistics() {
  try {
    return wx.getStorageSync(STORAGE_KEYS.STATISTICS) || {
      totalGames: 0,
      totalScore: 0,
      avgScore: 0,
      bestScore: 0,
      totalMoves: 0
    }
  } catch (e) {
    console.warn('getStatistics failed:', e)
    return { totalGames: 0, totalScore: 0, avgScore: 0, bestScore: 0, totalMoves: 0 }
  }
}
