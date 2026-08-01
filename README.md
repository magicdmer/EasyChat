# EasyChat（简聊）

[中文](./README.md) | [English](./README.en.md)

EasyChat 是一个简单的、面向自托管场景的多用户 AI 聊天应用。项目通过 OpenAI + NewAPI的方式兼容不同模型服务，并提供会话管理、用户与密钥管理、图文对话、图片生成、插件工具和使用量统计等能力。主要是用作个人使用，并分享给朋友或者亲戚。不适合商用。

当前版本：`1.0.2`

> EasyChat 基于 [Chanzhaoyu/chatgpt-web](https://github.com/Chanzhaoyu/chatgpt-web) 开发，做了大量修改。原项目的版权与许可声明见 [LICENSE](./LICENSE)。

## 主要功能

- OpenAI 兼容接口，支持自定义 API Base URL 和多个模型供应商
- 多会话聊天、流式响应、上下文续聊和自动会话标题
- 推理内容展示、图片上传、图文对话与历史图片回填
- 多 Key、模型能力刷新、角色权限和随机 Key 选择
- 登录注册、邮件验证、用户管理和管理员配置
- Token 用量统计、请求统计和模型分布统计
- 插件运行时、Function Call 工具和用户级插件启用状态
- 内置图片生成插件，模型由管理员统一配置
- 简体中文、繁体中文和英文界面，默认使用简体中文
- Docker、Docker Compose 和 PWA 支持
- 支持高级模式切换，默认关闭适合小白用户

详细实现说明见 [工程架构文档](./docs/ARCHITECTURE.md)。

## 界面预览

以下截图暂时保留用于展示主要功能，后续将更新为 EasyChat 最新界面。

### 登录与聊天

![登录界面](./docs/login.png)

![聊天界面](./docs/chat.png)

### 设置与管理

![基础设置](./docs/basesettings.png)


## 技术栈

- 前端：Vue 3、Vite、TypeScript、Naive UI、Pinia
- 后端：Node.js、Express、TypeScript
- 存储：SQLite、IndexedDB
- 包管理：pnpm 9.15.9
- 运行环境：Node.js 24.18.0

## 本地开发

### 环境准备

Linux 推荐使用 [mise](https://mise.jdx.dev/)：

```bash
mise install
```

Windows 推荐使用 [fnm](https://github.com/Schniz/fnm) 和 Corepack：

```powershell
fnm use
corepack enable
corepack prepare pnpm@9.15.9 --activate
```

### 安装依赖

前端和后端使用独立的依赖目录：

```bash
pnpm install --frozen-lockfile
cd service
pnpm install --frozen-lockfile
```

### 配置后端

复制后端环境变量示例：

```bash
cd service
cp .env.example .env
```

Windows PowerShell：

```powershell
Copy-Item .env.example .env
```

常用环境变量：

| 变量 | 用途 |
| --- | --- |
| `AUTH_SECRET_KEY` | 非空时启用登录和 JWT 鉴权 |
| `ROOT_USER` | 初始管理员邮箱 |
| `REGISTER_ENABLED` | 是否开放注册 |
| `OPENAI_API_KEY` | 可选的初始 OpenAI 兼容密钥 |
| `OPENAI_API_BASE_URL` | 可选的默认 OpenAI 兼容接口地址 |
| `TITLE_MODEL` | 首轮对话后生成会话标题的模型 |
| `MAX_REQUEST_PER_HOUR` | 每小时请求限制 |
| `SMTP_*` | 邮件验证和通知配置 |
| `UPLOAD_*` | 上传大小、清理间隔和保留时间 |
| `PLUGIN_DIR` | 外置插件目录 |

完整配置见 [service/.env.example](./service/.env.example)。API Key、允许使用的模型和大部分站点配置也可以在管理员界面维护。

### 启动开发环境

终端一，启动后端（默认 `http://127.0.0.1:3002`）：

```bash
cd service
pnpm start
```

终端二，启动前端（默认 `http://127.0.0.1:10002`）：

```bash
pnpm dev
```

## 构建验证

前端完整检查和生产构建：

```bash
pnpm build
```

后端生产构建：

```bash
cd service
pnpm build
```

## Docker 部署

### 本地构建

```bash
docker build -t easychat:1.0.2 .
docker run -d \
  --name easychat \
  -p 3002:3002 \
  -v easychat-data:/app/data \
  -v easychat-uploads:/app/uploads \
  -e AUTH_SECRET_KEY=replace-with-a-random-secret \
  easychat:1.0.2
```

访问 `http://localhost:3002`。

### Docker Compose

将 [docker-compose/docker-compose.yml](./docker-compose/docker-compose.yml) 复制到独立部署目录，编辑管理员邮箱和密钥，并在同级创建 `plugins/` 目录。镜像自带绘图插件，Compose 会将该目录作为互不遮盖的外挂插件目录只读挂载到容器：

```bash
docker-compose up -d
```

发布 GitHub Release 后，正式 workflow 会将版本标签推送到 `magicdmer/easychat`；非预发布版本同时更新 `latest`。手动测试 workflow 只在 Runner 本地构建并执行冒烟测试，不推送镜像。

## 目录结构

```text
EasyChat/
├─ src/                 # Vue 前端
├─ service/             # Express 后端、SQLite 和插件宿主
├─ service/plugin-sdk/  # @easychat/plugin-sdk
├─ plugins/             # 外置插件
├─ docker-compose/      # Compose 与 Nginx 示例
└─ docs/                # 架构文档与界面截图
```

## 贡献

提交改动前请阅读 [贡献指南](./CONTRIBUTING.md)。建议至少执行前端 `pnpm build` 和后端 `service/pnpm build`。

## 赞助

| 支付宝                   | 微信                   |
| ------------------------ | ---------------------- |
| ![](./docs/zhifubao.jpg) | ![](./docs/weixin.png) |

## 许可证

本项目采用 [MIT License](./LICENSE)。EasyChat 包含从上游项目继承的代码，因此许可证文件中保留了相应版权声明。
