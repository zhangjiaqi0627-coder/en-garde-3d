// Module 4: DOM Reference Cache, Dirty-Checked Mutators & Strict Domain-Partitioned StateStore

const DOM = {};
const _domCacheState = new WeakMap();

const REGISTERED_DOM_IDS = [
  'webglCanvas', 'gameCanvas', 'btnCamCloseup', 'btnCamDuel', 'btnCamPov', 'maskOverlay', 'broadcastStinger', 'stingerBladeAccent', 'stingerBladeMain',
  'stingerRivalAvatar', 'stingerTag', 'stingerTitle', 'stingerSub',
  'btnOpenFlashcards', 'btnStartTutorial', 'btnToggleTouchHud', 'btnOpenSettings',
  'lampPlayer', 'lampPlayerWhite', 'p1TitleLabel', 'priorityPlayerBadge', 'cardPlayerBadge',
  'staminaBar', 'poiseBar', 'scorePlayer', 'weaponModeBadge', 'clockDisplay', 'stripPosText',
  'scoreAI', 'cardAiBadge', 'priorityAiBadge', 'p2TitleLabel', 'radarPlayer', 'radarAI',
  'lampAI', 'lampAIWhite', 'rowBarLeft', 'rowBarRight', 'rowPuck', 'rowReasonText',
  'matchPointBanner', 'styleComboHud', 'styleRankLetter', 'styleComboCountText', 'styleActionSubText',
  'calloutBanner', 'calloutTitle', 'calloutSub',
  'tutorialOverlayPanel', 'tutStepBadge', 'btnToggleEncyclopedia', 'btnTutExit',
  'tutLessonTitle', 'tutLessonTheory', 'tutTaskPrompt', 'tutTaskCounter', 'tutProgressBar',
  'fencingEncyclopediaBox', 'btnTutPrev', 'btnTutResetStep', 'btnTutNext',
  'touchControlsDrawer', 'btnRetreat', 'btnJump', 'btnDuck', 'btnAdvance', 'btnParry', 'btnLunge',
  'quadNW', 'quadNE', 'quadSW', 'quadSE', 'hudAiDot', 'hudGuardDot', 'guardNameText', 'rightOfWayText',
  'btnMasterStrike', 'masterGaugeFill', 'masterStrikeText',
  'flashcardModalOverlay', 'btnFcModeStudy', 'btnFcModeQuiz', 'btnCloseFlashcards',
  'fcMasteredCountBadge', 'fcStudyView', 'fcCardBox', 'fcCategoryBadge', 'fcIndexLabel',
  'btnFcToggleMaster', 'fcTermFr', 'fcPhoneticFr', 'btnSpeakFr', 'fcTermEn', 'fcSubEn',
  'btnSpeakEn', 'fcTermZh', 'fcSubZh', 'btnSpeakExample', 'fcUsageDesc', 'fcExampleSentence',
  'fcControlHint', 'btnTryInArena', 'btnFcPrev', 'btnFcShuffle', 'btnFcNext',
  'fcQuizView', 'fcQuizScoreBadge', 'fcQuizPromptFr', 'fcQuizPromptEn', 'btnQuizReplayAudio',
  'fcQuizOptionsGrid', 'fcQuizFeedback', 'btnQuizNextQuestion',
  'victoryPodiumOverlay', 'podiumVerdictTag', 'podiumMedalNotice', 'podiumTitleText',
  'podiumScoreText', 'podiumRankText', 'podiumRivalImg', 'podiumQuoteText',
  'podiumStatParries', 'podiumStatRipostes', 'podiumStatStreak', 'podiumStatWeapon',
  'btnPodiumRematch', 'btnPodiumNextRival', 'btnPodiumMenu',
  'modalOverlay', 'titleLeftDock', 'titleRightWatermark', 'grandSlamBadge',
  'btnToggleBgm', 'btnToggleVoice', 'btnToggleSound', 'heroKeyArtImg', 'heroKeyArtCaption',
  'modalTitle', 'modalSubtitle', 'modeBtn1P', 'modeBtn2P', 'modeBtnTutorial', 'twoPlayerGuideBox',
  'weaponChannelNotice', 'cardFoil', 'badgeFoilStatus', 'cardEpee', 'badgeEpeeStatus',
  'cardSabre', 'badgeSabreStatus', 'rivalPortraitImg', 'rivalCountryBadge',
  'medalChipFoil', 'medalChipEpee', 'medalChipSabre', 'rivalNameText', 'rivalTitleText',
  'rivalTauntQuote', 'rivalStyleDesc', 'btnToggleMask', 'btnStartBout', 'btnResumeBout',
  'btnModalEnterTutorial', 'btnModalOpenFlashcards',
  'watermarkSpecBox', 'watermarkWeaponTitle', 'watermarkSpec1', 'watermarkSpec2', 'watermarkSpec3',
  'imgRivalLucas', 'imgRivalElena', 'imgRivalViktor'
];

function initDOMCache() {
  for (const id of REGISTERED_DOM_IDS) {
    DOM[id] = document.getElementById(id);
  }
}

function setDomText(el, text) {
  if (!el) return;
  let rec = _domCacheState.get(el);
  if (!rec) { rec = {}; _domCacheState.set(el, rec); }
  if (rec.text !== text) {
    rec.text = text;
    el.textContent = text;
  }
}

function setDomClass(el, cls) {
  if (!el) return;
  let rec = _domCacheState.get(el);
  if (!rec) { rec = {}; _domCacheState.set(el, rec); }
  if (rec.cls !== cls) {
    rec.cls = cls;
    el.className = cls;
  }
}

function setDomStyle(el, prop, val) {
  if (!el) return;
  let rec = _domCacheState.get(el);
  if (!rec) { rec = {}; _domCacheState.set(el, rec); }
  if (rec[prop] !== val) {
    rec[prop] = val;
    el.style[prop] = val;
  }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function createStrictDomainStateStore(domains) {
  const root = { domains };
  const keyToDomain = Object.create(null);

  for (const [domainName, domainObj] of Object.entries(domains)) {
    Object.defineProperty(root, domainName, {
      value: domainObj,
      enumerable: true,
      writable: false
    });
    for (const key of Object.keys(domainObj)) {
      keyToDomain[key] = domainObj;
      Object.defineProperty(root, key, {
        enumerable: true,
        get() { return domainObj[key]; },
        set(v) { domainObj[key] = v; }
      });
    }
  }

  return new Proxy(root, {
    get(target, prop, receiver) {
      if (typeof prop === 'symbol' || prop in target || prop === 'toJSON') {
        return Reflect.get(target, prop, receiver);
      }
      throw new TypeError(`[StateStore StrictMode] Read of undeclared state field: "${String(prop)}"`);
    },
    set(target, prop, value, receiver) {
      if (typeof prop === 'symbol' || prop in keyToDomain) {
        return Reflect.set(target, prop, value, receiver);
      }
      throw new TypeError(`[StateStore StrictMode] Write to undeclared state field: "${String(prop)}"`);
    }
  });
}

const state = createStrictDomainStateStore({
  appState: {
    gameMode: GameMode.SINGLE,
    selectedWeapon: WeaponId.FOIL,
    running: false,
    paused: true,
    difficulty: 'normal',
    targetScore: 5,
    maskEnabled: true,
    inWorldRingEnabled: true,
    physicsAccumulator: 0,
    playerScore: 0,
    aiScore: 0,
    playerYellowCards: 0,
    aiYellowCards: 0,
    boutTimeRemaining: 180,
    roundPhase: RoundPhase.READY,
    phaseTimer: 0,
    readySubStage: 0,
    lastPointColor: '#38bdf8',
    rightOfWay: 'none',
    rowMeter: 0,
    rowReason: 'NEUTRAL · BALANCED · 均势',
    hitStopTimer: 0,
    timeScale: 1.0,
    slowMoTimer: 0,
    hypeCombo: 0,
    maxHypeCombo: 0,
    stylePoints: 0,
    parriesLanded: 0,
    ripostesLanded: 0,
    masterGauge: 0,
    masterStrikeActive: false,
    medalsEarned: {},
    _lampResetTimer: null,
    // Authentic FIE Electrical Scoring Box (Boîtier Électrique) Live Lockout Window
    lockoutActive: false,
    lockoutTimer: 0,
    lockoutDuration: 0.045,
    lockoutFirstSide: 'none',
    lockoutFirstReason: '',
    lockoutFirstCue: '',
    lockoutFirstOffTarget: false,
    lockoutSecondSide: 'none',
    lockoutSecondReason: '',
    lockoutSecondOffTarget: false,
    lockoutDeltaMs: 0,
    lastImpactForceN: 0,
    keys: { left: false, right: false, p2Advance: false, p2Retreat: false }
  },
  player: {
    playerMarchTimer: 0,
    marchHoldDuration: 0,
    playerZ: -1.3,
    playerVelZ: 0,
    stepBurstTimer: 0,
    stepBurstDir: 0,
    playerY: 0,
    playerVelY: 0,
    playerPosture: Posture.STAND,
    duckHeld: false,
    duckHoldDuration: 0,
    mouseX: 0.18,
    mouseY: -0.12,
    prevMouseX: 0.18,
    prevMouseY: -0.12,
    lastMoveDirX: 0,
    lastMoveDirY: 0,
    guardX: 0.18,
    guardY: -0.12,
    tipX: 0.18,
    tipY: -0.12,
    tipVelX: 0,
    tipVelY: 0,
    // 22Hz Euler-Bernoulli Steel Blade Vibration & Leverage State
    bladeVibX: 0,
    bladeVibY: 0,
    bladeVibVelX: 0,
    bladeVibVelY: 0,
    bladeBuckleAmp: 0,
    sabreSlashPhase: 0,
    sabreSlashType: 'tete',
    sabreSlashStartNormX: 0.52,
    sabreSlashStartNormY: 0.16,
    sabreSlashEndNormX: 0.48,
    sabreSlashEndNormY: 0.56,
    bladeTrail: [],
    quadrant: Quadrant.NE,
    prevQuadrant: Quadrant.NE,
    swipeParryWindow: 0,
    swipeParryCooldown: 0,
    parryWhiffLockout: 0,
    beatCooldown: 0,
    remiseCooldown: 0,
    coquilleDeflectCooldown: 0,
    playerAttackHistory: [],
    bladePoise: 100,
    waggleHeat: 0,
    punishCooldown: 0,
    bladeBindActive: false,
    bindPressure: 0,
    bindLeverage: 1.0,
    bindStationP1: 0.5,
    bindStationP2: 0.5,
    bindContactWorldX: 0,
    bindContactWorldY: 1.18,
    bindContactWorldZ: 0,
    bindPushVectorX: 0,
    bindPushVectorY: 0,
    circularWindAccum: 0,
    lastWindAngle: 0,
    stamina: 100,
    heartRate: 92,
    breathPhase: 0,
    playerAction: Action.IDLE,
    playerActionTimer: 0,
    playerExtension: 0,
    playerStrikeEvaluated: false,
    parryActiveWindow: 0,
    riposteBonusTimer: 0,
    pointInLineTimer: 0,
    pointInLineActive: false
  },
  opponent: {
    aiZ: 1.3,
    aiVelZ: 0,
    p2StepBurstTimer: 0,
    p2StepBurstDir: 0,
    aiY: 0,
    aiVelY: 0,
    aiPosture: Posture.STAND,
    aiPostureTimer: 0,
    p2DuckHeld: false,
    p2DuckHoldDuration: 0,
    p2MarchTimer: 0,
    p2MarchHoldDuration: 0,
    p2SabreSlashPhase: 0,
    p2SabreSlashType: 'tete',
    p2SabreSlashStartNormX: 0.52,
    p2SabreSlashStartNormY: 0.16,
    p2SabreSlashEndNormX: 0.48,
    p2SabreSlashEndNormY: 0.56,
    aiScheme: 'direct',
    aiSchemeLabel: 'OBSERVATION',
    aiGuardX: -0.20,
    aiGuardY: -0.12,
    aiTargetX: 0.22,
    aiTargetY: -0.15,
    p2TipX: 0.22,
    p2TipY: -0.15,
    p2TipVelX: 0,
    p2TipVelY: 0,
    p2BladeVibX: 0,
    p2BladeVibY: 0,
    p2BladeVibVelX: 0,
    p2BladeVibVelY: 0,
    p2BladeBuckleAmp: 0,
    p2BladePoise: 100,
    p2BladeTrail: [],
    p2Stamina: 100,
    p2ParryActiveWindow: 0,
    p2RiposteBonusTimer: 0,
    p2RemiseCooldown: 0,
    p2CamBobPhase: 0,
    p2CamPitchOffset: 0,
    p2CamRollOffset: 0,
    p2CamFovZoom: 0,
    aiQuadrant: Quadrant.NE,
    aiAction: Action.IDLE,
    aiActionTimer: 0,
    aiExtension: 0,
    aiStrikeEvaluated: false,
    aiCoupeLiftY: 0,
    aiAttackQuad: Quadrant.NE,
    aiFeintTargetQuad: Quadrant.NW,
    aiFinalTargetQuad: Quadrant.SE,
    aiDecisionTimer: 0.35,
    aiProbeTimer: 0.9
  },
  tutorial: {
    tutorialStep: 0,
    tutorialProgress: 0,
    tutorialAdvancing: false,
    _tutAdvanceTimer: null,
    tutorialVisitedQuads: { NW: false, NE: false, SW: false, SE: false },
    tutorialFootworkFlags: { advance: false, retreat: false, vertical: false },
    tutorialCoachTimer: 1.2
  },
  flashcards: {
    fcCategory: 'all',
    fcFilteredList: [...FLASHCARD_DECK],
    fcCurrentIndex: 0,
    fcMasteredIds: {},
    fcQuizMode: false,
    fcQuizAnswered: false,
    fcQuizStreak: 0,
    fcQuizCorrect: 0,
    fcQuizTotal: 0,
    fcQuizCurrentItem: null,
    fcQuizOptions: []
  },
  vfx: {
    pinnedHitActive: false,
    pinnedHitTimer: 0,
    pinnedWorldX: 0,
    pinnedWorldY: 0,
    pinnedIsOffTarget: false,
    p2PinnedHitActive: false,
    p2PinnedHitTimer: 0,
    clashLightIntensity: 0,
    clashLightWorldX: 0,
    clashLightWorldY: 1.2,
    clashLightWorldZ: 0,
    clashLightColorHex: 0xfde047,
    camBobPhase: 0,
    camPitchOffset: 0,
    camRollOffset: 0,
    camFovZoom: 0,
    camShake: 0,
    p2CamShake: 0,
    screenFlash: 0,
    screenFlashColor: '#10b981',
    camCenterRatio: 0.67,
    showcaseWeaponPulse: 0,
    showcaseCamMode: 'closeup',
    transitionActive: false,
    sparks: [],
    slashRibbons: [],
    shockwaves: [],
    floatingTexts: [],
    speedLinesAlpha: 0,
    killCamSlashAlpha: 0
  }
});

const _gradientCache = {
  vw: 0,
  vh: 0,
  horizonKey: -1,
  skyGrad: null,
  floorGrad: null,
  pisteGrad: null
};

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  _gradientCache.vw = 0;
  if (window.ThreeArenaEngine) {
    window.ThreeArenaEngine.resize(window.innerWidth, window.innerHeight);
  }
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function getViewportMetrics(isP2Viewport = false) {
  if (state.gameMode === GameMode.SPLIT_2P) {
    const vw = canvas.width * 0.5;
    const vx = isP2Viewport ? vw : 0;
    return { vx, vw, vh: canvas.height, centerX: vx + vw * 0.5 };
  }
  return { vx: 0, vw: canvas.width, vh: canvas.height, centerX: canvas.width * 0.5 };
}

function computeSabreSlashNorms(q, swipeDx = 0, swipeDy = 0) {
  if (q === Quadrant.NW || (Math.abs(swipeDy) > Math.abs(swipeDx) && swipeDy > 0)) {
    return { type: 'tete', sx: 0.52, sy: 0.16, ex: 0.48, ey: 0.58 };
  }
  if (q === Quadrant.SW || swipeDx > 0.04) {
    return { type: 'figure', sx: 0.24, sy: 0.34, ex: 0.74, ey: 0.48 };
  }
  if (q === Quadrant.SE) {
    return { type: 'seconde', sx: 0.74, sy: 0.64, ex: 0.34, ey: 0.36 };
  }
  return { type: 'flanc', sx: 0.76, sy: 0.30, ex: 0.28, ey: 0.52 };
}
