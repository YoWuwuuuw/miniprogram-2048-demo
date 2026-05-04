## Why

项目开发完成，需要进行收尾工作：建立版本管理、生成项目文档、清理敏感信息，为后续迭代和团队协作做准备。

## What Changes

- 创建 `README.md`，标注版本号 v1.0、项目简介、技术栈、运行方式等信息
- 初始化 Git 仓库，配置 `.gitignore`，推送到 GitHub（`YoWuwuuuw/miniprogram-2048`）
- 将敏感配置（appid、cloud env ID）提取到独立配置文件，源码中引用配置文件，并将配置文件加入 `.gitignore`

### 敏感信息清单

| 文件 | 字段 | 说明 |
|------|------|------|
| `project.config.json` | `appid` | 微信小程序 appid |
| `js/cloud.js` | `CLOUD_ENV` | 微信云开发环境 ID |

## Capabilities

### New Capabilities
- `project-docs`: 项目 README 文档，包含版本号、项目说明、技术栈、运行指引
- `sensitive-config`: 敏感配置提取与保护，将 appid 和云环境 ID 抽离到 gitignored 配置文件

### Modified Capabilities
（无）

## Impact

- 新增文件：`README.md`、`config.local.js`（或类似配置文件）、`.gitignore`
- 修改文件：`js/cloud.js`（引用配置文件替代硬编码）、`project.config.json`（appid 移出或保留为占位）
- 新增 Git 仓库，首次推送到 GitHub
