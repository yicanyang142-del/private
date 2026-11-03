# Render 部署参数

本文件是部署准备说明，不表示当前单人本地版已经适合公开服务。

项目根目录必须同时包含 requirements.txt、config.toml、app/、wenlun-web/、convert_book.py 和思想实验室-System-Prompt.md。
如果 GitHub 仓库包含整个 work 目录，Render Root Directory 填 wenlun-local；若仓库根目录直接是本项目内容，留空。

Build Command:
```
python -m pip install -r requirements.txt
```

Start Command:
```
python -m uvicorn main:app --app-dir app --host 0.0.0.0 --port $PORT --workers 1
```

使用 Python 3.12 系列；配置读取使用 Python 3.11+ 内置 tomllib，建议保持与本机 3.12 一致。不要使用 Windows start.ps1 作为云端启动命令。前端是本地静态资源，由 FastAPI 提供，无需 npm 构建。

Environment 添加 SUPER_MIND_API_KEY、OPENAI_BASE_URL、OPENAI_MODEL，值分别为真实密钥、https://space.ai-builders.com/backend/v1、gpt-5。密钥不要写入此文件或提交 .env。可选检索密钥按 .env.example 设置。

当前尚需解决：
1. main.py 的本机 Host 白名单会拒绝公网域名，必须按明确的部署域名调整；不能仅靠启动参数解决。
2. SQLite、原著与封面当前都写 data/。Render 免费实例磁盘不持久，不能当作正式存储；需迁移外部数据库/对象存储或付费持久盘及对应路径配置。
3. 当前没有用户登录、数据隔离及 AI 配额控制，不能直接作为多人私人书架开放。
4. OCR 较消耗 CPU/内存，需要单独验收云端资源和转换耗时。

上传前检查 .env、data/、backups/ 没有被 Git 跟踪；.gitignore 不会自动移除历史已提交文件。仅上传本项目，避免上传 work 中其他项目和私人文件。

官方说明：https://render.com/docs/deploy-fastapi
