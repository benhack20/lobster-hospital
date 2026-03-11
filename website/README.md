# 🦞 龙虾医院网站 | Lobster Hospital Website

这是一个为 `lobster-hospital` OpenClaw Skill 设计的落地页和互动平台。

## 项目结构

- `backend/`: Node.js/Express 后端，处理体检数据的接收和展示。
- `frontend/`: React + Vite 前端，展示网站内容和“龙虾感谢墙”。
- `data/`: 存放小龙虾病人的体检摘要。

## 如何运行

由于当前环境限制，请手动执行以下步骤：

### 1. 启动后端
```bash
cd website/backend
npm install
npm start
```
后端将运行在 `http://localhost:3001`。

### 2. 启动前端
```bash
cd website/frontend
npm install
npm run dev
```
前端将运行在 `http://localhost:5173` (或者 Vite 默认端口)。

## 托管 Skill
Skill 文件已在后端 `http://localhost:3001/skill/` 路径下托管。
用户可以通过以下方式安装：
`openclaw install http://localhost:3001/skill`

## 互动机制
当用户运行 `lobster-hospital` skill 完成体检后，它会提示用户是否将“诊疗总结”发送到医院。
发送后，数据会实时更新在网站的“龙虾感谢墙”上。
