# 2048 微信小游戏

> 基于微信小游戏平台的 2048 数字益智游戏

**版本：** v1.0

## 简介

经典 2048 游戏的微信小游戏实现，支持滑动操控、方块合并动画、个人中心、排行榜等功能。采用 Canvas 2D 渲染，微信云开发存储排行榜数据。

## 技术栈

- 微信小游戏框架（Canvas 2D）
- 微信云开发（CloudBase）
- ES Modules

## 目录结构

```
├── game.js                  # 入口文件
├── game.json                # 小游戏配置
├── project.config.json      # 微信开发者工具项目配置
├── config.local.js          # 本地敏感配置（不提交，需自行创建）
├── js/
│   ├── main.js              # 主流程控制
│   ├── game-core.js         # 游戏核心逻辑（棋盘、移动、合并）
│   ├── renderer.js          # Canvas 渲染引擎
│   ├── animation.js         # 动画系统
│   ├── input.js             # 输入（滑动）处理
│   ├── storage.js           # 本地存档
│   ├── cloud.js             # 微信云开发封装（排行榜）
│   ├── constants.js         # 常量定义
│   ├── scenes/
│   │   ├── game-scene.js    # 游戏主场景
│   │   ├── overlay-scene.js # 覆盖层（开始、结束等）
│   │   ├── profile-scene.js # 个人中心
│   │   └── ranklist-scene.js# 排行榜
│   └── ui/
│       ├── button.js        # 按钮组件
│       └── dialog.js        # 对话框组件
└── project.config.local.json # 本地 appid 配置（不提交，需自行创建）
```

## 本地开发

### 环境准备

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 注册微信小游戏账号并获取 AppID

### 配置

项目使用本地配置文件存放敏感信息，这些文件不会被提交到仓库。首次克隆后需手动创建：

**1. 创建 `project.config.local.json`**

在项目根目录创建，填入你的 AppID：

```json
{
  "appid": "你的AppID"
}
```

**2. 创建 `config.local.js`**

在项目根目录创建，填入你的云开发环境 ID：

```js
export const CLOUD_ENV = '你的云开发环境ID'
```

### 敏感配置清单

| 文件 | 字段 | 说明 |
|------|------|------|
| `project.config.local.json` | `appid` | 微信小程序/小游戏 AppID |
| `config.local.js` | `CLOUD_ENV` | 微信云开发环境 ID |

### 运行

1. 打开微信开发者工具
2. 导入项目根目录
3. 在 `project.config.json` 中确认 `appid` 字段（或确保 `project.config.local.json` 已配置）
4. 编译运行

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-05-04 | 初始版本：核心 2048 玩法、动画系统、个人中心、排行榜、云开发集成 |
