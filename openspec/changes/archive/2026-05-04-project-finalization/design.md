## Context

2048 微信小游戏项目开发完成，代码位于 `C:\Users\wgl\Desktop\2048`，当前无版本管理。项目使用微信小游戏框架 + 云开发，存在硬编码的敏感配置（appid、cloud env ID）。需要建立 Git 管理、项目文档和敏感信息保护机制。

## Goals / Non-Goals

**Goals:**
- 创建 README.md 记录项目基本信息和版本（v1.0）
- 初始化 Git 仓库并推送到 GitHub
- 将敏感配置抽离到 .gitignore 保护的文件中

**Non-Goals:**
- 不重构项目架构
- 不添加 CI/CD 配置
- 不修改业务逻辑

## Decisions

### 1. 敏感配置提取方案

**选择：创建 `config.local.js` 导出配置常量，`cloud.js` 引用之**

- `project.config.json` 中的 appid：创建 `project.config.local.json` 包含真实 appid，`project.config.json` 中保留为空占位
- `cloud.js` 中的 `CLOUD_ENV`：提取到 `config.local.js`，`cloud.js` 通过 import 引入
- `.gitignore` 排除 `*.local.*` 和 `config.local.js`

替代方案：使用环境变量 → 微信小游戏不支持 process.env，不可行。

### 2. .gitignore 策略

排除：
- `node_modules/`
- `*.local.*`（本地配置文件）
- `.claude/`（Claude Code 工作目录）
- `openspec/`（开发过程文档，不需要上线）
- `*.log`

### 3. README 结构

包含：项目名称、版本号、简介、技术栈、目录结构、本地开发指引、版本历史。

## Risks / Trade-offs

- [appid 占位] `project.config.json` 中 appid 为空可能导致微信开发者工具报错 → 在 README 中说明需复制 `project.config.local.json` 配置
- [首次推送] 大文件或遗漏文件风险 → 推送前检查 git status 确认文件列表
