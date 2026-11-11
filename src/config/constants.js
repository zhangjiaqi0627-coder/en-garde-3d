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
    name: 'FOIL · 花剑',
    shortName: 'FOIL 花剑',
    frenchName: 'Fleuret',
    hasRightOfWay: true,
    attackStyle: 'thrust',
    validTargetDesc: 'Foil · 4.9N Spring Tip · Forte Leverage & Right-of-Way · 花剑躯干有效与优先权',
    channelDesc: 'FOIL: 4.9N Tip · Forte Leverage · Conductive Lamé Torso Only · 花剑',
    masterStrikeName: 'FLÈCHE ÉCLAIR (Lightning Blitz · 闪电飞冲刺)',
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
    name: 'ÉPÉE · 重剑',
    shortName: 'ÉPÉE 重剑',
    frenchName: 'Épée',
    hasRightOfWay: false,
    attackStyle: 'thrust',
    validTargetDesc: 'Épée · 7.35N Spring Tip · Bell Deflection & 45ms Double-Touch · 重剑全身有效',
    channelDesc: 'ÉPÉE: 7.35N Tip · 13.5cm Coquille Guard · 45ms Lockout · 重剑',
    masterStrikeName: 'CONTRE-TEMPS IMPÉRIAL (Opposition Wrist Snipe · 封线狙腕)',
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
    name: 'SABRE · 佩剑',
    shortName: 'SABRE 佩剑',
    frenchName: 'Sabre',
    hasRightOfWay: true,
    attackStyle: 'slash',
    validTargetDesc: 'Sabre · Mid-Air Edge Clash · 170ms Lockout & Quinte Roof Guard · 佩剑腰上劈斩',
    channelDesc: 'SABRE: Contre-Taille Clash · 170ms Lockout · Waist-Up Cuts · 佩剑',
    masterStrikeName: 'OURAGAN DE QUINTE (Grand Palais Twin-Arc Flunge · 双弧飞跃斩)',
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
    name: 'NOVICE · 新秀',
    rivalName: 'LUCAS MOREAU',
    country: 'FRA',
    rivalTitle: 'Paris Classical Prodigy · 巴黎学院派新锐',
    rivalDesc: 'Clean 4-quadrant parry-riposte fundamentals — ideal for mastering measure & perfect parries · 正统防反陪练',
    tauntQuote: '"En garde! Let\'s test the discipline of your guard line. · 看看你的防线够不够标准。"',
    winQuote: '"Superb point control! You\'ve mastered the Paris classical style. · 漂亮的剑尖控制！"',
    loseQuote: '"Your measure was just slightly off — steady your wrist and try again! · 稳住手腕再来一局！"',
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
    name: 'CADET · 标准',
    rivalName: 'ELENA ROSSI',
    country: 'ITA',
    rivalTitle: 'Milanese Speed Specialist · 米兰灵蛇快剑手',
    rivalDesc: 'High-tempo feint-disengages, distance traps & low-line Passata Sotto evasions · 高频变线与低蹲潜刺',
    tauntQuote: '"Troppo lento! Don\'t bite on my first feint. · 别被我的第一剑虚晃骗到哦。"',
    winQuote: '"Incredibile… You read right through my double disengage! · 居然看穿了我的双重变线！"',
    loseQuote: '"Too eager to parry early — my feints show no mercy. · 太急着抢挡了。"',
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
    name: 'MAÎTRE · 大师',
    rivalName: 'VIKTOR KOVÁCS',
    country: 'HUN',
    rivalTitle: 'Budapest Grand Slam Champion · 布达佩斯大满贯宗师',
    rivalDesc: 'Millimeter distance-pulls, crushing Forte opposition & sub-40ms wrist stop-hits · 极致控距与压剑狙腕',
    tauntQuote: '"Within forty milliseconds, the Grand Palais lights shine for one fencer alone. · 四十毫秒见真章。"',
    winQuote: '"Bravo, Grand Maître. The center piste belongs to you tonight. · 中央剑道今天属于你。"',
    loseQuote: '"Every repeated habit in your blade was already in my calculation. · 你的习惯已在预判之中。"',
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
  flunge_sabre:      { label: 'FLUNGE (AIRBORNE CUT · 飞跃斩)', type: 'offense' },
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
