// ============================================
// cloud.js - 微信云开发封装（排行榜）
// ============================================

import { CLOUD_ENV } from '../config.local.js'

let _db = null
let _scores = null

// 排行榜缓存
const RANK_CACHE_TTL = 60000 // 60 秒
let _rankCache = null // { data, timestamp }

function getDb() {
  if (!_db) _db = wx.cloud.database()
  return _db
}

function getScores() {
  if (!_scores) _scores = getDb().collection('scores')
  return _scores
}

// 初始化云开发
export function initCloud() {
  wx.cloud.init({
    env: CLOUD_ENV,
    traceUser: true
  })
}

// 上传分数（只在更高分时更新）
export async function uploadScore(score, maxTile, moveCount) {
  try {
    const scores = getScores()
    const db = getDb()
    const { data } = await scores
      .where({ _openid: '{openid}' })
      .get()

    if (data.length > 0) {
      const existing = data[0]
      if (score > existing.score) {
        await scores.doc(existing._id).update({
          data: {
            score,
            maxTile,
            moveCount,
            createdAt: db.serverDate()
          }
        })
      }
    } else {
      await scores.add({
        data: {
          score,
          maxTile,
          moveCount,
          nickname: '匿名玩家',
          createdAt: db.serverDate()
        }
      })
    }
  } catch (e) {
    console.warn('uploadScore failed:', e)
  }
}

// 获取排行榜（Top N，带缓存）
export async function fetchRankList(limit = 50, forceRefresh = false) {
  if (!forceRefresh && _rankCache && (Date.now() - _rankCache.timestamp) < RANK_CACHE_TTL) {
    return _rankCache.data
  }
  try {
    const { data } = await getScores()
      .orderBy('score', 'desc')
      .limit(limit)
      .get()
    _rankCache = { data, timestamp: Date.now() }
    return data
  } catch (e) {
    console.warn('fetchRankList failed:', e)
    return []
  }
}

// 清除排行榜缓存
export function clearRankListCache() {
  _rankCache = null
}

// 生成模拟测试数据（开发用，数据不足时补充）
export function seedTestData(count = 20) {
  const nicknames = [
    '游戏高手', '方块大师', '2048达人', '数字玩家', '棋盘征服者',
    '滑动王者', '合并专家', '积分猎手', '挑战者', '策略家',
    '速通达人', '数字天才', '方块猎人', '排名争夺者', '休闲玩家',
    '高分选手', '连击王', '数字控', '拼图达人', '极限挑战'
  ]
  const data = []
  for (let i = 0; i < count; i++) {
    const maxTile = Math.pow(2, Math.floor(Math.random() * 8) + 2) // 4~512
    data.push({
      _id: 'test_' + i,
      nickname: nicknames[i % nicknames.length],
      score: Math.floor(Math.random() * 50000) + 1000,
      maxTile,
      moveCount: Math.floor(Math.random() * 500) + 50,
      createdAt: new Date(Date.now() - Math.random() * 7 * 86400000)
    })
  }
  data.sort((a, b) => b.score - a.score)
  return data
}

// 获取当前用户排名
export async function fetchMyRank() {
  try {
    const scores = getScores()
    const db = getDb()
    const { data: myData } = await scores
      .where({ _openid: '{openid}' })
      .get()

    if (myData.length === 0) return null

    const myScore = myData[0].score
    const { total } = await scores
      .where({ score: db.command.gt(myScore) })
      .count()

    return { rank: total + 1, ...myData[0] }
  } catch (e) {
    console.warn('fetchMyRank failed:', e)
    return null
  }
}
