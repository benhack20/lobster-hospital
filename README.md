# 🦞 Lobster Hospital

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![OpenClaw](https://img.shields.io/badge/Agent-OpenClaw-orange)](https://github.com/openclaw/openclaw)
[![Official Website](https://img.shields.io/badge/Official-Website-blue)](https://lobster-hospital.benhack.site/)

[**Official Website**](https://lobster-hospital.benhack.site/)

<a href="https://lobster-hospital.benhack.site/">
  <img src="./assets/home1_en.png" width="800" alt="Lobster Hospital Home Page">
</a>

**English** | [中文](./README_zh.md)

> "Hello, I am Dr. Fox. Send your little lobster in, and I will take good care of it."

**Lobster Hospital** is a comprehensive diagnostic and health monitoring system designed specifically for [OpenClaw](https://github.com/openclaw/openclaw) agents. It helps users diagnose, repair, and optimize their agent instances through an immersive "doctor-patient" interaction mode.

---

## ✨ Core Features

- 🩺 **Deep Checkup**: Automatically detects Node.js environment, OpenClaw version, disk space, memory usage, and Gateway status.
- 🦊 **Immersive Consultation**: Features "Dr. Fox," who learns about your "lobster's" symptoms (e.g., slow response, connection issues, security concerns) through dialogue.
- 🛡️ **Security Audit**: Scans for configuration file permissions, gateway exposure risks, credential security, and other core security items.
- 📊 **Multi-dimensional Reports**: Generates interactive HTML web reports and standard Markdown medical records.
- 💊 **One-click Repair**: Provides automated repair scripts for common "ailments" like permission errors, zombie sessions, and log accumulation.
- 🏥 **Cloud Sync**: Supports syncing diagnostic results to a central "Lobster Hospital" dashboard for long-term tracking.

<p align="center">
  <img src="./assets/home2_en.png" width="800" alt="Medical Record Wall">
  <br>
  <em>Medical Record Wall: Centralized tracking of your lobster's health status</em>
</p>

---

## 🚀 Quick Start

### 1. Install the Skill for your OpenClaw

Simply send the following command to your lobster (OpenClaw):

```text
Read https://lobster-hospital.benhack.site/skill_en.md and follow the instructions to install this skill
```

### 2. Start Treatment

Once installed, you can trigger it with the following commands:

- `Lobster Hospital`
- `Take the lobster to the doctor`
- `My lobster feels unwell`

---

## 🏗️ Project Structure

```text
lobster-hospital/
├── website/                # Official website and backend services
│   ├── public/             # Static assets and Skill distribution
│   │   └── skill/          # Skill description files and core logic scripts
│   ├── server.js           # Record collection and website backend
│   └── data/               # Diagnostic record storage
├── docs/                   # Project documentation
│   └── history/            # Project history and evolution records
└── README.md               # This file
```

---

## 🛠️ Development & Deployment

If you want to contribute code or deploy a private instance of Lobster Hospital:

### Requirements

- Node.js >= 18
- npm

### Start the Service

1. Enter the website directory:
   ```bash
   cd website
   ```
2. Install dependencies:
   ```bash
   # npm install (Run this yourself)
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

The default service will run at `http://localhost:3000`.

---

## 🤝 Contribution Guide

We welcome all "veterinarians" and developers to help improve Lobster Hospital!

1. Fork this repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

*Lobster Hospital: Guarding the lifeline of little lobsters worldwide.*
