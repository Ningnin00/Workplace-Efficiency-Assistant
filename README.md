# 职场效率助手 · Web 版

一个可以直接通过网址分享的智能体 Web 应用：**一键生成周报 + 一键生成 PPT**。

## 功能
- 📝 **一键周报**：输入零散工作记录 → AI 生成结构化周报
- 📊 **一键 PPT**：输入主题 → AI 生成 PPT 大纲 → 下载真实 `.pptx` 文件

---

## 一、本地运行（测试用）

### 1. 安装依赖
```bash
pip install -r requirements.txt
```

### 2. 配置大模型 API
本项目使用 **OpenAI 兼容 Chat Completions 接口**。请配置环境变量：

| 环境变量 | 示例 | 说明 |
|---|---|---|
| `LLM_API_URL` | `https://ai-gateway.xfusion.com` | xfusion Base URL，代码会自动补 `/v1/chat/completions` |
| `LLM_API_KEY` | `sk-xxxx` | API Key |
| `LLM_MODEL` | `gpt-5.4` | 模型名 |
| `VERIFY_SSL` | `true` / `false` | 本地遇到证书拦截可设为 `false` |

PowerShell 示例：
```powershell
$env:LLM_API_URL="https://ai-gateway.xfusion.com"
$env:LLM_API_KEY="sk-你的Key"
$env:LLM_MODEL="gpt-5.4"
$env:VERIFY_SSL="false"
python app.py
```

> 注意：不要把 API Key 写进代码或提交到 GitHub。

### 3. 启动
```bash
python app.py
```
浏览器打开 **http://127.0.0.1:5000** 即可使用。

---

## 二、部署到公网（让别人复制网址就能用）⭐ 推荐

### 步骤 1：代码已上传到 GitHub
仓库：`Ningnin00/Workplace-Efficiency-Assistant`

### 步骤 2：在 Render 创建 Web Service
1. 打开 https://render.com 注册账号
2. 点击 **New +** → **Web Service**
3. 连接 GitHub 仓库，选择 `Workplace-Efficiency-Assistant`
4. Render 会自动读取 `render.yaml`

### 步骤 3：填写环境变量
在 Render 服务的 **Environment Variables** 添加：

| Key | Value |
|---|---|
| `LLM_API_URL` | `https://ai-gateway.xfusion.com` |
| `LLM_API_KEY` | 公司提供的 Codex/xfusion API Key |
| `LLM_MODEL` | `gpt-5.4` |
| `VERIFY_SSL` | Render 上一般填 `true` |

### 步骤 4：获得公网网址
部署完成后，Render 会给一个 `https://你的服务名.onrender.com` 的网址。
把这个网址发给同学，他们打开就能用你的智能体。

---

## 三、项目结构
```
webapp/
├── app.py              # Flask 后端（API + PPT 生成）
├── requirements.txt    # 依赖
├── render.yaml         # Render 部署配置
├── Procfile            # 启动命令
├── static/
│   ├── index.html      # 前端页面
│   ├── style.css       # 样式
│   └── app.js          # 前端逻辑
└── README.md
```
