## ADDED Requirements

### Requirement: 敏感配置隔离
项目 SHALL 将敏感配置信息从源码中提取到独立的配置文件，且配置文件不纳入版本管理。

#### Scenario: appid 配置隔离
- **WHEN** 开发者查看 `project.config.json`
- **THEN** `appid` 字段 SHALL 为空占位值，真实 appid 仅存在于 `.gitignore` 保护的 `project.config.local.json` 中

#### Scenario: 云环境 ID 配置隔离
- **WHEN** 开发者查看 `js/cloud.js`
- **THEN** `CLOUD_ENV` SHALL 从外部配置文件引入，不包含硬编码的环境 ID

#### Scenario: 配置文件不被提交
- **WHEN** 执行 `git add` 或 `git commit`
- **THEN** `*.local.*` 和 `config.local.js` 等本地配置文件 SHALL 被 `.gitignore` 排除

### Requirement: 配置使用指引
项目 SHALL 提供清晰的配置指引，帮助新开发者正确设置本地环境。

#### Scenario: README 包含配置说明
- **WHEN** 新开发者阅读 README
- **THEN** SHALL 包含需要配置的敏感项列表及配置方式说明
