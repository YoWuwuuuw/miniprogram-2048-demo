## 1. 敏感配置提取

- [x] 1.1 创建 `project.config.local.json`，包含真实 appid
- [x] 1.2 将 `project.config.json` 中的 appid 替换为空占位值
- [x] 1.3 创建 `config.local.js`，导出 `CLOUD_ENV` 常量
- [x] 1.4 修改 `js/cloud.js`，从 `config.local.js` 引入 `CLOUD_ENV` 替代硬编码

## 2. .gitignore 配置

- [x] 2.1 创建 `.gitignore`，排除 `*.local.*`、`config.local.js`、`node_modules/`、`.claude/`、`openspec/`、`*.log`

## 3. README.md 创建

- [x] 3.1 创建 `README.md`，包含项目名称、版本号 v1.0、简介、技术栈
- [x] 3.2 添加目录结构说明
- [x] 3.3 添加本地开发指引（环境准备、配置步骤、运行方式）
- [x] 3.4 添加敏感配置说明（需要配置的项及方式）
- [x] 3.5 添加版本历史记录区

## 4. Git 初始化与推送

- [x] 4.1 执行 `git init` 初始化仓库
- [x] 4.2 检查 `git status` 确认无敏感文件被追踪
- [x] 4.3 首次提交并推送到 GitHub（`YoWuwuuuw/miniprogram-2048`）
