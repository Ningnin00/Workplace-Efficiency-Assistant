# 🚀 Render 部署图文指南

> 目标：把「职场效率助手」部署到公网，得到一个**复制就能用**的网址。

---

## 📋 部署前准备

| 需要 | 说明 | 状态 |
|------|------|------|
| GitHub 账号 | 代码已上传到 `Ningnin00/Workplace-Efficiency-Assistant` | ✅ 已完成 |
| Render 账号 | 去 render.com 免费注册，可用 GitHub 登录 | ⬜ 待做 |
| 公司大模型 API | Codex/xfusion 的接口地址、API Key、模型名 | ⬜ 待确认 |

你已提供：
- `LLM_API_KEY`：公司 Codex API Key（请只填到 Render 环境变量，不要写进代码）
- `LLM_MODEL`：`gpt-5.5`

还需要确认：
- `LLM_API_URL`：公司 OpenAI 兼容接口地址，例如 `https://xxx/v1/chat/completions`

---

## 第 1 步：注册 / 登录 Render

1. 浏览器打开 **https://render.com**
2. 点右上角 **Get Started** 或 **Sign Up**
3. 选择 **Continue with GitHub**
4. GitHub 授权后回到 Render 控制台

---

## 第 2 步：创建 Web Service

1. 进入 Render Dashboard
2. 点右上角 **New +**
3. 选择 **Web Service**
4. 在仓库列表里找到 **Workplace-Efficiency-Assistant**
5. 点右侧 **Connect**

> 如果看不到仓库：点 GitHub 授权设置，确认 Render 有权限访问该仓库。

---

## 第 3 步：确认部署配置

Render 会自动读取仓库中的 `render.yaml`，通常不用手动改。

| 配置项 | 应为 |
|--------|------|
| Runtime | Python |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `gunicorn app:app` |
| Plan | Free |

---

## 第 4 步：填写环境变量（关键）

进入配置页的 **Environment Variables**，添加：

| Key | Value | 说明 |
|---|---|---|
| `LLM_API_URL` | `https://你的公司网关/v1/chat/completions` | 公司 Codex/xfusion OpenAI 兼容接口地址 |
| `LLM_API_KEY` | `sk-你的公司Key` | 公司 API Key |
| `LLM_MODEL` | `gpt-5.5` | 模型名 |
| `VERIFY_SSL` | `true` | Render 云端通常不用关闭证书校验 |

> 本地公司网络如果出现 SSL 证书拦截，可设 `VERIFY_SSL=false`；Render 上一般保持 `true`。

---

## 第 5 步：创建并部署

1. 点页面底部 **Create Web Service**
2. 等待日志显示部署完成（通常 2~5 分钟）
3. 状态变为 **Live** 即成功

---

## 第 6 步：获取公网网址

部署完成后，页面顶部会显示类似：

```text
https://zhinengti-assistant.onrender.com
```

复制这个网址发给同学，他们打开就能使用你的智能体。

---

## 常见问题

### Q1：`LLM_API_URL` 填什么？
填公司提供的 OpenAI 兼容聊天接口地址，通常以 `/v1/chat/completions` 结尾。你需要向公司平台/文档确认。

### Q2：为什么不把 Key 写进代码？
因为 GitHub 仓库可能公开，API Key 写进代码会泄露。正确做法是填到 Render 的环境变量里。

### Q3：部署成功但生成失败？
检查 Render 日志，常见原因：
- `LLM_API_URL` 地址不对
- `LLM_API_KEY` 没填或无权限
- `LLM_MODEL` 模型名不对
- 公司接口不兼容 OpenAI `chat/completions` 格式

### Q4：免费版第一次打开慢？
Render 免费服务闲置后会休眠，第一次访问需要几十秒唤醒，正常现象。

---

## ✅ 完成检查清单

- [ ] Render 服务显示 `Live`
- [ ] 环境变量已填写：`LLM_API_URL`、`LLM_API_KEY`、`LLM_MODEL`
- [ ] 打开公网网址能看到页面
- [ ] 生成周报功能正常
- [ ] 生成 PPT 大纲和下载 PPT 正常
