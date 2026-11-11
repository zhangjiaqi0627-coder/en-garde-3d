# EN GARDE 3D · PARIS GRAND PALAIS

![Development: AI-Assisted](https://img.shields.io/badge/Development-AI--Assisted-8b5cf6)
![Engine: Three.js r128 WebGL](https://img.shields.io/badge/Engine-Three.js_r128_WebGL-0ea5e9)
![Physics: 120Hz FIE Simulation](https://img.shields.io/badge/Physics-120Hz_FIE_Mechanics-10b981)
![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b)

> **全剑种 3D 击剑竞技与三语战术教学模拟（花剑 Fleuret · 重剑 Épée · 佩剑 Sabre）**  
> A zero-build, browser-native 3D Olympic fencing simulator featuring procedural WebGL PBR equipment modeling, analytical two-bone IK, 3D Forte/Foible blade-leverage physics, live FIE electrical lockout windows, and a trilingual (FR/EN/ZH) referee lexicon.  
> 
> 🤺 **在线试玩 / Live Demo**: [https://zhangjiaqi0627-coder.github.io/en-garde-3d/](https://zhangjiaqi0627-coder.github.io/en-garde-3d/)

> [!NOTE]
> **AI-Assisted Development Disclosure / AI 辅助开发声明**  
> 本项目采用 **人类主导设计 + AI 辅助编码与资产生成（Human-Directed, AI-Assisted Development）** 完成，详情请参阅文末 [AI 辅助生成说明与贡献声明](#ai-disclosure--ai-辅助开发声明)。  
> This repository was created through human-directed iterative design with AI-generated code, procedural 3D shaders/textures, and illustrated key-art assets.

## 核心特性 / Highlights

### 1. 真实比赛级 120Hz 交锋物理（Real-Match FIE Fencing Physics）
- **三维强弱剑身力矩碰撞（3D Forte vs. Foible Leverage）**：实时求解两把三维钢剑线段最近点与力臂比（`τ = F · s`）。以靠近护手的强剑身（Forte）压制对手弱剑尖（Foible）可打出 `1.5x–2.8x` 压剑封线（`Prise de Fer / Opposition`）；佩剑双刃对砍支持空中拼刀反弹（`Contre-Taille / Fer sur Fer`）。
- **接地护手盘与金属剑道弹开（Grounded Coquille & Piste Ricochet）**：剑尖撞击对手接地金属护手盘（如重剑 13.5cm 偏心深碗）或低刺擦中铜镍接地剑道时，触发空腔金属弹开声与三维火花，**不亮灯、不停表**，交锋无缝继续。
- **FIE 弹簧剑头压力阈值与实时电审闭锁窗（Boîtier Électrique）**：还原花剑 `> 4.90N (500gf)`、重剑 `> 7.35N (750gf)` 轴向触发力（对手高速后撤拉距卸力会产生 `Effleuré` 擦滑未触发），并在首灯亮起后运行真实的 `45ms`（重剑）/ `170ms`（佩剑）/ `200ms`（花剑）毫秒级电审闭锁倒计时窗。
- **原位二次补刺（Remise）与 22Hz 钢剑横波震颤**：进攻被拨挡或被护手盘弹开收剑瞬间，再次点击左键可发动快速变线补刺（`Remise`）；每次金属交击均驱动 22Hz 马氏体钢横波震颤与柱式屈曲弓形弯折。

### 2. 原生 WebGL Three.js 解剖级建模与 PBR 材质
- **多截面放样人体与装备建模**：1600N 黑色不锈钢金属网复合面罩、800N 凯夫拉斜纹剑服、花剑银镍无袖金属衣、佩剑香槟金长袖金属衣、非对称牛筋底击剑鞋与无缝球形关节。
- **三剑种专属三维护手与实时形变钢剑**：花剑 11cm 浅碟护手 + Visconti 枪柄、重剑 13.5cm 偏心深碗护手 + 双孔插座、佩剑弧形护手盘 + 三维护指弓（`Branche`），配合 15 段实时二次贝塞尔弯曲钢剑与悬链线拖地手线。
- **三机位大厅检视与双人同屏分屏**：主界面支持 `CAM 01 建模特写` / `CAM 02 双人全景` / `CAM 03 第一视角` 360° 鼠标环视，支持 1P 锦标赛、2P 本地同屏 WebGL 视口分屏与 7 节互动教学学院。

## 快速运行与部署 / Quick Start & Deployment

本项目为 **纯前端零构建依赖（Zero-Build Static Web App）**，无需 `npm install`，不包含任何后端或付费 API 调用。

### 本地运行 / Run Locally

```bash
python3 -m http.server 8080
# 浏览器打开 Open http://localhost:8080
```

> **推荐环境 / Recommended Browser**：桌面端 **Chrome** 或 **Edge**（开启硬件加速 WebGL；法语/英语裁判语音基于浏览器内置 `Web Speech API`，不同操作系统的内置法语音色略有差异）。

### 一键部署至 GitHub Pages / Deploy to GitHub Pages

1. 新建公开或私有 GitHub 仓库后，在项目根目录执行安全自检与推送（下方示例包含开源社区通用的 AI 协同提交尾注 `Co-authored-by`）：
   ```bash
   python3 scripts/security_audit.py
   git init
   git add .
   git commit -m "feat: initial release of En Garde 3D fencing simulator

   Co-authored-by: AI Coding Assistant <noreply@ai-assisted.local>"
   git branch -M main
   git remote add origin https://github.com/zhangjiaqi0627-coder/en-garde-3d.git
   git push -u origin main
   ```
2. 进入 GitHub 仓库页面：**Settings → Pages → Build and deployment**，将 **Source** 设为 `Deploy from a branch`，选择 `main` 分支与 `/ (root)` 目录并保存（仓库根目录已附带 `.nojekyll`）。等待约 1 分钟即可获得在线试玩链接。

## 操作说明 / Controls

| 模式 / Mode | 步法与身位 / Footwork | 控剑防线 / Guard Line | 出剑与补刺 / Attack & Remise | 格挡与绝技 / Parry & Super |
| :--- | :--- | :--- | :--- | :--- |
| **1P / 学院模式** | `A` 后撤 · `D` 前进 · `W` 跃起 · `S` 下蹲 | 移动鼠标 或 `1 / 2 / 3 / 4` | 鼠标左键 / `Space`（收剑期再按触发 `Remise`） | 鼠标右键 / `F` 格挡 · `E` 奥林匹克绝技 |
| **2P 左屏 (P1)** | `A` 后撤 · `D` 前进 · `W` 跃起 · `S` 下蹲 | 鼠标 或 `1 / 2 / 3 / 4` | 鼠标左键 / `Space` | 鼠标右键 / `F` |
| **2P 右屏 (P2)** | `→` 后撤 · `←` 前进 · `↑` 跃起 · `↓` 下蹲 | `I / O / K / L` 或小键盘 `7/9/4/6` | `Enter` / `J` / 小键盘 `0` | `P` / `;` |

## 目录结构 / Project Structure

```text
├── index.html                        # 应用入口与 FIE 转播级 HUD 布局
├── styles/
│   └── fencing.css                   # 响应式排版、斜切转场与护面网罩样式
├── assets/                           # 三剑种主视觉海报与三位挑战者头像 (无 EXIF 隐私信息)
├── src/
│   ├── config/constants.js           # 武器物理常量、FIE 弹簧阈值与 AI 策略表
│   ├── data/curriculum.js            # 7 节互动教学课纲与 24 张中/英/法术语词卡
│   ├── audio/sound-engine.js         # 零外部音频文件的 WebAudio 物理打击与合成器配乐
│   ├── state/store.js                # 严格代理校验的分区状态库与 DOM 脏检查缓存
│   ├── rules/geometry.js             # 三维剑身线段碰撞、强弱剑身力矩与护手盘弹开计算
│   ├── controllers/combat-engine.js  # 120Hz 物理主循环、FIE 闭锁盒、惯性步法与战术 AI
│   ├── renderer/fencer-3d-models.js  # 程序化 PBR 纹理、放样人体解剖网格与三剑种三维护手
│   ├── renderer/arena-3d-renderer.js # Three.js PBR 渲染管线、双骨骼解析 IK 与战术环投影
│   └── ui/hud-and-app.js             # 事件绑定、词卡听音测验、内置单元测试与帧循环
├── scripts/
│   ├── security_audit.py             # 上传前密钥、Token 与本地隐私路径自检脚本
│   └── publish_github.py             # 一键自动创建 GitHub 仓库、推送代码并配置 Pages
├── .gitignore                        # 排除 .env、私钥证书与系统缓存文件
├── .nojekyll                         # GitHub Pages 纯静态目录直出标记
└── LICENSE                           # MIT 开源许可证
```

## 安全与隐私说明 / Security & Privacy Audit

- **零密钥与零外部请求**：全仓不含任何第三方大模型或云服务 API Key，无任何 `fetch` / `XMLHttpRequest` / `WebSocket` 数据外发请求；比赛奖牌进度仅保存在浏览器本地 `localStorage`。
- **公共静态依赖**：仅通过公共无密钥 CDN 加载 `Three.js r128`、`Tailwind CSS 3.4.17` 与 `Google Fonts` 字体。每次修改后可运行 `python3 scripts/security_audit.py` 进行上传前复检。

## AI Disclosure / AI 辅助开发声明

遵循开源社区透明化惯例（Open-Source AI Transparency Convention），特此声明本项目的创作分工：

- **人类创作者主导（Human Direction & Curation）**：核心创意立意、花/重/佩三剑种竞技规则差异化拆解、UI 去同质化审美把控、三维解剖建模与真实比赛物理机制的多轮迭代评审及实机验收。
- **AI 辅助生成（AI-Generated Implementation & Assets）**：模块化前端代码（HTML5 / CSS3 / Vanilla JS）、Three.js 程序化 PBR 材质与双骨骼逆运动学算法、三维线段力矩物理求解器、Web Audio 实时音效合成及 `assets/` 目录下的概念插画素材均由 AI 辅助编写与生成。

## License

Released under the [MIT License](./LICENSE). Copyright (c) 2026 zhangjiaqi0627-coder.
