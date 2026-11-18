# EN GARDE 3D · PARIS GRAND PALAIS

![Version: v2.10.0](https://img.shields.io/badge/Version-v2.10.0-f43f5e)
![Development: AI-Assisted](https://img.shields.io/badge/Development-AI--Assisted-8b5cf6)
![Engine: Three.js r128 WebGL](https://img.shields.io/badge/Engine-Three.js_r128_WebGL-0ea5e9)
![Physics: 120Hz FIE Simulation](https://img.shields.io/badge/Physics-120Hz_FIE_Mechanics-10b981)
![License: MIT](https://img.shields.io/badge/License-MIT-f59e0b)

> **全剑种 3D 击剑竞技与三语战术教学模拟（花剑 Fleuret · 重剑 Épée · 佩剑 Sabre）**  
> A zero-build, browser-native 3D Olympic fencing simulator featuring arm-first Olympic `Allongement` lunge kinematics, directional `Marche / Rompez` footwork, time-ramped (`0.48x → 0.20x`) post-hit 3D broadcast replays with dynamic dolly focus, non-penetrating 3D blade-on-blade contact, live FIE electrical lockout windows, and a trilingual (FR/EN/ZH) referee lexicon.

> [!NOTE]
> **AI-Assisted Development Disclosure / AI 辅助开发声明**  
> 本项目采用 **人类主导设计 + AI 辅助编码与资产生成（Human-Directed, AI-Assisted Development）** 完成，详情请参阅文末 [AI 辅助生成说明与贡献声明](#ai-disclosure--ai-辅助开发声明)。  
> This repository was created through human-directed iterative design with AI-generated code, procedural 3D shaders/textures, and illustrated key-art assets.

## 版本更新日志 / Changelog (For GitHub Sync)

### `v2.10.0` — 伸臂先行步法动力学与奥运转播级击中后变速 3D 回放升级（Locomotion & Post-Hit Replay Overhaul）
- **运动与步法动力学精进（Olympic `Allongement` & Directional Footwork）**：
  - **伸臂先行（`armExt` 领先 `bodyExt`）**：将持剑臂伸展曲线（$t^{0.62}$）与身体大弓步发力曲线（$t^{1.15}$）解耦，还原真实击剑“手臂率先突刺威胁、后腿随后爆发蹬跨”的鞭打节奏，后脚稳固锚定剑道。
  - **前进/后撤步态区分与重心微弹**：在 `Marche`（前进）与 `Rompez`（后撤）时分别赋予前脚/后脚错峰微抬与实时步频重心弹跳（`stepBounce`），并在 60Hz 回放快照中同步记录双方水平速度（`p1Vel / p2Vel`），让回放里的步法衔接同样流畅自然。
- **击中后 3D 慢镜回放升级（Time-Ramped Post-Hit Broadcast Replay）**：
  - **补全击中后 `0.28s` 余韵与受击缓冲帧**：不再在触发得分瞬间立刻截断录制，而是在 `HALT` 首拍继续记录约 9 帧受击躯干/面罩后仰顿挫与 22Hz 钢剑余振，使回放完整呈现“起势逼近 → 伸臂刺中 → 剑尖锁止微弯 → 受击后仰”的全过程。
  - **奥运转播级变速曲线（`0.48x → 0.33x → 0.20x`）与推近运镜**：起势试探阶段以 `0.48x` 流畅推进，临近命中帧自动降速至 **`0.20x` 超慢动作**，同时侧轨摄像机视场角从 `45°` 平滑推近至 `36°` 并将焦点偏转至受击方胸甲触点；回放框左上角同步显示实时倍速标签与 `TOUCHÉ ENREGISTRÉ` 亮灯指示。
- **涉及变更文件清单（Modified Files in `v2.10.0`）**：
  - `src/state/store.js`（新增回放命中帧索引 `replayImpactIndex` 与击中后余韵录制计时器 `replayPostRecordTimer`）
  - `src/controllers/combat-engine.js`（快照记录 `p1Vel / p2Vel`、击中后 `0.28s` 余韵帧录制及 `0.48x → 0.20x` 变速回放推进）
  - `src/renderer/arena-3d-renderer.js`（实装 `armExt / bodyExt` 伸臂先行曲线、方向性步法弹跳、回放推近运镜聚焦与实时倍速/亮灯提示）
  - `README.md`（新增 `v2.10.0` 运动与击中回放升级说明及 GitHub 增量同步指令）

### `v2.9.0` — 根治对手得分回放时“剑反刺自身”的轴向越界 Bug（Fix Opponent Hit Replay Self-Stabbing Bug）
- 调整 `poseFencer3D` 中自身胸前防穿模与对手胸甲间距限位的优先级顺序并加入剑尖严格朝前硬约束，同时在 3D 慢镜回放中动态对齐每帧胸甲触点并完整恢复状态。

### `v2.8.0` — 修正剑身弯曲极性（真实下垂定型 `Soie` 与外翻微弧）及主视角护手剑根共线对齐
- 将刺中时的法向挠度极性统一修正为真实花/重剑装柄定型（`Soie`）与旋外刺击时的自然下垂外张方向（`-Y`），并将第一视角剑根起点 `_pBladeStart` 改为严格沿“护手→剑尖”单位向量推进。

### `v2.7.0` — 根治击中时钢剑过度弯折与 C1 连续弱剑尖微弹性曲线升级（Subtle C1-Continuous Maraging Steel Flex）
- 修正持剑手护手盘与对手胸甲表面的轴向缓冲止停间距（`standOff = bladeLen - 0.045m`），并将梁变形插值方程升级为 $w(t) = 2.60 \cdot t^{1.45}(1-t)$。

### `v2.6.0` — 剑与剑三维非穿透接触约束、解剖分区触点锁止与受击后坐力重构
- 1:1 对齐物理与渲染层三维剑身世界坐标，实装双剑交锋非穿透弹性分离、主动格挡法线弹开与五区解剖靶面触点锁止。

### `v2.5.0` — 装备解剖微雕、踝部步法动力学与奥运导播细节打磨
- 新增五指微曲竞技平衡后手、三剑种护手盘内腔双插针电审插座、`FIE 800N` 护腕织唛、前垂导电护颈与圆弧包跟击剑鞋。

### `v2.4.0` — 远距实战控距与奥运全舒展大弓步重构
- 拉开实战起始站位至 `3.50m` 并拓展三剑种真实远距刺击区间（`2.92m–3.24m`），加入弓步前脚跟扎地制动。

### `v2.3.0` — 全方位三维防穿模重构与近身屈曲吸能升级
- 采用上下单层分区躯干与一体化双色 1600N 面罩，彻底消除破面闪烁。

### `v2.2.0` — 决胜瞬间 3D 慢镜回放、高模平滑法线与大皇宫场馆升级
- 新增 FIE 转播级 3D 慢镜回放系统（`Ralenti Officiel 3D`）与巴黎大皇宫北端荣誉阶梯。

### `v2.1.0` — 国际剑联真实交锋物理与开源工程规范化
- 实装三维强弱剑身力矩碰撞、接地护手盘弹开、FIE 弹簧剑头压力阈值、`45ms / 170ms / 200ms` 电审闭锁窗与开源安全审计脚本。

## 核心特性 / Highlights

### 1. 真实比赛级远距控距与 120Hz 交锋物理（Real-Match Measure & FIE Physics）
- **伸臂先行步法与全舒展大弓步（`Allongement` & `La Fente Allongée`）**：双方在 `2.65m–3.24m` 真实赛场距离博弈试探，出剑遵循“手臂率先突刺 + 后腿锚定爆发蹬跨 + 前脚跟扎地制动 + 五指后手水平展翼”。
- **剑与剑三维非穿透接触与强弱力矩（3D Non-Penetrating Blade Bind & Leverage）**：实时求解两把三维钢剑线段最近点、法线推力与力臂比（`τ = F · s`）。以强剑身（Forte）压制对手弱剑尖（Foible）可打出 `1.5x–2.8x` 压剑封线（`Prise de Fer`）。
- **解剖靶区表面锁止、真实下垂微弧与受击后坐力**：剑尖严格锁止在对应解剖部位外表面并呈现 `2.5cm–4.2cm` 的自然下垂外张微弧，同时受击方躯干与面罩产生真实的物理顿挫后仰。
- **FIE 弹簧剑头压力阈值与实时电审闭锁窗（Boîtier Électrique）**：还原花剑 `> 4.90N`、重剑 `> 7.35N` 轴向触发力与 `45ms / 170ms / 200ms` 毫秒级电审闭锁倒计时窗。

### 2. 原生 WebGL Three.js 零穿模精雕高模与变速回放导播
- **精雕解剖高模与 PBR 材质**：一体化双色 1600N 金属网面罩、前垂导电护颈与头线、五指微曲后手、带内腔插座的三剑种护手盘、800N 凯夫拉斜纹剑服、花剑银镍/佩剑香槟金金属衣与圆弧包跟击剑鞋。
- **大皇宫赛场与变速 3D 慢镜回放（`0.48x → 0.20x`）**：每剑得分后自动推近至受击胸甲触点，以 `0.20x` 超慢动作完整重现起势、刺中微弧、受击后仰与亮灯全过程（支持 `[R]` 键重播或空格/左键跳过）。

## 快速运行与 GitHub 同步指南 / Quick Start & GitHub Sync

本项目为 **纯前端零构建依赖（Zero-Build Static Web App）**，无需 `npm install`，不包含任何后端或付费 API 调用。

### 本地运行 / Run Locally

```bash
python3 -m http.server 8080
# 浏览器打开 Open http://localhost:8080
```

> **推荐环境 / Recommended Browser**：桌面端 **Chrome** 或 **Edge**（开启硬件加速 WebGL；法语/英语裁判语音基于浏览器内置 `Web Speech API`）。

### 本地 AI Agent 增量同步至 GitHub 指引 / Sync Guide for Local AI Agent

当你下载新版压缩包准备同步更新已有的本地 GitHub 仓库时，可直接将新版文件覆盖至本地仓库目录（**注意保留本地 `LICENSE` 中已填写好的个人署名**），并让本地 AI Agent 执行以下标准流程：

```bash
# 1. 运行上传前安全自检，确保无任何密钥或本地绝对路径泄露
python3 scripts/security_audit.py

# 2. 查看本次版本变更文件（对照上方 Changelog v2.10.0 清单）
git status

# 3. 暂存并附带 AI 协同尾注提交推送至远端
git add index.html README.md .gitignore .nojekyll styles/ src/ assets/ scripts/
git commit -m "feat(v2.10): upgrade arm-first lunge locomotion & time-ramped post-hit 3D broadcast replay

Co-authored-by: AI Coding Assistant <noreply@ai-assisted.local>"
git push
```

若是**首次初始化上传**，在项目根目录执行：

```bash
python3 scripts/security_audit.py
# 先将 LICENSE 中的 [Your Name / GitHub Username] 替换为你的 GitHub 用户名
git init && git add .
git commit -m "feat: release En Garde 3D v2.10 fencing simulator

Co-authored-by: AI Coding Assistant <noreply@ai-assisted.local>"
git branch -M main
git remote add origin https://github.com/<your-username>/en-garde-3d.git
git push -u origin main
```

随后在仓库 **Settings → Pages → Build and deployment** 中选择 `Deploy from a branch`（`main` 分支 `/ (root)` 目录），即可开启在线试玩网页。

## 操作说明 / Controls

| 模式 / Mode | 步法与身位 / Footwork | 控剑防线 / Guard Line | 出剑与补刺 / Attack & Remise | 格挡、绝技与回放 / Parry & Replay |
| :--- | :--- | :--- | :--- | :--- |
| **1P / 学院模式** | `A` 后撤 · `D` 前进 · `W` 跃起 · `S` 下蹲 | 移动鼠标 或 `1 / 2 / 3 / 4` | 鼠标左键 / `Space`（收剑期再按触发 `Remise`） | 右键 / `F` 格挡 · `E` 绝技 · `R` 慢镜回放 |
| **2P 左屏 (P1)** | `A` 后撤 · `D` 前进 · `W` 跃起 · `S` 下蹲 | 鼠标 或 `1 / 2 / 3 / 4` | 鼠标左键 / `Space` | 鼠标右键 / `F` · `R` 慢镜回放 |
| **2P 右屏 (P2)** | `→` 后撤 · `←` 前进 · `↑` 跃起 · `↓` 下蹲 | `I / O / K / L` 或小键盘 `7/9/4/6` | `Enter` / `J` / 小键盘 `0` | `P` / `;` |

## 目录结构 / Project Structure

```text
├── index.html                        # 应用入口与 FIE 转播级 HUD 布局
├── styles/
│   └── fencing.css                   # 响应式排版、斜切转场与护面网罩样式
├── assets/                           # 三剑种主视觉海报与三位挑战者头像 (无 EXIF 隐私信息)
├── src/
│   ├── config/constants.js           # 远距实战控距、FIE 弹簧阈值与武器物理常量
│   ├── data/curriculum.js            # 7 节互动教学课纲与 24 张中/英/法术语词卡
│   ├── audio/sound-engine.js         # 双簧片电审蜂鸣、弹簧剑头咔哒声与合成器配乐引擎
│   ├── state/store.js                # 严格代理校验的分区状态库、回放命中索引与后坐力状态
│   ├── rules/geometry.js             # 三维剑身线段碰撞、强弱力矩与解剖靶区表面接触求解器
│   ├── controllers/combat-engine.js  # 120Hz 物理主循环、余韵帧录制与变速 3D 回放控制器
│   ├── renderer/fencer-3d-models.js  # C1 连续弱剑尖微弹性钢剑、五指后手与大皇宫场馆建模
│   ├── renderer/arena-3d-renderer.js # 伸臂先行步法曲线、推近回放运镜与 3D 慢镜导播
│   └── ui/hud-and-app.js             # 事件绑定、词卡听音测验、内置单元测试与帧循环
├── scripts/
│   └── security_audit.py             # 上传前密钥、Token 与本地隐私路径自检脚本
├── .gitignore                        # 排除 .env、私钥证书与系统缓存文件
├── .nojekyll                         # GitHub Pages 纯静态目录直出标记
└── LICENSE                           # MIT 开源许可证
```

## 安全与隐私说明 / Security & Privacy Audit

- **零密钥与零外部请求**：全仓不含任何第三方大模型或云服务 API Key，无任何 `fetch` / `XMLHttpRequest` / `WebSocket` 数据外发请求；比赛奖牌进度仅保存在浏览器本地 `localStorage`。
- **公共静态依赖**：仅通过公共无密钥 CDN 加载 `Three.js r128`、`Tailwind CSS 3.4.17` 与 `Google Fonts` 字体。每次修改后可运行 `python3 scripts/security_audit.py` 进行上传前复检。

## AI Disclosure / AI 辅助开发声明

遵循开源社区透明化惯例（Open-Source AI Transparency Convention），特此声明本项目的创作分工：

- **人类创作者主导（Human Direction & Curation）**：核心创意立意、花/重/佩三剑种竞技规则差异化拆解、UI 去同质化审美把控、三维解剖建模、防穿模机制、奥运舒展弓步控距及变速回放体验的多轮迭代评审与实机验收。
- **AI 辅助生成（AI-Generated Implementation & Assets）**：模块化前端代码（HTML5 / CSS3 / Vanilla JS）、Three.js 程序化 PBR 材质与双骨骼逆运动学算法、三维线段力矩与解剖靶区物理求解器、Web Audio 实时音效合成及 `assets/` 目录下的概念插画素材均由 AI 辅助编写与生成。

## License

Released under the [MIT License](./LICENSE). 首次上传前请将 `LICENSE` 文件中的 `[Your Name / GitHub Username]` 替换为你的署名或 GitHub ID。
