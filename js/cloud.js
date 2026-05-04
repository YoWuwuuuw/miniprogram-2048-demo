// ============================================
// cloud.js - 微信云开发封装（排行榜）
// ============================================

import { CLOUD_ENV } from '../config.local.js'

let _db = null
let _scores = null
let _users = null

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

function getUsers() {
  if (!_users) _users = getDb().collection('users')
  return _users
}

// 初始化云开发
export function initCloud() {
  wx.cloud.init({
    env: CLOUD_ENV,
    traceUser: true
  })
}

// 保存用户信息（openid + nickname）到云端
export async function saveUserInfo(nickname) {
  try {
    const users = getUsers()
    const { data } = await users
      .where({ _openid: '{openid}' })
      .get()

    if (data.length > 0) {
      await users.doc(data[0]._id).update({
        data: { nickname }
      })
    } else {
      await users.add({
        data: {
          nickname,
          createdAt: getDb().serverDate()
        }
      })
    }
  } catch (e) {
    console.warn('saveUserInfo failed:', e)
  }
}

// 获取当前用户在云端的昵称
export async function getUserNickname() {
  try {
    const users = getUsers()
    const { data } = await users
      .where({ _openid: '{openid}' })
      .get()

    if (data.length > 0) {
      return data[0].nickname || ''
    }
    return ''
  } catch (e) {
    console.warn('getUserNickname failed:', e)
    return ''
  }
}

// 上传分数（始终上传，100 名限制，同一用户仅保留最高分记录）
export async function uploadScore(score, maxTile, moveCount) {
  try {
    // 未登录用户不上传分数
    const { getNickname } = await import('./storage.js')
    const nickname = getNickname()
    if (!nickname || nickname === '匿名用户') return

    const scores = getScores()
    const db = getDb()

    // 查询当前用户已有记录
    const { data: existingRecords } = await scores
      .where({ _openid: '{openid}' })
      .get()

    // 如果用户已有记录且新分数不更高，跳过
    if (existingRecords.length > 0 && score <= existingRecords[0].score) {
      return
    }

    // 查询第 100 名的分数，判断是否可入榜
    const { data: top100 } = await scores
      .orderBy('score', 'desc')
      .limit(100)
      .get()

    // 排行榜已满且新分数不够入榜
    if (top100.length >= 100 && score <= top100[top100.length - 1].score) {
      return
    }

    // nickname already retrieved above

    // 删除用户旧记录
    for (const record of existingRecords) {
      await scores.doc(record._id).remove()
    }

    // 添加新记录
    await scores.add({
      data: {
        score,
        maxTile,
        moveCount,
        nickname,
        createdAt: db.serverDate()
      }
    })

    // 清理排名 > 100 的记录
    const { data: allRecords } = await scores
      .orderBy('score', 'desc')
      .get()

    if (allRecords.length > 100) {
      const toDelete = allRecords.slice(100)
      for (const record of toDelete) {
        await scores.doc(record._id).remove()
      }
    }

    // 清除排行榜缓存
    clearRankListCache()
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
