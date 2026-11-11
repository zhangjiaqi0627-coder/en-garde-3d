# EN GARDE 3D · PARIS GRAND PALAIS

![Development: AI-Assisted](https://img.shields.io/badge/Development-AI--Assisted-8b5cf6)
![Engine: Three.js r128 WebGL](https://img.shields.io/badge/Engine-Three.js_r128_WebGL-0ea5e9)
![Physics: 120Hz FIE Simulation](https://img.shields.io/badge/Physics-120Hz_FIE_Mechanics-10b981)
![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b)

> **A zero-build, browser-native 3D Olympic fencing simulator (Foil · Épée · Sabre) featuring procedural WebGL PBR equipment modeling, analytical two-bone IK, 3D Forte/Foible blade-leverage physics, live FIE electrical lockout boxes, and a trilingual (FR/EN/ZH) referee lexicon.**  
> **全剑种 3D 击剑竞技与三语战术模拟（花剑 Fleuret · 重剑 Épée · 佩剑 Sabre）** — 零构建静态前端架构，内置 120Hz FIE 剑身物理与电审闭锁模拟。  
>
> 🤺 **Live Playable Demo / 在线试玩**: [https://zhangjiaqi0627-coder.github.io/en-garde-3d/](https://zhangjiaqi0627-coder.github.io/en-garde-3d/)

> [!NOTE]
> **AI-Assisted Development Disclosure · AI 辅助开发声明**  
> This repository was created through **Human-Directed, AI-Assisted Development** — combining human game/rules design and iterative curation with AI-generated implementation, procedural 3D shaders/textures, and key-art illustrations. See [AI-Assisted Development Disclosure](#ai-assisted-development-disclosure--ai-辅助开发声明) below for details.  
> 本项目采用 **人类主导设计 + AI 辅助编码与资产生成** 完成，详情请参阅文末声明。

## Highlights · 核心特性

### 1. Real-Match 120Hz FIE Fencing Physics · 比赛级 120Hz 交锋物理
- **3D Forte vs. Foible Blade Leverage · 三维强弱剑身力矩碰撞**: Analytical closest-point solver between 3D steel blade segments (`τ = F · s`). Pressing your strong **Forte** (near the guard) against the opponent's weak **Foible** (near the tip) yields `1.5x–2.8x` mechanical leverage (`Prise de Fer / Opposition`), while Sabre supports mid-air edge-to-edge clashes (`Contre-Taille / Fer sur Fer`).  
  *实时求解三维钢剑线段最近点与力臂比，还原强剑身压制封线与佩剑空中拼刀反弹。*
- **Grounded Coquille & Copper Piste Ricochet · 接地护手盘与金属剑道弹开**: Strikes glancing off the opponent's grounded hemispherical bell guard (e.g., Épée's 13.5cm eccentric bowl) or grazing the grounded copper-nickel piste emit metallic ricochet sparks and audio **without halting play or lighting a lamp**.  
  *剑尖撞击接地护手盘或擦中金属剑道时触发真实火花弹开，不亮灯、不停表，交锋无缝继续。*
- **FIE Spring-Tip Force Thresholds & Live Lockout Box (`Boîtier Électrique`) · 弹簧剑头压力阈值与电审闭锁窗**: Enforces axial tip compression thresholds (`> 4.90N / 500gf` for Foil, `> 7.35N / 750gf` for Épée — fast retreating distance-pulls cause sub-threshold `Effleuré` grazes) alongside authentic live lockout windows (`45ms` Épée · `170ms` Sabre · `200ms` Foil).  
  *还原花剑 `4.90N`、重剑 `7.35N` 剑头触发力（高速后撤拉距可卸力擦滑）与毫秒级双灯电审闭锁窗。*
- **In-Place Second-Intention `Remise` & 22Hz Steel Harmonics · 原位二次补刺与钢剑震颤**: Immediately Left-Click during recovery after a parry or bell-guard ricochet to fire a rapid `Remise` continuation, accompanied by 22Hz Euler–Bernoulli transverse blade vibration and column-buckling bends on hit.  
  *收剑瞬间支持变线二次续刺（`Remise`），每次交击驱动 22Hz 马氏体钢横波震颤与命中弓形弯折。*

### 2. Procedural WebGL 3D Anatomy & Broadcast Presentation · 原生 WebGL 三维建模与转播级交互
- **Multi-Section Lofted Fencers & PBR Gear · 解剖级放样建模与 PBR 材质**: 1600N stainless-mesh masks, 800N Kevlar twill uniforms, silver-nickel Foil torso lamés, champagne-gold Sabre conductive jackets, asymmetrical gum-sole fencing shoes, and seamless ball joints.  
  *内置程序化法线/粗糙度贴图生成，细致刻画三剑种导电金属衣、1600N 护面网罩与专业击剑鞋。*
- **Discipline-Authentic 3D Hilts & Deforming Blades · 三剑种专属护手与实时弯曲钢剑**: Foil 11cm dish guard + Visconti pistol grip, Épée 13.5cm eccentric deep bowl + dual-prong socket, and Sabre curved knuckle-bow (`Branche`), paired with 15-segment quadratic Bézier flexing blades and catenary body cords.  
  *独立构建花/重/佩三套三维护手与枪柄，配合 15 段实时二次贝塞尔形变剑身。*
- **3-Camera Showcase, Split-Screen 2P & Academy · 三机位检视、双人分屏与互动学院**: Switch between `CAM 01 CLOSE-UP`, `CAM 02 DUEL WIDE`, and `CAM 03 MASK POV` with 360° drag orbit; play 1P Grand Slam Championship, 2P Local Split-Screen, a 7-lesson Interactive Academy, and a 24-card FR/EN/ZH audio lexicon & quiz.  
  *支持大厅三机位 360° 环视、单人锦标赛、本地双人同屏分屏、7 节互动教学与 24 张法/英/中发声词卡测验。*

## Quick Start & Deployment · 快速运行与部署

This project is a **Zero-Build Static Web Application** — no `npm install`, no bundler, and zero backend or paid API dependencies.  
本项目为 **纯前端零构建静态网页应用**，无需安装 Node 依赖或配置任何后端密钥。

### Run Locally · 本地运行

```bash
python3 -m http.server 8080
# Open http://localhost:8080 in Chrome or Edge (在浏览器中打开)
```

> **Recommended Browser · 推荐环境**: Desktop **Chrome** or **Edge** with hardware-accelerated WebGL enabled. French & English referee voice synthesis uses the browser's built-in `Web Speech API`.

### Deploy to GitHub Pages · 部署至 GitHub Pages

1. Run the pre-upload security audit and push to your GitHub repository (including the standard `Co-authored-by` AI transparency trailer):  
   运行安全自检脚本并推送至 GitHub 仓库：
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
2. In your GitHub repository, navigate to **Settings → Pages → Build and deployment**, set **Source** to `Deploy from a branch`, and select `main` / `/ (root)` (`.nojekyll` is included at the root).  
   在仓库 **Settings → Pages** 中选择 `main` 分支 `/ (root)` 目录保存，等待约 1 分钟即可在线访问。

## Controls · 操作说明

| Mode · 模式 | Footwork & Evasion · 步法身位 | Guard Line · 控剑防线 | Attack & Remise · 出剑与补刺 | Parry & Super · 格挡与绝技 |
| :--- | :--- | :--- | :--- | :--- |
| **1P / Academy (单人/学院)** | `A` Retreat · `D` Advance · `W` Jump · `S` Duck<br>*(后撤 / 前进 / 跃起 / 下蹲)* | Mouse or `1 / 2 / 3 / 4`<br>*(移动鼠标或数字键)* | Left-Click / `Space` (click in recovery for `Remise`)<br>*(左键/空格，收剑期再按补刺)* | Right-Click / `F` Parry · `E` Coup de Maître<br>*(右键/F 格挡 · E 奥林匹克绝技)* |
| **2P Left (左屏 P1)** | `A` Retreat · `D` Advance · `W` Jump · `S` Duck | Mouse or `1 / 2 / 3 / 4` | Left-Click / `Space` | Right-Click / `F` |
| **2P Right (右屏 P2)** | `→` Retreat · `←` Advance · `↑` Jump · `↓` Duck | `I / O / K / L` or Numpad `7/9/4/6` | `Enter` / `J` / Numpad `0` | `P` / `;` |

## Project Structure · 目录结构

```text
├── index.html                        # Entry point & FIE broadcast HUD layout (应用入口与转播级界面)
├── styles/
│   └── fencing.css                   # Responsive typography, broadcast stingers & visor mesh (样式与动效)
├── assets/                           # Key-art posters & challenger portraits, EXIF-clean (主视觉与立绘)
├── src/
│   ├── config/constants.js           # Biomechanical constants, FIE spring thresholds & AI schemes (物理与剑种常量)
│   ├── data/curriculum.js            # 7 interactive academy lessons & 24 FR/EN/ZH flashcards (课纲与三语词卡)
│   ├── audio/sound-engine.js         # Zero-asset WebAudio physical synthesis & dynamic BGM (程序化音效与配乐)
│   ├── state/store.js                # Strict Proxy-guarded state store & dirty-checked DOM cache (状态管理)
│   ├── rules/geometry.js             # 3D blade-segment collision, Forte/Foible torque & Coquille ricochet (几何碰撞)
│   ├── controllers/combat-engine.js  # 120Hz physics loop, FIE lockout box, footwork & tactical AI (核心战斗引擎)
│   ├── renderer/fencer-3d-models.js  # Procedural PBR textures, lofted fencer anatomy & 3D hilts (三维解剖与器材建模)
│   ├── renderer/arena-3d-renderer.js # Three.js WebGL pipeline, analytical 2-bone IK & HUD rings (三维场馆与IK渲染)
│   └── ui/hud-and-app.js             # Input wiring, audio quiz, unit self-tests & main loop (交互绑定与自检)
├── scripts/
│   ├── security_audit.py             # Pre-publish secret, token & private-path scanner (上传前安全审计脚本)
│   └── publish_github.py             # Automated GitHub repo sync & Pages publisher (GitHub 自动发布脚本)
├── .gitignore                        # Excludes .env, credentials & OS caches (Git 忽略规则)
├── .nojekyll                         # Bypass Jekyll for static GitHub Pages serving (静态直出标记)
└── LICENSE                           # MIT Open-Source License (MIT 开源许可证)
```

## Security & Privacy Audit · 安全与隐私说明

- **Zero Secrets & Zero Telemetry · 零密钥与零数据外发**: Contains zero API keys, tokens, or external `fetch` / `XMLHttpRequest` / `WebSocket` calls. Championship medals are saved strictly in browser `localStorage`.  
- **Public Static CDNs Only · 纯公共静态依赖**: Loads only `Three.js r128`, `Tailwind CSS 3.4.17`, and `Google Fonts` over keyless public CDNs. Run `python3 scripts/security_audit.py` anytime before pushing to verify zero sensitive strings.

## AI-Assisted Development Disclosure · AI 辅助开发声明

In accordance with open-source AI transparency best practices, the roles in creating this project are disclosed as follows:  
遵循开源社区 AI 透明化惯例，特此声明本项目的创作分工：

- **Human Direction & Curation · 人类主导设计与把关**: Core creative direction, Olympic Foil/Épée/Sabre rule differentiation, broadcast UI/UX aesthetic direction, iterative 3D anatomy & FIE physics reviews, and live gameplay verification.  
- **AI-Generated Implementation & Assets · AI 辅助编码与资产生成**: Modular Vanilla JS/HTML5/CSS3 code, procedural Three.js PBR shaders/textures, analytical two-bone IK, 3D blade-segment leverage solver, Web Audio synthesis, and illustrated key-art assets under `assets/`.

## License

Released under the [MIT License](./LICENSE). Copyright (c) 2026 zhangjiaqi0627-coder.
