// Module 2: 24-Card Trilingual FIE Flashcard Deck & 7-Lesson Interactive Fencing Academy Data

const FLASHCARD_DECK = Object.freeze([
  {
    id: 'en_garde', cat: 'referee', catLabel: 'REFEREE · 裁判口令',
    fr: 'En garde !', phonetic: '[ɑ̃ ɡaʁd] · ahn GARD · 昂-嘎赫德',
    en: 'On Guard!', enSub: 'Assume your ready stance behind the line',
    zh: '实战姿势（各就各位）', zhSub: '每回合开局第一道口令',
    desc: 'First command of every phrase: both fencers take a balanced side stance behind their en-garde lines with bell guards covering their primary line. · 裁判开局第一拍口令，双方于实战线后摆好防守架势。',
    example: 'En garde ! Messieurs, êtes-vous prêts ? Allez !',
    control: 'Mechanic: Beat 1 of the 3-beat referee start cadence · 开局三拍口令第 1 拍', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'prets', cat: 'referee', catLabel: 'REFEREE · 裁判口令',
    fr: 'Êtes-vous prêts ?', phonetic: '[ɛt vu pʁɛ] · et voo PREH · 艾特-乌-普黑',
    en: 'Are You Ready?', enSub: 'Final confirmation before combat starts',
    zh: '预备好了吗？', zhSub: '开局第二拍确认口令',
    desc: 'Referee confirms both fencers are ready; false-starting before "Allez!" is strictly prohibited. · 确认双方就绪，Allez 响起前严禁抢攻。',
    example: 'En garde ! ... Prêts ? ... Allez !',
    control: 'Mechanic: Read your opponent\'s initial guard sector · 观察对手起手防区', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'allez', cat: 'referee', catLabel: 'REFEREE · 裁判口令',
    fr: 'Allez !', phonetic: '[a.le] · ah-LAY · 阿-蕾',
    en: 'Fence! / Play!', enSub: 'Begin active combat immediately',
    zh: '开始！（交锋开始）', zhSub: '正式进入计时与交锋状态',
    desc: 'Signal to begin live combat. In Sabre, both fencers explode off the line on "Allez!" to contest the center 4-meter zone. · 开战信号，佩剑常在此瞬间爆发抢攻。',
    example: 'Prêts ? ... Allez ! Attaque à droite !',
    control: 'Control: Press D on "Allez!" to march and claim initiative · 按 D 前压争夺先手', tryWeapon: WeaponId.SABRE
  },
  {
    id: 'halte', cat: 'referee', catLabel: 'REFEREE · 裁判口令',
    fr: 'Halte !', phonetic: '[alt] · ALT · 阿尔特',
    en: 'Halt!', enSub: 'Stop fencing immediately',
    zh: '停！（中止交锋）', zhSub: '亮灯、出界或冲撞违例时立即停表',
    desc: 'Freezes the clock immediately when a scoring lamp lights, a fencer crosses the rear limit, or Corps-à-Corps collision occurs. · 亮灯、出界或贴身冲撞时裁判立即喊停。',
    example: 'Halte ! Corps-à-corps à gauche, carton jaune !',
    control: 'Mechanic: Triggers slow-motion replay & referee call · 触发慢镜与裁决', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'touche', cat: 'referee', catLabel: 'REFEREE · 裁判口令',
    fr: 'Touché ! Point !', phonetic: '[tu.ʃe pwɛ̃] · too-SHAY pwan · 图-谢 普万',
    en: 'Hit! Point Awarded!', enSub: 'Valid touch scored on target',
    zh: '刺中 / 劈中得分！', zhSub: '有效部位亮起红灯或绿灯并获判 1 分',
    desc: 'After verifying target validity, lockout window, and right-of-way, the referee awards 1 point to the scoring fencer. · 有效命中并通过优先权或闭锁判定后获判 1 分。',
    example: 'Attaque de la gauche, touché, point à gauche !',
    control: 'Mechanic: Valid hit triggers 0.22x bullet-time & +1 score · 有效命中慢镜加分', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'hors_cible', cat: 'referee', catLabel: 'REFEREE · 裁判口令',
    fr: 'Non valable (Hors cible)', phonetic: '[ɔʁ sibl] · or SEEBL · 奥赫-西布勒',
    en: 'Off-Target (White Light)', enSub: 'Hit landed outside valid conductive lamé',
    zh: '无效部位（亮白灯停表）', zhSub: '花剑刺中四肢或面罩等金属背心以外区域',
    desc: 'In Foil, only the conductive torso lamé is valid; hitting limbs or mask illuminates a white lamp and halts play without scoring. · 花剑刺中金属背心外亮白灯停表、不计分。',
    example: 'Attaque non valable à gauche, hors cible !',
    control: 'Mechanic: Excessive wrist jitter scatters Foil thrusts off-target · 乱晃手腕易偏靶白灯', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'simultane', cat: 'referee', catLabel: 'REFEREE · 裁判口令',
    fr: 'Actions simultanées', phonetic: '[ak.sjɔ̃ si.myl.ta.ne] · see-mool-tah-NAY · 西谬塔内',
    en: 'Simultaneous Actions', enSub: 'Both fencers attacked at the exact same moment',
    zh: '同时进攻（互中不计分）', zhSub: '花剑/佩剑双方同时起动互中，均不得分',
    desc: 'In Foil and Sabre, if both fencers launch attacks simultaneously with neither holding priority, both lamps cancel out with no point awarded. · 花佩剑无先后同时互中不计分重来。',
    example: 'Actions simultanées, pas de touche ! En garde !',
    control: 'Mechanic: Neutral double-lights award 0 points in Foil/Sabre · 均势双灯不计分', tryWeapon: WeaponId.SABRE
  },
  {
    id: 'quarte', cat: 'guard', catLabel: 'PARRY & GUARD · 防线与格挡',
    fr: 'Quarte (4e position)', phonetic: '[kaʁt] · KART · 卡赫特',
    en: 'Fourth Position (High Inside)', enSub: 'Protects upper-inside chest / left cheek',
    zh: '四号位防守（上内线 / 左立剑）', zhSub: '花重剑护左上胸，佩剑左立剑护左面',
    desc: 'Classic lateral parry sweeping the bell guard left to close the high-inside chest line (or vertical sabre edge protecting the left cheek). · 护手盘左移封闭上内线或佩剑左面。',
    example: 'Parade de quarte et riposte directe, touché !',
    control: 'Control: Move mouse Top-Left or press [1] · 鼠标移至左上或按 1 键', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'sixte', cat: 'guard', catLabel: 'PARRY & GUARD · 防线与格挡',
    fr: 'Sixte (6e) / Tierce (3e)', phonetic: '[sikst / tjɛʁs] · SEEKST / TYERS · 西克斯特',
    en: 'Sixth / Third Position (High Outside)', enSub: 'Standard en-garde line protecting sword arm',
    zh: '六号位 / 佩剑三号位（上外线）', zhSub: '默认实战起手防线，重点保护持剑手腕',
    desc: 'Default classical en-garde line: Sixte in Foil/Épée closes the high-outside line and shields the exposed wrist; Tierce in Sabre guards the flank/arm. · 默认基准防线，重点保护持剑手腕右臂。',
    example: 'Engagement en sixte, opposition au poignet !',
    control: 'Control: Move mouse Top-Right or press [2] · 鼠标移至右上或按 2 键', tryWeapon: WeaponId.EPEE
  },
  {
    id: 'quinte', cat: 'guard', catLabel: 'PARRY & GUARD · 防线与格挡',
    fr: 'Quinte (5e position Sabre)', phonetic: '[kɛ̃t] · KANT · 坎特',
    en: 'Fifth Position (Overhead Roof Guard)', enSub: 'Horizontal sabre blade raised above mask',
    zh: '五号位横刀架顶（佩剑专属防头）', zhSub: '刀身横置头顶上方拦截当头直劈',
    desc: 'Signature Sabre overhead parry! Raise the hilt and hold the blade horizontally above your mask to block descending head cuts (Coup à la Tête). · 佩剑专属横刀架顶，拦截当头直劈。',
    example: 'Parade de quinte haute, riposte au flanc, point !',
    control: 'Control: Raise mouse Top-Center in Sabre mode · 佩剑鼠标上抬架顶', tryWeapon: WeaponId.SABRE
  },
  {
    id: 'septime_octave', cat: 'guard', catLabel: 'PARRY & GUARD · 防线与格挡',
    fr: 'Septime (7e) & Octave (8e)', phonetic: '[sɛp.tim / ɔk.tav] · sep-TEEM / ok-TAHV · 七八号位',
    en: 'Seventh & Eighth (Low Lines)', enSub: 'Semi-circular parries defending lower abdomen & thigh',
    zh: '七号位与八号位（下内线 / 下外线）', zhSub: '剑尖下沉画半圆拦截低位潜刺与点脚',
    desc: 'Semi-circular low-line parries dropping the tip to sweep away ducking thrusts (Passata Sotto) or Épée foot/knee snipes. · 剑尖下沉拦截下蹲潜刺与重剑点脚。',
    example: 'Parade d\'octave en bas, riposte au corps !',
    control: 'Control: Move mouse Bottom-Left (7) or Bottom-Right (8/2) · 左下7号 / 右下8号', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'parade_riposte', cat: 'guard', catLabel: 'PARRY & GUARD · 防线与格挡',
    fr: 'Parade-Riposte', phonetic: '[pa.ʁad ʁi.pɔst] · pah-RAHD ree-POST · 格挡还击',
    en: 'Parry and Riposte', enSub: 'Deflecting an attack to seize right-of-way and counter-strike',
    zh: '格挡还击（防反夺权）', zhSub: '击剑攻防转换最核心的得分手段',
    desc: 'Deflecting an opponent\'s attack with your Forte immediately transfers 100% right-of-way to you; timing within 140ms triggers a Perfect Parry! · 格挡瞬间夺回100%优先权，精准迎击触发完美弹反。',
    example: 'Parade parfaite et riposte immédiate, touché !',
    control: 'Control: Swipe into red threat sector / RMB, then LMB to Riposte · 右键格挡后立即左键还击', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'marche_rompre', cat: 'attack', catLabel: 'FOOTWORK & ATTACK · 步法与进攻',
    fr: 'Marche & Rompre', phonetic: '[maʁʃ / ʁɔ̃pʁ] · MARSH / ROHMPR · 前进与后撤',
    en: 'Advance & Retreat', enSub: 'Fundamental footwork controlling fencing measure',
    zh: '前进步与后撤步（控距步法）', zhSub: '击剑70%的胜负取决于距离控制（Mesure）',
    desc: 'Advancing (Marche) builds offensive priority; retreating (Rompre) pulls measure so opponent lunges fall short. Avoid marching too long without striking! · D 前进建立主动，A 后撤拉距诱空。',
    example: 'Attaque en marchant, fente directe !',
    control: 'Control: [D] Advance · [A] Retreat · D 键前压 / A 键后撤', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'fente', cat: 'attack', catLabel: 'FOOTWORK & ATTACK · 步法与进攻',
    fr: 'La Fente (Lunge)', phonetic: '[la fɑ̃t] · lah FAHNT · 弓步突刺',
    en: 'The Lunge', enSub: 'Explosive rear-leg drive with full sword-arm extension',
    zh: '弓步突刺 / 弓步劈斩', zhSub: '先伸持剑臂、后腿猛蹬爆发跨步的终结动作',
    desc: 'Point leads the body: extend the weapon arm first to establish priority, then drive explosively off the rear leg to close measure. · 剑尖先行、手臂引体，后腿爆发蹬地突刺。',
    example: 'Allongement du bras et fente en sixte, touché !',
    control: 'Control: Left-Click (LMB) or [Space] inside optimal measure · 最佳射程内按左键或空格', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'fleche_flunge', cat: 'attack', catLabel: 'FOOTWORK & ATTACK · 步法与进攻',
    fr: 'Flèche & Flunge', phonetic: '[flɛʃ / flʌndʒ] · FLESH / FLUNJ · 飞冲与飞跃',
    en: 'Arrow Charge & Flying Lunge', enSub: 'Explosive running blitz (Foil/Épée) vs airborne leap cut (Sabre)',
    zh: '飞冲刺（花重剑）与飞跃斩（佩剑）', zhSub: '佩剑严禁交叉步冲刺，故演化出腾空飞跃劈砍',
    desc: 'Foil & Épée permit explosive crossover sprinting charges (Flèche); Sabre bans forward foot crossovers, birthing the airborne leaping Flunge! · 花重剑交叉步飞冲，佩剑双脚腾空飞跃劈斩。',
    example: 'Flunge spectaculaire à la tête, point !',
    control: 'Control: Fill Master Gauge to 100% then press [E] · 满气槽按 E 释放绝技', tryWeapon: WeaponId.SABRE
  },
  {
    id: 'feinte_degagement', cat: 'attack', catLabel: 'FOOTWORK & ATTACK · 步法与进攻',
    fr: 'Feinte-Dégagement', phonetic: '[fɛ̃t de.ɡaʒ.mɑ̃] · FANT day-gahzh-MAHN · 虚晃变线',
    en: 'Feint-Disengage', enSub: 'Faking into one line then dipping under the bell guard to hit open line',
    zh: '虚晃绕剑变线攻', zhSub: '假刺诱骗对手移动护手盘，瞬间从下方绕入空当',
    desc: 'Threaten one sector (amber pulse warning) to bait a premature parry, then spiral the tip smoothly underneath the opponent\'s bell guard into the open line. · 假刺骗挡（黄光预警），瞬间绕过护手盘刺入空当。',
    example: 'Feinte en quarte, dégagement en sixte, touché !',
    control: 'Counterplay: Hold steady on yellow feints; parry only on red! · 黄光忍住，红光再挡', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'battement_coupe', cat: 'attack', catLabel: 'FOOTWORK & ATTACK · 步法与进攻',
    fr: 'Battement & Coupé', phonetic: '[bat.mɑ̃ / ku.pe] · baht-MAHN / koo-PAY · 敲剑与挑剑',
    en: 'Beat Attack & Cut-Over', enSub: 'Striking opponent\'s blade aside or lifting over the tip',
    zh: '敲剑进攻与挑剑越尖攻', zhSub: '破除对手伸臂亮剑（Pointe en Ligne）的利器',
    desc: 'Crisply strike the opponent\'s foible to knock their guard open and seize priority (Battement), or lift cleanly over their point into an open high line (Coupé). · 强剑身敲击夺权或挑剑越过剑尖换线。',
    example: 'Battement sur le fer et attaque directe !',
    control: 'Control: Flick swiftly across opponent\'s guard dot to beat their blade · 快速滑过对手剑位敲剑夺权', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'pointe_en_ligne', cat: 'rules', catLabel: 'WEAPONS & RULES · 剑种与规则',
    fr: 'Pointe en Ligne', phonetic: '[pwɛ̃t ɑ̃ liɲ] · pwant ahn LEENY · 伸臂亮剑',
    en: 'Point-in-Line', enSub: 'Extended straight arm with weapon tip threatening valid target',
    zh: '伸臂亮剑（直线威慑先手）', zhSub: '在对手发起进攻前提前伸直手臂将剑尖对准靶心',
    desc: 'Special Foil/Sabre priority rule: establishing a straight arm with point threatening target BEFORE the opponent starts an attack wins right-of-way unless beaten aside! · 提前伸直手臂对准靶心可获先手威慑。',
    example: 'Pointe en ligne maintenue, attaque adverse sans battement, point à gauche !',
    control: 'Control: Hold center guard steadily for 0.42s in Foil · 花剑稳守中心 0.42s 激活亮剑', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'priorite', cat: 'rules', catLabel: 'WEAPONS & RULES · 剑种与规则',
    fr: 'Priorité (Convention)', phonetic: '[pʁi.jɔ.ʁi.te] · pree-or-ee-TAY · 进攻优先权',
    en: 'Right-of-Way', enSub: 'Initiative rule governing Foil and Sabre double-lights',
    zh: '进攻优先权法则', zhSub: '花剑与佩剑的灵魂——谁握有主动权谁在双灯时得分',
    desc: 'Governs Foil & Sabre double-lights: the fencer who initiates the attack first, beats the blade, or parries holds Priority; missing or getting parried forfeits it immediately. · 花佩剑双灯裁决核心：主动进攻、敲剑或格挡者得分。',
    example: 'Attaque composée à gauche, priorité maintenue !',
    control: 'HUD: Track the live PRIORITÉ tug-of-war bar under the scorebug · 顶部拔河条实时显示优先权', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'coup_double_epee', cat: 'rules', catLabel: 'WEAPONS & RULES · 剑种与规则',
    fr: 'Coup Double (Épée 40ms)', phonetic: '[ku dubl] · koo DOOBL · 重剑双灯互中',
    en: 'Double Touch (40ms Lockout)', enSub: 'Both fencers score 1 point if hits land within 40 milliseconds',
    zh: '重剑同时互中（双灯同得）', zhSub: '无优先权约束，40毫秒内互中双方各加 1 分',
    desc: 'Épée has no right-of-way and full-body target: if both fencers depress their 7.35N tips within 40–45ms, both lamps light and both score +1! Beat them by >45ms for a single light. · 重剑无优先权，45ms内互中双灯同得。',
    example: 'Coup double ! Un point partout !',
    control: 'Tactic: Snipe the exposed wrist from 2.74m to lock out single-light · 远距狙击手腕打单灯', tryWeapon: WeaponId.EPEE
  },
  {
    id: 'saignee_poignet', cat: 'rules', catLabel: 'WEAPONS & RULES · 剑种与规则',
    fr: 'Saignée au Poignet & Pied', phonetic: '[sɛ.ɲe o pwa.ɲɛ] · sen-YAY oh pwan-YAY · 狙腕与点脚',
    en: 'Wrist Snipe & Foot Touch', enSub: 'Targeting the closest exposed extremity in Épée',
    zh: '重剑狙击手腕与下潜点脚', zhSub: '手腕比躯干近约 36 厘米，是重剑博弈第一要害',
    desc: 'Because the sword wrist sits ~36cm closer than the chest, Épée masters pick off the exposed forearm/wrist (Poignet) or lead foot (Pied) from outside torso lunge range. · 手腕比躯干近36cm，是重剑远距第一靶点。',
    example: 'Arrêt au temps sur le poignet, une seule lumière !',
    control: 'Control: Aim Top-Right (Poignet) in Épée to snipe from 2.74m · 重剑右上防区远距狙腕', tryWeapon: WeaponId.EPEE
  },
  {
    id: 'coup_de_taille', cat: 'rules', catLabel: 'WEAPONS & RULES · 剑种与规则',
    fr: 'Coup de Taille (Sabre)', phonetic: '[ku də taj] · koo duh TAH-yuh · 佩剑挥斩',
    en: 'Sabre Cutting / Slashing', enSub: 'Scoring with the front edge, flat, or back third of the blade',
    zh: '佩剑劈砍有效（腰线以上）', zhSub: '佩剑以刃口挥斩为主，腰部以下击中无效不停表',
    desc: 'Descended from cavalry swordsmanship: any cut with the edge, flat, or back third of the blade above the waist scores immediately; low hits below the waist (Coup Bas) do not halt play. · 佩剑腰上刀刃碰触即得分，腰下无效不停表。',
    example: 'Moulinet coup à la tête, touché !',
    control: 'Control: Sweep mouse briskly or Left-Click to unleash Sabre arcs · 佩剑挥鼠或左键弧形劈斩', tryWeapon: WeaponId.SABRE
  },
  {
    id: 'opposition_fer', cat: 'rules', catLabel: 'WEAPONS & RULES · 剑种与规则',
    fr: 'Opposition & Enveloppement', phonetic: '[ɔ.pɔ.zi.sjɔ̃] · oh-poh-zee-SYOHN · 抗剑与绞剑',
    en: 'Blade Bind & Circular Taking', enSub: 'Maintaining steel-on-steel leverage while thrusting',
    zh: '抗剑压制与螺旋绞剑', zhSub: '双剑交接时利用杠杆力封死对手反击线路',
    desc: 'Pressing your strong Forte against the opponent\'s weak Foible (Fer sur Fer) or circling their blade (Enveloppement) locks out their counter-attack while driving your point home. · 以强剑身压制弱剑尖或画圆绞剑破防。',
    example: 'Attaque par opposition en sixte, touché !',
    control: 'Control: Hold reticle against rival guard or draw a 360° circle · 贴近护手抗剑或画圈绞剑', tryWeapon: WeaponId.EPEE
  },
  {
    id: 'corps_a_corps_esquive', cat: 'rules', catLabel: 'WEAPONS & RULES · 剑种与规则',
    fr: 'Corps-à-Corps & Esquive', phonetic: '[kɔʁ a kɔʁ / ɛs.kiv] · kor ah KOR / es-KEEV · 冲撞与闪避',
    en: 'Illegal Body Collision & Ducking Evasion', enSub: 'Yellow/Red card penalty vs clean vertical dodge',
    zh: '贴身冲撞罚牌与下潜闪避', zhSub: '恶意冲撞吃黄红牌；灵巧蹲跳闪避可直接防反',
    desc: 'Barging closer than 1.18m causes illegal Corps-à-Corps (Yellow Card warning, then Red Card penalty point), whereas cleanly ducking under a high lunge ([S] Esquive) opens an instant counter! · 恶意贴身冲撞罚黄红牌，按 S 下蹲闪避可华丽反杀。',
    example: 'Esquive sous l\'attaque haute, remise au corps, touché !',
    control: 'Control: Press [S] to duck high attacks · Press [W] to jump low sweeps · S 下蹲躲上路 / W 跃起躲下路', tryWeapon: WeaponId.FOIL
  }
]);

const TUTORIAL_LESSONS = Object.freeze([
  {
    step: 1,
    weapon: WeaponId.FOIL,
    title: '1. Foil 4-Quadrant Guard Lines (4 / 6 / 7 / 8) · 花剑四象限防线',
    theory: 'Foil divides target defense into Quarte (4 Top-Left), Sixte (6 Top-Right), Septime (7 Low-Left), and Octave (8 Low-Right). Glide your mouse smoothly without erratic jerking. · 平稳移动鼠标依次切换 4/6/7/8 四个剑位扇区。',
    taskPrompt: 'Smoothly visit all 4 guard sectors (4, 6, 7, 8) · 平稳点亮四个剑位扇区',
    goalCount: 4
  },
  {
    step: 2,
    weapon: WeaponId.FOIL,
    title: '2. Footwork Measure & Vertical Evasion (WASD) · 控距步法与立体闪避',
    theory: 'Optimal Foil measure is 1.65m–2.38m (colliding <1.18m draws a Yellow Card). Press [W] to leap over low sweeps and [S] to duck high lunges. · 保持最佳交锋距离，演练前进、后撤与跳蹲闪避。',
    taskPrompt: 'Perform [D] Advance, [A] Retreat, and [W/S] Jump/Duck once each · 完成前进、后撤与跳蹲',
    goalCount: 3
  },
  {
    step: 3,
    weapon: WeaponId.FOIL,
    title: '3. Direct Lunge into Open Line (Fente Directe) · 瞄准空当弓步直刺',
    theory: 'In Foil, only the metallic torso lamé scores (limbs trigger off-target White Light). Bypass the Coach\'s closed Quarte (4) guard and lunge into an open quadrant! · 避开教练封闭的4号位，瞄准空当刺中躯干。',
    taskPrompt: 'Aim at an open sector and press LMB / Space to score 2 valid touches · 刺中空当躯干 2 次',
    goalCount: 2
  },
  {
    step: 4,
    weapon: WeaponId.FOIL,
    title: '4. Parry-Riposte & Right-of-Way · 完美弹反与防反还击',
    theory: 'When the opponent attacks first, they hold Priority. Watch the red warning arc, swipe into the matching quadrant (or press RMB) to parry, then immediately Left-Click to Riposte! · 迎向红光格挡夺权后立即左键还击。',
    taskPrompt: 'Parry the Coach\'s attack and score 2 Riposte touches · 格挡并还击得 2 分',
    goalCount: 2
  },
  {
    step: 5,
    weapon: WeaponId.FOIL,
    title: '5. Reading Feints & Duck Counter (Feinte & Esquive) · 识破虚晃假动作',
    theory: 'Amber pulsing arcs indicate a fake Feint (biting early locks your guard!). Wait for the red real lunge to parry, or press [S] to duck underneath and counter-strike! · 黄光虚晃忍住别抢挡，等变红光再挡或按 S 下蹲反杀。',
    taskPrompt: 'Outsmart the yellow feint via delayed parry or [S] duck-counter (2 pts) · 识破假动作反击得 2 分',
    goalCount: 2
  },
  {
    step: 6,
    weapon: WeaponId.EPEE,
    title: '6. Épée Mastery: 2.74m Wrist Snipe & 45ms Lockout · 重剑远距狙腕与双灯',
    theory: 'Épée projects 3 range rings on the piste: the Wrist (POIGNET) is 0.36m closer than the chest, letting you snipe single-lights from 2.70m! Mutual hits ≤45ms award +1 to both. · 瞄准右上腕部或右下脚面远距狙击单灯。',
    taskPrompt: 'Aim Top-Right (Wrist) or Bottom-Right (Foot) for 2 long-range Épée touches · 远距狙腕或点脚得 2 分',
    goalCount: 2
  },
  {
    step: 7,
    weapon: WeaponId.SABRE,
    title: '7. Sabre Mastery: Quinte Roof Guard & Moulinet Cuts · 佩剑架顶与劈砍',
    theory: 'Sabre scores with blade edges above the waist! Raise your mouse Top-Center for Quinte (5) Overhead Guard against head cuts, and sweep or Left-Click for blazing Moulinet slashes! · 上抬鼠标5号架顶防头，挥鼠或左键劈砍毕业。',
    taskPrompt: 'Score 2 Sabre touches via Quinte parry-riposte or Moulinet cuts · 佩剑架顶反击或劈砍得 2 分',
    goalCount: 2
  }
]);
