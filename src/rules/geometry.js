// Module 5: Pure Weapon Quadrant Geometry, 3D Segment-Segment Blade Collision, FIE Impact Mechanics & Broadcast Stinger Controller

function getQuadrant(x, y, weapon = state.selectedWeapon) {
  if (weapon === WeaponId.SABRE) {
    if (y < -0.22 && Math.abs(x) <= 0.45) return Quadrant.NW; // Quinte (5) Overhead Roof
    if (y > 0.22) return Quadrant.SE;                          // Seconde (2) Low Flank
    return x < 0 ? Quadrant.SW : Quadrant.NE;                  // Quarte (4) vs Tierce (3)
  }
  if (y <= 0) {
    return x < 0 ? Quadrant.NW : Quadrant.NE;
  }
  return x < 0 ? Quadrant.SW : Quadrant.SE;
}

function getQuadCoords(q, weapon = state.selectedWeapon) {
  if (weapon === WeaponId.SABRE) {
    switch (q) {
      case Quadrant.NW: return { x:  0.00, y: -0.52 };
      case Quadrant.NE: return { x:  0.48, y: -0.05 };
      case Quadrant.SW: return { x: -0.48, y: -0.05 };
      case Quadrant.SE: return { x:  0.28, y:  0.42 };
      default:          return { x:  0.48, y: -0.05 };
    }
  }
  switch (q) {
    case Quadrant.NW: return { x: -0.44, y: -0.36 };
    case Quadrant.NE: return { x:  0.44, y: -0.36 };
    case Quadrant.SW: return { x: -0.40, y:  0.40 };
    case Quadrant.SE: return { x:  0.40, y:  0.40 };
    default:          return { x:  0.35, y: -0.30 };
  }
}

function getQuadrantLabel(q, weapon = state.selectedWeapon) {
  if (weapon === WeaponId.SABRE) {
    switch (q) {
      case Quadrant.NW: return 'Quinte (5) · 横剑架顶 / 劈头';
      case Quadrant.NE: return 'Tierce (3) · 右外立剑 / 劈臂';
      case Quadrant.SW: return 'Quarte (4) · 左内立剑 / 横斩面';
      case Quadrant.SE: return 'Seconde (2) · 下外斜防 / 撩肋';
      default:          return 'Tierce (3) · 右外立剑';
    }
  }
  if (weapon === WeaponId.EPEE) {
    switch (q) {
      case Quadrant.NW: return 'Masque (4) · 瞄准面罩上内';
      case Quadrant.NE: return 'Poignet (6) · 狙击手腕 (+0.36m)';
      case Quadrant.SW: return 'Corps (7) · 瞄准胸腹内线';
      case Quadrant.SE: return 'Pied (8) · 狙击前脚面膝盖';
      default:          return 'Poignet (6) · 狙击手腕';
    }
  }
  switch (q) {
    case Quadrant.NW: return 'Quarte (4) · 上内线';
    case Quadrant.NE: return 'Sixte (6) · 上外线';
    case Quadrant.SW: return 'Septime (7) · 下内线';
    case Quadrant.SE: return 'Octave (8) · 下外线';
    default:          return 'Sixte (6) · 上外线';
  }
}

function getQuadrantShort(q, weapon = state.selectedWeapon) {
  if (weapon === WeaponId.SABRE) {
    switch (q) {
      case Quadrant.NW: return 'Quinte(5·头顶)';
      case Quadrant.NE: return 'Tierce(3·右臂)';
      case Quadrant.SW: return 'Quarte(4·左面)';
      case Quadrant.SE: return 'Seconde(2·下肋)';
      default:          return 'Tierce(3)';
    }
  }
  if (weapon === WeaponId.EPEE) {
    switch (q) {
      case Quadrant.NW: return 'Masque(面罩)';
      case Quadrant.NE: return 'Poignet(手腕)';
      case Quadrant.SW: return 'Corps(躯干)';
      case Quadrant.SE: return 'Pied(脚面)';
      default:          return 'Poignet(手腕)';
    }
  }
  switch (q) {
    case Quadrant.NW: return 'Quarte(4)';
    case Quadrant.NE: return 'Sixte(6)';
    case Quadrant.SW: return 'Septime(7)';
    case Quadrant.SE: return 'Octave(8)';
    default:          return 'Sixte(6)';
  }
}

function getSabreCutName(q) {
  switch (q) {
    case Quadrant.NW: return 'Coup à la Tête (当头直劈面罩!)';
    case Quadrant.NE: return 'Coup à la Manche (外线挥斩前臂!)';
    case Quadrant.SW: return 'Coup à la Figure (内线横斩面胸!)';
    case Quadrant.SE: return 'Coup au Flanc (下线斜撩侧肋!)';
    default:          return 'Coup de Taille (佩剑挥斩!)';
  }
}

function getEpeeTargetName(q) {
  switch (q) {
    case Quadrant.NE: return 'Saignée au Poignet (重剑远距狙腕!)';
    case Quadrant.NW: return 'Touche au Masque (重剑点刺面罩!)';
    case Quadrant.SE: return 'Touche au Pied (重剑下潜点脚!)';
    default:          return 'Botti au Corps (重剑深刺躯干!)';
  }
}

// ============================================================================
// REAL-MATCH 3D BLADE SEGMENT COLLISION, LEVERAGE & FIE AXIAL IMPACT MECHANICS
// ============================================================================

// Computes exact 3D World-Space Hilt & Tip coordinates matching ThreeArenaEngine
function computeWorldBladeSegment3D(params) {
  const {
    isP1, baseZ, jumpY, posture, ext,
    guardX, guardY, tipX, tipY,
    wType, slashPhase, attackQuad, coupeLift = 0
  } = params;

  const dirZ = isP1 ? 1 : -1;
  const crouchDrop = posture === Posture.DUCK ? 0.30 : 0;
  const lungeSink = ext * 0.23;
  const shoulderY = Math.max(0.68, 1.30 - crouchDrop - lungeSink) + Math.max(0, jumpY * 0.50);
  const shoulderZ = baseZ + dirZ * (0.14 + ext * 0.42);
  const bladeLen = WEAPON_CHANNELS[wType] ? WEAPON_CHANNELS[wType].bladeLength3D : 0.89;

  // Screen +X corresponds to World -X in P1 camera space
  let hx = -0.13 - guardX * 0.22;
  let hy = shoulderY - 0.14 - guardY * 0.18 + coupeLift * 0.16;
  let hz = shoulderZ + dirZ * (0.30 + ext * 0.26);

  let tx = -tipX * 0.36;
  let ty = hy + 0.05 - tipY * 0.24 + coupeLift * 0.32;
  let tz = hz + dirZ * bladeLen;

  if (wType === WeaponId.SABRE) {
    if (slashPhase > 0) {
      const prog = 1 - slashPhase;
      if (attackQuad === Quadrant.NW) {
        hx = -0.06 + prog * 0.04;
        hy = shoulderY + 0.24 - prog * 0.32;
        tx = -0.04;
        ty = hy + Math.cos(prog * 2.1) * bladeLen * 0.82;
        tz = hz + dirZ * (0.35 + Math.sin(prog * 1.65) * bladeLen * 0.72);
      } else if (attackQuad === Quadrant.NE) {
        hx = -0.28 + prog * 0.34;
        hy = shoulderY + 0.04 - prog * 0.12;
        tx = -0.58 + prog * 0.88;
        ty = hy + 0.18 - prog * 0.32;
        tz = hz + dirZ * (bladeLen * 0.86);
      } else if (attackQuad === Quadrant.SW) {
        hx = 0.22 - prog * 0.38;
        hy = shoulderY + 0.05 - prog * 0.08;
        tx = 0.54 - prog * 0.88;
        ty = hy + 0.16 - prog * 0.18;
        tz = hz + dirZ * (bladeLen * 0.86);
      } else {
        hx = -0.24 + prog * 0.28;
        hy = shoulderY - 0.20 + prog * 0.14;
        tx = -0.46 + prog * 0.68;
        ty = hy - 0.12 + prog * 0.28;
        tz = hz + dirZ * (bladeLen * 0.88);
      }
    } else if (guardY < -0.22) {
      // Quinte (5) Overhead Roof Guard
      hx = -0.22;
      hy = shoulderY + 0.28;
      hz = shoulderZ + dirZ * 0.22;
      tx = 0.36;
      ty = hy + 0.04;
      tz = hz + dirZ * 0.12;
    } else {
      tx = hx + (guardX >= 0 ? -0.10 : 0.10) - tipX * 0.14;
      ty = hy + 0.64 - tipY * 0.12;
      tz = hz + dirZ * 0.52;
    }
  }

  return { hx, hy, hz, tx, ty, tz };
}

// Analytical Closest Point Between Two 3D Line Segments (P1: H1->T1, P2: H2->T2)
// Returns stations s1, s2 in [0,1], 3D separation dist3D, 3D contact point, and Forte/Foible leverage ratio!
function solve3DBladeSegmentCollision(seg1, seg2) {
  const d1x = seg1.tx - seg1.hx;
  const d1y = seg1.ty - seg1.hy;
  const d1z = seg1.tz - seg1.hz;

  const d2x = seg2.tx - seg2.hx;
  const d2y = seg2.ty - seg2.hy;
  const d2z = seg2.tz - seg2.hz;

  const rx = seg1.hx - seg2.hx;
  const ry = seg1.hy - seg2.hy;
  const rz = seg1.hz - seg2.hz;

  const a = d1x * d1x + d1y * d1y + d1z * d1z;
  const e = d2x * d2x + d2y * d2y + d2z * d2z;
  const f = d2x * rx + d2y * ry + d2z * rz;

  let s = 0;
  let t = 0;
  const EPS = 1e-6;

  if (a <= EPS && e <= EPS) {
    s = 0; t = 0;
  } else if (a <= EPS) {
    s = 0;
    t = Math.max(0, Math.min(1, f / e));
  } else {
    const c = d1x * rx + d1y * ry + d1z * rz;
    if (e <= EPS) {
      t = 0;
      s = Math.max(0, Math.min(1, -c / a));
    } else {
      const b = d1x * d2x + d1y * d2y + d1z * d2z;
      const denom = a * e - b * b;
      if (denom !== 0) {
        s = Math.max(0, Math.min(1, (b * f - c * e) / denom));
      } else {
        s = 0;
      }
      t = (b * s + f) / e;
      if (t < 0) {
        t = 0;
        s = Math.max(0, Math.min(1, -c / a));
      } else if (t > 1) {
        t = 1;
        s = Math.max(0, Math.min(1, (b - c) / a));
      }
    }
  }

  const c1x = seg1.hx + d1x * s;
  const c1y = seg1.hy + d1y * s;
  const c1z = seg1.hz + d1z * s;

  const c2x = seg2.hx + d2x * t;
  const c2y = seg2.hy + d2y * t;
  const c2z = seg2.hz + d2z * t;

  const nxWorld = c1x - c2x;
  const nyWorld = c1y - c2y;
  const nzWorld = c1z - c2z;
  const dist3D = Math.hypot(nxWorld, nyWorld, nzWorld);

  // Mechanical Leverage: Forte (s -> 0) has ~3x wrist torque authority over Foible (s -> 1)
  const leverageP1 = (1.22 - s) / Math.max(0.22, 1.22 - t);

  return {
    s1: s,
    s2: t,
    dist3D,
    contactX: (c1x + c2x) * 0.5,
    contactY: (c1y + c2y) * 0.5,
    contactZ: (c1z + c2z) * 0.5,
    // Convert world normal (world -X = screen +X, world +Y = screen -Y) to normalized screen guard space
    pushScreenX: dist3D > 1e-4 ? (-nxWorld / dist3D) : 1,
    pushScreenY: dist3D > 1e-4 ? (-nyWorld / dist3D) : 0,
    leverageP1
  };
}

// Checks if an incoming thrust tip strikes the defender's grounded hemispherical Bell Guard (Coquille)
function checkCoquilleGuardIntercept(attackerTipX, attackerTipY, defenderGuardX, defenderGuardY, wType, leverageAdv = 1.0) {
  if (wType === WeaponId.SABRE) return { intercepted: false, deflectX: 0, deflectY: 0 };
  const wCfg = WEAPON_CHANNELS[wType];
  // Screen-space projection of the 3D bell guard cone (Épée 13.5cm bowl covers significantly wider wrist angle than Foil 11cm dish)
  const baseCone = wType === WeaponId.EPEE ? 0.21 : 0.14;
  const effectiveCone = baseCone / Math.max(0.70, Math.min(1.45, leverageAdv));
  const dx = attackerTipX - defenderGuardX;
  const dy = attackerTipY - defenderGuardY;
  const radial = Math.hypot(dx, dy);
  if (radial <= effectiveCone) {
    const inv = radial > 0.001 ? (1 / radial) : 1;
    return {
      intercepted: true,
      coquilleRadiusCm: Math.round(wCfg.coquilleRadius3D * 200),
      deflectX: radial > 0.001 ? dx * inv : (defenderGuardX >= 0 ? -1 : 1),
      deflectY: radial > 0.001 ? dy * inv : -0.6
    };
  }
  return { intercepted: false, deflectX: 0, deflectY: 0 };
}

// Computes real FIE axial tip compression force (Newtons) from relative closing velocity, poise & angle
function computeAxialImpactForceN(wType, relClosingSpeed, bladePoise = 100, lateralTipSpeed = 0, isRemise = false) {
  const baseArmForce = wType === WeaponId.EPEE ? 8.35 : (wType === WeaponId.FOIL ? 6.45 : 9.20);
  const remiseScale = isRemise ? 0.84 : 1.0;
  const momentumTerm = relClosingSpeed * 1.42;
  const poiseLoss = bladePoise < 70 ? ((70 - bladePoise) / 70) * 2.1 : 0;
  const obliqueWhipLoss = Math.min(2.4, lateralTipSpeed * 0.36);
  return Math.max(1.2, (baseArmForce * remiseScale) + momentumTerm - poiseLoss - obliqueWhipLoss);
}

function computeOffTargetStatus(wType, tipX, tipY, tipVelX, tipVelY, poise = 100) {
  const tipSpeed = Math.hypot(tipVelX, tipVelY);
  const poiseScatter = poise < CONSTANTS.POISE_SCATTER_START
    ? ((CONSTANTS.POISE_SCATTER_START - poise) / CONSTANTS.POISE_SCATTER_START) * 0.42
    : 0;
  const whipPenalty = (wType !== WeaponId.SABRE && tipSpeed > 1.95) ? (tipSpeed - 1.95) * 0.20 : 0;
  const effectiveAimX = Math.abs(tipX) + poiseScatter + whipPenalty;
  const effectiveAimY = Math.abs(tipY) + poiseScatter + whipPenalty;

  if (wType === WeaponId.FOIL) {
    return effectiveAimX > 0.54 || effectiveAimY > 0.54 || poise < 34;
  }
  if (wType === WeaponId.EPEE) {
    return effectiveAimX > 0.85 || effectiveAimY > 0.85 || poise < 28;
  }
  if (wType === WeaponId.SABRE) {
    return tipY > 0.62 || poise < 28;
  }
  return false;
}

function triggerPlateClickEffect(el) {
  if (!el) return;
  el.classList.remove('plate-clicked');
  void el.offsetWidth;
  el.classList.add('plate-clicked');
}

let _stingerT1 = null;
let _stingerT2 = null;
let _stingerT3 = null;

function triggerBroadcastStinger(tagText, titleText, subText, accentBgClass = 'bg-amber-400', onMidpoint = null) {
  const bladeAcc = DOM.stingerBladeAccent;
  const bladeMain = DOM.stingerBladeMain;
  if (!bladeAcc || !bladeMain) {
    if (onMidpoint) onMidpoint();
    return;
  }
  clearTimeout(_stingerT1);
  clearTimeout(_stingerT2);
  clearTimeout(_stingerT3);

  setDomText(DOM.stingerTag, tagText);
  setDomText(DOM.stingerTitle, titleText);
  setDomText(DOM.stingerSub, subText);

  if (DOM.stingerRivalAvatar) {
    const showPortrait = String(tagText).startsWith('CHALLENGER //');
    const diff = DIFFICULTIES[state.difficulty] || DIFFICULTIES.normal;
    const srcEl = DOM[diff.portraitDomId];
    if (showPortrait && srcEl && srcEl.src) {
      DOM.stingerRivalAvatar.src = srcEl.src;
      DOM.stingerRivalAvatar.classList.remove('hidden');
    } else {
      DOM.stingerRivalAvatar.classList.add('hidden');
    }
  }

  sound.playStingerSwoosh();

  bladeAcc.style.transition = 'none';
  bladeMain.style.transition = 'none';
  bladeAcc.className = `stinger-blade stinger-off-left absolute inset-y-[-10%] left-[-15%] w-[130%] ${accentBgClass} shadow-2xl`;
  bladeMain.className = 'stinger-blade stinger-off-left absolute inset-y-[-10%] left-[-15%] w-[130%] bg-slate-950 border-x-4 border-amber-400 flex items-center justify-center shadow-2xl';
  void bladeAcc.offsetWidth;

  bladeAcc.style.transition = 'transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)';
  bladeMain.style.transition = 'transform 0.26s cubic-bezier(0.22, 1, 0.36, 1) 0.03s';
  bladeAcc.classList.remove('stinger-off-left');
  bladeAcc.classList.add('stinger-center');
  bladeMain.classList.remove('stinger-off-left');
  bladeMain.classList.add('stinger-center');

  _stingerT1 = setTimeout(() => {
    if (onMidpoint) onMidpoint();
  }, 210);

  _stingerT2 = setTimeout(() => {
    bladeAcc.style.transition = 'transform 0.26s cubic-bezier(0.55, 0, 0.78, 0.36) 0.03s';
    bladeMain.style.transition = 'transform 0.24s cubic-bezier(0.55, 0, 0.78, 0.36)';
    bladeMain.classList.remove('stinger-center');
    bladeMain.classList.add('stinger-off-right');
    bladeAcc.classList.remove('stinger-center');
    bladeAcc.classList.add('stinger-off-right');
  }, 390);

  _stingerT3 = setTimeout(() => {
    bladeAcc.style.transition = 'none';
    bladeMain.style.transition = 'none';
    bladeAcc.className = `stinger-blade stinger-off-left absolute inset-y-[-10%] left-[-15%] w-[130%] ${accentBgClass} shadow-2xl`;
    bladeMain.className = 'stinger-blade stinger-off-left absolute inset-y-[-10%] left-[-15%] w-[130%] bg-slate-950 border-x-4 border-amber-400 flex items-center justify-center shadow-2xl';
  }, 700);
}

function spawnShockwave(screenX, screenY, color = '#fde047', maxRadius = 85) {
  state.shockwaves.push({
    x: screenX,
    y: screenY,
    r: 10,
    maxR: maxRadius,
    life: 0.28,
    maxLife: 0.28,
    color
  });
}

function spawnSparks(screenX, screenY, color = '#fde047', count = 28) {
  if (count >= 22) {
    spawnShockwave(screenX, screenY, color, count >= 34 ? 98 : 68);
  }
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 150 + Math.random() * 500;
    state.sparks.push({
      x: screenX,
      y: screenY,
      px: screenX,
      py: screenY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 85,
      life: 0.22 + Math.random() * 0.36,
      maxLife: 0.56,
      size: 1.8 + Math.random() * 3.0,
      color
    });
  }
}

// Emits 3D Clash Light + Screen-Projected Sparks directly at a 3D World Contact Point!
function trigger3DWorldClashSparks(wx, wy, wz, color = '#fde047', hexColor = 0xfde047, count = 24, intensity = 2.4) {
  state.clashLightWorldX = wx;
  state.clashLightWorldY = wy;
  state.clashLightWorldZ = wz;
  state.clashLightColorHex = hexColor;
  state.clashLightIntensity = Math.max(state.clashLightIntensity, intensity);

  if (window.ThreeArenaEngine && window.ThreeArenaEngine.projectWorldToScreen) {
    const pt = window.ThreeArenaEngine.projectWorldToScreen(wx, wy, wz, false);
    if (pt) {
      spawnSparks(pt.x, pt.y, color, count);
      return pt;
    }
  }
  const vp = getViewportMetrics(false);
  const fx = vp.centerX - wx * 210;
  const fy = vp.vh * 0.46 - (wy - 1.18) * 210;
  spawnSparks(fx, fy, color, count);
  return { x: fx, y: fy };
}

function spawnSabreSlashRibbon(x1, y1, x2, y2, color = '#fb923c') {
  state.slashRibbons.push({
    x1, y1, x2, y2,
    life: 0.30,
    maxLife: 0.30,
    color
  });
}

function spawnFloatingCombatText(screenX, screenY, text, subText = '', color = '#fbbf24') {
  state.floatingTexts.push({
    x: screenX,
    y: screenY,
    vy: -72,
    text,
    subText,
    color,
    life: 0.94,
    maxLife: 0.94
  });
}

function addStyleMomentum(points, popupTitle, popupSub = '', screenX = null, screenY = null, color = '#fbbf24') {
  state.hypeCombo++;
  if (state.hypeCombo > state.maxHypeCombo) state.maxHypeCombo = state.hypeCombo;
  state.stylePoints = Math.min(1200, state.stylePoints + points * (1 + Math.min(4, state.hypeCombo) * 0.2));
  state.masterGauge = Math.min(100, state.masterGauge + Math.round(points * 0.20));

  const vp = getViewportMetrics(false);
  const px = screenX !== null ? screenX : vp.centerX;
  const py = screenY !== null ? screenY : vp.vh * 0.36;
  const comboSuffix = state.hypeCombo >= 2 ? ` x${state.hypeCombo}` : '';
  spawnFloatingCombatText(px, py, `${popupTitle}${comboSuffix}`, popupSub, color);

  if (DOM.styleComboHud) {
    DOM.styleComboHud.classList.remove('hidden');
    const rank = state.stylePoints >= 850 ? 'SS' : (state.stylePoints >= 580 ? 'S' : (state.stylePoints >= 340 ? 'A' : (state.stylePoints >= 160 ? 'B' : 'C')));
    const rankColor = (rank === 'SS' || rank === 'S') ? 'text-amber-400' : (rank === 'A' ? 'text-rose-400' : (rank === 'B' ? 'text-cyan-400' : 'text-emerald-400'));
    setDomText(DOM.styleRankLetter, rank);
    setDomClass(DOM.styleRankLetter, `style-rank-badge style-pop text-4xl font-athletic font-black italic leading-none ${rankColor}`);
    setDomText(DOM.styleComboCountText, `${state.hypeCombo}x STREAK · ${Math.round(state.stylePoints)} PTS`);
    setDomText(DOM.styleActionSubText, popupTitle);
  }
}

function showCallout(title, sub, colorClass = 'text-amber-300', duration = 1.25) {
  const banner = DOM.calloutBanner;
  if (!banner) return;
  setDomClass(DOM.calloutTitle, `text-sm sm:text-base font-athletic font-black italic tracking-widest uppercase ${colorClass} mr-2`);
  setDomText(DOM.calloutTitle, title);
  setDomText(DOM.calloutSub, sub);
  banner.classList.remove('opacity-0', 'scale-95');
  banner.classList.add('opacity-100', 'scale-100');

  clearTimeout(banner._hideTimer);
  banner._hideTimer = setTimeout(() => {
    banner.classList.remove('opacity-100', 'scale-100');
    banner.classList.add('opacity-0', 'scale-95');
  }, duration * 1000);
}

function setScoringLamps(playerColored, aiColored, playerWhite = false, aiWhite = false) {
  setDomClass(
    DOM.lampPlayer,
    'w-10 h-3.5 border transition-all duration-150 ' +
      (playerColored ? 'bg-emerald-500 border-emerald-200 score-lamp-green' : 'bg-slate-900 border-slate-700')
  );
  setDomClass(
    DOM.lampAI,
    'w-10 h-3.5 border transition-all duration-150 ' +
      (aiColored ? 'bg-rose-500 border-rose-200 score-lamp-red' : 'bg-slate-900 border-slate-700')
  );
  setDomClass(
    DOM.lampPlayerWhite,
    'w-5 h-1.5 border transition-all duration-150 ' +
      (playerWhite ? 'bg-slate-100 border-white score-lamp-white' : 'bg-slate-900 border-slate-800')
  );
  setDomClass(
    DOM.lampAIWhite,
    'w-5 h-1.5 border transition-all duration-150 ' +
      (aiWhite ? 'bg-slate-100 border-white score-lamp-white' : 'bg-slate-900 border-slate-800')
  );
}

function loadSavedMedals() {
  try {
    const raw = localStorage.getItem('engarde_grand_slam_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') state.medalsEarned = parsed;
    }
  } catch (_) {}
}

function recordChampionshipMedal(diffKey, weaponKey) {
  const k = `${diffKey}_${weaponKey}`;
  const isNew = !state.medalsEarned[k];
  state.medalsEarned[k] = true;
  try {
    localStorage.setItem('engarde_grand_slam_v2', JSON.stringify(state.medalsEarned));
  } catch (_) {}
  updateRivalPersonaUI();
  return isNew;
}

function updateRivalPersonaUI() {
  const diff = DIFFICULTIES[state.difficulty] || DIFFICULTIES.normal;
  setDomText(DOM.rivalNameText, diff.rivalName);
  setDomText(DOM.rivalCountryBadge, diff.country);
  setDomText(DOM.rivalTitleText, diff.rivalTitle);
  setDomText(DOM.rivalTauntQuote, diff.tauntQuote);
  setDomText(DOM.rivalStyleDesc, diff.rivalDesc);

  const srcEl = DOM[diff.portraitDomId];
  if (DOM.rivalPortraitImg && srcEl && srcEl.src) {
    DOM.rivalPortraitImg.src = srcEl.src;
  }

  const medalMap = [
    { w: 'foil', el: DOM.medalChipFoil, label: 'FOIL' },
    { w: 'epee', el: DOM.medalChipEpee, label: 'ÉPÉE' },
    { w: 'sabre', el: DOM.medalChipSabre, label: 'SABRE' }
  ];
  for (const m of medalMap) {
    const won = !!state.medalsEarned[`${state.difficulty}_${m.w}`];
    setDomText(m.el, won ? `${m.label} ★` : `${m.label} ○`);
    setDomClass(
      m.el,
      won
        ? 'px-1.5 py-0.2 text-[8px] font-mono-tech font-black bg-amber-400/20 text-amber-300 border border-amber-400/60'
        : 'px-1.5 py-0.2 text-[8px] font-mono-tech font-bold bg-slate-900 text-slate-500 border border-slate-800'
    );
  }

  let totalMedals = 0;
  for (const d of ['easy', 'normal', 'master']) {
    for (const w of ['foil', 'epee', 'sabre']) {
      if (state.medalsEarned[`${d}_${w}`]) totalMedals++;
    }
  }
  setDomText(DOM.grandSlamBadge, `TROPHIES: ${totalMedals}/9`);

  if (state.gameMode === GameMode.SINGLE) {
    setDomText(DOM.p2TitleLabel, `${diff.rivalName.split(' ')[1]} [${diff.country}]`);
  }
}

function selectWeaponDiscipline(wType, silent = false) {
  if (!WEAPON_CHANNELS[wType]) return;
  state.selectedWeapon = wType;
  const wCfg = WEAPON_CHANNELS[wType];

  const cards = {
    foil: {
      el: DOM.cardFoil,
      badge: DOM.badgeFoilStatus,
      activeCls: 'border-2 border-cyan-400 weapon-card-active-glow-cyan',
      badgeActiveCls: 'absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-cyan-400 text-slate-950 text-[8px] font-mono-tech font-black',
      heroCap: 'FLEURET // 4.90N SPRING TIP & FORTE-FOIBLE LEVERAGE'
    },
    epee: {
      el: DOM.cardEpee,
      badge: DOM.badgeEpeeStatus,
      activeCls: 'border-2 border-amber-400 weapon-card-active-glow-amber',
      badgeActiveCls: 'absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[8px] font-mono-tech font-black',
      heroCap: 'ÉPÉE // 7.35N COQUILLE DEFLECTION & 45MS LOCKOUT'
    },
    sabre: {
      el: DOM.cardSabre,
      badge: DOM.badgeSabreStatus,
      activeCls: 'border-2 border-orange-400 weapon-card-active-glow-orange',
      badgeActiveCls: 'absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-orange-400 text-slate-950 text-[8px] font-mono-tech font-black',
      heroCap: 'SABRE // CONTRE-TAILLE BLADE CLASH & 170MS LOCKOUT'
    }
  };

  Object.keys(cards).forEach(k => {
    const item = cards[k];
    if (!item.el) return;
    if (k === wType) {
      setDomClass(item.el, `weapon-card cursor-pointer bg-slate-950 group ${item.activeCls}`);
      setDomText(item.badge, 'ACTIVE');
      setDomClass(item.badge, item.badgeActiveCls);
      const cardImg = item.el.querySelector('img');
      if (DOM.heroKeyArtImg && cardImg && DOM.heroKeyArtImg.getAttribute('data-wpn') !== wType) {
        DOM.heroKeyArtImg.src = cardImg.src;
        DOM.heroKeyArtImg.setAttribute('data-wpn', wType);
      }
      setDomText(DOM.heroKeyArtCaption, item.heroCap);
    } else {
      setDomClass(item.el, 'weapon-card cursor-pointer border border-slate-700/90 hover:border-slate-500 bg-slate-950 group opacity-80 hover:opacity-100');
      setDomText(item.badge, 'READY');
      setDomClass(item.badge, 'absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-slate-900/90 text-slate-400 text-[8px] font-mono-tech font-bold');
    }
  });

  if (wType === WeaponId.SABRE) {
    setDomText(DOM.quadNW, '5顶');
    setDomText(DOM.quadNE, '3右');
    setDomText(DOM.quadSW, '4左');
    setDomText(DOM.quadSE, '2肋');
  } else if (wType === WeaponId.EPEE) {
    setDomText(DOM.quadNW, '面');
    setDomText(DOM.quadNE, '腕');
    setDomText(DOM.quadSW, '胸');
    setDomText(DOM.quadSE, '脚');
  } else {
    setDomText(DOM.quadNW, '4');
    setDomText(DOM.quadNE, '6');
    setDomText(DOM.quadSW, '7');
    setDomText(DOM.quadSE, '8');
  }

  setDomText(DOM.weaponChannelNotice, wCfg.channelDesc);
  setDomClass(
    DOM.weaponChannelNotice,
    wType === WeaponId.FOIL
      ? 'text-[10px] font-mono-tech text-cyan-300 font-bold'
      : (wType === WeaponId.EPEE ? 'text-[10px] font-mono-tech text-amber-300 font-bold' : 'text-[10px] font-mono-tech text-orange-300 font-bold')
  );

  if (DOM.watermarkSpecBox) {
    DOM.watermarkSpecBox.classList.remove('telemetry-pulse');
    void DOM.watermarkSpecBox.offsetWidth;
    DOM.watermarkSpecBox.classList.add('telemetry-pulse');
  }
  if (wType === WeaponId.SABRE) {
    setDomText(DOM.watermarkWeaponTitle, 'SABRE · 佩剑 (ARME DE TAILLE)');
    setDomText(DOM.watermarkSpec1, 'CONTRE-TAILLE 拼刀');
    setDomText(DOM.watermarkSpec2, '170ms ±10ms');
    setDomText(DOM.watermarkSpec3, 'PRIORITÉ + 腰上有效');
  } else if (wType === WeaponId.EPEE) {
    setDomText(DOM.watermarkWeaponTitle, 'ÉPÉE · 重剑 (FULL TARGET)');
    setDomText(DOM.watermarkSpec1, '> 7.35N (750gf)');
    setDomText(DOM.watermarkSpec2, '45ms LIVE BOX');
    setDomText(DOM.watermarkSpec3, 'COQUILLE + 双灯');
  } else {
    setDomText(DOM.watermarkWeaponTitle, 'FLEURET · 花剑 (FOIL)');
    setDomText(DOM.watermarkSpec1, '> 4.90N (500gf)');
    setDomText(DOM.watermarkSpec2, 'FORTE/FOIBLE 抗剑');
    setDomText(DOM.watermarkSpec3, 'PRIORITÉ 优先权');
  }

  state.quadrant = getQuadrant(state.guardX, state.guardY, wType);
  state.aiQuadrant = getQuadrant(state.aiGuardX, state.aiGuardY, wType);
  updateScoreHUD();

  if (!silent) {
    const activeCard = cards[wType] ? cards[wType].el : null;
    triggerPlateClickEffect(activeCard);
    state.showcaseWeaponPulse = 1.0;
    state.camShake = 0.14;
    if (wType === WeaponId.SABRE) {
      state.p2SabreSlashPhase = 1.0;
      sound.playSabreCut();
    } else {
      state.aiExtension = 0.85;
      sound.playClang(wType === WeaponId.FOIL ? 1040 : 680, 0.75);
    }
    const sparkX = (!state.running && state.paused && canvas.width > 760) ? canvas.width * 0.67 : canvas.width * 0.5;
    spawnSparks(sparkX, canvas.height * 0.44, wCfg.bladeColor, 26);
    refVoice.speakCue('engarde', `${wCfg.frenchName}! En garde!`);
  }
}
