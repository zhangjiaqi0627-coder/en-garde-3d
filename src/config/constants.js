// Module 1: Polyfills, Frozen Enums, FIE Biomechanical Physics Constants, 3-Weapon Profiles, Challenger Personas & AI Schemes

if (typeof CanvasRenderingContext2D !== 'undefined' && !CanvasRenderingContext2D.prototype.roundRect) {
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    const radius = Math.min(typeof r === 'number' ? r : 6, Math.abs(w) * 0.5, Math.abs(h) * 0.5);
    this.moveTo(x + radius, y);
    this.arcTo(x + w, y, x + w, y + h, radius);
    this.arcTo(x + w, y + h, x, y + h, radius);
    this.arcTo(x, y + h, x, y, radius);
    this.arcTo(x, y, x + w, y, radius);
    this.closePath();
    return this;
  };
}

const GameMode = Object.freeze({
  SINGLE: '1p',
  SPLIT_2P: '2p',
  TUTORIAL: 'tutorial'
});

const WeaponId = Object.freeze({
  FOIL: 'foil',
  EPEE: 'epee',
  SABRE: 'sabre'
});

const RoundPhase = Object.freeze({
  READY: 'ready',
  FIGHTING: 'fighting',
  HALT: 'halt'
});

const Action = Object.freeze({
  IDLE: 'idle',
  PREP: 'prep',
  FEINT1: 'feint1',
  FEINT2: 'feint2',
  COUPE: 'coupe',
  LUNGE: 'lunge',
  REMISE: 'remise',
  RECOVERY: 'recovery',
  PARRY: 'parry',
  PARRYING: 'parrying',
  PARRIED: 'parried'
});

const Posture = Object.freeze({
  STAND: 'stand',
  DUCK: 'duck',
  JUMP: 'jump'
});

const Quadrant = Object.freeze({
  NW: 'NW',
  NE: 'NE',
  SW: 'SW',
  SE: 'SE'
});

const CONSTANTS = Object.freeze({
  FIXED_DT: 1 / 120,
  MAX_FRAME_DT: 0.05,
  PISTE_HALF_LENGTH: 6.85,
  CORPS_A_CORPS_DIST: 1.18,
  BIND_MAX_DIST: 2.68,
  BIND_RADIUS: 0.28,
  BLADE_CONTACT_RADIUS_3D: 0.082,
  POISE_LOSS_THRESHOLD: 40,
  POISE_SCATTER_START: 64,
  MARCH_HESITATION_LIMIT: 1.28,
  SABRE_MARCH_LIMIT: 0.90,
  DUCK_CAMP_LIMIT: 0.68,
  PERFECT_PARRY_WINDOW: 0.14,
  EPEE_WRIST_MAX_REACH: 2.74,
  EPEE_FOOT_MAX_REACH: 2.58,
  EPEE_BODY_MAX_REACH: 2.38,
  FOIL_TRIGGER_FORCE_N: 4.90,
  EPEE_TRIGGER_FORCE_N: 7.35,
  FOIL_LOCKOUT_SEC: 0.20,
  EPEE_LOCKOUT_SEC: 0.045,
  SABRE_LOCKOUT_SEC: 0.17,
  FOOTWORK_ACCEL: 28.0,
  FOOTWORK_FRICTION: 17.5,
  BLADE_VIB_OMEGA: 138.0,
  BLADE_VIB_DAMPING: 9.2,
  SPRING_STIFFNESS_DEFAULT: 198,
  SPRING_STIFFNESS_EPEE: 242,
  SPRING_DAMPING_NORMAL: 16.5,
  SPRING_DAMPING_LOW_POISE: 8.8,
  HEART_RATE_MIN: 62,
  HEART_RATE_MAX: 194
});

const WEAPON_CHANNELS = Object.freeze({
  foil: {
    id: 'foil',
    name: 'FOIL 花剑',
    shortName: '花剑',
    frenchName: 'Fleuret',
    hasRightOfWay: true,
    attackStyle: 'thrust',
    validTargetDesc: '花剑 · 4.9N弹簧剑头 · 强弱剑身抗剑与优先权',
    channelDesc: '花剑：4.9N剑尖触发 · Forte强剑身压制 · 仅金属背心有效',
    masterStrikeName: 'FLÈCHE ÉCLAIR (闪电飞冲绕剑刺)',
    bellRadius: 44,
    coquilleRadius3D: 0.056,
    triggerForceN: 4.90,
    lockoutSec: 0.20,
    bladeLength3D: 0.89,
    bladeColor: '#38bdf8',
    optimalMin: 1.62,
    optimalMax: 2.38,
    minMeasure: 1.48
  },
  epee: {
    id: 'epee',
    name: 'ÉPÉE 重剑',
    shortName: '重剑',
    frenchName: 'Épée',
    hasRightOfWay: false,
    attackStyle: 'thrust',
    validTargetDesc: '重剑 · 7.35N弹簧剑头 · 护手盘弹开与45ms真闭锁双灯',
    channelDesc: '重剑：7.35N触发 · 13.5cm深碗护手弹开 · 45ms电审闭锁双灯',
    masterStrikeName: 'CONTRE-TEMPS IMPÉRIAL (零秒封线狙腕)',
    bellRadius: 62,
    coquilleRadius3D: 0.072,
    triggerForceN: 7.35,
    lockoutSec: 0.045,
    bladeLength3D: 0.89,
    bladeColor: '#fbbf24',
    optimalMin: 1.48,
    optimalMax: 2.68,
    minMeasure: 1.34
  },
  sabre: {
    id: 'sabre',
    name: 'SABRE 佩剑',
    shortName: '佩剑',
    frenchName: 'Sabre',
    hasRightOfWay: true,
    attackStyle: 'slash',
    validTargetDesc: '佩剑 · 刀刃空中拼刀反弹 · 170ms闭锁与5号架顶',
    channelDesc: '佩剑：刃口拼刀反弹(Contre-Taille) · 170ms闭锁 · 腰上有效',
    masterStrikeName: 'OURAGAN DE QUINTE (大皇宫双弧飞跃斩)',
    bellRadius: 50,
    coquilleRadius3D: 0.062,
    triggerForceN: 0.0,
    lockoutSec: 0.17,
    bladeLength3D: 0.86,
    bladeColor: '#fb923c',
    optimalMin: 1.44,
    optimalMax: 2.48,
    minMeasure: 1.30
  }
});

const DIFFICULTIES = Object.freeze({
  easy: {
    name: 'NOVICE 新秀',
    rivalName: 'LUCAS MOREAU',
    country: 'FRA',
    rivalTitle: '巴黎学院派新锐 · Le Académicien',
    rivalDesc: '正统四象限防守反击，出剑线路清晰，适合打磨距离与完美弹反',
    tauntQuote: '"En garde ! 让我看看你的防线够不够标准。"',
    winQuote: '"漂亮的剑尖控制！你已经掌握巴黎学院派精髓了。"',
    loseQuote: '"距离感还差一点，稳住手腕再来一局！"',
    portraitDomId: 'imgRivalLucas',
    accentColor: '#38bdf8',
    visorColor: '#0284c7',
    reactDelay: 0.28,
    attackFreq: 0.90,
    parryChance: 0.62,
    feintChance: 0.34,
    speedMult: 0.96,
    guardSpeed: 3.1
  },
  normal: {
    name: 'CADET 标准',
    rivalName: 'ELENA ROSSI',
    country: 'ITA',
    rivalTitle: '米兰灵蛇快剑手 · La Vipère',
    rivalDesc: '高频假动作变线 (Feinte) + 控距后撤引诱 + 低蹲潜刺 (Passata Sotto)',
    tauntQuote: '"Troppo lento! 别被我的第一剑虚晃骗到哦。"',
    winQuote: '"Incredibile… 居然能看穿我的双重变线！"',
    loseQuote: '"太急着抢挡了，我的假动作可不会留情。"',
    portraitDomId: 'imgRivalElena',
    accentColor: '#10b981',
    visorColor: '#f43f5e',
    reactDelay: 0.17,
    attackFreq: 1.24,
    parryChance: 0.84,
    feintChance: 0.60,
    speedMult: 1.15,
    guardSpeed: 4.6
  },
  master: {
    name: 'MAÎTRE 大师',
    rivalName: 'VIKTOR KOVÁCS',
    country: 'HUN',
    rivalTitle: '布达佩斯大满贯宗师 · Grand Maître',
    rivalDesc: '微米级拉距诱空 + 强剑身压制反击 + 毫秒级重剑狙腕截刺',
    tauntQuote: '"四十毫秒之内，大皇宫的灯光只会为一人亮起。"',
    winQuote: '"Bravo, Grand Maître. 这片中央剑道今天属于你。"',
    loseQuote: '"你每一次重复出剑的习惯，都在我的预判之中。"',
    portraitDomId: 'imgRivalViktor',
    accentColor: '#fbbf24',
    visorColor: '#f59e0b',
    reactDelay: 0.10,
    attackFreq: 1.58,
    parryChance: 0.95,
    feintChance: 0.84,
    speedMult: 1.34,
    guardSpeed: 6.2
  }
});

const AI_SCHEMES = Object.freeze({
  direct:            { label: 'FENTE DIRECTE',        type: 'offense' },
  feint_disengage:   { label: 'FEINTE-DÉGAGEMENT',    type: 'offense' },
  double_feint:      { label: 'DOUBLE DÉGAGEMENT',    type: 'offense' },
  beat_lunge:        { label: 'BATTEMENT-ATTAQUE',    type: 'offense' },
  coupe_glide:       { label: 'COUPÉ HAUT',           type: 'offense' },
  fleche_blitz:      { label: 'FLÈCHE',               type: 'offense' },
  flunge_sabre:      { label: 'FLUNGE (飞跃劈斩)',     type: 'offense' },
  moulinet_tete:     { label: 'MOULINET À LA TÊTE',   type: 'offense' },
  feint_tete_flanc:  { label: 'FEINTE TÊTE → FLANC',  type: 'offense' },
  saignee_poignet:   { label: 'SAIGNÉE AU POIGNET',   type: 'offense' },
  touche_au_pied:    { label: 'TOUCHE AU PIED',       type: 'offense' },
  riposte_direct:    { label: 'PARADE-RIPOSTE',       type: 'counter' },
  riposte_croise:    { label: 'CONTRE-DE-SIXTE',      type: 'counter' },
  stop_hit_retreat:  { label: 'ARRÊT EN ROMPANT',     type: 'counter' },
  pull_distance_counter: { label: 'ROMPRE & REPRISE', type: 'counter' },
  passata_sotto:     { label: 'PASSATA SOTTO',        type: 'counter' },
  temps_opportunite: { label: 'ATTAQUE AU TEMPS',     type: 'counter' }
});
