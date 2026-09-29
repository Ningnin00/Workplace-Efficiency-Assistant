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

### 2. 配置 DeepSeek API Key
编辑 `app.py` 顶部，把：
```python
DEEPSEEK_API_KEY = os.environ.get("DEEPSEEK_API_KEY", "在这里填入你的_API_Key")
```
改成你的 Key（也可以设置环境变量 `DEEPSEEK_API_KEY`）。

> 去 https://platform.deepseek.com 注册获取 API Key。

### 3. 启动
```bash
python app.py
```
浏览器打开 **http://127.0.0.1:5000** 即可使用。

---

## 二、部署到公网（让别人复制网址就能用）⭐ 推荐

> 本地网络受限时，推荐用 **Render** 免费部署，部署后得到一个公网 URL。

### 步骤 1：把代码上传到 GitHub
1. 在 GitHub 新建一个仓库
2. 把 `webapp` 文件夹里的内容上传（`app.py`、`requirements.txt`、`render.yaml`、`Procfile`、`static/`）

### 步骤 2：在 Render 创建 Web Service
1. 打开 https://render.com 注册账号（免费）
2. 点击 **New +** → **Web Service**
3. 连接你的 GitHub 仓库，选择它
4. Render 会自动读取 `render.yaml` 配置

### 步骤 3：填写 API Key
1. 在服务设置里找到 **Environment** → **Environment Variables**
2. 添加变量：`DEEPSEEK_API_KEY` = 你的 DeepSeek Key
3. 保存，Render 会自动部署

### 步骤 4：获得公网网址
- 部署完成后，Render 会给一个 `https://你的服务名.onrender.com` 的网址
- **把这个网址发给同学，他们打开就能用你的智能体了** 🎉

> 免费版注意事项：
> - 免费实例闲置 15 分钟会休眠，第一次访问会慢几秒（会自动唤醒）
> - 每月有免费额度，个人演示完全够用

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
