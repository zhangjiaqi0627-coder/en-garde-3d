# EN GARDE 3D · PARIS GRAND PALAIS

![Version: v2.10.0](https://img.shields.io/badge/Version-v2.10.0-f43f5e)
![Development: AI-Assisted](https://img.shields.io/badge/Development-AI--Assisted-8b5cf6)
![Engine: Three.js r128 WebGL](https://img.shields.io/badge/Engine-Three.js_r128_WebGL-0ea5e9)
![Physics: 120Hz FIE Simulation](https://img.shields.io/badge/Physics-120Hz_FIE_Mechanics-10b981)
![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b)

> **A zero-build, browser-native 3D Olympic fencing simulator (Foil · Épée · Sabre) featuring arm-first Olympic `Allongement` lunge kinematics, directional `Marche / Rompez` footwork, authentic downward/supinated Foible blade flex (`Soie`), non-penetrating 3D blade-on-blade contact constraints, anatomical 3D body-surface tip pinning with hit recoil, live FIE electrical lockout windows, time-ramped (`0.48x → 0.20x`) post-hit 3D broadcast replays (`Ralenti`), and a trilingual (FR/EN/ZH) referee lexicon.**  
> **全剑种 3D 击剑竞技与三语战术教学模拟（花剑 Fleuret · 重剑 Épée · 佩剑 Sabre）** — 零构建静态前端架构，内置伸臂先行步法动力学、120Hz FIE 剑身物理与变速 3D 慢镜回放系统。  
>
> 🤺 **Live Playable Demo / 在线试玩**: [https://zhangjiaqi0627-coder.github.io/en-garde-3d/](https://zhangjiaqi0627-coder.github.io/en-garde-3d/)

> [!NOTE]
> **AI-Assisted Development Disclosure · AI 辅助开发声明**  
> This repository was created through **Human-Directed, AI-Assisted Development** — combining human game/rules design and iterative curation with AI-generated implementation, procedural 3D shaders/textures, and key-art illustrations. See [AI-Assisted Development Disclosure](#ai-assisted-development-disclosure--ai-辅助开发声明) below for details.  
> 本项目采用 **人类主导设计 + AI 辅助编码与资产生成** 完成，详情请参阅文末声明。

## Changelog · 版本更新日志

### `v2.10.0` — Arm-First Lunge Locomotion & Time-Ramped Post-Hit 3D Broadcast Replay · 伸臂先行步法与变速 3D 回放升级
- **Olympic `Allongement` & Directional Footwork · 伸臂先行与方向性步法动力学**:
  - **Arm-First Extension (`armExt` leads `bodyExt`)**: Decouples sword-arm extension ($t^{0.62}$) from rear-leg lunge drive ($t^{1.15}$), reproducing authentic fencing whip-timing where the point threatens first while the back foot stays anchored to the piste. *(将持剑臂伸展与大弓步蹬跨解耦，还原“手臂率先突刺威胁、后腿随后爆发蹬跨”的真实节奏。)*
  - **Directional `Marche / Rompez` & `stepBounce`**: Adds staggered front/rear foot lifts and cadence-driven vertical bounce during advances and retreats, recording `p1Vel / p2Vel` into 60Hz replay snapshots for fluid playback. *(前进与后撤时区分前后脚错峰微抬与步频重心弹跳，并在 60Hz 回放中同步还原步法。)*
- **Time-Ramped Post-Hit 3D Broadcast Replay (`0.48x → 0.20x`) · 击中后余韵帧与奥运变速推近回放**:
  - **0.28s Post-Hit Cushion Recording**: Continues capturing ~9 frames after `HALT` so replays showcase torso/mask hit recoil and 22Hz steel ringing instead of cutting off at contact. *(命中后继续录制 `0.28s` 受击缓冲帧，完整呈现“起势逼近 → 伸臂刺中 → 剑尖锁止微弯 → 受击后仰”。)*
  - **Ramped Speed Curve & Dolly Zoom**: Flows at `0.48x` during approach, ramps smoothly down to `0.20x` ultra-slow motion at impact while narrowing FOV from `45°` to `36°` toward the hit point, displaying live speed & `TOUCHÉ ENREGISTRÉ` lamp status. *(临近命中降速至 `0.20x` 并推近聚焦受击胸甲触点，实时显示倍速与亮灯状态。)*
- **Modified Files in `v2.10.0` · 本版变更文件**: `src/state/store.js`, `src/controllers/combat-engine.js`, `src/renderer/arena-3d-renderer.js`, `README.md`.

### `v2.9.0` — Fix Opponent Hit Replay Self-Stabbing Bug · 根治对手得分回放“剑反刺自身”轴向越界 Bug
- Reordered chest anti-clipping and opponent-spacing invariants in `poseFencer3D`, added a strict forward-tip constraint (`dirZ * (tipWorldZ - _pHandLead.z) >= 0.62m`), and dynamically aligned hit chest planes across replay frames with full `pinnedWorldX/Y/Z` state restoration. *(修复对攻回放时对手持剑手被反向推过肩膀导致剑尖朝向自身的轴向反转问题。)*

### `v2.8.0` — Authentic Downward `Soie` Blade Flex & Co-Linear First-Person Guard · 修正剑身弯曲极性与主视角共线对齐
- Unified deflection polarity along natural Foil/Épée cant (`Soie`, `-Y`) and aligned first-person blade origin `_pBladeStart` strictly along the guard-to-tip vector to eliminate S-curve artifacts. *(统一刺中弯曲极性为真实下垂外张方向，并消除第一视角剑根反折。)*

### `v2.7.0` — Subtle C1-Continuous Maraging Steel Flex · 弱剑尖 C1 连续微弹性曲线升级
- Adjusted axial stand-off (`bladeLen - 0.045m`) and upgraded beam bending to $w(t) = 2.60 \cdot t^{1.45}(1-t)$, keeping the Forte tangent and straight while flexing the Foible by `2.5cm–4.2cm`. *(修正止停间距与弹性插值方程，强剑身挺直、仅弱剑尖呈现自然微弧。)*

### `v2.6.0` — 3D Blade-on-Blade & Blade-to-Body Contact Overhaul · 三维非穿透接触与受击后坐力重构
- 1:1 world-space blade alignment with non-penetrating blade separation, normal parry deflection, 5-zone anatomical pinning (mask/lamé/wrist/foot/off-arm), and physical hit recoil. *(实装双剑非穿透分离、法线弹开与五区解剖靶面触点锁止。)*

### `v2.5.0` — Equipment & Kinematic Micro-Polish · 装备解剖微雕与步法动力学打磨
- Added 5-finger articulated balance hand, dual-prong inner guard sockets (`Prise intérieure`), `FIE 800N` wrist patches, conductive mask bib (`Bavette`), body cord, and heel-strike/toe-roll footwork. *(新增五指后手、内腔电审插座、前垂护颈与弓步脚踝动力学。)*

### `v2.4.0` — Long-Measure Combat & Full-Stretch Olympic Lunge · 远距实战控距与奥运大弓步重构
- Expanded starting distance to `3.50m` and strike ranges (`2.92m–3.24m`) with front-heel braking (`stopDist`), 180° shoulder-height arm lock, and `1.50m` lunge stride. *(拉开远距博弈区间，重塑全舒展大弓步姿态。)*

### `v2.3.0` — Zero-Clipping 3D Overhaul · 全方位三维防穿模重构
- Added real-time `oppChestSurfaceZ` boundary clamping, single-layer torso zoning, and unified dual-tone 1600N masks. *(实装胸甲外表面硬限位与一体化双色面罩。)*

### `v2.2.0` — Broadcast 3D Slow-Mo Replay & Grand Palais Upgrades · 3D 慢镜回放与大皇宫场馆升级
- Introduced `Ralenti Officiel 3D` (`[R]` replay, `Space`/LMB skip), Catmull-Rom 3x longitudinal subdivision, and Grand Palais northern honor stairs. *(新增 3D 慢镜回放系统与大皇宫北端荣誉阶梯。)*

### `v2.1.0` — Real-Match FIE Physics & Open-Source Hardening · 国际剑联物理与开源工程规范化
- Added 3D Forte/Foible blade leverage, grounded `Coquille` ricochets, `4.90N / 7.35N` axial spring thresholds, `45ms / 170ms / 200ms` lockout box, `Remise`, and `security_audit.py`. *(实装强弱剑身力矩、护手盘弹开、弹簧触发阈值、闭锁窗与安全审计脚本。)*

## Highlights · 核心特性

### 1. Real-Match Measure & 120Hz FIE Physics · 比赛级远距控距与 120Hz 交锋物理
- **Arm-First `Allongement` & Full-Stretch Lunge · 伸臂先行与全舒展大弓步**: Fencers duel across authentic `2.65m–3.24m` measure; lunges lead with the sword arm (`t^0.62`) before driving off the anchored rear leg (`t^1.15`) with front-heel braking and balanced 5-finger rear-hand extension.  
  *还原真实击剑“手臂率先突刺威胁、后腿锚定爆发蹬跨、前脚跟扎地制动”的运动学节奏。*
- **3D Non-Penetrating Blade Bind & Leverage · 三维强弱剑身非穿透接触与力矩**: Analytical closest-point solver (`τ = F · s`) maintains non-penetrating steel separation while letting **Forte** overpower **Foible** (`1.5x–2.8x` leverage, `Prise de Fer / Opposition`), plus Sabre mid-air edge clashes (`Contre-Taille`).  
  *实时求解三维钢剑最近点与力臂比，还原强剑身压制封线与佩剑空中拼刀反弹。*
- **Anatomical Surface Pinning, `Soie` Flex & Recoil · 解剖靶区锁止、真实下垂微弧与受击后坐力**: Tips pin cleanly onto the mask, torso lamé, sword wrist, or lead foot with `2.5cm–4.2cm` downward/supinated Foible flex and physical torso/mask hit recoil.  
  *剑尖严格锁止在对应解剖部位外表面，呈现自然微弧并触发受击方真实后仰顿挫。*
- **Grounded `Coquille` Ricochet & FIE Lockout Box (`Boîtier Électrique`) · 护手盘弹开与实时电审闭锁窗**: Glancing hits off grounded bell guards or the copper piste spark without halting play, while valid hits enforce `4.90N` (Foil) / `7.35N` (Épée) axial tip force and `45ms / 170ms / 200ms` lockout windows.  
  *还原接地护手盘弹开（不亮灯不停表）、弹簧剑头触发阈值与毫秒级双灯电审闭锁。*

### 2. Procedural WebGL 3D Anatomy & Broadcast Presentation · 原生 WebGL 三维建模与变速回放导播
- **Sculpted PBR Gear & Discipline-Authentic Hilts · 精雕解剖高模与三剑种专属护手**: Dual-tone 1600N stainless-mesh masks with conductive `Bavette` bibs, 800N Kevlar uniforms, silver-nickel Foil & champagne-gold Sabre lamés, 3D Foil/Épée/Sabre guards with dual-prong sockets, 15-segment Bézier blades, and catenary body cords.  
  *内置程序化法线/粗糙度贴图与三套独立三维护手，配合 15 段实时二次贝塞尔形变钢剑。*
- **Grand Palais Arena & Time-Ramped 3D Replay (`0.48x → 0.20x`) · 大皇宫赛场与变速 3D 慢镜回放**: Cast-iron Grand Palais vaulting, full-strip scoring LEDs, armored spool reels, 3-camera showcase orbit, 2P local split-screen, 7-lesson Academy, 24-card FR/EN/ZH lexicon, and `[R]` instant slow-motion replays.  
  *支持三机位环视、本地双人分屏、7 节互动学院、24 张三语词卡测验与 `[R]` 键变速推近 3D 回放。*

## Quick Start & Deployment · 快速运行与部署

This project is a **Zero-Build Static Web Application** — no `npm install`, no bundler, and zero backend or paid API dependencies.  
本项目为 **纯前端零构建静态网页应用**，无需安装 Node 依赖或配置任何后端密钥。

### Run Locally · 本地运行

```bash
python3 -m http.server 8080
# Open http://localhost:8080 in Chrome or Edge (在浏览器中打开)
```

> **Recommended Browser · 推荐环境**: Desktop **Chrome** or **Edge** with hardware-accelerated WebGL enabled. French & English referee voice synthesis uses the browser's built-in `Web Speech API`.

### Incremental Sync & GitHub Pages Deployment · 增量同步与 GitHub Pages 部署

```bash
# 1. Run pre-publish security audit (zero API keys, tokens, or local paths)
python3 scripts/security_audit.py

# 2. Check modified files
git status

# 3. Stage, commit with AI collaboration trailer, and push
git add index.html README.md .gitignore .nojekyll styles/ src/ assets/ scripts/
git commit -m "feat(v2.10): upgrade arm-first lunge locomotion & time-ramped post-hit 3D broadcast replay

Co-authored-by: AI Coding Assistant <noreply@ai-assisted.local>"
git push
```

For first-time setup, replace `[Your Name / GitHub Username]` in `LICENSE`, initialize `main` pointing to `https://github.com/zhangjiaqi0627-coder/en-garde-3d.git`, push, and enable **Settings → Pages → Deploy from a branch (`main` / `/ (root)`)** (`.nojekyll` is included).

## Controls · 操作说明

| Mode · 模式 | Footwork & Evasion · 步法身位 | Guard Line · 控剑防线 | Attack & Remise · 出剑与补刺 | Parry, Super & Replay · 格挡/绝技/回放 |
| :--- | :--- | :--- | :--- | :--- |
| **1P / Academy (单人/学院)** | `A` Retreat · `D` Advance · `W` Jump · `S` Duck<br>*(后撤 / 前进 / 跃起 / 下蹲)* | Mouse or `1 / 2 / 3 / 4`<br>*(移动鼠标或数字键)* | Left-Click / `Space` (click in recovery for `Remise`)<br>*(左键/空格，收剑期再按补刺)* | Right-Click / `F` Parry · `E` Coup de Maître · `R` Replay<br>*(右键/F 格挡 · E 绝技 · R 慢镜回放)* |
| **2P Left (左屏 P1)** | `A` Retreat · `D` Advance · `W` Jump · `S` Duck | Mouse or `1 / 2 / 3 / 4` | Left-Click / `Space` | Right-Click / `F` · `R` Slow-Mo Replay |
| **2P Right (右屏 P2)** | `→` Retreat · `←` Advance · `↑` Jump · `↓` Duck | `I / O / K / L` or Numpad `7/9/4/6` | `Enter` / `J` / Numpad `0` | `P` / `;` |

## Project Structure · 目录结构

```text
├── index.html                        # Entry point & FIE broadcast HUD layout (应用入口与转播级界面)
├── styles/
│   └── fencing.css                   # Responsive typography, broadcast stingers & visor mesh (样式与动效)
├── assets/                           # Key-art posters & challenger portraits, EXIF-clean (主视觉与立绘)
├── src/
│   ├── config/constants.js           # Long-measure ranges, FIE spring thresholds & weapon constants (物理常量)
│   ├── data/curriculum.js            # 7 interactive academy lessons & 24 FR/EN/ZH flashcards (课纲与三语词卡)
│   ├── audio/sound-engine.js         # Zero-asset WebAudio synthesis, scoring buzzer & BGM (程序化音效与配乐)
│   ├── state/store.js                # Strict Proxy state store, replay impact index & recoil state (状态管理)
│   ├── rules/geometry.js             # 3D blade-segment collision, torque & surface contact solver (几何碰撞)
│   ├── controllers/combat-engine.js  # 120Hz physics loop, 0.28s post-hit buffer & ramped 3D replay (战斗引擎)
│   ├── renderer/fencer-3d-models.js  # C1-continuous Soie blade flex, 5-finger hand & Grand Palais 3D (三维建模)
│   ├── renderer/arena-3d-renderer.js # Arm-first lunge curves, dolly-zoom replay & 2-bone IK (三维渲染与回放)
│   └── ui/hud-and-app.js             # Input wiring, audio quiz, unit self-tests & main loop (交互绑定与自检)
├── scripts/
│   ├── security_audit.py             # Pre-publish secret, token & private-path scanner (安全审计脚本)
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

- **Human Direction & Curation · 人类主导设计与把关**: Core creative direction, Olympic Foil/Épée/Sabre rule differentiation, broadcast UI/UX aesthetic direction, iterative 3D anatomy, anti-clipping, Olympic lunge measure & ramped replay reviews, and live gameplay verification.  
- **AI-Generated Implementation & Assets · AI 辅助编码与资产生成**: Modular Vanilla JS/HTML5/CSS3 code, procedural Three.js PBR shaders/textures, analytical two-bone IK, 3D blade-segment torque & anatomical contact solvers, Web Audio synthesis, and illustrated key-art assets under `assets/`.

## License

Released under the [MIT License](./LICENSE). Copyright (c) 2026 zhangjiaqi0627-coder.
