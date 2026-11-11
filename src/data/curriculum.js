// Module 2: 24-Card Trilingual FIE Flashcard Deck & 7-Lesson Interactive Fencing Academy Data

const FLASHCARD_DECK = Object.freeze([
  {
    id: 'en_garde', cat: 'referee', catLabel: '裁判口令 · REFEREE',
    fr: 'En garde !', phonetic: '[ɑ̃ ɡaʁd] · 昂-嘎赫德',
    en: 'On Guard!', enSub: 'Assume your ready stance behind the line',
    zh: '实战姿势（各就各位）', zhSub: '每回合开局第一道口令',
    desc: '裁判宣布每一剑开始的第一声指令，双方剑手需侧身站在各自实战线后，前膝微屈、护手盘护住防线。',
    example: 'En garde ! Messieurs, êtes-vous prêts ? Allez !',
    control: '对应机制：开局三拍执裁口令第 1 拍', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'prets', cat: 'referee', catLabel: '裁判口令 · REFEREE',
    fr: 'Êtes-vous prêts ?', phonetic: '[ɛt vu pʁɛ] · 艾特-乌-普黑',
    en: 'Are You Ready?', enSub: 'Final confirmation before combat starts',
    zh: '预备好了吗？', zhSub: '开局第二拍确认口令',
    desc: '裁判确认双方剑手器材正常且做好心理与距离准备；在“Allez”响起前严禁提前抢攻。',
    example: 'En garde ! ... Prêts ? ... Allez !',
    control: '对应机制：观察对手站姿与初始防区', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'allez', cat: 'referee', catLabel: '裁判口令 · REFEREE',
    fr: 'Allez !', phonetic: '[a.le] · 阿-蕾',
    en: 'Fence! / Play!', enSub: 'Begin active combat immediately',
    zh: '开始！（交锋开始）', zhSub: '正式进入计时与交锋状态',
    desc: '裁判发出的开战信号。佩剑项目中双方往往在 Allez 瞬间同时启动向中央 4 米区爆发抢攻。',
    example: 'Prêts ? ... Allez ! Attaque à droite !',
    control: '对应机制：听到 Allez 后按 D 前压争夺先手', tryWeapon: WeaponId.SABRE
  },
  {
    id: 'halte', cat: 'referee', catLabel: '裁判口令 · REFEREE',
    fr: 'Halte !', phonetic: '[alt] · 阿尔特',
    en: 'Halt!', enSub: 'Stop fencing immediately',
    zh: '停！（中止交锋）', zhSub: '亮灯、出界或冲撞违例时立即停表',
    desc: '当电审器亮灯、一方双脚退过底线或发生身体冲撞（Corps-à-Corps）时，裁判立刻喊 Halte 冻结比分判定。',
    example: 'Halte ! Corps-à-corps à gauche, carton jaune !',
    control: '对应机制：触发子弹时间慢镜回放与裁判宣判', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'touche', cat: 'referee', catLabel: '裁判口令 · REFEREE',
    fr: 'Touché ! Point !', phonetic: '[tu.ʃe pwɛ̃] · 图-谢 普万',
    en: 'Hit! Point Awarded!', enSub: 'Valid touch scored on target',
    zh: '刺中 / 劈中得分！', zhSub: '有效部位亮起红灯或绿灯并获判 1 分',
    desc: '剑尖或刀刃合法击中有效靶面并通过优先权或闭锁时间审核后，裁判向得分方举手授予 1 分。',
    example: 'Attaque de la gauche, touché, point à gauche !',
    control: '对应机制：有效命中触发 0.22x 慢镜特写并加 1 分', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'hors_cible', cat: 'referee', catLabel: '裁判口令 · REFEREE',
    fr: 'Non valable (Hors cible)', phonetic: '[ɔʁ sibl] · 奥赫-西布勒',
    en: 'Off-Target (White Light)', enSub: 'Hit landed outside valid conductive lamé',
    zh: '无效部位（亮白灯停表）', zhSub: '花剑刺中四肢或面罩等金属背心以外区域',
    desc: '花剑仅躯干金属背心有效；若剑尖刺中手臂或大腿，电审器亮起白灯暂停交锋，重置站位但不计分。',
    example: 'Attaque non valable à gauche, hors cible !',
    control: '对应机制：花剑出剑时手腕抖动过大将偏靶亮白灯', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'simultane', cat: 'referee', catLabel: '裁判口令 · REFEREE',
    fr: 'Actions simultanées', phonetic: '[ak.sjɔ̃ si.myl.ta.ne] · 西谬塔内',
    en: 'Simultaneous Actions', enSub: 'Both fencers attacked at the exact same moment',
    zh: '同时进攻（互中不计分）', zhSub: '花剑/佩剑双方同时起动互中，均不得分',
    desc: '在遵循优先权的花剑和佩剑中央 4 米区内，双方毫无先后差异同时启动击中对方，裁判双手平挥宣布不计分重来。',
    example: 'Actions simultanées, pas de touche ! En garde !',
    control: '对应机制：均势对峙下同时互中双灯不加分', tryWeapon: WeaponId.SABRE
  },
  {
    id: 'quarte', cat: 'guard', catLabel: '防线与格挡 · PARADE',
    fr: 'Quarte (4e position)', phonetic: '[kaʁt] · 卡赫特',
    en: 'Fourth Position (High Inside)', enSub: 'Protects upper-inside chest / left cheek',
    zh: '四号位防守（上内线 / 左立剑）', zhSub: '花重剑护左上胸，佩剑左立剑护左面',
    desc: '最经典的击剑主防线之一，护手盘横向左移封闭胸膛内侧高路；佩剑中则以垂直刀背向外挡开横斩。',
    example: 'Parade de quarte et riposte directe, touché !',
    control: '操作映射：鼠标移至左上方（或按数字键 1）', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'sixte', cat: 'guard', catLabel: '防线与格挡 · PARADE',
    fr: 'Sixte (6e) / Tierce (3e)', phonetic: '[sikst / tjɛʁs] · 西克斯特 / 蒂耶斯',
    en: 'Sixth / Third Position (High Outside)', enSub: 'Standard en-garde line protecting sword arm',
    zh: '六号位 / 佩剑三号位（上外线）', zhSub: '默认实战起手防线，重点保护持剑手腕',
    desc: '花剑与重剑以六号位（Sixte）为基准防线封闭外侧并保护手腕；佩剑则以三号位（Tierce）立剑保护持剑右臂。',
    example: 'Engagement en sixte, opposition au poignet !',
    control: '操作映射：鼠标移至右上方（或按数字键 2）', tryWeapon: WeaponId.EPEE
  },
  {
    id: 'quinte', cat: 'guard', catLabel: '防线与格挡 · PARADE',
    fr: 'Quinte (5e position Sabre)', phonetic: '[kɛ̃t] · 坎特',
    en: 'Fifth Position (Overhead Roof Guard)', enSub: 'Horizontal sabre blade raised above mask',
    zh: '五号位横刀架顶（佩剑专属防头）', zhSub: '刀身横置头顶上方拦截当头直劈',
    desc: '佩剑最具视觉辨识度的格挡技术！面对对手凌厉的劈头（Coup à la Tête），迅速上抬护手将刀刃横架于面罩上方弹开来刀。',
    example: 'Parade de quinte haute, riposte au flanc, point !',
    control: '操作映射：佩剑模式下鼠标上移至正上方架顶', tryWeapon: WeaponId.SABRE
  },
  {
    id: 'septime_octave', cat: 'guard', catLabel: '防线与格挡 · PARADE',
    fr: 'Septime (7e) & Octave (8e)', phonetic: '[sɛp.tim / ɔk.tav] · 塞普蒂姆 / 奥克塔夫',
    en: 'Seventh & Eighth (Low Lines)', enSub: 'Semi-circular parries defending lower abdomen & thigh',
    zh: '七号位与八号位（下内线 / 下外线）', zhSub: '剑尖下沉画半圆拦截低位潜刺与点脚',
    desc: '当对手下蹲潜刺（Passata Sotto）或重剑狙击膝盖脚面时，剑尖迅速下沉扫过下内线（7号）或下外线（8号）拨开来剑。',
    example: 'Parade d\'octave en bas, riposte au corps !',
    control: '操作映射：鼠标移至左下（7号）或右下（8号/佩剑2号）', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'parade_riposte', cat: 'guard', catLabel: '防线与格挡 · PARADE',
    fr: 'Parade-Riposte', phonetic: '[pa.ʁad ʁi.pɔst] · 帕哈德-里波斯特',
    en: 'Parry and Riposte', enSub: 'Deflecting an attack to seize right-of-way and counter-strike',
    zh: '格挡还击（防反夺权）', zhSub: '击剑攻防转换最核心的得分手段',
    desc: '用剑根拨开对手进攻的瞬间，进攻优先权立刻100%易主！在最后 140ms 内精准迎击更可触发“完美弹反（Parade Parfaite）”。',
    example: 'Parade parfaite et riposte immédiate, touché !',
    control: '操作映射：迎向红光扇区滑鼠或按右键格挡，立即左键还击', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'marche_rompre', cat: 'attack', catLabel: '步法与进攻 · ATTAQUE',
    fr: 'Marche & Rompre', phonetic: '[maʁʃ / ʁɔ̃pʁ] · 玛赫什 / 宏普赫',
    en: 'Advance & Retreat', enSub: 'Fundamental footwork controlling fencing measure',
    zh: '前进步与后撤步（控距步法）', zhSub: '击剑70%的胜负取决于距离控制（Mesure）',
    desc: '前脚先动跟后脚为前进步（建立主动权），后脚先退跟前脚为后撤步（诱敌落空）。切忌只前走不出剑导致犹豫失权。',
    example: 'Attaque en marchant, fente directe !',
    control: '操作映射：D 键前进步压迫 · A 键后撤步拉距离', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'fente', cat: 'attack', catLabel: '步法与进攻 · ATTAQUE',
    fr: 'La Fente (Lunge)', phonetic: '[la fɑ̃t] · 拉-方特',
    en: 'The Lunge', enSub: 'Explosive rear-leg drive with full sword-arm extension',
    zh: '弓步突刺 / 弓步劈斩', zhSub: '先伸持剑臂、后腿猛蹬爆发跨步的终结动作',
    desc: '遵循“剑尖先行、手臂引体”原则，先刺出手臂确立优先权再跨出前腿，后臂向后平展保持重心平衡。',
    example: 'Allongement du bras et fente en sixte, touché !',
    control: '操作映射：在最佳射程内点击鼠标左键或按空格键', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'fleche_flunge', cat: 'attack', catLabel: '步法与进攻 · ATTAQUE',
    fr: 'Flèche & Flunge', phonetic: '[flɛʃ / flʌndʒ] · 弗莱什 / 弗朗奇',
    en: 'Arrow Charge & Flying Lunge', enSub: 'Explosive running blitz (Foil/Épée) vs airborne leap cut (Sabre)',
    zh: '飞冲刺（花重剑）与飞跃斩（佩剑）', zhSub: '佩剑严禁交叉步冲刺，故演化出腾空飞跃劈砍',
    desc: '花剑和重剑允许交叉步全力冲刺（Flèche）；而现代佩剑规则禁止双脚前后交叉前进，顶尖选手因此发明了双脚腾空前跃劈砍的 Flunge！',
    example: 'Flunge spectaculaire à la tête, point !',
    control: '操作映射：攒满绝技槽后按 E 键即可释放飞冲/飞跃绝技', tryWeapon: WeaponId.SABRE
  },
  {
    id: 'feinte_degagement', cat: 'attack', catLabel: '步法与进攻 · ATTAQUE',
    fr: 'Feinte-Dégagement', phonetic: '[fɛ̃t de.ɡaʒ.mɑ̃] · 凡特-代嘎日芒',
    en: 'Feint-Disengage', enSub: 'Faking into one line then dipping under the bell guard to hit open line',
    zh: '虚晃绕剑变线攻', zhSub: '假刺诱骗对手移动护手盘，瞬间从下方绕入空当',
    desc: '先向某防区做逼真假刺（黄光扇区预警），待对手受骗横向格挡露出破绽，手指轻捻剑柄绕过护手盘刺入另一侧。',
    example: 'Feinte en quarte, dégagement en sixte, touché !',
    control: '应对策略：看到黄圈虚晃忍住别抢挡，等变红圈再格挡', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'battement_coupe', cat: 'attack', catLabel: '步法与进攻 · ATTAQUE',
    fr: 'Battement & Coupé', phonetic: '[bat.mɑ̃ / ku.pe] · 巴特芒 / 库佩',
    en: 'Beat Attack & Cut-Over', enSub: 'Striking opponent\'s blade aside or lifting over the tip',
    zh: '敲剑进攻与挑剑越尖攻', zhSub: '破除对手伸臂亮剑（Pointe en Ligne）的利器',
    desc: '清脆敲击对手剑身中前部震开其防线并夺取优先权（Battement），或上提越过对手剑尖换线突刺（Coupé）。',
    example: 'Battement sur le fer et attaque directe !',
    control: '操作映射：快速滑过对手护手盘即可敲开其剑尖夺权', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'pointe_en_ligne', cat: 'rules', catLabel: '剑种与规则 · RÈGLEMENT',
    fr: 'Pointe en Ligne', phonetic: '[pwɛ̃t ɑ̃ liɲ] · 普万特-昂-里涅',
    en: 'Point-in-Line', enSub: 'Extended straight arm with weapon tip threatening valid target',
    zh: '伸臂亮剑（直线威慑先手）', zhSub: '在对手发起进攻前提前伸直手臂将剑尖对准靶心',
    desc: '花剑和佩剑的特殊先手规则：若你在安全距离提前稳稳伸直持剑臂指向对手，对手若不先敲开你的剑而盲目直冲，优先权归你！',
    example: 'Pointe en ligne maintenue, attaque adverse sans battement, point à gauche !',
    control: '操作映射：花剑模式下稳守中心防区 0.42s 自动激活亮剑激光', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'priorite', cat: 'rules', catLabel: '剑种与规则 · RÈGLEMENT',
    fr: 'Priorité (Convention)', phonetic: '[pʁi.jɔ.ʁi.te] · 普里奥里泰',
    en: 'Right-of-Way', enSub: 'Initiative rule governing Foil and Sabre double-lights',
    zh: '进攻优先权法则', zhSub: '花剑与佩剑的灵魂——谁握有主动权谁在双灯时得分',
    desc: '源于古典剑术“先防身再伤敌”的准则。主动先伸臂进攻、成功敲剑或格挡的一方享有优先权；落空或被格挡则立刻失权。',
    example: 'Attaque composée à gauche, priorité maintenue !',
    control: '界面指示：顶部记分牌下方 PRIORITÉ 拔河条实时量化显示', tryWeapon: WeaponId.FOIL
  },
  {
    id: 'coup_double_epee', cat: 'rules', catLabel: '剑种与规则 · RÈGLEMENT',
    fr: 'Coup Double (Épée 40ms)', phonetic: '[ku dubl] · 库-杜布勒',
    en: 'Double Touch (40ms Lockout)', enSub: 'Both fencers score 1 point if hits land within 40 milliseconds',
    zh: '重剑同时互中（双灯同得）', zhSub: '无优先权约束，40毫秒内互中双方各加 1 分',
    desc: '重剑还原真实决斗，全身从面罩到脚尖皆有效且无优先权。只有比对手快出 40ms 以上才能触发电审闭锁单灯独得 1 分！',
    example: 'Coup double ! Un point partout !',
    control: '战术精髓：重剑可利用距离差在 2.74m 外优先狙击对手手腕', tryWeapon: WeaponId.EPEE
  },
  {
    id: 'saignee_poignet', cat: 'rules', catLabel: '剑种与规则 · RÈGLEMENT',
    fr: 'Saignée au Poignet & Pied', phonetic: '[sɛ.ɲe o pwa.ɲɛ] · 塞涅-奥-普瓦涅',
    en: 'Wrist Snipe & Foot Touch', enSub: 'Targeting the closest exposed extremity in Épée',
    zh: '重剑狙击手腕与下潜点脚', zhSub: '手腕比躯干近约 36 厘米，是重剑博弈第一要害',
    desc: '重剑大师极少盲目深刺胸膛，而是紧盯对手护手盘外的手腕前臂（Poignet）与前脚背（Pied）进行远距精确打击。',
    example: 'Arrêt au temps sur le poignet, une seule lumière !',
    control: '操作映射：重剑选右上角腕部防区可在 2.74m 远距出剑命中', tryWeapon: WeaponId.EPEE
  },
  {
    id: 'coup_de_taille', cat: 'rules', catLabel: '剑种与规则 · RÈGLEMENT',
    fr: 'Coup de Taille (Sabre)', phonetic: '[ku də taj] · 库-德-塔伊',
    en: 'Sabre Cutting / Slashing', enSub: 'Scoring with the front edge, flat, or back third of the blade',
    zh: '佩剑劈砍有效（腰线以上）', zhSub: '佩剑以刃口挥斩为主，腰部以下击中无效不停表',
    desc: '脱胎于轻骑兵马刀，腰部以上（头盔、双臂、躯干）整个刀刃前缘与刀背前1/3碰触导电衣即亮灯得分；劈中大腿腰下不计分且不停表（Coup Bas）。',
    example: 'Moulinet coup à la tête, touché !',
    control: '操作映射：佩剑模式下大幅挥动鼠标或按左键直接劈出炽热刀弧', tryWeapon: WeaponId.SABRE
  },
  {
    id: 'opposition_fer', cat: 'rules', catLabel: '剑种与规则 · RÈGLEMENT',
    fr: 'Opposition & Enveloppement', phonetic: '[ɔ.pɔ.zi.sjɔ̃] · 奥波西雄',
    en: 'Blade Bind & Circular Taking', enSub: 'Maintaining steel-on-steel leverage while thrusting',
    zh: '抗剑压制与螺旋绞剑', zhSub: '双剑交接时利用杠杆力封死对手反击线路',
    desc: '在花剑与重剑交锋中贴住对手剑身持续施压（Fer sur Fer）或画圆绞剑（Enveloppement），可一边锁死对方剑尖一边安全刺中目标。',
    example: 'Attaque par opposition en sixte, touché !',
    control: '操作映射：准星贴近对手护手盘持续抗剑或画圈即可破防夺权', tryWeapon: WeaponId.EPEE
  },
  {
    id: 'corps_a_corps_esquive', cat: 'rules', catLabel: '剑种与规则 · RÈGLEMENT',
    fr: 'Corps-à-Corps & Esquive', phonetic: '[kɔʁ a kɔʁ / ɛs.kiv] · 科赫-阿-科赫',
    en: 'Illegal Body Collision & Ducking Evasion', enSub: 'Yellow/Red card penalty vs clean vertical dodge',
    zh: '贴身冲撞罚牌与下潜闪避', zhSub: '恶意冲撞吃黄红牌；灵巧蹲跳闪避可直接防反',
    desc: '距离小于 1.18m 仍蛮横前冲撞击对手将被判黄牌警告、再犯红牌罚分；而面对上路刺劈时抓准时机按 S 下蹲（Esquive）则是合法的华丽反杀技！',
    example: 'Esquive sous l\'attaque haute, remise au corps, touché !',
    control: '操作映射：对手攻上路按 S 下蹲闪避，攻下路按 W 跃起闪避', tryWeapon: WeaponId.FOIL
  }
]);

const TUTORIAL_LESSONS = Object.freeze([
  {
    step: 1,
    weapon: WeaponId.FOIL,
    title: '1. 花剑四象限防线 (4 / 6 / 7 / 8号位)',
    theory: '花剑防线分为左上 Quarte(4)、右上 Sixte(6)、左下 Septime(7)、右下 Octave(8)。观察中央半透明四向剑位环，平稳移动鼠标控剑。',
    taskPrompt: '平稳移动鼠标依次点亮 4、6、7、8 四个剑位扇区',
    goalCount: 4
  },
  {
    step: 2,
    weapon: WeaponId.FOIL,
    title: '2. 控距步法与高低立体闪避 (WASD)',
    theory: '最佳交锋距离为 1.65m–2.38m（贴脸冲撞会吃黄牌）。按 W 可跃起躲下路，按 S 可下蹲闪避上路攻击。',
    taskPrompt: '按 D 前进、A 后撤、W/S 跳蹲各完成 1 次',
    goalCount: 3
  },
  {
    step: 3,
    weapon: WeaponId.FOIL,
    title: '3. 瞄准空当弓步直刺 (Fente Directe)',
    theory: '花剑仅躯干金属背心有效（刺偏四肢亮白灯）。避开教练封闭的左上4号位，瞄准空当按左键或空格突刺。',
    taskPrompt: '瞄准空当象限，按左键或 Space 刺中躯干 2 次',
    goalCount: 2
  },
  {
    step: 4,
    weapon: WeaponId.FOIL,
    title: '4. 完美弹反与防反还击 (Parade-Riposte)',
    theory: '对手先攻时握有优先权。观察准星外围红光预警扇区，滑鼠移入同侧（或按右键）格挡夺权，立即左键还击！',
    taskPrompt: '格挡教练进攻并立即左键 Riposte 还击得 2 分',
    goalCount: 2
  },
  {
    step: 5,
    weapon: WeaponId.FOIL,
    title: '5. 识破虚晃假动作 (Feinte & Esquive)',
    theory: '看到黄色脉冲扇区为假动作（抢挡会挥空硬直！），等变成红色真刺再格挡，或按 S 下蹲闪避反杀。',
    taskPrompt: '识破黄光虚晃，延后格挡或下蹲闪避反击得 2 分',
    goalCount: 2
  },
  {
    step: 6,
    weapon: WeaponId.EPEE,
    title: '6. 重剑独立机制：2.74m 狙击手腕与 40ms 双灯',
    theory: '重剑地面投射三道射程线：【手腕 POIGNET】比躯干近 0.36m，可在 2.70m 外远距狙腕单灯得分！互中误差 ≤40ms 则双灯同得。',
    taskPrompt: '移至右上腕部防区或右下脚面防区，远距点刺得 2 分',
    goalCount: 2
  },
  {
    step: 7,
    weapon: WeaponId.SABRE,
    title: '7. 佩剑独立机制：横刀架顶与 Moulinet 劈砍',
    theory: '佩剑立剑持握！鼠标上抬变成【Quinte 5号位横刀架顶】接下劈头，大幅挥鼠或按左键直接劈出炽热弧形刀浪！',
    taskPrompt: '使用佩剑横刀架顶反击或大弧度挥砍拿下 2 分毕业',
    goalCount: 2
  }
]);
