# 🦞 龙虾医院 (Lobster Hospital)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw](https://img.shields.io/badge/Agent-OpenClaw-orange)](https://github.com/openclaw/openclaw)

[English](./README.md) | **中文**

> "你好，我是医生小狐。把你的小龙虾送进来吧，我会照顾好它的。"

**龙虾医院 (Lobster Hospital)** 是一个专为 [OpenClaw](https://github.com/openclaw/openclaw) 智能体设计的全方位诊疗与健康监测系统。它通过沉浸式的“医生与患者”交互模式，帮助用户诊断、修复并优化其智能体实例。

---

## ✨ 核心特性

- 🩺 **深度体检**：自动检测 Node.js 环境、OpenClaw 版本、磁盘空间、内存占用及 Gateway 状态。
- 🦊 **沉浸式问诊**：内置“医生小狐”角色，通过对话了解“小龙虾”的症状（如反应慢、连不上、安全担忧等）。
- 🛡️ **安全审计**：扫描配置文件权限、网关暴露风险、凭证安全等核心安全项。
- 📊 **多维报告**：生成交互式 HTML 网页报告与标准的 Markdown 病历卡。
- 💊 **一键修复**：针对权限错误、僵尸会话、日志堆积等常见病症提供自动化修复脚本。
- 🏥 **云端同步**：支持将诊断结果同步至中央“龙虾医院”看板，方便长期跟踪。

---

## 🚀 快速开始

### 1. 为你的 OpenClaw 安装技能

只需将以下指令发送给你的小龙虾（OpenClaw）：

```text
阅读 https://lobster-hospital.benhack.site/skill.md 并遵循指导安装这个skill
```

### 2. 开启诊疗

安装完成后，你可以通过以下指令触发：
- `龙虾医院`
- `带小龙虾看病`
- `我的小龙虾不舒服`

---

## 🏗️ 项目结构

```text
lobster-hospital/
├── website/                # 官方网站与后台服务
│   ├── public/             # 静态资源与 Skill 分发
│   │   └── skill/          # Skill 描述文件与核心逻辑脚本
│   ├── server.js           # 记录收集与网站后台
│   └── data/               # 诊断记录存储
├── docs/                   # 项目文档
│   └── history/            # 项目发展史与演进记录
└── README.md               # 英文主文档
```

---

## 🛠️ 开发与部署

### 环境要求

- Node.js >= 18
- npm

### 启动服务

1. 进入网站目录：
   ```bash
   cd website
   ```
2. 安装依赖：
   ```bash
   npm install
   ```
3. 启动开发服务器：
   ```bash
   npm run dev
   ```

默认服务将运行在 `http://localhost:3000`。

---

## 📄 开源协议

本项目基于 **MIT License** 协议开源。详情请参阅 [LICENSE](LICENSE) 文件。

---

*龙虾医院：守护全球小龙虾的生命线*
