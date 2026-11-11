// Module 6: Real-Match 120Hz 3D Blade-Collision Physics, FIE Spring-Tip & Lockout Box, Inertial Footwork, Remise & Tactical AI

function injectBladeVibration(isP1, impX, impY) {
  if (isP1) {
    state.bladeVibVelX = Math.max(-9.5, Math.min(9.5, state.bladeVibVelX + impX));
    state.bladeVibVelY = Math.max(-9.5, Math.min(9.5, state.bladeVibVelY + impY));
  } else {
    state.p2BladeVibVelX = Math.max(-9.5, Math.min(9.5, state.p2BladeVibVelX + impX));
    state.p2BladeVibVelY = Math.max(-9.5, Math.min(9.5, state.p2BladeVibVelY + impY));
  }
}

function accelerateWithPisteTraction(currentVel, targetVel, dt, accelRate = CONSTANTS.FOOTWORK_ACCEL, brakeRate = CONSTANTS.FOOTWORK_FRICTION) {
  const diff = targetVel - currentVel;
  const isBrakingOrReversing = (Math.abs(targetVel) < Math.abs(currentVel)) || (targetVel * currentVel < -0.05);
  const rate = isBrakingOrReversing ? brakeRate * 1.35 : accelRate;
  const maxDelta = rate * dt;
  if (Math.abs(diff) <= maxDelta) return targetVel;
  return currentVel + Math.sign(diff) * maxDelta;
}

function triggerP2SabreSlashVisual(quad, swipeDx = 0, swipeDy = 0) {
  state.p2SabreSlashPhase = 1.0;
  const norms = computeSabreSlashNorms(quad, swipeDx, swipeDy);
  state.p2SabreSlashType = norms.type;
  state.p2SabreSlashStartNormX = norms.sx;
  state.p2SabreSlashStartNormY = norms.sy;
  state.p2SabreSlashEndNormX = norms.ex;
  state.p2SabreSlashEndNormY = norms.ey;

  if (state.gameMode === GameMode.SPLIT_2P) {
    const vp2 = getViewportMetrics(true);
    spawnSabreSlashRibbon(
      vp2.vx + norms.sx * vp2.vw,
      norms.sy * vp2.vh,
      vp2.vx + norms.ex * vp2.vw,
      norms.ey * vp2.vh,
      '#fb7185'
    );
  }
}

function handleSwipeBladeMovement(nx, ny) {
  const clampedX = Math.max(-0.92, Math.min(0.92, nx));
  const clampedY = Math.max(-0.82, Math.min(0.82, ny));
  const dx = clampedX - state.prevMouseX;
  const dy = clampedY - state.prevMouseY;
  const deltaDist = Math.hypot(dx, dy);

  state.prevMouseX = clampedX;
  state.prevMouseY = clampedY;
  state.mouseX = clampedX;
  state.mouseY = clampedY;

  if (state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;

  const dist = state.aiZ - state.playerZ;
  const newQuad = getQuadrant(clampedX, clampedY, state.selectedWeapon);
  const quadChanged = newQuad !== state.quadrant;

  // Smart Reversal-Angle Waggle Detector:
  // Purposeful sweeps, Coupé disengages & Moulinet cuts do NOT penalize poise; only rapid >125° jitter reversals accumulate waggleHeat!
  if (deltaDist > 0.035) {
    const ux = dx / deltaDist;
    const uy = dy / deltaDist;
    const dot = ux * state.lastMoveDirX + uy * state.lastMoveDirY;
    state.lastMoveDirX = ux;
    state.lastMoveDirY = uy;

    if (dot < -0.45 && deltaDist > 0.085 && state.selectedWeapon !== WeaponId.SABRE) {
      state.waggleHeat = Math.min(3.2, state.waggleHeat + deltaDist * 4.2);
      state.bladePoise = Math.max(12, state.bladePoise - deltaDist * 48);
    } else if (deltaDist > 0.34 && state.selectedWeapon !== WeaponId.SABRE) {
      state.waggleHeat = Math.min(3.2, state.waggleHeat + (deltaDist - 0.30) * 2.5);
      state.bladePoise = Math.max(20, state.bladePoise - (deltaDist - 0.30) * 28);
    }
  }

  if (state.bladePoise < CONSTANTS.POISE_LOSS_THRESHOLD) {
    state.swipeParryWindow = 0;
    if (state.rightOfWay === 'player' && state.riposteBonusTimer <= 0) {
      state.rightOfWay = 'ai';
      state.rowMeter = 80;
      state.rowReason = 'GARDE OUVERTE · 乱晃失稳';
    }
    if (state.gameMode === GameMode.SINGLE && state.aiAction === Action.IDLE && dist < 2.65 && state.punishCooldown <= 0) {
      state.punishCooldown = 0.95;
      launchAIScheme('temps_opportunite');
    }
    return;
  }

  if (state.parryWhiffLockout > 0) return;

  // Feint-Bait Punishment (Biting early on yellow deception)
  if (state.gameMode !== GameMode.SPLIT_2P && (state.aiAction === Action.FEINT1 || state.aiAction === Action.FEINT2) && dist < 2.85 && deltaDist > 0.05) {
    if (newQuad === state.aiAttackQuad) {
      state.parryWhiffLockout = 0.32;
      state.swipeParryWindow = 0;
      state.bladePoise = Math.max(28, state.bladePoise - 24);
      injectBladeVibration(true, dx * 18, dy * 18);
      state.rowReason = 'PARADE VIDE · 被假动作骗挡硬直';
      showCallout('DÉROBEMENT! 被黄光虚晃骗挡', '护手盘失位 0.32s — 快按 A 拉开距离或 S 下蹲！', 'text-amber-300', 0.9);
      return;
    }
  }

  if ((deltaDist > 0.052 || (quadChanged && deltaDist > 0.032)) && state.swipeParryCooldown <= 0) {
    state.swipeParryWindow = 0.22;
    state.swipeParryCooldown = 0.22;
    state.tipVelX += dx * 6.8;
    state.tipVelY += dy * 6.8;
    // Subtle wrist-whip excites natural Maraging steel flex
    injectBladeVibration(true, -dx * 9.5, -dy * 9.5);
    sound.playSwoosh(1.18);

    // Sabre Sweep-to-Slash Gesture
    if (state.selectedWeapon === WeaponId.SABRE && state.playerAction === Action.IDLE &&
        dist <= 2.45 && dist >= 1.30 && state.bladePoise >= 48 &&
        state.aiAction !== Action.LUNGE && state.aiAction !== Action.PREP && deltaDist > 0.10) {
      performPlayerLunge(dx, dy);
      return;
    }
  }

  // Circular Enveloppement (360° Forte Spiral) Detection during 3D Blade Bind
  const angle = Math.atan2(clampedY, clampedX);
  let dAngle = angle - state.lastWindAngle;
  if (dAngle > Math.PI) dAngle -= Math.PI * 2;
  if (dAngle < -Math.PI) dAngle += Math.PI * 2;
  state.lastWindAngle = angle;

  if (state.bladeBindActive && dist < 2.65 && state.bladePoise >= 50) {
    state.circularWindAccum = state.circularWindAccum * 0.93 + Math.abs(dAngle);
    if (state.circularWindAccum > 3.4 && state.beatCooldown <= 0) {
      state.circularWindAccum = 0;
      state.beatCooldown = 1.00;
      executeSuccessfulPlayerParry('ENVELOPPEMENT', true);
      return;
    }
  }

  // Active Swipe Parry Check (with 3D Contact Spark Emission!)
  if ((state.aiAction === Action.PREP || state.aiAction === Action.LUNGE || state.aiAction === Action.REMISE || state.aiAction === Action.COUPE) &&
      dist < 2.80 && deltaDist > 0.038 && state.bladePoise >= CONSTANTS.POISE_LOSS_THRESHOLD) {
    const targetQc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    const distToThreat = Math.hypot(clampedX - targetQc.x, clampedY - targetQc.y);
    if (newQuad === state.aiAttackQuad || distToThreat < 0.36) {
      const isPerfect = ((state.aiAction === Action.LUNGE || state.aiAction === Action.REMISE) && state.aiExtension >= 0.36);
      const label = state.selectedWeapon === WeaponId.SABRE && newQuad === Quadrant.NW
        ? 'QUINTE (5号架顶)'
        : (isPerfect ? 'PARADE PARFAITE' : 'PARADE');
      executeSuccessfulPlayerParry(label, isPerfect);
      return;
    }
  }

  // Proactive Battement (Sharp Forte-on-Foible Beat-Blade Seizure!)
  if (state.aiAction === Action.IDLE && dist < 2.64 && state.beatCooldown <= 0 &&
      deltaDist > 0.065 && deltaDist < 0.36 && state.bladePoise >= 60) {
    const distToAiBlade = Math.hypot(clampedX - state.aiGuardX, clampedY - state.aiGuardY);
    if (distToAiBlade < 0.25) {
      state.beatCooldown = 1.05;
      state.rightOfWay = 'player';
      state.rowMeter = -82;
      state.aiGuardX = Math.max(-0.78, Math.min(0.78, state.aiGuardX + dx * 2.25));
      state.aiGuardY = Math.max(-0.68, Math.min(0.68, state.aiGuardY + dy * 2.25));
      state.p2TipVelX += dx * 12;
      state.p2TipVelY += dy * 12;
      injectBladeVibration(true, -dx * 16, -dy * 16);
      injectBladeVibration(false, dx * 26, dy * 26);
      state.camShake = 0.15;
      state.rowReason = 'BATTEMENT · 强剑身敲击夺权!';
      sound.playClang(1180, 0.92, false);
      const midZ = (state.playerZ + state.aiZ) * 0.5;
      const pt = trigger3DWorldClashSparks(-clampedX * 0.24, 1.18 - clampedY * 0.18, midZ, '#fde047', 0xfde047, 26, 2.5);
      addStyleMomentum(95, 'BATTEMENT!', 'FORTE BEAT · PRIORITY SEIZED', pt.x, pt.y - 28, '#fde047');
    }
  }
}

function triggerPlayerJump() {
  if (state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;
  if (state.playerPosture === Posture.JUMP || state.stamina < 14) return;
  state.stamina = Math.max(0, state.stamina - 14);
  state.playerPosture = Posture.JUMP;
  state.playerVelY = 2.65;
  state.stepBurstDir = 1;
  state.stepBurstTimer = 0.24;
  sound.playFootstep(true);

  if (state.gameMode === GameMode.TUTORIAL && TUTORIAL_LESSONS[state.tutorialStep].step === 2 && !state.tutorialFootworkFlags.vertical) {
    state.tutorialFootworkFlags.vertical = true;
    advanceTutorialProgress(1, '已完成跳跃机动 (Bond)！');
  }
}

function setPlayerDuck(active) {
  state.duckHeld = active;
  if (!state.running || state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;
  if (active && state.playerPosture !== Posture.JUMP) {
    state.playerPosture = Posture.DUCK;
    sound.playShoeSqueak();

    if (state.gameMode === GameMode.TUTORIAL && TUTORIAL_LESSONS[state.tutorialStep].step === 2 && !state.tutorialFootworkFlags.vertical) {
      state.tutorialFootworkFlags.vertical = true;
      advanceTutorialProgress(1, '已完成下蹲闪避 (Esquive)！');
    }
  }
}

function triggerFootworkBurst(dir) {
  if (state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;
  if (state.playerAction === Action.LUNGE) return;
  // Shoe-piste rubber traction squeak when reversing fast momentum!
  if ((dir < 0 && state.playerVelZ > 1.3) || (dir > 0 && state.playerVelZ < -1.3)) {
    sound.playShoeSqueak();
  }
  state.stepBurstDir = dir;
  state.stepBurstTimer = 0.17;
  sound.playFootstep(false);

  if (state.gameMode === GameMode.TUTORIAL && TUTORIAL_LESSONS[state.tutorialStep].step === 2) {
    if (dir > 0 && !state.tutorialFootworkFlags.advance) {
      state.tutorialFootworkFlags.advance = true;
      advanceTutorialProgress(1, '已完成前进步 (Marche)！');
    } else if (dir < 0 && !state.tutorialFootworkFlags.retreat) {
      state.tutorialFootworkFlags.retreat = true;
      advanceTutorialProgress(1, '已完成撤退步 (Rompre)！');
    }
  }

  if (dir > 0) {
    state.playerMarchTimer = 0.55;
    if (state.aiAction === Action.IDLE && state.bladePoise >= CONSTANTS.POISE_LOSS_THRESHOLD) {
      state.rightOfWay = 'player';
      state.rowMeter = -65;
      state.rowReason = state.selectedWeapon === WeaponId.EPEE ? 'MARCHE · 重剑压迫控距' : 'PRIORITÉ P1 · 前压步法主动';
      const dist = state.aiZ - state.playerZ;
      const diffCfg = DIFFICULTIES[state.difficulty];
      if (state.gameMode === GameMode.SINGLE && dist < 2.45 && Math.random() < 0.30 * diffCfg.speedMult) {
        launchAIScheme('stop_hit_retreat');
      }
    }
  } else if (dir < 0) {
    state.playerMarchTimer = 0;
    state.marchHoldDuration = 0;
    if (state.rightOfWay === 'player' && state.riposteBonusTimer <= 0) {
      state.rightOfWay = 'none';
      state.rowMeter = 15;
      state.rowReason = 'ROMPRE · 后撤拉开距离';
    }
  }
}

// 2P Controls
function setPlayer2Quad(q) {
  if (state.gameMode !== GameMode.SPLIT_2P || state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;
  const qc = getQuadCoords(q, state.selectedWeapon);
  state.aiTargetX = qc.x;
  state.aiTargetY = qc.y;
  state.aiAttackQuad = q;
  state.p2ParryActiveWindow = 0.22;
}

function triggerPlayer2FootworkBurst(dir) {
  if (state.gameMode !== GameMode.SPLIT_2P || state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;
  if (state.aiAction === Action.LUNGE) return;
  state.p2StepBurstDir = dir;
  state.p2StepBurstTimer = 0.17;
  sound.playFootstep(false);
  if (dir < 0) {
    state.p2MarchTimer = 0.55;
  } else {
    state.p2MarchTimer = 0;
    state.p2MarchHoldDuration = 0;
  }
}

function triggerPlayer2Jump() {
  if (state.gameMode !== GameMode.SPLIT_2P || state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;
  if (state.aiPosture === Posture.JUMP || state.p2Stamina < 14) return;
  state.p2Stamina = Math.max(0, state.p2Stamina - 14);
  state.aiPosture = Posture.JUMP;
  state.aiVelY = 2.65;
  sound.playFootstep(true);
}

function setPlayer2Duck(active) {
  if (state.gameMode !== GameMode.SPLIT_2P) return;
  state.p2DuckHeld = active;
  if (active && state.aiPosture !== Posture.JUMP) {
    state.aiPosture = Posture.DUCK;
    sound.playShoeSqueak();
  }
}

function performPlayer2Lunge() {
  if (state.gameMode !== GameMode.SPLIT_2P || state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;
  const canRemise = (state.aiAction === Action.RECOVERY && state.p2RemiseCooldown <= 0 && state.p2Stamina >= 15);
  if (state.aiAction !== Action.IDLE && state.aiAction !== Action.PARRYING && !canRemise) return;
  if (state.p2Stamina < (canRemise ? 15 : 20)) return;

  state.p2Stamina = Math.max(0, state.p2Stamina - (canRemise ? 15 : 25));
  state.aiAttackQuad = state.aiQuadrant;
  state.aiAction = canRemise ? Action.REMISE : Action.LUNGE;
  state.aiActionTimer = canRemise ? 0.19 : 0.27;
  state.aiStrikeEvaluated = false;
  if (canRemise) state.p2RemiseCooldown = 0.55;
  state.p2MarchHoldDuration = 0;

  if (state.selectedWeapon === WeaponId.SABRE) {
    triggerP2SabreSlashVisual(state.aiAttackQuad);
    sound.playSabreCut();
  } else {
    sound.playSwoosh(canRemise ? 1.32 : 1.15);
  }
  if (!canRemise && (state.p2RiposteBonusTimer > 0 || state.playerAction === Action.IDLE)) {
    state.rightOfWay = 'ai';
    state.rowMeter = 92;
    state.rowReason = 'ATTAQUE P2 · 右方进攻主动';
  }
}

function performPlayer2Parry() {
  if (state.gameMode !== GameMode.SPLIT_2P || state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;
  if (state.aiAction === Action.LUNGE) return;
  state.aiAction = Action.PARRYING;
  state.aiActionTimer = 0.24;
  state.p2ParryActiveWindow = 0.24;
  sound.playSwoosh(0.95);
}

function executeSuccessfulP2Parry() {
  state.playerAction = Action.RECOVERY;
  state.playerActionTimer = 0.42;
  state.remiseCooldown = 0.06;
  state.aiAction = Action.PARRYING;
  state.aiActionTimer = 0.18;
  state.p2RiposteBonusTimer = 0.92;
  state.rightOfWay = 'ai';
  state.rowMeter = 100;
  state.rowReason = 'PARADE P2 · 右方格挡夺权';
  state.hitStopTimer = 0.052;
  state.p2CamShake = 0.22;
  state.camShake = 0.16;
  injectBladeVibration(true, 18, -14);
  injectBladeVibration(false, -12, 10);
  sound.playClang(1060, 1.2, false);
  refVoice.speakCue('parade');
  const vp2 = getViewportMetrics(true);
  spawnSparks(vp2.centerX + state.aiGuardX * 135, vp2.vh * 0.46 + state.aiGuardY * 105, '#fb7185', 34);
  showCallout('PARADE P2! 右方格挡成功', 'P2 立即按 Enter / J 还击，P1 可后撤或变线补刺！', 'text-rose-300', 0.95);
}

// COUP DE MAÎTRE (100% Gauge Weapon-Authentic Olympic Signature Masterstrike)
function performPlayerMasterStrike() {
  if (state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;
  if (state.masterGauge < 100) {
    showCallout('COUP DE MAÎTRE CHARGING', `抗剑压制、格挡或命中积攒绝技槽 (${Math.round(state.masterGauge)}%)`, 'text-amber-300', 0.85);
    return;
  }
  if (state.playerAction === Action.LUNGE) return;

  state.masterGauge = 0;
  state.masterStrikeActive = true;
  state.bladePoise = 100;
  state.stamina = Math.max(28, state.stamina);
  state.speedLinesAlpha = 1.0;
  state.screenFlash = 0.26;
  state.screenFlashColor = '#fbbf24';
  state.camShake = 0.24;
  sound.playMasterStrikeActivation();

  const vp1 = getViewportMetrics(false);
  const wType = state.selectedWeapon;

  if (wType === WeaponId.FOIL) {
    const openQuads = [Quadrant.NW, Quadrant.NE, Quadrant.SW, Quadrant.SE].filter(q => q !== state.aiQuadrant);
    const targetQ = openQuads[0] || Quadrant.NE;
    const qc = getQuadCoords(targetQ, WeaponId.FOIL);
    state.mouseX = qc.x * 0.65;
    state.mouseY = qc.y * 0.65;
    state.guardX = state.mouseX;
    state.guardY = state.mouseY;
    state.tipX = state.mouseX * 0.45;
    state.tipY = state.mouseY * 0.45;
    state.quadrant = targetQ;
    state.playerPosture = Posture.JUMP;
    state.playerVelY = 2.15;
    state.stepBurstDir = 1.68;
    state.stepBurstTimer = 0.26;
    state.rightOfWay = 'player';
    state.rowMeter = -100;
    spawnSparks(vp1.centerX, vp1.vh * 0.45, '#22d3ee', 40);
    spawnFloatingCombatText(vp1.centerX, vp1.vh * 0.34, '⚡ FLÈCHE ÉCLAIR!', 'FOIL COUP DE MAÎTRE', '#22d3ee');
    state.playerAction = Action.IDLE;
    performPlayerLunge();
  } else if (wType === WeaponId.EPEE) {
    const qc = getQuadCoords(Quadrant.NE, WeaponId.EPEE);
    state.mouseX = qc.x * 0.55;
    state.mouseY = qc.y * 0.55;
    state.guardX = state.mouseX;
    state.guardY = state.mouseY;
    state.tipX = 0.10;
    state.tipY = -0.10;
    state.quadrant = Quadrant.NE;
    state.bladeBindActive = true;
    state.bindPressure = 1.0;
    state.bindLeverage = 2.2;
    state.stepBurstDir = 1.48;
    state.stepBurstTimer = 0.24;
    spawnSparks(vp1.centerX, vp1.vh * 0.44, '#fbbf24', 40);
    spawnFloatingCombatText(vp1.centerX, vp1.vh * 0.34, '🎯 CONTRE-TEMPS IMPÉRIAL!', 'ÉPÉE FORTE OPPOSITION SNIPE', '#fbbf24');
    state.playerAction = Action.IDLE;
    performPlayerLunge();
  } else {
    state.quadrant = Quadrant.NW;
    state.tipY = -0.25;
    state.playerPosture = Posture.JUMP;
    state.playerVelY = 2.35;
    state.stepBurstDir = 1.75;
    state.stepBurstTimer = 0.26;
    state.rightOfWay = 'player';
    state.rowMeter = -100;
    spawnSabreSlashRibbon(vp1.vx + 0.20 * vp1.vw, 0.18 * vp1.vh, vp1.vx + 0.80 * vp1.vw, 0.58 * vp1.vh, '#fb923c');
    spawnSabreSlashRibbon(vp1.vx + 0.80 * vp1.vw, 0.18 * vp1.vh, vp1.vx + 0.20 * vp1.vw, 0.58 * vp1.vh, '#fde047');
    spawnSparks(vp1.centerX, vp1.vh * 0.42, '#fb923c', 46);
    spawnFloatingCombatText(vp1.centerX, vp1.vh * 0.34, '🔥 OURAGAN DE QUINTE!', 'SABRE AIRBORNE FLUNGE', '#fb923c');
    state.playerAction = Action.IDLE;
    performPlayerLunge(0, 0.25);
  }
}

function performPlayerLunge(swipeDx = 0, swipeDy = 0) {
  if (state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;

  // Authentic Second-Intention Remise (二次补剑 / 续刺) while recovering from a parried/short lunge or Coquille ricochet!
  const isRemise = (state.playerAction === Action.RECOVERY && state.remiseCooldown <= 0 && !state.masterStrikeActive);
  if (state.playerAction !== Action.IDLE && state.playerAction !== Action.PARRY && !isRemise) return;

  const staminaCost = isRemise ? 15 : 24;
  if (state.stamina < (isRemise ? 15 : 20)) {
    showCallout('LOW STAMINA', '按 A 后撤步调整呼吸恢复体能', 'text-amber-400', 0.8);
    return;
  }

  state.stamina = Math.max(0, state.stamina - staminaCost);
  state.playerAction = isRemise ? Action.REMISE : Action.LUNGE;
  state.playerActionTimer = isRemise ? 0.19 : 0.27;
  state.playerStrikeEvaluated = false;
  if (isRemise) {
    state.remiseCooldown = 0.56;
    state.playerExtension = Math.max(0.42, state.playerExtension);
  }
  state.speedLinesAlpha = state.selectedWeapon === WeaponId.SABRE ? 0.68 : (isRemise ? 0.38 : 0.48);
  state.marchHoldDuration = 0;

  if (state.selectedWeapon === WeaponId.SABRE) {
    state.sabreSlashPhase = 1.0;
    const norms = computeSabreSlashNorms(state.quadrant, swipeDx, swipeDy);
    state.sabreSlashType = norms.type;
    state.sabreSlashStartNormX = norms.sx;
    state.sabreSlashStartNormY = norms.sy;
    state.sabreSlashEndNormX = norms.ex;
    state.sabreSlashEndNormY = norms.ey;

    sound.playSabreCut();
    const vp1 = getViewportMetrics(false);
    spawnSabreSlashRibbon(
      vp1.vx + norms.sx * vp1.vw,
      norms.sy * vp1.vh,
      vp1.vx + norms.ex * vp1.vw,
      norms.ey * vp1.vh,
      isRemise ? '#fde047' : '#fb923c'
    );
  } else {
    sound.playSwoosh(isRemise ? 1.38 : 1.15);
  }

  state.playerAttackHistory.push(state.quadrant);
  if (state.playerAttackHistory.length > 4) state.playerAttackHistory.shift();

  if (isRemise) {
    state.rowReason = `REMISE · 变线二次续刺 ${getQuadrantShort(state.quadrant)}`;
  } else if (state.selectedWeapon === WeaponId.EPEE) {
    state.rowReason = state.bladeBindActive && state.bindLeverage >= 1.18
      ? `OPPOSITION · 压剑封线刺 ${getQuadrantShort(state.quadrant)}`
      : `ÉPÉE · 狙刺 ${getQuadrantShort(state.quadrant)}`;
  } else if (state.bladePoise < CONSTANTS.POISE_LOSS_THRESHOLD && state.riposteBonusTimer <= 0) {
    state.rightOfWay = 'ai';
    state.rowMeter = 85;
    state.rowReason = 'GARDE OUVERTE · 失稳失权';
  } else if (state.riposteBonusTimer > 0) {
    state.rightOfWay = 'player';
    state.rowMeter = -100;
    state.rowReason = 'RIPOSTE P1 · 防反绝对优先';
  } else if (state.bladeBindActive && state.bindLeverage >= 1.20) {
    state.rightOfWay = 'player';
    state.rowMeter = -95;
    state.rowReason = `COULÉ FORTE (${state.bindLeverage.toFixed(1)}x) · 强剑身滑压进攻`;
  } else if (state.aiAction === Action.IDLE || state.aiAction === Action.RECOVERY) {
    state.rightOfWay = 'player';
    state.rowMeter = -90;
    state.rowReason = state.selectedWeapon === WeaponId.SABRE
      ? `SABRE · ${getSabreCutName(state.quadrant)}`
      : 'ATTAQUE P1 · 左方进攻优先';
  }

  if (!isRemise) sound.playFootstep(true);
}

function performPlayerParry() {
  if (state.paused || state.roundPhase !== RoundPhase.FIGHTING) return;
  if (state.playerAction === Action.LUNGE) return;
  if (state.bladePoise < 30 || state.parryWhiffLockout > 0) return;

  const dist = state.aiZ - state.playerZ;
  if (state.gameMode !== GameMode.SPLIT_2P && (state.aiAction === Action.FEINT1 || state.aiAction === Action.FEINT2) && dist < 2.85) {
    state.parryWhiffLockout = 0.32;
    state.swipeParryWindow = 0;
    state.parryActiveWindow = 0;
    state.bladePoise = Math.max(28, state.bladePoise - 24);
    state.rowReason = 'PARADE VIDE · 被假动作骗挡硬直';
    showCallout('DÉROBEMENT! 被黄光虚晃骗挡', '护手盘失位 0.32s — 快按 A 拉开距离！', 'text-amber-300', 0.9);
    return;
  }

  state.playerAction = Action.PARRY;
  state.playerActionTimer = 0.26;
  state.parryActiveWindow = 0.24;
  state.swipeParryWindow = 0.24;
  sound.playSwoosh(0.95);
}

function executeSuccessfulPlayerParry(parryStyle = 'PARADE', isPerfect = false) {
  state.aiAction = Action.PARRIED;
  state.aiActionTimer = isPerfect ? 0.60 : 0.46;
  state.aiExtension = Math.min(0.25, state.aiExtension);
  state.aiStrikeEvaluated = true;
  state.playerAction = Action.PARRY;
  state.playerActionTimer = 0.18;
  state.riposteBonusTimer = isPerfect ? 1.15 : 0.92;
  state.rightOfWay = 'player';
  state.rowMeter = -100;
  state.rowReason = `${parryStyle} · 格挡成功立即还击`;
  state.hitStopTimer = isPerfect ? 0.068 : 0.048;
  state.camShake = isPerfect ? 0.26 : 0.18;
  state.p2CamShake = 0.15;
  state.parriesLanded++;
  state.speedLinesAlpha = isPerfect ? 0.95 : 0.72;

  const deflectSign = state.guardX >= 0 ? 1 : -1;
  state.aiGuardX = Math.max(-0.82, Math.min(0.82, state.aiGuardX - deflectSign * 0.38));
  injectBladeVibration(true, -deflectSign * 14, -8);
  injectBladeVibration(false, deflectSign * 28, 16);

  sound.playClang(isPerfect ? 1240 : 1080, isPerfect ? 1.4 : 1.15, isPerfect);
  refVoice.speakCue('parade');

  const contactZ = state.playerZ + 0.85;
  const pt = trigger3DWorldClashSparks(
    -state.guardX * 0.24,
    1.18 - state.guardY * 0.18,
    contactZ,
    isPerfect ? '#fde047' : '#38bdf8',
    isPerfect ? 0xfde047 : 0x38bdf8,
    isPerfect ? 48 : 34,
    isPerfect ? 3.2 : 2.4
  );

  addStyleMomentum(
    isPerfect ? 260 : 160,
    isPerfect ? '⚡ PARADE PARFAITE!' : `${parryStyle}!`,
    isPerfect ? 'FORTE DEFLECT · +50% SUPER' : 'RIPOSTE WINDOW OPEN!',
    pt.x,
    pt.y - 34,
    isPerfect ? '#fde047' : '#38bdf8'
  );
  showCallout(
    isPerfect ? `⚡ ${parryStyle}! 完美弹反` : `${parryStyle}! 格挡成功`,
    state.selectedWeapon === WeaponId.SABRE ? '对手刀刃弹开！立即挥鼠或左键劈砍还击！' : '对手剑身震荡失位！立即左键发动 RIPOSTE 还击！',
    isPerfect ? 'text-amber-300' : 'text-cyan-300',
    0.95
  );
}

// ============================================================================
// 120HZ SPRING-DAMPER WRIST + 22HZ EULER-BERNOULLI STEEL TRANSVERSE VIBRATION
// ============================================================================
function stepSpringPhysicsSubstep(fixedDt) {
  const stiffness = state.selectedWeapon === WeaponId.EPEE
    ? CONSTANTS.SPRING_STIFFNESS_EPEE
    : CONSTANTS.SPRING_STIFFNESS_DEFAULT;
  const damping = state.bladePoise < 50
    ? CONSTANTS.SPRING_DAMPING_LOW_POISE
    : CONSTANTS.SPRING_DAMPING_NORMAL;

  // Leverage-weighted bind deflection: Forte holds line; Foible bends away
  const p1Compliance = state.bladeBindActive ? (0.42 / Math.max(0.45, state.bindLeverage)) : 0;
  const p2Compliance = state.bladeBindActive ? (0.42 * Math.min(2.2, state.bindLeverage)) : 0;

  const bindDeflectX = state.bladeBindActive ? state.bindPushVectorX * p1Compliance : 0;
  const bindDeflectY = state.bladeBindActive ? state.bindPushVectorY * p1Compliance : 0;

  const ax = (state.guardX + bindDeflectX - state.tipX) * stiffness - state.tipVelX * damping;
  const ay = (state.guardY + bindDeflectY - state.tipY) * stiffness - state.tipVelY * damping;
  state.tipVelX += ax * fixedDt;
  state.tipVelY += ay * fixedDt;
  state.tipX += state.tipVelX * fixedDt;
  state.tipY += state.tipVelY * fixedDt;

  const p2BindX = state.bladeBindActive ? -state.bindPushVectorX * p2Compliance : 0;
  const p2BindY = state.bladeBindActive ? -state.bindPushVectorY * p2Compliance : 0;
  const p2Ax = (state.aiGuardX + p2BindX - state.p2TipX) * stiffness - state.p2TipVelX * CONSTANTS.SPRING_DAMPING_NORMAL;
  const p2Ay = (state.aiGuardY + p2BindY - state.p2TipY) * stiffness - state.p2TipVelY * CONSTANTS.SPRING_DAMPING_NORMAL;
  state.p2TipVelX += p2Ax * fixedDt;
  state.p2TipVelY += p2Ay * fixedDt;
  state.p2TipX += state.p2TipVelX * fixedDt;
  state.p2TipY += state.p2TipVelY * fixedDt;

  // 22Hz Maraging Steel Transverse Harmonic Ringing (d²u/dt² = -ω²u - 2ζω du/dt)
  const omegaSq = CONSTANTS.BLADE_VIB_OMEGA * CONSTANTS.BLADE_VIB_OMEGA;
  const vibDamp = CONSTANTS.BLADE_VIB_DAMPING * 2;

  const vAx1 = -omegaSq * state.bladeVibX - vibDamp * state.bladeVibVelX;
  const vAy1 = -omegaSq * state.bladeVibY - vibDamp * state.bladeVibVelY;
  state.bladeVibVelX += vAx1 * fixedDt;
  state.bladeVibVelY += vAy1 * fixedDt;
  state.bladeVibX += state.bladeVibVelX * fixedDt;
  state.bladeVibY += state.bladeVibVelY * fixedDt;

  const vAx2 = -omegaSq * state.p2BladeVibX - vibDamp * state.p2BladeVibVelX;
  const vAy2 = -omegaSq * state.p2BladeVibY - vibDamp * state.p2BladeVibVelY;
  state.p2BladeVibVelX += vAx2 * fixedDt;
  state.p2BladeVibVelY += vAy2 * fixedDt;
  state.p2BladeVibX += state.p2BladeVibVelX * fixedDt;
  state.p2BladeVibY += state.p2BladeVibVelY * fixedDt;
}

// ============================================================================
// REAL-TIME 3D BLADE-TO-BLADE COLLISION & FORTE/FOIBLE LEVERAGE SOLVER
// ============================================================================
function updateReal3DBladeContactPhysics(dt, dist) {
  const wType = state.selectedWeapon;
  if (state.roundPhase !== RoundPhase.FIGHTING || dist > CONSTANTS.BIND_MAX_DIST || state.aiAction === Action.PARRIED) {
    state.bladeBindActive = false;
    state.bindPressure = Math.max(0, state.bindPressure - dt * 6.0);
    state.guardX += (state.mouseX - state.guardX) * Math.min(1, dt * 22);
    state.guardY += (state.mouseY - state.guardY) * Math.min(1, dt * 22);
    return;
  }

  const segP1 = computeWorldBladeSegment3D({
    isP1: true,
    baseZ: state.playerZ,
    jumpY: state.playerY,
    posture: state.playerPosture,
    ext: state.playerExtension,
    guardX: state.guardX,
    guardY: state.guardY,
    tipX: state.tipX,
    tipY: state.tipY,
    wType,
    slashPhase: state.sabreSlashPhase,
    attackQuad: state.quadrant,
    coupeLift: 0
  });

  const segP2 = computeWorldBladeSegment3D({
    isP1: false,
    baseZ: state.aiZ,
    jumpY: state.aiY,
    posture: state.aiPosture,
    ext: state.aiExtension,
    guardX: state.aiGuardX,
    guardY: state.aiGuardY,
    tipX: state.p2TipX,
    tipY: state.p2TipY,
    wType,
    slashPhase: state.p2SabreSlashPhase,
    attackQuad: state.aiAttackQuad,
    coupeLift: state.aiCoupeLiftY
  });

  const col = solve3DBladeSegmentCollision(segP1, segP2);

  // Sabre 3D Mid-Air Edge-to-Edge Clash (Contre-Taille / Fer sur Fer!)
  if (wType === WeaponId.SABRE) {
    const p1Cutting = (state.playerAction === Action.LUNGE || state.playerAction === Action.REMISE || state.sabreSlashPhase > 0.25);
    const p2Cutting = (state.aiAction === Action.LUNGE || state.aiAction === Action.REMISE || state.p2SabreSlashPhase > 0.25);
    if (p1Cutting && p2Cutting && col.dist3D < 0.115 && state.coquilleDeflectCooldown <= 0) {
      state.coquilleDeflectCooldown = 0.28;
      state.playerAction = Action.RECOVERY;
      state.playerActionTimer = 0.22;
      state.remiseCooldown = 0.06;
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.25;
      state.hitStopTimer = 0.042;
      state.camShake = 0.22;
      state.p2CamShake = 0.22;
      injectBladeVibration(true, col.pushScreenX * 26, col.pushScreenY * 22);
      injectBladeVibration(false, -col.pushScreenX * 26, -col.pushScreenY * 22);
      sound.playClang(1320, 1.25, true);
      const pt = trigger3DWorldClashSparks(col.contactX, col.contactY, col.contactZ, '#fb923c', 0xfb923c, 36, 3.0);
      addStyleMomentum(120, '⚔️ FER SUR FER!', 'SABRE MID-AIR BLADE CLASH', pt.x, pt.y - 30, '#fde047');
      showCallout('CONTRE-TAILLE! 佩剑空中拼刀弹开', '双刃交击震荡 — 立即点击左键抢先二次挥斩 (Remise) 或后撤！', 'text-amber-300', 1.0);
    }
    state.bladeBindActive = false;
    state.guardX += (state.mouseX - state.guardX) * Math.min(1, dt * 22);
    state.guardY += (state.mouseY - state.guardY) * Math.min(1, dt * 22);
    return;
  }

  // Foil & Épée 3D Segment-Segment Steel Contact & Forte/Foible Leverage!
  const in3DBind = (col.dist3D < CONSTANTS.BLADE_CONTACT_RADIUS_3D && state.aiCoupeLiftY < 0.10 && state.bladePoise >= CONSTANTS.POISE_LOSS_THRESHOLD);

  if (in3DBind) {
    state.bladeBindActive = true;
    state.bindStationP1 = col.s1;
    state.bindStationP2 = col.s2;
    state.bindLeverage = col.leverageP1;
    state.bindContactWorldX = col.contactX;
    state.bindContactWorldY = col.contactY;
    state.bindContactWorldZ = col.contactZ;

    const penetration = Math.max(0.05, (CONSTANTS.BLADE_CONTACT_RADIUS_3D - col.dist3D) / CONSTANTS.BLADE_CONTACT_RADIUS_3D);
    state.bindPressure = Math.min(1, state.bindPressure + dt * (4.2 + col.leverageP1 * 1.4));
    state.masterGauge = Math.min(100, state.masterGauge + dt * 18);

    // Push vector weighted by Forte vs Foible leverage!
    const p1Yield = 0.22 / Math.max(0.45, Math.min(2.4, col.leverageP1));
    const p2Yield = 1.55 * Math.max(0.45, Math.min(2.4, col.leverageP1));

    state.guardX += (state.mouseX + col.pushScreenX * p1Yield - state.guardX) * Math.min(1, dt * 18);
    state.guardY += (state.mouseY + col.pushScreenY * p1Yield - state.guardY) * Math.min(1, dt * 18);
    state.aiGuardX -= col.pushScreenX * penetration * p2Yield * dt;
    state.aiGuardY -= col.pushScreenY * penetration * p2Yield * dt;
    state.aiGuardX = Math.max(-0.85, Math.min(0.85, state.aiGuardX));
    state.aiGuardY = Math.max(-0.75, Math.min(0.75, state.aiGuardY));

    state.bindPushVectorX = col.pushScreenX * penetration;
    state.bindPushVectorY = col.pushScreenY * penetration;

    sound.playBladeScrape(1420 + col.leverageP1 * 340, Math.min(1, state.bindPressure * 0.9));
    if (Math.random() < 0.42) {
      trigger3DWorldClashSparks(col.contactX, col.contactY, col.contactZ, '#fde047', 0xfde047, 3, 1.35);
    }

    // Crushing Forte-on-Foible Prise de Fer Disarm / Line Seizure!
    if (state.bindPressure >= 0.94 && col.leverageP1 >= 1.15 && state.beatCooldown <= 0) {
      state.beatCooldown = 0.95;
      state.bindPressure = 0.25;
      executeSuccessfulPlayerParry('PRISE DE FER (强剑压制)', true);
    }
  } else {
    state.bladeBindActive = false;
    state.bindPressure = Math.max(0, state.bindPressure - dt * 5.5);
    state.bindLeverage += (1.0 - state.bindLeverage) * Math.min(1, dt * 8);
    state.guardX += (state.mouseX - state.guardX) * Math.min(1, dt * 22);
    state.guardY += (state.mouseY - state.guardY) * Math.min(1, dt * 22);
  }
}

function updateOpponentGuardAndPosture(dt, controllerIntent) {
  if (controllerIntent.isHumanP2) {
    if (state.aiPosture === Posture.JUMP) {
      state.aiY += state.aiVelY * dt;
      state.aiVelY -= 6.8 * dt;
      if (state.aiY <= 0) {
        state.aiY = 0;
        state.aiVelY = 0;
        state.aiPosture = state.p2DuckHeld ? Posture.DUCK : Posture.STAND;
        sound.playFootstep(true);
      }
    } else if (state.p2DuckHeld) {
      state.aiPosture = Posture.DUCK;
      state.p2DuckHoldDuration += dt;
      state.p2Stamina = Math.max(0, state.p2Stamina - 22 * dt);
      if (state.p2Stamina <= 5) {
        state.p2DuckHeld = false;
        state.aiPosture = Posture.STAND;
        state.p2DuckHoldDuration = 0;
      }
      state.aiY += (-0.48 - state.aiY) * Math.min(1, dt * 14);
    } else {
      state.aiPosture = Posture.STAND;
      state.p2DuckHoldDuration = 0;
      state.aiY += (0 - state.aiY) * Math.min(1, dt * 12);
    }
  } else {
    if (state.aiPostureTimer > 0) {
      state.aiPostureTimer -= dt;
      if (state.aiPostureTimer <= 0) state.aiPosture = Posture.STAND;
    }
    const targetAiY = state.aiPosture === Posture.DUCK ? -0.46 : (state.aiPosture === Posture.JUMP ? 0.46 : 0);
    state.aiY += (targetAiY - state.aiY) * Math.min(1, dt * 12);
  }

  // Physical finite angular wrist velocity for Opponent Guard (cannot teleport instantaneously!)
  const maxGuardStep = (controllerIntent.maxGuardSpeed || 4.8) * dt;
  const gdx = state.aiTargetX - state.aiGuardX;
  const gdy = state.aiTargetY - state.aiGuardY;
  const gDist = Math.hypot(gdx, gdy);
  if (gDist > 0.001) {
    const bindDrag = state.bladeBindActive ? Math.max(0.28, 1.0 - state.bindPressure * 0.65) : 1.0;
    const step = Math.min(gDist, maxGuardStep * bindDrag);
    state.aiGuardX += (gdx / gDist) * step;
    state.aiGuardY += (gdy / gDist) * step;
  }
  state.aiQuadrant = getQuadrant(state.aiGuardX, state.aiGuardY, state.selectedWeapon);
}

// ============================================================================
// AUTHENTIC FIE ELECTRICAL SCORING APPARATUS (BOÎTIER ÉLECTRIQUE) LOCKOUT BOX
// ============================================================================
function registerApparatusTouch(side, reason, cueKey, isOffTarget = false) {
  if (state.roundPhase === RoundPhase.HALT) return;

  // Tutorial drills resolve immediately for crisp step-by-step pedagogy
  if (state.gameMode === GameMode.TUTORIAL) {
    if (isOffTarget) {
      triggerPoint('offtarget', reason, 'offtarget', side === 'player' ? 'p1' : 'p2');
    } else {
      triggerPoint(side, reason, cueKey);
    }
    return;
  }

  const wType = state.selectedWeapon;
  const wCfg = WEAPON_CHANNELS[wType];

  if (!state.lockoutActive) {
    state.lockoutActive = true;
    state.lockoutDuration = wCfg.lockoutSec;
    state.lockoutTimer = wCfg.lockoutSec;
    state.lockoutFirstSide = side;
    state.lockoutFirstReason = reason;
    state.lockoutFirstCue = cueKey;
    state.lockoutFirstOffTarget = isOffTarget;
    state.lockoutSecondSide = 'none';
    state.lockoutSecondReason = '';
    state.lockoutSecondOffTarget = false;
    state.lockoutDeltaMs = 0;

    // Immediate real-match physical apparatus click + lamp illumination while lockout window runs!
    sound.playPointClick();
    if (side === 'player') {
      setScoringLamps(!isOffTarget, false, isOffTarget, false);
    } else {
      setScoringLamps(false, !isOffTarget, false, isOffTarget);
    }
    return;
  }

  // Second fencer registered a touch BEFORE the electrical lockout timer expired!
  if (side !== state.lockoutFirstSide && state.lockoutSecondSide === 'none') {
    state.lockoutSecondSide = side;
    state.lockoutSecondReason = reason;
    state.lockoutSecondOffTarget = isOffTarget;
    state.lockoutDeltaMs = Math.max(1, Math.round((state.lockoutDuration - state.lockoutTimer) * 1000));
    sound.playPointClick();
    resolveLockoutPhrase();
  }
}

function resolveLockoutPhrase() {
  if (!state.lockoutActive) return;
  state.lockoutActive = false;
  const wType = state.selectedWeapon;
  const wCfg = WEAPON_CHANNELS[wType];

  const first = state.lockoutFirstSide;
  const firstOff = state.lockoutFirstOffTarget;
  const second = state.lockoutSecondSide;
  const secondOff = state.lockoutSecondOffTarget;
  const dtMs = state.lockoutDeltaMs;

  // Case 1: Only ONE fencer registered before the FIE box locked out!
  if (second === 'none') {
    if (firstOff) {
      triggerPoint('offtarget', state.lockoutFirstReason, 'offtarget', first === 'player' ? 'p1' : 'p2');
    } else {
      const lockTag = wType === WeaponId.EPEE ? ` [45ms闭锁单灯 · ${state.lastImpactForceN.toFixed(1)}N]` : '';
      triggerPoint(first, `${state.lockoutFirstReason}${lockTag}`, state.lockoutFirstCue);
    }
    return;
  }

  // Case 2: BOTH fencers registered within the FIE electrical lockout window!
  if (wType === WeaponId.EPEE) {
    triggerPoint('epee_double', `Coup Double (双灯时间差 Δt=${dtMs}ms ≤ 45ms 闭锁窗!)`, 'coup_double');
    return;
  }

  // Foil & Sabre Two-Lamp Right-of-Way (Priorité) Adjudication
  const p1HitValid = (first === 'player' && !firstOff) || (second === 'player' && !secondOff);
  const p2HitValid = (first === 'ai' && !firstOff) || (second === 'ai' && !secondOff);
  const p1Off = (first === 'player' && firstOff) || (second === 'player' && secondOff);
  const p2Off = (first === 'ai' && firstOff) || (second === 'ai' && secondOff);

  if (state.rightOfWay === 'player' && state.bladePoise >= CONSTANTS.POISE_LOSS_THRESHOLD) {
    if (p1Off) {
      triggerPoint('offtarget', 'Hors Cible (我方具优先权但刺偏白灯停表)', 'offtarget', 'p1');
    } else if (p1HitValid) {
      const rsn = first === 'player' ? state.lockoutFirstReason : state.lockoutSecondReason;
      triggerPoint('player', `${rsn} (双灯 Δt=${dtMs}ms · 我方优先权得分!)`, 'touch_player');
    }
    return;
  }

  if (state.rightOfWay === 'ai' || state.bladePoise < CONSTANTS.POISE_LOSS_THRESHOLD) {
    if (p2Off) {
      triggerPoint('offtarget', 'Hors Cible Adverse (对手具优先权但亮白灯停表)', 'offtarget', 'p2');
    } else if (p2HitValid) {
      const rsn = first === 'ai' ? state.lockoutFirstReason : state.lockoutSecondReason;
      triggerPoint('ai', `${rsn} (双灯 Δt=${dtMs}ms · 对手优先权!)`, 'touch_ai');
    }
    return;
  }

  triggerPoint('double', `Actions Simultanées (Δt=${dtMs}ms 同时互中不计分)`, 'simultaneous');
}

function evaluateP2LungeHit(dist) {
  state.aiStrikeEvaluated = true;
  const wType = state.selectedWeapon;
  const wCfg = WEAPON_CHANNELS[wType];

  if (dist < wCfg.minMeasure) {
    state.aiAction = Action.RECOVERY;
    state.aiActionTimer = 0.40;
    state.rightOfWay = 'player';
    state.rowMeter = -90;
    state.rowReason = 'COUP PASSÉ P2 · 右方过近擦肩落空';
    showCallout(`COUP PASSÉ P2! (${dist.toFixed(2)}m)`, '对手距离过近刺过肩膀 — 立即反击！', 'text-amber-300', 1.0);
    return;
  }

  // Check if P2's thrust hits P1's grounded Coquille Bell Guard!
  const coq = checkCoquilleGuardIntercept(-state.p2TipX, state.p2TipY, state.guardX, state.guardY, wType, 1 / Math.max(0.5, state.bindLeverage));
  if (coq.intercepted && state.bladePoise >= CONSTANTS.POISE_LOSS_THRESHOLD && state.coquilleDeflectCooldown <= 0) {
    state.coquilleDeflectCooldown = 0.25;
    state.aiAction = Action.RECOVERY;
    state.aiActionTimer = 0.28;
    state.riposteBonusTimer = 0.65;
    state.rightOfWay = 'player';
    state.rowMeter = -88;
    state.rowReason = 'COQUILLE · 你的护手盘弹开来剑!';
    injectBladeVibration(true, -coq.deflectX * 14, -coq.deflectY * 14);
    injectBladeVibration(false, coq.deflectX * 24, coq.deflectY * 24);
    sound.playCoquilleDeflect(wType === WeaponId.EPEE);
    trigger3DWorldClashSparks(-state.guardX * 0.22, 1.16 - state.guardY * 0.16, state.playerZ + 0.52, '#38bdf8', 0x38bdf8, 22, 2.2);
    showCallout('RICOCHET SUR TA COQUILLE!', '对手剑尖撞上你的接地护手盘滑开（不亮灯）— 立即反刺！', 'text-cyan-300', 0.95);
    return;
  }

  // Check Axial Force Threshold (4.90N Foil / 7.35N Épée) when P1 pulls distance fast!
  const relSpeed = (-state.aiVelZ) + state.playerVelZ;
  const forceN = computeAxialImpactForceN(wType, relSpeed, state.p2BladePoise, Math.hypot(state.p2TipVelX, state.p2TipVelY), state.aiAction === Action.REMISE);
  if (wCfg.triggerForceN > 0 && dist > wCfg.optimalMax - 0.14 && state.playerVelZ < -1.45 && forceN < wCfg.triggerForceN) {
    state.aiAction = Action.RECOVERY;
    state.aiActionTimer = 0.30;
    state.riposteBonusTimer = 0.68;
    state.rightOfWay = 'player';
    state.rowMeter = -85;
    state.rowReason = `ROMPRE RÉUSSI · 后撤卸力 (${forceN.toFixed(1)}N < ${wCfg.triggerForceN}N)`;
    sound.playBladeScrape(1260, 0.55);
    showCallout(`EFFLEURÉ! 成功拉距卸力 (${forceN.toFixed(1)}N)`, `对手剑头压力不足 ${wCfg.triggerForceN}N 未压响弹簧 — 立即反击！`, 'text-emerald-300', 1.0);
    return;
  }

  const p2IsOffTarget = computeOffTargetStatus(wType, state.p2TipX, state.p2TipY, state.p2TipVelX, state.p2TipVelY, state.p2BladePoise);
  const vp2 = getViewportMetrics(state.gameMode === GameMode.SPLIT_2P);
  const cx = vp2.centerX + state.p2TipX * 95;
  const cy = vp2.vh * 0.44 + state.p2TipY * 80;

  if (p2IsOffTarget) {
    if (wType === WeaponId.FOIL) {
      spawnSparks(cx, cy, '#f8fafc', 22);
      registerApparatusTouch('ai', 'Hors Cible P2 (右方刺中金属背心外亮白灯)', 'offtarget', true);
    } else if (wType === WeaponId.SABRE) {
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.30;
      showCallout('COUP BAS P2 (右方腰下无效)', '佩剑仅腰部以上有效，交锋继续', 'text-amber-300', 0.9);
    } else {
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.30;
      showCallout('COUP À CÔTÉ P2 (右方刺偏)', '对手重剑擦过衣袖未压响弹簧，交锋继续！', 'text-amber-300', 0.9);
    }
    return;
  }

  state.p2PinnedHitActive = (wType !== WeaponId.SABRE);
  state.p2PinnedHitTimer = 0.65;
  state.p2BladeBuckleAmp = Math.min(0.18, 0.06 + Math.max(0, wCfg.optimalMax - dist) * 0.14);

  spawnSparks(cx, cy, '#fb7185', 36);
  const p2HitTitle = wType === WeaponId.SABRE
    ? `P2 ${getSabreCutName(state.aiAttackQuad)}`
    : (wType === WeaponId.EPEE ? `P2 ${getEpeeTargetName(state.aiAttackQuad)}` : `P2 命中 ${getQuadrantShort(state.aiAttackQuad)}`);
  registerApparatusTouch('ai', p2HitTitle, 'touch_ai', false);
}

function updatePlayer2Human(dt) {
  const dist = state.aiZ - state.playerZ;
  const wCfg = WEAPON_CHANNELS[state.selectedWeapon];

  updateOpponentGuardAndPosture(dt, { isHumanP2: true, maxGuardSpeed: 7.5 });

  if (state.aiAction === Action.IDLE && !state.p2DuckHeld) {
    state.p2Stamina = Math.min(100, state.p2Stamina + 24 * dt);
  }
  if (state.p2ParryActiveWindow > 0) state.p2ParryActiveWindow = Math.max(0, state.p2ParryActiveWindow - dt);
  if (state.p2RiposteBonusTimer > 0) state.p2RiposteBonusTimer = Math.max(0, state.p2RiposteBonusTimer - dt);
  if (state.p2RemiseCooldown > 0) state.p2RemiseCooldown = Math.max(0, state.p2RemiseCooldown - dt);
  if (state.p2MarchTimer > 0) state.p2MarchTimer = Math.max(0, state.p2MarchTimer - dt);

  let p2MoveDir = 0;
  if (state.keys.p2Advance) p2MoveDir -= 1;
  if (state.keys.p2Retreat) p2MoveDir += 1;

  if (p2MoveDir < 0 && state.aiAction === Action.IDLE) {
    state.p2MarchHoldDuration += dt;
    if (state.p2MarchHoldDuration > CONSTANTS.MARCH_HESITATION_LIMIT && state.rightOfWay === 'ai') {
      state.rightOfWay = 'none';
      state.rowMeter = -25;
      state.rowReason = 'ATTAQUE RETARDÉE P2 · 右方久走失权';
    }
  } else {
    state.p2MarchHoldDuration = Math.max(0, state.p2MarchHoldDuration - dt * 2.5);
  }

  if (state.p2StepBurstTimer > 0) {
    state.p2StepBurstTimer -= dt;
    p2MoveDir = state.p2StepBurstDir * 1.35;
  }

  let targetP2Vel = 0;
  if (state.aiAction === Action.LUNGE) {
    const lungeProg = 1 - (state.aiActionTimer / 0.27);
    targetP2Vel = lungeProg < 0.58 ? -4.85 : -0.95;
  } else if (state.aiAction === Action.REMISE) {
    targetP2Vel = -1.25;
  } else if (state.aiAction === Action.RECOVERY || state.aiAction === Action.PARRIED) {
    targetP2Vel = 1.85;
  } else {
    const stepPulse = 0.88 + 0.24 * Math.sin(state.p2CamBobPhase * 2);
    const duckSlow = state.aiPosture === Posture.DUCK ? 0.65 : 1.0;
    targetP2Vel = p2MoveDir * 2.40 * stepPulse * duckSlow;
  }

  state.aiVelZ = accelerateWithPisteTraction(state.aiVelZ, targetP2Vel, dt);
  state.aiZ += state.aiVelZ * dt;

  if (Math.abs(state.aiVelZ) > 0.15 && state.aiAction !== Action.LUNGE) {
    state.p2CamBobPhase += dt * 11.5;
  }

  if (state.aiAction === Action.PARRIED) {
    state.aiActionTimer -= dt;
    if (state.aiActionTimer <= 0) state.aiAction = Action.IDLE;
    return;
  }

  if (state.aiAction === Action.PARRYING) {
    state.aiActionTimer -= dt;
    state.p2CamRollOffset = (state.aiGuardX >= 0 ? 1 : -1) * 0.032;
    if (state.aiActionTimer <= 0) {
      state.aiAction = Action.IDLE;
      state.p2CamRollOffset = 0;
    }
    return;
  }

  let p2MaxReach = wCfg.optimalMax + 0.02;
  if (state.selectedWeapon === WeaponId.EPEE) {
    if (state.aiAttackQuad === Quadrant.NE) p2MaxReach = CONSTANTS.EPEE_WRIST_MAX_REACH;
    else if (state.aiAttackQuad === Quadrant.SE) p2MaxReach = CONSTANTS.EPEE_FOOT_MAX_REACH;
  }

  if (state.aiAction === Action.LUNGE || state.aiAction === Action.REMISE) {
    state.aiActionTimer -= dt;
    state.aiExtension = Math.min(1, state.aiExtension + dt * (state.aiAction === Action.REMISE ? 13.5 : 10.8));
    state.p2CamFovZoom = state.aiExtension * 0.14;
    state.p2CamPitchOffset = state.aiExtension * 22;

    const p2HighAttack = (state.aiAttackQuad === Quadrant.NW || state.aiAttackQuad === Quadrant.NE);
    const p2LowAttack = (state.aiAttackQuad === Quadrant.SW || state.aiAttackQuad === Quadrant.SE);
    if (p2HighAttack && state.playerPosture === Posture.DUCK && state.duckHoldDuration <= CONSTANTS.DUCK_CAMP_LIMIT && state.aiExtension > 0.65) {
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.36;
      state.riposteBonusTimer = 0.78;
      state.rightOfWay = 'player';
      state.rowMeter = -95;
      return;
    }
    if (p2LowAttack && state.playerPosture === Posture.JUMP && state.aiExtension > 0.65) {
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.36;
      state.riposteBonusTimer = 0.78;
      state.rightOfWay = 'player';
      state.rowMeter = -95;
      return;
    }

    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    const guardDist = Math.hypot(state.guardX - qc.x, state.guardY - qc.y);
    if (dist < 2.62 && state.aiExtension > 0.25 && state.playerAction !== Action.RECOVERY && state.bladePoise >= CONSTANTS.POISE_LOSS_THRESHOLD) {
      if ((state.parryActiveWindow > 0 || state.swipeParryWindow > 0) && guardDist < 0.36) {
        executeSuccessfulPlayerParry('PARADE', state.aiExtension >= 0.42);
        return;
      }
    }

    if (!state.aiStrikeEvaluated && state.aiExtension > 0.72 && dist <= p2MaxReach) {
      evaluateP2LungeHit(dist);
      return;
    }

    if (state.aiActionTimer <= 0) {
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.28;
      if (state.rightOfWay === 'ai') {
        state.rightOfWay = 'player';
        state.rowMeter = -55;
        state.rowReason = 'PRIORITÉ P1 · 右方落空';
      }
    }
    return;
  }

  if (state.aiAction === Action.RECOVERY) {
    state.aiActionTimer -= dt;
    state.aiExtension = Math.max(0, state.aiExtension - dt * 6.0);
    state.p2CamFovZoom *= 0.82;
    state.p2CamPitchOffset *= 0.82;
    if (state.aiActionTimer <= 0) {
      state.aiAction = Action.IDLE;
      state.aiExtension = 0;
    }
    return;
  }

  state.aiExtension = Math.max(0, state.aiExtension - dt * 6.5);
  state.p2CamFovZoom *= 0.85;
  state.p2CamPitchOffset *= 0.85;
  state.p2CamRollOffset *= 0.85;
}

function evaluatePlayerLungeHit(dist) {
  state.playerStrikeEvaluated = true;
  const diffCfg = DIFFICULTIES[state.difficulty];
  const wType = state.selectedWeapon;
  const wCfg = WEAPON_CHANNELS[wType];
  const isRemise = (state.playerAction === Action.REMISE);

  if (dist < wCfg.minMeasure) {
    state.playerAction = Action.RECOVERY;
    state.playerActionTimer = 0.40;
    state.masterStrikeActive = false;
    state.rightOfWay = 'ai';
    state.rowMeter = 90;
    state.rowReason = 'COUP PASSÉ · 贴身越肩落空';
    showCallout(`COUP PASSÉ! (${dist.toFixed(2)}m)`, '距离过近剑尖越过对手后背落空 — 快按 A 拉开距离！', 'text-amber-300', 1.0);
    return;
  }

  const playerAttackingHigh = (state.quadrant === Quadrant.NW || state.quadrant === Quadrant.NE);

  // 1. Duck Evasion Check (Passata Sotto)
  if (!state.masterStrikeActive && playerAttackingHigh && state.aiPosture === Posture.DUCK && state.p2DuckHoldDuration <= CONSTANTS.DUCK_CAMP_LIMIT) {
    state.playerAction = Action.RECOVERY;
    state.playerActionTimer = 0.38;
    state.remiseCooldown = 0.08;
    state.rightOfWay = 'ai';
    state.rowMeter = 95;
    showCallout('ESQUIVE ADVERSE! 对手低蹲潜避', '上路刺空 — 提防低线反刺或立即下压补剑！', 'text-amber-300', 0.9);
    if (state.gameMode === GameMode.SINGLE) launchAIScheme('passata_sotto');
    else state.p2RiposteBonusTimer = 0.78;
    return;
  }

  // 2. Grounded Copper Piste Floor Strike Check in Épée low foot snipe (Touche au Sol — Bout stays LIVE!)
  if (!state.masterStrikeActive && state.gameMode !== GameMode.TUTORIAL && wType === WeaponId.EPEE &&
      state.quadrant === Quadrant.SE && state.tipY > 0.66 && state.bladePoise < 58) {
    state.playerAction = Action.RECOVERY;
    state.playerActionTimer = 0.26;
    state.remiseCooldown = 0.05;
    injectBladeVibration(true, 6, -24);
    sound.playPisteFloorStrike();
    trigger3DWorldClashSparks(-state.tipX * 0.25, 0.03, state.aiZ - 0.32, '#fbbf24', 0xfbbf24, 20, 1.8);
    state.rowReason = 'TOUCHE AU SOL · 刺中接地金属剑道不亮灯!';
    showCallout('TOUCHE AU SOL! 刺中接地剑道', '金属剑道接地吸收信号（不亮灯不停表）— 稳住准星立即补刺！', 'text-amber-300', 0.95);
    return;
  }

  // 3. Grounded 3D Bell Guard Ricochet (Ricochet sur Coquille — Bout stays LIVE!)
  if (!state.masterStrikeActive && state.gameMode !== GameMode.TUTORIAL && wType !== WeaponId.SABRE && state.coquilleDeflectCooldown <= 0) {
    const oppBlockingLine = (state.aiAction === Action.IDLE || state.aiAction === Action.PREP || state.aiAction === Action.PARRYING);
    const coq = checkCoquilleGuardIntercept(state.tipX, state.tipY, state.aiGuardX, state.aiGuardY, wType, state.bindLeverage);
    if (oppBlockingLine && coq.intercepted && !(state.bladeBindActive && state.bindLeverage >= 1.25)) {
      state.coquilleDeflectCooldown = 0.24;
      state.playerAction = Action.RECOVERY;
      state.playerActionTimer = 0.24;
      state.remiseCooldown = 0.04;
      state.tipVelX += coq.deflectX * 8.5;
      state.tipVelY += coq.deflectY * 8.5;
      injectBladeVibration(true, coq.deflectX * 24, coq.deflectY * 22);
      injectBladeVibration(false, -coq.deflectX * 10, -coq.deflectY * 10);
      state.camShake = 0.14;
      sound.playCoquilleDeflect(wType === WeaponId.EPEE);
      const pt = trigger3DWorldClashSparks(
        -state.aiGuardX * 0.22,
        1.16 - state.aiGuardY * 0.16,
        state.aiZ - 0.46,
        '#fde047',
        0xfde047,
        26,
        2.3
      );
      spawnFloatingCombatText(pt.x, pt.y - 26, 'COQUILLE!', `${coq.coquilleRadiusCm}cm BELL DEFLECT`, '#cbd5e1');
      state.rowReason = 'RICOCHET COQUILLE · 撞中对手护手盘滑开!';
      showCallout('RICOCHET SUR COQUILLE! 撞中护手盘', '接地护手盘弹开剑尖（不亮灯不停表）— 快变线再点左键发动 REMISE 续刺！', 'text-cyan-200', 1.05);
      return;
    }
  }

  // 4. Defender Active Parry Evaluation (2P, Tutorial, or Physical Guard-Travel AI!)
  if (state.gameMode === GameMode.SPLIT_2P) {
    if (!state.masterStrikeActive && state.p2ParryActiveWindow > 0 && state.aiQuadrant === state.quadrant) {
      executeSuccessfulP2Parry();
      return;
    }
  } else if (state.gameMode === GameMode.TUTORIAL) {
    const lesson = TUTORIAL_LESSONS[state.tutorialStep];
    if (lesson.step === 3 && state.quadrant === Quadrant.NW) {
      state.playerAction = Action.RECOVERY;
      state.playerActionTimer = 0.36;
      injectBladeVibration(true, 18, 12);
      sound.playClang(920, 1.0, false);
      showCallout('PARADE DU MAÎTRE!', '教练正封闭 4号位，请瞄准其他空当扇区出剑', 'text-amber-300', 1.2);
      return;
    }
  } else {
    const repeatCount = state.playerAttackHistory.filter(q => q === state.quadrant).length;
    const habitBonus = repeatCount >= 2 ? 1.38 : 1.0;
    const canAiDefend = !state.masterStrikeActive &&
      state.aiAction !== Action.PARRIED &&
      state.aiAction !== Action.LUNGE &&
      state.aiAction !== Action.REMISE &&
      state.riposteBonusTimer <= 0;

    // Physical Guard Travel Distance: Can AI's hand physically reach the attacked sector in time?
    const attackedQc = getQuadCoords(state.quadrant, wType);
    const guardTravelDist = Math.hypot(state.aiGuardX - attackedQc.x, state.aiGuardY - attackedQc.y);
    const maxReachableDist = (diffCfg.guardSpeed || 4.6) * 0.145 * habitBonus;
    const guardCanPhysicallyReach = guardTravelDist <= maxReachableDist;

    // 3D Forte-vs-Foible Opposition & Tempo Vulnerability!
    const strongForteOpposition = (state.bladeBindActive && state.bindLeverage >= 1.22);
    const caughtInForwardTempo = (state.aiVelZ < -1.15 || state.aiAction === Action.FEINT1 || state.aiAction === Action.FEINT2);
    const tempoPenalty = caughtInForwardTempo ? 0.38 : 1.0;
    const waggleVulnerability = state.bladePoise < 60 ? 1.32 : 1.0;
    const epeeSnipeBypass = (wType === WeaponId.EPEE && ((state.quadrant === Quadrant.NE && dist > CONSTANTS.EPEE_BODY_MAX_REACH) || state.quadrant === Quadrant.SE)) ? 0.32 : 1.0;

    if (canAiDefend && playerAttackingHigh && wType !== WeaponId.SABRE && !strongForteOpposition && !caughtInForwardTempo &&
        Math.random() < diffCfg.parryChance * 0.24 * waggleVulnerability * habitBonus * epeeSnipeBypass) {
      state.playerAction = Action.RECOVERY;
      state.playerActionTimer = 0.40;
      state.remiseCooldown = 0.08;
      launchAIScheme('passata_sotto');
      return;
    }

    const aiWillParry = canAiDefend && !strongForteOpposition && guardCanPhysicallyReach && (
      (state.aiQuadrant === state.quadrant && !caughtInForwardTempo) ||
      state.bladePoise < 44 ||
      repeatCount >= 3 ||
      Math.random() < diffCfg.parryChance * 0.58 * tempoPenalty * waggleVulnerability * habitBonus * epeeSnipeBypass
    );

    if (aiWillParry) {
      state.aiQuadrant = state.quadrant;
      state.aiTargetX = attackedQc.x;
      state.aiTargetY = attackedQc.y;
      state.aiGuardX += (attackedQc.x - state.aiGuardX) * 0.78;
      state.aiGuardY += (attackedQc.y - state.aiGuardY) * 0.78;
      state.aiAction = Action.PARRYING;
      state.aiActionTimer = 0.16;
      state.playerAction = Action.RECOVERY;
      state.playerActionTimer = 0.42;
      state.remiseCooldown = 0.06;
      state.rightOfWay = 'ai';
      state.rowMeter = 95;

      const useCroise = Math.random() < 0.50;
      state.aiScheme = useCroise ? 'riposte_croise' : 'riposte_direct';
      state.aiSchemeLabel = AI_SCHEMES[state.aiScheme].label;
      if (useCroise) {
        state.mouseY = Math.min(0.82, state.mouseY + 0.38);
        state.tipVelY += 4.2;
      }

      injectBladeVibration(true, (attackedQc.x >= 0 ? -1 : 1) * 24, 16);
      injectBladeVibration(false, (attackedQc.x >= 0 ? 1 : -1) * 12, -8);

      state.rowReason = 'PARADE ADVERSE · 进攻被拨开';
      state.hitStopTimer = 0.045;
      state.camShake = 0.18;
      sound.playClang(920, 1.05, false);
      refVoice.speakCue('parade');

      trigger3DWorldClashSparks(
        -attackedQc.x * 0.22,
        1.16 - attackedQc.y * 0.16,
        state.aiZ - 0.45,
        '#fb7185',
        0xfb7185,
        30,
        2.4
      );
      showCallout('PARADE ADVERSE! 进攻被拨开', '盯紧防位环红光格挡防反，或变线左键抢刺 REMISE！', 'text-rose-400', 1.0);
      return;
    }
  }

  // 5. FIE Axial Spring-Tip Compression Force Check (> 4.90N Foil / > 7.35N Épée)!
  const relClosingSpeed = state.playerVelZ - state.aiVelZ;
  const lateralSpeed = Math.hypot(state.tipVelX, state.tipVelY);
  const impactForceN = state.masterStrikeActive
    ? 14.8
    : computeAxialImpactForceN(wType, relClosingSpeed, state.bladePoise, lateralSpeed, isRemise);
  state.lastImpactForceN = impactForceN;

  if (!state.masterStrikeActive && state.gameMode !== GameMode.TUTORIAL && wCfg.triggerForceN > 0 &&
      dist > wCfg.optimalMax - 0.12 && state.aiVelZ > 1.35 && impactForceN < wCfg.triggerForceN) {
    state.playerAction = Action.RECOVERY;
    state.playerActionTimer = 0.26;
    state.remiseCooldown = 0.05;
    injectBladeVibration(true, 14, -12);
    sound.playBladeScrape(1380, 0.65);
    const pt = trigger3DWorldClashSparks(-state.tipX * 0.22, 1.15 - state.tipY * 0.18, state.aiZ - 0.18, '#e2e8f0', 0xe2e8f0, 16, 1.4);
    spawnFloatingCombatText(pt.x, pt.y - 24, `EFFLEURÉ ${impactForceN.toFixed(1)}N`, `< ${wCfg.triggerForceN.toFixed(2)}N SPRING`, '#cbd5e1');
    state.rowReason = `EFFLEURÉ · 擦滑卸力 (${impactForceN.toFixed(1)}N < ${wCfg.triggerForceN}N)`;
    showCallout(`EFFLEURÉ! 弹簧压力不足 (${impactForceN.toFixed(1)}N)`, `对手后撤卸力未达 ${wCfg.triggerForceN}N 触发阈值 — 立即前压补刺！`, 'text-amber-200', 1.0);
    return;
  }

  const wasMaster = state.masterStrikeActive;
  state.masterStrikeActive = false;
  const isOffTarget = !wasMaster && computeOffTargetStatus(wType, state.tipX, state.tipY, state.tipVelX, state.tipVelY, state.bladePoise);

  const vp1 = getViewportMetrics(false);
  const cx = vp1.centerX + state.tipX * 95;
  const cy = vp1.vh * 0.44 + state.tipY * 80;

  if (isOffTarget) {
    if (wType === WeaponId.FOIL) {
      state.pinnedHitActive = true;
      state.pinnedHitTimer = 0.68;
      state.pinnedWorldX = Math.max(-0.20, Math.min(0.20, state.tipX * 0.28));
      state.pinnedWorldY = Math.max(-0.26, Math.min(0.24, -state.tipY * 0.28 + state.aiY));
      state.pinnedIsOffTarget = true;
      state.bladeBuckleAmp = 0.09;
      spawnSparks(cx, cy, '#f8fafc', 22);
      registerApparatusTouch('player', 'Hors Cible (刺中金属背心外亮白灯)', 'offtarget', true);
    } else if (wType === WeaponId.SABRE) {
      state.playerAction = Action.RECOVERY;
      state.playerActionTimer = 0.30;
      showCallout('COUP BAS (腰下无效)', '佩剑仅腰线以上有效，交锋继续', 'text-amber-300', 0.9);
    } else {
      state.playerAction = Action.RECOVERY;
      state.playerActionTimer = 0.30;
      showCallout('COUP À CÔTÉ (刺偏擦袖)', '重剑偏出轮廓落空，交锋继续！', 'text-amber-300', 0.9);
    }
    return;
  }

  // Real 3D Column-Buckling Pin on Target!
  state.pinnedHitActive = (wType !== WeaponId.SABRE);
  state.pinnedHitTimer = 0.76;
  state.pinnedWorldX = Math.max(-0.20, Math.min(0.20, state.tipX * 0.28));
  state.pinnedWorldY = Math.max(-0.26, Math.min(0.24, -state.tipY * 0.28 + state.aiY));
  state.pinnedIsOffTarget = false;
  state.bladeBuckleAmp = Math.min(0.22, 0.07 + Math.max(0, (wCfg.optimalMax - dist)) * 0.16 + impactForceN * 0.005);

  const sparkColor = wType === WeaponId.SABRE ? '#fb923c' : (wType === WeaponId.EPEE ? '#fbbf24' : '#34d399');
  trigger3DWorldClashSparks(
    -state.pinnedWorldX * 0.7,
    1.14 + state.pinnedWorldY * 0.55,
    state.aiZ - 0.18,
    sparkColor,
    wType === WeaponId.SABRE ? 0xfb923c : (wType === WeaponId.EPEE ? 0xfbbf24 : 0x34d399),
    wasMaster ? 52 : 38,
    2.8
  );

  const isRiposte = state.riposteBonusTimer > 0;
  const forceBadge = wType !== WeaponId.SABRE ? ` (${impactForceN.toFixed(1)}N)` : '';
  let msg = '';
  let cue = isRiposte ? 'riposte_player' : (isRemise ? 'remise' : 'touch_player');

  if (wasMaster) {
    msg = `COUP DE MAÎTRE · ${wCfg.masterStrikeName}`;
  } else if (isRemise) {
    msg = `Remise en ${getQuadrantShort(state.quadrant)} · 二次续刺命中${forceBadge}`;
  } else if (wType === WeaponId.SABRE) {
    const cutDesc = getSabreCutName(state.quadrant);
    msg = isRiposte ? `Riposte · ${cutDesc}` : cutDesc;
  } else if (wType === WeaponId.EPEE) {
    const epeeDesc = getEpeeTargetName(state.quadrant);
    const oppTag = (state.bladeBindActive && state.bindLeverage >= 1.18) ? 'Opposition · ' : '';
    msg = `${oppTag}${isRiposte ? 'Contre-Riposte · ' : ''}${epeeDesc}${forceBadge}`;
  } else {
    const couleTag = (state.bladeBindActive && state.bindLeverage >= 1.18) ? 'Coulé Opposition ' : 'Fente Directe ';
    msg = isRiposte
      ? `Parade-Riposte en ${getQuadrantShort(state.quadrant)}${forceBadge}`
      : `${couleTag}en ${getQuadrantShort(state.quadrant)}${forceBadge}`;
  }

  registerApparatusTouch('player', msg, cue, false);
}

function launchAIScheme(schemeName, forceLowLine = false) {
  const diffCfg = DIFFICULTIES[state.difficulty];
  const allQuads = [Quadrant.NW, Quadrant.NE, Quadrant.SW, Quadrant.SE];
  const openQuads = allQuads.filter(q => q !== state.quadrant);
  const randOpen = () => openQuads[Math.floor(Math.random() * openQuads.length)] || Quadrant.NE;

  state.aiScheme = schemeName;
  state.aiSchemeLabel = AI_SCHEMES[schemeName] ? AI_SCHEMES[schemeName].label : 'ATTAQUE';
  state.rightOfWay = 'ai';
  state.rowMeter = 90;
  state.aiCoupeLiftY = 0;
  state.aiStrikeEvaluated = false;

  if (schemeName === 'pull_distance_counter') {
    state.aiVelZ = 3.15 * diffCfg.speedMult;
    state.aiAttackQuad = randOpen();
    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.PREP;
    state.aiActionTimer = Math.max(0.18, 0.25 / diffCfg.speedMult);
    sound.playShoeSqueak();
    state.rowReason = 'ROMPRE & REPRISE · 对手拉距诱空反击!';
    return;
  }

  if (schemeName === 'temps_opportunite') {
    state.aiAttackQuad = randOpen();
    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.LUNGE;
    state.aiActionTimer = 0.24;
    if (state.selectedWeapon === WeaponId.SABRE) {
      triggerP2SabreSlashVisual(state.aiAttackQuad);
      sound.playSabreCut();
    } else {
      sound.playSwoosh(1.4);
    }
    state.rowReason = `AI 迎击 ${getQuadrantShort(state.aiAttackQuad)}`;
    return;
  }

  if (schemeName === 'beat_lunge') {
    sound.playClang(1120, 0.9, false);
    state.camShake = 0.16;
    const pushDirX = state.guardX >= 0 ? 0.34 : -0.34;
    state.mouseX = Math.max(-0.9, Math.min(0.9, state.mouseX + pushDirX));
    state.tipVelX += pushDirX * 13;
    injectBladeVibration(true, pushDirX * 24, 10);
    injectBladeVibration(false, -pushDirX * 14, -6);
    trigger3DWorldClashSparks(-state.guardX * 0.22, 1.18 - state.guardY * 0.16, (state.playerZ + state.aiZ) * 0.5, '#fde047', 0xfde047, 24, 2.3);

    state.aiAttackQuad = randOpen();
    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.PREP;
    state.aiActionTimer = Math.max(0.18, 0.28 / diffCfg.speedMult);
    state.rowReason = `BATTEMENT AI · 敲剑攻 ${getQuadrantShort(state.aiAttackQuad)}`;
    return;
  }

  if (schemeName === 'coupe_glide') {
    const highOpen = [Quadrant.NW, Quadrant.NE].filter(q => q !== state.quadrant);
    state.aiAttackQuad = highOpen.length > 0 ? highOpen[0] : Quadrant.NE;
    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.COUPE;
    state.aiActionTimer = Math.max(0.20, 0.30 / diffCfg.speedMult);
    sound.playSwoosh(1.35);
    state.rowReason = `COUPÉ AI · 挑剑绕护手攻 ${getQuadrantShort(state.aiAttackQuad)}`;
    return;
  }

  if (schemeName === 'flunge_sabre') {
    state.aiPosture = Posture.JUMP;
    state.aiPostureTimer = 0.54;
    state.aiAttackQuad = Math.random() < 0.6 ? Quadrant.NW : Quadrant.NE;
    const qc = getQuadCoords(state.aiAttackQuad, WeaponId.SABRE);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.PREP;
    state.aiActionTimer = Math.max(0.16, 0.23 / diffCfg.speedMult);
    sound.playFootstep(true);
    state.rowReason = `FLUNGE SABRE · 飞跃劈斩 ${getQuadrantShort(state.aiAttackQuad)}`;
    return;
  }

  if (schemeName === 'moulinet_tete') {
    state.aiAttackQuad = Quadrant.NW;
    const qc = getQuadCoords(Quadrant.NW, WeaponId.SABRE);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.PREP;
    state.aiActionTimer = Math.max(0.17, 0.25 / diffCfg.speedMult);
    sound.playSwoosh(1.3);
    state.rowReason = 'MOULINET TÊTE · 5号位当头直劈!';
    return;
  }

  if (schemeName === 'feint_tete_flanc') {
    state.aiAttackQuad = Quadrant.NW;
    state.aiFeintTargetQuad = Math.random() < 0.55 ? Quadrant.SE : Quadrant.SW;
    const qc = getQuadCoords(Quadrant.NW, WeaponId.SABRE);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.FEINT1;
    state.aiActionTimer = Math.max(0.16, 0.23 / diffCfg.speedMult);
    state.rowReason = 'FEINTE TÊTE → FLANC · 虚劈头实斩肋!';
    return;
  }

  if (schemeName === 'saignee_poignet') {
    state.aiAttackQuad = Quadrant.NE;
    const qc = getQuadCoords(Quadrant.NE, WeaponId.EPEE);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.PREP;
    state.aiActionTimer = Math.max(0.15, 0.22 / diffCfg.speedMult);
    state.rowReason = 'SAIGNÉE AU POIGNET · 重剑远距狙击你的手腕!';
    return;
  }

  if (schemeName === 'touche_au_pied') {
    state.aiPosture = Posture.DUCK;
    state.aiPostureTimer = 0.58;
    state.aiAttackQuad = Quadrant.SE;
    const qc = getQuadCoords(Quadrant.SE, WeaponId.EPEE);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.PREP;
    state.aiActionTimer = Math.max(0.16, 0.24 / diffCfg.speedMult);
    sound.playShoeSqueak();
    state.rowReason = 'TOUCHE AU PIED · 重剑下潜狙击前脚面!';
    return;
  }

  if (schemeName === 'fleche_blitz') {
    state.aiPosture = Posture.JUMP;
    state.aiPostureTimer = 0.62;
    state.aiAttackQuad = forceLowLine ? (Math.random() < 0.5 ? Quadrant.SW : Quadrant.SE) : randOpen();
    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.PREP;
    state.aiActionTimer = Math.max(0.17, 0.26 / diffCfg.speedMult);
    sound.playFootstep(true);
    state.rowReason = `FLÈCHE AI · 飞冲 ${getQuadrantShort(state.aiAttackQuad)}`;
    return;
  }

  if (schemeName === 'feint_disengage') {
    state.aiAttackQuad = state.quadrant;
    state.aiFeintTargetQuad = randOpen();
    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.FEINT1;
    state.aiActionTimer = Math.max(0.16, 0.25 / diffCfg.speedMult);
    state.rowReason = 'FEINTE AI · 黄光虚晃变线';
    return;
  }

  if (schemeName === 'double_feint') {
    const q1 = randOpen();
    const q2 = allQuads.find(q => q !== q1 && q !== state.quadrant) || Quadrant.SE;
    const q3 = allQuads.find(q => q !== q2) || Quadrant.NW;
    state.aiAttackQuad = q1;
    state.aiFeintTargetQuad = q2;
    state.aiFinalTargetQuad = q3;
    const qc = getQuadCoords(q1, state.selectedWeapon);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.FEINT1;
    state.aiActionTimer = Math.max(0.14, 0.22 / diffCfg.speedMult);
    state.rowReason = 'DOUBLE FEINTE · 双重虚晃';
    return;
  }

  if (schemeName === 'passata_sotto') {
    state.aiPosture = Posture.DUCK;
    state.aiPostureTimer = 0.68;
    state.aiAttackQuad = Math.random() < 0.5 ? Quadrant.SW : Quadrant.SE;
    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.PREP;
    state.aiActionTimer = Math.max(0.16, 0.24 / diffCfg.speedMult);
    sound.playShoeSqueak();
    state.rowReason = 'PASSATA SOTTO · 低蹲潜刺';
    return;
  }

  if (schemeName === 'stop_hit_retreat') {
    state.aiVelZ = 2.65 * diffCfg.speedMult;
    state.aiAttackQuad = randOpen();
    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;
    state.aiAction = Action.PREP;
    state.aiActionTimer = Math.max(0.15, 0.22 / diffCfg.speedMult);
    sound.playShoeSqueak();
    state.rowReason = 'ARRÊT AI · 后撤截击';
    return;
  }

  state.aiAttackQuad = schemeName === 'riposte_croise'
    ? ((state.quadrant === Quadrant.NW || state.quadrant === Quadrant.NE) ? Quadrant.SE : Quadrant.NE)
    : randOpen();
  const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
  state.aiTargetX = qc.x;
  state.aiTargetY = qc.y;
  state.aiAction = Action.PREP;
  state.aiActionTimer = schemeName.startsWith('riposte') ? 0.16 : Math.max(0.19, 0.32 / diffCfg.speedMult);
  state.rowReason = `ATTAQUE AI → ${getQuadrantShort(state.aiAttackQuad)}`;
}

function decideAI(dt, dist, diffCfg, wCfg) {
  const wType = state.selectedWeapon;
  state.aiDecisionTimer -= dt;
  state.aiProbeTimer -= dt;

  // Real-Match Distance-Pulling Reflex: if player lunges from slightly too far, skilled AI pulls 20cm distance!
  if (state.playerAction === Action.LUNGE && state.playerExtension < 0.42 && dist > wCfg.optimalMax - 0.14 &&
      state.difficulty !== 'easy' && state.aiProbeTimer <= 0) {
    state.aiProbeTimer = 1.15;
    launchAIScheme('pull_distance_counter');
    return true;
  }

  if (state.aiDecisionTimer <= 0) {
    const tempoFactor = wType === WeaponId.SABRE ? 0.58 : (wType === WeaponId.EPEE ? 0.90 : 0.72);
    state.aiDecisionTimer = diffCfg.reactDelay * (tempoFactor + Math.random() * 0.35);

    const quads = [Quadrant.NW, Quadrant.NE, Quadrant.SW, Quadrant.SE];
    let favoredQuad = state.quadrant;
    if (state.playerAttackHistory.length >= 2) {
      const lastQ = state.playerAttackHistory[state.playerAttackHistory.length - 1];
      const prevQ = state.playerAttackHistory[state.playerAttackHistory.length - 2];
      if (lastQ === prevQ) favoredQuad = lastQ;
    }
    const chosenQuad = (wType === WeaponId.EPEE && Math.random() < 0.58)
      ? Quadrant.NE
      : (Math.random() < 0.72 ? favoredQuad : quads[Math.floor(Math.random() * quads.length)]);
    const qc = getQuadCoords(chosenQuad, wType);
    state.aiTargetX = qc.x;
    state.aiTargetY = qc.y;

    if (wType === WeaponId.FOIL && state.pointInLineActive && dist < 2.65) {
      state.pointInLineActive = false;
      state.pointInLineTimer = 0;
      launchAIScheme('beat_lunge');
      return true;
    }

    // If P1 is dominating a 3D blade bind with Forte leverage, AI attempts Coupé disengage over the tip!
    if (state.bladeBindActive && state.bindLeverage >= 1.25 && wType !== WeaponId.SABRE && Math.random() < 0.55) {
      launchAIScheme('coupe_glide');
      return true;
    }

    const maxAttackDist = wType === WeaponId.EPEE ? 2.82 : (wType === WeaponId.SABRE ? 2.65 : 2.72);
    const freqMult = wType === WeaponId.SABRE ? 0.74 : (wType === WeaponId.EPEE ? 0.48 : 0.56);

    if (dist < maxAttackDist && dist > wCfg.minMeasure && Math.random() < freqMult * diffCfg.attackFreq) {
      const roll = Math.random();
      if (wType === WeaponId.SABRE) {
        if (dist > 2.22 && roll < 0.32) launchAIScheme('flunge_sabre');
        else if (roll < 0.58 && state.quadrant !== Quadrant.NW) launchAIScheme('moulinet_tete');
        else if (roll < 0.80 && Math.random() < diffCfg.feintChance) launchAIScheme('feint_tete_flanc');
        else if (roll < 0.92) launchAIScheme('beat_lunge');
        else launchAIScheme('direct');
      } else if (wType === WeaponId.EPEE) {
        if (dist > 2.34 && state.quadrant !== Quadrant.NE && roll < 0.52) launchAIScheme('saignee_poignet');
        else if (roll < 0.35 && state.playerPosture !== Posture.JUMP) launchAIScheme('touche_au_pied');
        else if (dist > 2.38 && roll < 0.55) launchAIScheme('fleche_blitz');
        else if (roll < 0.76) launchAIScheme('stop_hit_retreat');
        else launchAIScheme('direct');
      } else {
        if (dist > 2.32 && roll < 0.22) launchAIScheme('fleche_blitz');
        else if (roll < 0.25) launchAIScheme('beat_lunge');
        else if (roll < 0.45) launchAIScheme('coupe_glide');
        else if (roll < 0.68 && Math.random() < diffCfg.feintChance) launchAIScheme('feint_disengage');
        else if (roll < 0.84 && state.difficulty !== 'easy') launchAIScheme('double_feint');
        else if (roll < 0.93) launchAIScheme('passata_sotto');
        else launchAIScheme('direct');
      }
      return true;
    }
  }

  // Rhythmic Olympic "En-Garde Bounce / Measure Contest" Footwork with Inertial Piste Traction!
  const nowS = performance.now() * 0.001;
  let desiredVel = 0;
  if (wType === WeaponId.SABRE) {
    if (dist > 2.20) desiredVel = -2.75 * diffCfg.speedMult;
    else if (dist < 1.68) desiredVel = 2.55 * diffCfg.speedMult;
    else desiredVel = Math.sin(nowS * 8.8) * 1.85;
  } else if (wType === WeaponId.EPEE) {
    if (dist > 2.64) desiredVel = -1.65 * diffCfg.speedMult;
    else if (dist < 2.06) desiredVel = 2.05 * diffCfg.speedMult;
    else desiredVel = Math.sin(nowS * 5.2) * 1.10;
  } else {
    if (dist > 2.42) desiredVel = -2.05 * diffCfg.speedMult;
    else if (dist < 1.85) desiredVel = 2.25 * diffCfg.speedMult;
    else desiredVel = Math.sin(nowS * 6.4) * 1.35;
  }
  state.aiVelZ = accelerateWithPisteTraction(state.aiVelZ, desiredVel, dt);
  state.aiZ += state.aiVelZ * dt;
  return false;
}

function updateAIOpponent(dt) {
  const diffCfg = DIFFICULTIES[state.difficulty];
  const dist = state.aiZ - state.playerZ;
  const wCfg = WEAPON_CHANNELS[state.selectedWeapon];

  updateOpponentGuardAndPosture(dt, { isHumanP2: false, maxGuardSpeed: diffCfg.guardSpeed || 4.6 });

  if (state.aiAction === Action.PARRIED) {
    state.aiActionTimer -= dt;
    state.aiVelZ = accelerateWithPisteTraction(state.aiVelZ, 0.85, dt);
    state.aiZ += state.aiVelZ * dt;
    if (state.aiActionTimer <= 0) {
      state.aiAction = Action.IDLE;
      state.aiSchemeLabel = 'OBSERVATION';
    }
    return;
  }

  if (state.aiAction === Action.PARRYING) {
    state.aiActionTimer -= dt;
    state.aiVelZ = accelerateWithPisteTraction(state.aiVelZ, 0.35, dt);
    state.aiZ += state.aiVelZ * dt;
    if (state.aiActionTimer <= 0) {
      if (dist < 2.68) launchAIScheme(state.aiScheme === 'riposte_croise' ? 'riposte_croise' : 'riposte_direct');
      else state.aiAction = Action.IDLE;
    }
    return;
  }

  if (state.aiAction === Action.COUPE) {
    state.aiActionTimer -= dt;
    state.aiCoupeLiftY = Math.sin((1 - state.aiActionTimer / 0.25) * Math.PI) * 0.42;
    state.aiVelZ = accelerateWithPisteTraction(state.aiVelZ, -1.85 * diffCfg.speedMult, dt);
    state.aiZ += state.aiVelZ * dt;
    if (state.aiActionTimer <= 0) {
      state.aiCoupeLiftY = 0;
      state.aiAction = Action.LUNGE;
      state.aiActionTimer = 0.24;
      state.aiStrikeEvaluated = false;
      if (state.selectedWeapon === WeaponId.SABRE) {
        triggerP2SabreSlashVisual(state.aiAttackQuad);
        sound.playSabreCut();
      } else {
        sound.playSwoosh(1.25);
      }
    }
    return;
  }

  if (state.aiAction === Action.FEINT1) {
    state.aiActionTimer -= dt;
    state.aiVelZ = accelerateWithPisteTraction(state.aiVelZ, -1.65 * diffCfg.speedMult, dt);
    state.aiZ += state.aiVelZ * dt;
    if (state.aiActionTimer <= 0) {
      state.aiAttackQuad = state.aiFeintTargetQuad;
      const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
      state.aiTargetX = qc.x;
      state.aiTargetY = qc.y;
      sound.playSwoosh(1.25);
      if (state.aiScheme === 'double_feint') {
        state.aiAction = Action.FEINT2;
        state.aiActionTimer = Math.max(0.13, 0.20 / diffCfg.speedMult);
      } else {
        state.aiAction = Action.LUNGE;
        state.aiActionTimer = 0.24;
        state.aiStrikeEvaluated = false;
        if (state.selectedWeapon === WeaponId.SABRE) {
          triggerP2SabreSlashVisual(state.aiAttackQuad);
          sound.playSabreCut();
        }
      }
    }
    return;
  }

  if (state.aiAction === Action.FEINT2) {
    state.aiActionTimer -= dt;
    state.aiVelZ = accelerateWithPisteTraction(state.aiVelZ, -1.85 * diffCfg.speedMult, dt);
    state.aiZ += state.aiVelZ * dt;
    if (state.aiActionTimer <= 0) {
      state.aiAttackQuad = state.aiFinalTargetQuad;
      const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
      state.aiTargetX = qc.x;
      state.aiTargetY = qc.y;
      state.aiAction = Action.LUNGE;
      state.aiActionTimer = 0.24;
      state.aiStrikeEvaluated = false;
      if (state.selectedWeapon === WeaponId.SABRE) {
        triggerP2SabreSlashVisual(state.aiAttackQuad);
        sound.playSabreCut();
      } else {
        sound.playSwoosh(1.35);
      }
    }
    return;
  }

  if (state.aiAction === Action.PREP) {
    state.aiActionTimer -= dt;
    const isRetreatScheme = (state.aiScheme === 'pull_distance_counter' || state.aiScheme === 'stop_hit_retreat');
    const speedBoost = (state.aiScheme === 'fleche_blitz' || state.aiScheme === 'flunge_sabre') ? 1.55 : 1.0;
    const targetPrepVel = isRetreatScheme ? (2.15 * diffCfg.speedMult) : (-1.65 * diffCfg.speedMult * speedBoost);
    state.aiVelZ = accelerateWithPisteTraction(state.aiVelZ, targetPrepVel, dt);
    state.aiZ += state.aiVelZ * dt;

    if (state.quadrant === state.aiAttackQuad && state.aiScheme === 'direct' &&
        Math.random() < diffCfg.feintChance * 0.45 && state.aiActionTimer > 0.08) {
      const allQuads = [Quadrant.NW, Quadrant.NE, Quadrant.SW, Quadrant.SE].filter(q => q !== state.quadrant);
      state.aiFeintTargetQuad = allQuads[Math.floor(Math.random() * allQuads.length)];
      state.aiScheme = 'feint_disengage';
      state.aiSchemeLabel = AI_SCHEMES.feint_disengage.label;
      state.aiAction = Action.FEINT1;
      state.aiActionTimer = 0.14;
      return;
    }

    const targetQc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    const guardDist = Math.hypot(state.guardX - targetQc.x, state.guardY - targetQc.y);
    if ((state.parryActiveWindow > 0 || state.swipeParryWindow > 0) &&
        state.bladePoise >= CONSTANTS.POISE_LOSS_THRESHOLD && state.parryWhiffLockout <= 0 &&
        (state.quadrant === state.aiAttackQuad || guardDist < 0.35) && dist < 2.75) {
      executeSuccessfulPlayerParry(state.selectedWeapon === WeaponId.SABRE && state.quadrant === Quadrant.NW ? 'QUINTE (5号架顶)' : 'PARADE', false);
      return;
    }

    if (state.aiActionTimer <= 0) {
      state.aiAction = Action.LUNGE;
      state.aiActionTimer = 0.25;
      state.aiStrikeEvaluated = false;
      if (state.selectedWeapon === WeaponId.SABRE) {
        triggerP2SabreSlashVisual(state.aiAttackQuad);
        sound.playSabreCut();
      } else {
        sound.playSwoosh(1.15);
      }
    }
    return;
  }

  if (state.aiAction === Action.LUNGE || state.aiAction === Action.REMISE) {
    state.aiActionTimer -= dt;
    const lungeBoost = (state.aiScheme === 'fleche_blitz' || state.aiScheme === 'flunge_sabre') ? 1.35 : 1.0;
    const lungeProg = 1 - Math.max(0, state.aiActionTimer / 0.25);
    const desiredLungeVel = lungeProg < 0.62 ? (-4.25 * diffCfg.speedMult * lungeBoost) : (-1.15 * diffCfg.speedMult);
    state.aiExtension = Math.min(1, state.aiExtension + dt * 10.6 * diffCfg.speedMult);
    state.aiVelZ = accelerateWithPisteTraction(state.aiVelZ, desiredLungeVel, dt, 38, 22);
    state.aiZ += state.aiVelZ * dt;

    if (state.rightOfWay !== 'player') {
      state.rightOfWay = 'ai';
      state.rowMeter = 100;
    }

    const aiHighAttack = (state.aiAttackQuad === Quadrant.NW || state.aiAttackQuad === Quadrant.NE);
    const aiLowAttack = (state.aiAttackQuad === Quadrant.SW || state.aiAttackQuad === Quadrant.SE);
    if (aiHighAttack && state.playerPosture === Posture.DUCK && state.duckHoldDuration <= CONSTANTS.DUCK_CAMP_LIMIT && state.aiExtension > 0.62) {
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.38;
      state.riposteBonusTimer = 0.85;
      state.rightOfWay = 'player';
      state.rowMeter = -95;
      state.rowReason = 'ESQUIVE · 下蹲闪避成功';
      addStyleMomentum(185, '💨 ESQUIVE!', 'PERFECT DUCK EVADE', null, null, '#34d399');
      state.speedLinesAlpha = 0.68;
      showCallout('ESQUIVE! 闪过上路攻击', '立即点击左键反击！', 'text-emerald-300', 0.9);
      return;
    }
    if (aiLowAttack && state.playerPosture === Posture.JUMP && state.aiExtension > 0.62) {
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.38;
      state.riposteBonusTimer = 0.85;
      state.rightOfWay = 'player';
      state.rowMeter = -95;
      state.rowReason = 'BOND · 跃起闪避成功';
      addStyleMomentum(185, '⚡ BOND EVADE!', 'AIRBORNE DODGE', null, null, '#818cf8');
      state.speedLinesAlpha = 0.68;
      showCallout('JUMP EVADE! 跃起躲过下路', '立即左键反击！', 'text-indigo-300', 0.9);
      return;
    }

    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    const guardDist = Math.hypot(state.guardX - qc.x, state.guardY - qc.y);

    if (dist < 2.64 && state.aiExtension > 0.24 && state.playerAction !== Action.RECOVERY &&
        state.bladePoise >= CONSTANTS.POISE_LOSS_THRESHOLD && state.parryWhiffLockout <= 0) {
      if ((state.parryActiveWindow > 0 || state.swipeParryWindow > 0) && guardDist < 0.37) {
        const isPerfect = state.aiExtension >= 0.40;
        executeSuccessfulPlayerParry(
          state.selectedWeapon === WeaponId.SABRE && state.quadrant === Quadrant.NW ? 'QUINTE (5号架顶)' : (isPerfect ? 'PARADE PARFAITE' : 'PARADE'),
          isPerfect
        );
        return;
      }
    }

    // Check if AI's lunge is deflected off P1's Forte Opposition or grounded Coquille!
    if (!state.aiStrikeEvaluated && state.aiExtension > 0.74) {
      if (state.bladeBindActive && state.bindLeverage >= 1.28 && state.selectedWeapon !== WeaponId.SABRE) {
        state.aiStrikeEvaluated = true;
        state.aiAction = Action.RECOVERY;
        state.aiActionTimer = 0.30;
        injectBladeVibration(false, 22, 16);
        sound.playCoquilleDeflect(state.selectedWeapon === WeaponId.EPEE);
        trigger3DWorldClashSparks(state.bindContactWorldX, state.bindContactWorldY, state.bindContactWorldZ, '#38bdf8', 0x38bdf8, 22, 2.2);
        state.rowReason = `OPPOSITION (${state.bindLeverage.toFixed(1)}x) · 强剑身架开来剑!`;
        return;
      }

      const aiMaxReach = (state.selectedWeapon === WeaponId.EPEE && state.aiAttackQuad === Quadrant.NE)
        ? CONSTANTS.EPEE_WRIST_MAX_REACH
        : wCfg.optimalMax;

      if (dist <= aiMaxReach) {
        state.aiStrikeEvaluated = true;
        // Axial force check if P1 is retreating rapidly at edge of measure!
        const relSpd = (-state.aiVelZ) + state.playerVelZ;
        const aiForceN = computeAxialImpactForceN(state.selectedWeapon, relSpd, 92, 0.2, false);
        if (wCfg.triggerForceN > 0 && dist > aiMaxReach - 0.11 && state.playerVelZ < -1.55 && aiForceN < wCfg.triggerForceN) {
          state.aiAction = Action.RECOVERY;
          state.aiActionTimer = 0.32;
          state.riposteBonusTimer = 0.75;
          state.rightOfWay = 'player';
          state.rowMeter = -88;
          sound.playBladeScrape(1320, 0.6);
          addStyleMomentum(140, 'ROMPRE LA MESURE!', `PULLED DISTANCE (${aiForceN.toFixed(1)}N)`, null, null, '#34d399');
          showCallout(`拉距卸力成功! (${aiForceN.toFixed(1)}N < ${wCfg.triggerForceN}N)`, '后撤步让对手弹簧剑头未压响 — 立即反攻！', 'text-emerald-300', 1.0);
          return;
        }

        const vp1 = getViewportMetrics(false);
        const cx = vp1.centerX + qc.x * 135;
        const cy = vp1.vh * 0.47 + qc.y * 105;
        spawnSparks(cx, cy, '#f43f5e', 34);
        state.p2PinnedHitActive = (state.selectedWeapon !== WeaponId.SABRE);
        state.p2PinnedHitTimer = 0.65;
        state.p2BladeBuckleAmp = 0.12;
        registerApparatusTouch('ai', `${state.aiSchemeLabel} → ${getQuadrantShort(state.aiAttackQuad)}`, 'touch_ai', false);
        return;
      }
    }

    if (state.aiActionTimer <= 0) {
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.30;
      state.rightOfWay = 'player';
      state.rowMeter = -65;
      state.riposteBonusTimer = 0.45;
      state.rowReason = 'ATTAQUE NON · 对手刺空失位!';
    }
    return;
  }

  if (state.aiAction === Action.RECOVERY) {
    state.aiActionTimer -= dt;
    state.aiExtension = Math.max(0, state.aiExtension - dt * 6.0);
    state.aiVelZ = accelerateWithPisteTraction(state.aiVelZ, 1.75 * diffCfg.speedMult, dt);
    state.aiZ += state.aiVelZ * dt;
    if (state.aiActionTimer <= 0) {
      state.aiAction = Action.IDLE;
      state.aiExtension = 0;
      state.aiSchemeLabel = 'OBSERVATION';
      if (state.rightOfWay === 'ai') state.rightOfWay = 'none';
    }
    return;
  }

  decideAI(dt, dist, diffCfg, wCfg);
}

function updateContinuousPriorite(dt) {
  if (state.roundPhase !== RoundPhase.FIGHTING) return;

  if (state.lockoutActive) {
    const remMs = Math.max(0, Math.round(state.lockoutTimer * 1000));
    state.rowReason = `BOÎTIER LIVE · 闭锁倒计时 ${remMs}ms`;
    return;
  }

  if (state.selectedWeapon === WeaponId.EPEE) {
    const dist = state.aiZ - state.playerZ;
    const wristCovered = (state.quadrant === Quadrant.NE && state.bladePoise >= 65);
    if (state.bladeBindActive) {
      const levTxt = state.bindLeverage >= 1.15 ? `FORTE ${state.bindLeverage.toFixed(1)}x 占优` : (state.bindLeverage <= 0.85 ? `FOIBLE ${state.bindLeverage.toFixed(1)}x 受压` : '均势交剑');
      state.rowMeter += (-55 * (state.bindLeverage - 0.5) - state.rowMeter) * Math.min(1, dt * 8);
      state.rowReason = `FER SUR FER · ${levTxt}`;
    } else if (dist <= CONSTANTS.EPEE_WRIST_MAX_REACH && dist > CONSTANTS.EPEE_BODY_MAX_REACH && state.quadrant === Quadrant.NE) {
      state.rowMeter += (-55 - state.rowMeter) * Math.min(1, dt * 8);
      state.rowReason = `POIGNET WINDOW (${dist.toFixed(2)}m) · 可远距狙腕!`;
    } else if (!wristCovered && dist <= CONSTANTS.EPEE_WRIST_MAX_REACH) {
      state.rowMeter += (55 - state.rowMeter) * Math.min(1, dt * 8);
      state.rowReason = 'POIGNET EXPOSÉ · 手腕暴露提防截刺!';
    } else if (state.aiAction === Action.PREP || state.aiAction === Action.FEINT1 || state.aiAction === Action.FEINT2) {
      state.rowMeter += (-60 - state.rowMeter) * Math.min(1, dt * 8);
      state.rowReason = 'ARRÊT 45ms · 抢先45ms闭锁单灯良机';
    } else {
      state.rowMeter += (-15 - state.rowMeter) * Math.min(1, dt * 5);
      state.rowReason = 'COQUILLE FERMÉE · 6号位深碗护腕对峙';
    }
    return;
  }

  if (state.riposteBonusTimer > 0) {
    state.rightOfWay = 'player';
    state.rowMeter = -100;
    return;
  }
  if (state.p2RiposteBonusTimer > 0) {
    state.rightOfWay = 'ai';
    state.rowMeter = 100;
    return;
  }
  if (state.pointInLineActive) {
    state.rightOfWay = 'player';
    state.rowMeter = -85;
    return;
  }
  if (state.playerAction === Action.LUNGE || state.playerAction === Action.REMISE) return;
  if (state.aiAction !== Action.IDLE && state.aiAction !== Action.PARRIED && state.aiAction !== Action.RECOVERY) return;

  if (state.bladePoise < CONSTANTS.POISE_LOSS_THRESHOLD) {
    state.rightOfWay = 'ai';
    state.rowMeter += (75 - state.rowMeter) * Math.min(1, dt * 8);
    state.rowReason = 'GARDE OUVERTE · 剑尖失稳';
  } else if (state.parryWhiffLockout > 0) {
    state.rightOfWay = 'ai';
    state.rowMeter = 90;
    state.rowReason = 'PARADE VIDE · 挥空硬直';
  } else if (state.bladeBindActive) {
    const levAdvantage = state.bindLeverage - 1.0;
    state.rowMeter += (-65 * levAdvantage - state.rowMeter) * Math.min(1, dt * 7);
    const zoneTag = state.bindStationP1 < 0.42 ? 'FORTE强剑身' : (state.bindStationP1 > 0.68 ? 'FOIBLE弱剑尖' : 'MEDIO中段');
    state.rowReason = `FER (${zoneTag} ${state.bindLeverage.toFixed(1)}x) · 抗剑角力`;
  } else if ((state.keys.right || state.playerMarchTimer > 0) && state.marchHoldDuration <= CONSTANTS.MARCH_HESITATION_LIMIT) {
    state.rightOfWay = 'player';
    state.rowMeter += (-65 - state.rowMeter) * Math.min(1, dt * 8);
    state.rowReason = 'PRIORITÉ GAUCHE · 左方步法主动';
  } else if (state.gameMode === GameMode.SPLIT_2P && (state.keys.p2Advance || state.p2MarchTimer > 0) && state.p2MarchHoldDuration <= CONSTANTS.MARCH_HESITATION_LIMIT) {
    state.rightOfWay = 'ai';
    state.rowMeter += (65 - state.rowMeter) * Math.min(1, dt * 8);
    state.rowReason = 'PRIORITÉ DROITE · 右方步法主动';
  } else if (state.keys.left) {
    state.rowMeter += (35 - state.rowMeter) * Math.min(1, dt * 6);
    if (state.rowMeter > 20) {
      state.rightOfWay = 'ai';
      state.rowReason = 'PRIORITÉ DROITE · 右方压进';
    }
  } else if (state.beatCooldown <= 0.2) {
    state.rowMeter += (0 - state.rowMeter) * Math.min(1, dt * 4);
    if (Math.abs(state.rowMeter) < 15) {
      state.rightOfWay = 'none';
      state.rowReason = 'NEUTRAL · 控距试探';
    }
  }
}

// Interactive Academy & Bout Lifecycle
function startInteractiveTutorial(stepIndex = 0) {
  sound.init();
  refVoice.warmup();
  if (DOM.titleLeftDock) DOM.titleLeftDock.classList.add('dock-slide-out');
  if (DOM.titleRightWatermark) DOM.titleRightWatermark.classList.add('watermark-slide-out');

  const lesson = TUTORIAL_LESSONS[Math.max(0, Math.min(TUTORIAL_LESSONS.length - 1, stepIndex))];
  triggerBroadcastStinger(
    'FENCING ACADEMY // 击剑战术学院',
    `LESSON ${lesson.step} · ${WEAPON_CHANNELS[lesson.weapon].frenchName.toUpperCase()}`,
    lesson.title,
    'bg-amber-400',
    () => {
      setGameMode(GameMode.TUTORIAL);
      state.running = true;
      state.paused = false;
      state.playerScore = 0;
      state.aiScore = 0;
      state.playerYellowCards = 0;
      state.aiYellowCards = 0;
      state.boutTimeRemaining = 999;
      state.camCenterRatio = 0.65;
      state.camFovZoom = -0.20;
      if (DOM.modalOverlay) DOM.modalOverlay.classList.add('hidden');
      if (DOM.victoryPodiumOverlay) DOM.victoryPodiumOverlay.classList.add('hidden');
      if (DOM.titleLeftDock) DOM.titleLeftDock.classList.remove('dock-slide-out');
      if (DOM.titleRightWatermark) DOM.titleRightWatermark.classList.remove('watermark-slide-out');
      if (DOM.flashcardModalOverlay) DOM.flashcardModalOverlay.classList.add('hidden');
      if (DOM.btnResumeBout) DOM.btnResumeBout.classList.remove('hidden');
      loadTutorialLesson(stepIndex);
    }
  );
}

function loadTutorialLesson(idx) {
  clearTimeout(state._tutAdvanceTimer);
  state.tutorialAdvancing = false;

  const clampedIdx = Math.max(0, Math.min(TUTORIAL_LESSONS.length - 1, idx));
  state.tutorialStep = clampedIdx;
  state.tutorialProgress = 0;
  state.tutorialVisitedQuads = { NW: false, NE: false, SW: false, SE: false };
  state.tutorialFootworkFlags = { advance: false, retreat: false, vertical: false };
  state.tutorialCoachTimer = 1.0;

  const lesson = TUTORIAL_LESSONS[clampedIdx];
  selectWeaponDiscipline(lesson.weapon, true);
  resetPositionsForNextPoint(true);
  state.roundPhase = RoundPhase.FIGHTING;
  updateTutorialUI();

  showCallout(lesson.title, lesson.taskPrompt, 'text-amber-300', 1.8);
  refVoice.speakCue('engarde');
}

function updateTutorialUI() {
  const panel = DOM.tutorialOverlayPanel;
  if (!panel) return;
  if (state.gameMode !== GameMode.TUTORIAL) {
    panel.classList.add('hidden');
    return;
  }
  panel.classList.remove('hidden');

  const lesson = TUTORIAL_LESSONS[state.tutorialStep];
  setDomText(DOM.tutStepBadge, `LESSON ${lesson.step} / ${TUTORIAL_LESSONS.length}`);
  setDomText(DOM.tutLessonTitle, lesson.title);
  setDomText(DOM.tutLessonTheory, lesson.theory);
  setDomText(DOM.tutTaskPrompt, lesson.taskPrompt);
  setDomText(DOM.tutTaskCounter, `${state.tutorialProgress} / ${lesson.goalCount}`);
  const pct = Math.min(100, Math.round((state.tutorialProgress / lesson.goalCount) * 100));
  setDomStyle(DOM.tutProgressBar, 'width', `${pct}%`);
}

function advanceTutorialProgress(increment = 1, praiseMsg = '漂亮！') {
  if (state.gameMode !== GameMode.TUTORIAL || state.tutorialAdvancing) return;
  const lesson = TUTORIAL_LESSONS[state.tutorialStep];
  state.tutorialProgress = Math.min(lesson.goalCount, state.tutorialProgress + increment);
  updateTutorialUI();
  sound.playScoreMachine('player');

  if (state.tutorialProgress >= lesson.goalCount) {
    state.tutorialAdvancing = true;
    refVoice.speakCue('bravo');
    if (state.tutorialStep < TUTORIAL_LESSONS.length - 1) {
      showCallout(`第 ${lesson.step} 课完成!`, `即将进入：${TUTORIAL_LESSONS[state.tutorialStep + 1].title}`, 'text-emerald-400', 1.5);
      clearTimeout(state._tutAdvanceTimer);
      state._tutAdvanceTimer = setTimeout(() => {
        if (state.gameMode === GameMode.TUTORIAL) {
          loadTutorialLesson(state.tutorialStep + 1);
        }
      }, 1500);
    } else {
      showCallout('击剑学院全部通关!', '已掌握花/重/佩三套真实剑术物理！点击右上菜单开启锦标赛', 'text-amber-300', 3.0);
    }
  } else {
    showCallout(`训练进度 ${state.tutorialProgress}/${lesson.goalCount}`, praiseMsg, 'text-cyan-300', 1.0);
  }
}

function updateTutorialCoachAI(dt) {
  const lesson = TUTORIAL_LESSONS[state.tutorialStep];
  const dist = state.aiZ - state.playerZ;

  updateOpponentGuardAndPosture(dt, { isHumanP2: false, maxGuardSpeed: 3.8 });

  if (state.aiAction === Action.IDLE) {
    if (dist > 2.22) state.aiZ -= 1.3 * dt;
    else if (dist < 1.82) state.aiZ += 1.3 * dt;
  }

  if (lesson.step === 1) {
    if (state.bladePoise >= 70 && !state.tutorialVisitedQuads[state.quadrant]) {
      state.tutorialVisitedQuads[state.quadrant] = true;
      advanceTutorialProgress(1, `已巡检 ${getQuadrantShort(state.quadrant)}`);
    }
    return;
  }
  if (lesson.step === 2) return;
  if (lesson.step === 3) {
    state.aiTargetX = -0.44;
    state.aiTargetY = -0.36;
    state.aiQuadrant = Quadrant.NW;
    return;
  }

  if (state.aiAction === Action.PARRIED) {
    state.aiActionTimer -= dt;
    if (state.aiActionTimer <= 0) state.aiAction = Action.IDLE;
    return;
  }

  if (state.aiAction === Action.FEINT1) {
    state.aiActionTimer -= dt;
    if (state.aiActionTimer <= 0) {
      state.aiAttackQuad = state.aiFeintTargetQuad;
      const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
      state.aiTargetX = qc.x;
      state.aiTargetY = qc.y;
      state.aiAction = Action.LUNGE;
      state.aiActionTimer = 0.34;
      state.aiStrikeEvaluated = false;
      if (state.selectedWeapon === WeaponId.SABRE) {
        triggerP2SabreSlashVisual(state.aiAttackQuad);
        sound.playSabreCut();
      } else {
        sound.playSwoosh(1.2);
      }
    }
    return;
  }

  if (state.aiAction === Action.PREP) {
    state.aiActionTimer -= dt;
    const targetQc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    const guardDist = Math.hypot(state.guardX - targetQc.x, state.guardY - targetQc.y);
    if ((state.parryActiveWindow > 0 || state.swipeParryWindow > 0) &&
        state.bladePoise >= CONSTANTS.POISE_LOSS_THRESHOLD && state.parryWhiffLockout <= 0 &&
        (state.quadrant === state.aiAttackQuad || guardDist < 0.38)) {
      executeSuccessfulPlayerParry('PARADE', false);
      return;
    }
    if (state.aiActionTimer <= 0) {
      state.aiAction = Action.LUNGE;
      state.aiActionTimer = 0.34;
      state.aiStrikeEvaluated = false;
      if (state.selectedWeapon === WeaponId.SABRE) {
        triggerP2SabreSlashVisual(state.aiAttackQuad);
        sound.playSabreCut();
      } else {
        sound.playSwoosh(1.15);
      }
    }
    return;
  }

  if (state.aiAction === Action.LUNGE) {
    state.aiActionTimer -= dt;
    state.aiExtension = Math.min(1, state.aiExtension + dt * 7.5);
    const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
    const guardDist = Math.hypot(state.guardX - qc.x, state.guardY - qc.y);
    const highLine = (state.aiAttackQuad === Quadrant.NW || state.aiAttackQuad === Quadrant.NE);

    if (highLine && state.playerPosture === Posture.DUCK && state.duckHoldDuration <= 0.75 && state.aiExtension > 0.55) {
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.55;
      state.riposteBonusTimer = 0.95;
      state.rightOfWay = 'player';
      state.rowMeter = -95;
      addStyleMomentum(160, 'ESQUIVE!', 'DUCK COUNTER', null, null, '#34d399');
      showCallout('ESQUIVE! 下蹲闪避成功', '立即点击左键反刺得分！', 'text-emerald-300', 1.0);
      return;
    }

    if ((state.parryActiveWindow > 0 || state.swipeParryWindow > 0) &&
        state.bladePoise >= CONSTANTS.POISE_LOSS_THRESHOLD && state.parryWhiffLockout <= 0 &&
        (state.quadrant === state.aiAttackQuad || guardDist < 0.38)) {
      executeSuccessfulPlayerParry('PARADE', state.aiExtension >= 0.40);
      return;
    }

    if (state.aiActionTimer <= 0) {
      state.aiAction = Action.RECOVERY;
      state.aiActionTimer = 0.40;
    }
    return;
  }

  if (state.aiAction === Action.RECOVERY) {
    state.aiActionTimer -= dt;
    state.aiExtension = Math.max(0, state.aiExtension - dt * 5.0);
    if (state.aiActionTimer <= 0) {
      state.aiAction = Action.IDLE;
      state.aiExtension = 0;
    }
    return;
  }

  state.tutorialCoachTimer -= dt;
  if (state.tutorialCoachTimer <= 0 && state.riposteBonusTimer <= 0) {
    state.tutorialCoachTimer = 1.65;
    const openQuads = [Quadrant.NW, Quadrant.NE, Quadrant.SW, Quadrant.SE].filter(q => q !== state.quadrant);
    const pickQuad = openQuads[Math.floor(Math.random() * openQuads.length)] || Quadrant.NE;

    if (lesson.step === 4) {
      state.aiAttackQuad = pickQuad;
      const qc = getQuadCoords(pickQuad, state.selectedWeapon);
      state.aiTargetX = qc.x;
      state.aiTargetY = qc.y;
      state.aiAction = Action.PREP;
      state.aiActionTimer = 0.42;
      state.rightOfWay = 'ai';
      state.rowMeter = 85;
      state.rowReason = `教练喂招 ${getQuadrantShort(pickQuad)} · 滑鼠格挡`;
    } else if (lesson.step === 5) {
      state.aiAttackQuad = state.quadrant;
      state.aiFeintTargetQuad = Math.random() < 0.5 ? Quadrant.NW : Quadrant.NE;
      const qc = getQuadCoords(state.aiAttackQuad, state.selectedWeapon);
      state.aiTargetX = qc.x;
      state.aiTargetY = qc.y;
      state.aiAction = Action.FEINT1;
      state.aiActionTimer = 0.36;
      state.rightOfWay = 'ai';
      state.rowMeter = 85;
      state.rowReason = '黄光虚晃 · 忍住别抢挡';
    } else if (lesson.step === 6) {
      state.aiTargetX = -0.35;
      state.aiTargetY = 0.25;
    } else if (lesson.step === 7) {
      state.aiAttackQuad = Quadrant.NW;
      const qc = getQuadCoords(Quadrant.NW, state.selectedWeapon);
      state.aiTargetX = qc.x;
      state.aiTargetY = qc.y;
      if (Math.random() < 0.55) {
        state.aiAction = Action.PREP;
        state.aiActionTimer = 0.42;
        state.rowReason = '教练劈头 · 鼠标上抬横刀架顶(5)!';
      }
    }
  }
}

function resetPositionsForNextPoint(skipCadence = false) {
  clearTimeout(state._lampResetTimer);
  state.lockoutActive = false;
  state.lockoutTimer = 0;
  state.lockoutFirstSide = 'none';
  state.lockoutSecondSide = 'none';
  state.playerZ = -1.3;
  state.aiZ = 1.3;
  state.playerVelZ = 0;
  state.aiVelZ = 0;
  state.playerY = 0;
  state.playerVelY = 0;
  state.aiY = 0;
  state.aiVelY = 0;
  state.playerPosture = Posture.STAND;
  state.aiPosture = Posture.STAND;
  state.duckHeld = false;
  state.p2DuckHeld = false;
  state.duckHoldDuration = 0;
  state.p2DuckHoldDuration = 0;
  state.marchHoldDuration = 0;
  state.p2MarchHoldDuration = 0;
  state.playerAction = Action.IDLE;
  state.aiAction = Action.IDLE;
  state.playerExtension = 0;
  state.aiExtension = 0;
  state.playerStrikeEvaluated = false;
  state.aiStrikeEvaluated = false;
  state.bladeVibX = 0;
  state.bladeVibY = 0;
  state.bladeVibVelX = 0;
  state.bladeVibVelY = 0;
  state.p2BladeVibX = 0;
  state.p2BladeVibY = 0;
  state.p2BladeVibVelX = 0;
  state.p2BladeVibVelY = 0;
  state.bladeBuckleAmp = 0;
  state.p2BladeBuckleAmp = 0;
  state.pinnedHitActive = false;
  state.p2PinnedHitActive = false;
  state.bladeBindActive = false;
  state.bindPressure = 0;
  state.bindLeverage = 1.0;
  state.bladePoise = 100;
  state.p2BladePoise = 100;
  state.waggleHeat = 0;
  state.parryWhiffLockout = 0;
  state.remiseCooldown = 0;
  state.p2RemiseCooldown = 0;
  state.coquilleDeflectCooldown = 0;
  state.riposteBonusTimer = 0;
  state.p2RiposteBonusTimer = 0;
  state.pointInLineTimer = 0;
  state.pointInLineActive = false;
  state.masterStrikeActive = false;
  state.stamina = 100;
  state.p2Stamina = 100;
  state.rightOfWay = 'none';
  state.rowMeter = 0;
  state.rowReason = 'EN GARDE · 准备';
  state.bladeTrail = [];
  state.p2BladeTrail = [];
  setScoringLamps(false, false, false, false);

  if (skipCadence) {
    state.roundPhase = RoundPhase.FIGHTING;
    state.phaseTimer = 0;
    return;
  }

  state.roundPhase = RoundPhase.READY;
  state.phaseTimer = 1.05;
  state.readySubStage = 0;
  showCallout('EN GARDE!', WEAPON_CHANNELS[state.selectedWeapon].validTargetDesc, 'text-cyan-300', 0.55);
  refVoice.speakCue('engarde');
}

function startNewBout() {
  if (state.gameMode === GameMode.TUTORIAL) {
    startInteractiveTutorial(0);
    return;
  }
  sound.init();
  refVoice.warmup();
  if (DOM.titleLeftDock) DOM.titleLeftDock.classList.add('dock-slide-out');
  if (DOM.titleRightWatermark) DOM.titleRightWatermark.classList.add('watermark-slide-out');

  const wCfg = WEAPON_CHANNELS[state.selectedWeapon];
  const accentCls = state.selectedWeapon === WeaponId.SABRE
    ? 'bg-orange-400'
    : (state.selectedWeapon === WeaponId.EPEE ? 'bg-amber-400' : 'bg-cyan-400');
  const diffObj = DIFFICULTIES[state.difficulty];
  const modeTag = state.gameMode === GameMode.SPLIT_2P
    ? 'LOCAL VERSUS 2P // 双人同屏决战'
    : `CHALLENGER // ${diffObj.rivalName} [${diffObj.country}]`;

  triggerBroadcastStinger(
    modeTag,
    `${wCfg.frenchName.toUpperCase()} // EN GARDE`,
    state.gameMode === GameMode.SPLIT_2P ? `${state.targetScore} TOUCHES · ${wCfg.validTargetDesc}` : diffObj.tauntQuote,
    accentCls,
    () => {
      state.playerScore = 0;
      state.aiScore = 0;
      state.playerYellowCards = 0;
      state.aiYellowCards = 0;
      state.playerAttackHistory = [];
      state.boutTimeRemaining = 180;
      state.hypeCombo = 0;
      state.maxHypeCombo = 0;
      state.stylePoints = 0;
      state.parriesLanded = 0;
      state.ripostesLanded = 0;
      state.masterGauge = 0;
      state.masterStrikeActive = false;
      state.running = true;
      state.paused = false;
      state.camCenterRatio = 0.66;
      state.camFovZoom = -0.22;
      if (DOM.styleComboHud) DOM.styleComboHud.classList.add('hidden');
      if (DOM.victoryPodiumOverlay) DOM.victoryPodiumOverlay.classList.add('hidden');
      if (DOM.modalOverlay) DOM.modalOverlay.classList.add('hidden');
      if (DOM.titleLeftDock) DOM.titleLeftDock.classList.remove('dock-slide-out');
      if (DOM.titleRightWatermark) DOM.titleRightWatermark.classList.remove('watermark-slide-out');
      if (DOM.flashcardModalOverlay) DOM.flashcardModalOverlay.classList.add('hidden');
      if (DOM.btnResumeBout) DOM.btnResumeBout.classList.remove('hidden');
      updateScoreHUD();
      updateTutorialUI();
      resetPositionsForNextPoint();
    }
  );
}

function triggerCorpsACorpsHalt(offender = 'p1') {
  if (state.roundPhase === RoundPhase.HALT) return;
  state.lockoutActive = false;
  if (state.gameMode === GameMode.TUTORIAL) {
    const mid = (state.aiZ + state.playerZ) * 0.5;
    state.playerZ = mid - 0.85;
    state.aiZ = mid + 0.85;
    showCallout('CORPS-À-CORPS!', '贴身过近违例，已自动拉开距离', 'text-amber-300', 1.1);
    return;
  }
  state.roundPhase = RoundPhase.HALT;
  state.phaseTimer = 2.0;
  state.hitStopTimer = 0.06;
  state.camShake = 0.28;
  state.p2CamShake = 0.28;
  state.bladeBindActive = false;
  sound.playFootstep(true);

  if (offender === 'p1') {
    if (state.playerYellowCards === 0) {
      state.playerYellowCards = 1;
      state.rowMeter = 50;
      state.rowReason = 'CORPS-À-CORPS P1 · 黄牌警告';
      state.lastPointColor = '#fbbf24';
      sound.playScoreMachine('neutral');
      showCallout('HALTE! — CARTON JAUNE (P1)', '贴身冲撞违例黄牌警告一次（再犯直接罚分）', 'text-amber-300', 1.9);
      refVoice.speakCue('corps_jaune');
    } else {
      state.aiScore++;
      state.rowMeter = 100;
      state.rowReason = 'CARTON ROUGE P1 · 红牌罚分';
      state.lastPointColor = '#f43f5e';
      setScoringLamps(false, true, false, false);
      sound.playScoreMachine('ai');
      state.screenFlash = 0.34;
      state.screenFlashColor = '#f43f5e';
      showCallout('HALTE! — CARTON ROUGE', '再次冲撞违例，右方直接获判 1 分！', 'text-rose-400', 1.9);
      refVoice.speakCue('corps_rouge');
    }
  } else {
    if (state.aiYellowCards === 0) {
      state.aiYellowCards = 1;
      state.rowMeter = -50;
      state.rowReason = 'CORPS-À-CORPS P2 · 黄牌警告';
      state.lastPointColor = '#fbbf24';
      sound.playScoreMachine('neutral');
      showCallout('HALTE! — CARTON JAUNE (P2)', '右方贴身冲撞违例黄牌警告一次', 'text-amber-300', 1.9);
      refVoice.speakCue('corps_jaune');
    } else {
      state.playerScore++;
      state.rowMeter = -100;
      state.rowReason = 'CARTON ROUGE P2 · 红牌罚分';
      state.lastPointColor = '#10b981';
      setScoringLamps(true, false, false, false);
      sound.playScoreMachine('player');
      state.screenFlash = 0.34;
      state.screenFlashColor = '#10b981';
      showCallout('HALTE! — CARTON ROUGE', '右方再次冲撞违例，左方获判 1 分！', 'text-emerald-400', 1.9);
      refVoice.speakCue('corps_rouge');
    }
  }

  updateScoreHUD();
  if (state.playerScore >= state.targetScore || state.aiScore >= state.targetScore) {
    setTimeout(() => finishBout(), 1700);
  }
}

function triggerPoint(winner, reason, cueKey, offTargetSide = 'p1') {
  if (state.roundPhase === RoundPhase.HALT) return;
  state.lockoutActive = false;

  if (state.gameMode === GameMode.TUTORIAL) {
    const lesson = TUTORIAL_LESSONS[state.tutorialStep];
    state.playerAction = Action.RECOVERY;
    state.playerActionTimer = 0.28;
    state.aiAction = Action.RECOVERY;
    state.aiActionTimer = 0.35;

    clearTimeout(state._lampResetTimer);
    if (winner === 'player' || (winner === 'epee_double' && lesson.step === 6)) {
      setScoringLamps(true, winner === 'epee_double', false, false);
      state._lampResetTimer = setTimeout(() => setScoringLamps(false, false, false, false), 900);
      if (lesson.step === 3) advanceTutorialProgress(1, reason);
      else if (lesson.step === 4 && state.riposteBonusTimer > 0) advanceTutorialProgress(1, '漂亮的格挡还击 (Parade-Riposte)！');
      else if (lesson.step === 4) showCallout('请先格挡再还击', '先迎向红光扇区格挡，再左键还击得分', 'text-amber-300', 1.3);
      else if (lesson.step === 5 && state.riposteBonusTimer > 0) advanceTutorialProgress(1, '成功识破假动作反击！');
      else if (lesson.step === 6 || lesson.step === 7) advanceTutorialProgress(1, reason);
    } else if (winner === 'offtarget') {
      setScoringLamps(false, false, offTargetSide === 'p1', offTargetSide === 'p2');
      state._lampResetTimer = setTimeout(() => setScoringLamps(false, false, false, false), 900);
      showCallout('HORS CIBLE (白灯无效)', '花剑仅躯干金属背心有效', 'text-slate-200', 1.2);
    }
    return;
  }

  state.roundPhase = RoundPhase.HALT;
  state.phaseTimer = 2.0;
  state.hitStopTimer = 0.020;
  state.camShake = 0.26;
  state.p2CamShake = 0.26;
  state.bladeBindActive = false;
  state.bindPressure = 0;

  const p1Name = state.gameMode === GameMode.SPLIT_2P ? 'P1' : 'YOU';
  const p2Name = state.gameMode === GameMode.SPLIT_2P ? 'P2' : DIFFICULTIES[state.difficulty].rivalName.split(' ')[1];

  if (winner === 'player') {
    state.playerScore++;
    if (state.riposteBonusTimer > 0) state.ripostesLanded++;
    state.rowMeter = -100;
    state.rowReason = `POINT GAUCHE · ${p1Name} 得分`;
    state.lastPointColor = '#10b981';
    state.slowMoTimer = 0.44;
    state.timeScale = 0.22;
    state.camFovZoom = 0.22;
    state.speedLinesAlpha = 1.0;
    state.killCamSlashAlpha = 1.0;
    addStyleMomentum(
      state.riposteBonusTimer > 0 ? 320 : 240,
      state.riposteBonusTimer > 0 ? 'RIPOSTE TOUCHÉ!' : 'TOUCHÉ!',
      reason,
      null,
      null,
      '#34d399'
    );
    setScoringLamps(true, false, false, false);
    sound.playScoreMachine('player');
    sound.playCrowdReaction(true);
    state.screenFlash = 0.30;
    state.screenFlashColor = '#10b981';
    showCallout(`TOUCHÉ À GAUCHE! (${p1Name} +1)`, reason, 'text-emerald-400', 1.9);
    refVoice.speakCue(cueKey || 'touch_player');
  } else if (winner === 'ai') {
    state.aiScore++;
    state.hypeCombo = 0;
    state.stylePoints = Math.max(0, state.stylePoints - 180);
    state.slowMoTimer = 0.34;
    state.timeScale = 0.28;
    state.speedLinesAlpha = 0.85;
    state.killCamSlashAlpha = 0.85;
    const vp = getViewportMetrics(state.gameMode === GameMode.SPLIT_2P);
    spawnFloatingCombatText(vp.centerX, vp.vh * 0.38, state.gameMode === GameMode.SPLIT_2P ? 'P2 TOUCHÉ!' : 'TOUCHÉ ADVERSE!', reason, '#fb7185');
    state.rowMeter = 100;
    state.rowReason = `POINT DROITE · ${p2Name} 得分`;
    state.lastPointColor = '#f43f5e';
    setScoringLamps(false, true, false, false);
    sound.playScoreMachine('ai');
    sound.playCrowdReaction(state.gameMode === GameMode.SPLIT_2P);
    state.screenFlash = 0.30;
    state.screenFlashColor = '#f43f5e';
    showCallout(`TOUCHÉ À DROITE! (${p2Name} +1)`, reason, 'text-rose-400', 1.9);
    refVoice.speakCue(cueKey || 'touch_ai');
  } else if (winner === 'epee_double') {
    const bothAtMatchPoint = (state.playerScore >= state.targetScore - 1 && state.aiScore >= state.targetScore - 1);
    if (!bothAtMatchPoint) {
      state.playerScore++;
      state.aiScore++;
    }
    state.rowMeter = 0;
    state.rowReason = 'COUP DOUBLE · 双灯同得';
    state.lastPointColor = '#fbbf24';
    state.slowMoTimer = 0.32;
    state.timeScale = 0.28;
    setScoringLamps(true, true, false, false);
    sound.playScoreMachine('player');
    state.screenFlash = 0.24;
    state.screenFlashColor = '#fbbf24';
    showCallout('COUP DOUBLE! (重剑双灯 +1 / +1)', bothAtMatchPoint ? '决胜分互中重来' : reason, 'text-amber-300', 1.95);
    refVoice.speakCue('coup_double');
  } else if (winner === 'double') {
    state.rowMeter = 0;
    state.rowReason = 'SIMULTANÉ · 同时互中不计分';
    state.lastPointColor = '#fbbf24';
    setScoringLamps(true, true, false, false);
    sound.playScoreMachine('neutral');
    showCallout('SIMULTANÉ!', reason || '同时互中无优先权，不计分', 'text-amber-300', 1.8);
    refVoice.speakCue('simultaneous');
  } else if (winner === 'offtarget') {
    state.rowMeter = offTargetSide === 'p1' ? -30 : 30;
    state.rowReason = 'HORS CIBLE · 白灯无效部位';
    state.lastPointColor = '#f8fafc';
    setScoringLamps(false, false, offTargetSide === 'p1', offTargetSide === 'p2');
    sound.playScoreMachine('neutral');
    showCallout('HORS CIBLE (白灯)', reason, 'text-slate-100', 1.75);
    refVoice.speakCue('offtarget');
  }

  updateScoreHUD();

  if (state.playerScore >= state.targetScore || state.aiScore >= state.targetScore) {
    setTimeout(() => finishBout(), 1700);
  }
}

function finishBout() {
  state.paused = true;
  state.running = false;
  state.lockoutActive = false;
  state.timeScale = 1.0;
  state.slowMoTimer = 0;
  const won = state.playerScore >= state.aiScore;
  const finalRank = state.stylePoints >= 850 ? 'SS' : (state.stylePoints >= 580 ? 'S' : (state.stylePoints >= 340 ? 'A' : (state.stylePoints >= 160 ? 'B' : 'C')));
  const diff = DIFFICULTIES[state.difficulty] || DIFFICULTIES.normal;
  const wCfg = WEAPON_CHANNELS[state.selectedWeapon];

  let unlockedNewMedal = false;
  if (won && state.gameMode === GameMode.SINGLE) {
    unlockedNewMedal = recordChampionshipMedal(state.difficulty, state.selectedWeapon);
  }

  if (DOM.victoryPodiumOverlay) {
    setDomText(DOM.podiumVerdictTag, state.gameMode === GameMode.SPLIT_2P ? 'LOCAL 2P CHAMPIONSHIP // 双人决战结果' : `GRAND PALAIS // VS ${diff.rivalName} [${diff.country}]`);
    setDomText(
      DOM.podiumTitleText,
      state.gameMode === GameMode.SPLIT_2P
        ? (won ? 'VICTOIRE P1 // 左屏夺冠!' : 'VICTOIRE P2 // 右屏夺冠!')
        : (won ? 'VICTOIRE // 荣膺桂冠!' : 'DÉFAITE // 惜败强敌')
    );
    setDomText(DOM.podiumScoreText, `${state.playerScore} : ${state.aiScore}`);
    setDomText(DOM.podiumRankText, finalRank);
    if (DOM.podiumMedalNotice) DOM.podiumMedalNotice.classList.toggle('hidden', !unlockedNewMedal);

    const srcEl = DOM[diff.portraitDomId];
    if (DOM.podiumRivalImg && srcEl && srcEl.src) DOM.podiumRivalImg.src = srcEl.src;
    setDomText(
      DOM.podiumQuoteText,
      state.gameMode === GameMode.SPLIT_2P
        ? `"精彩绝伦的双人同屏交锋！最终比分 ${state.playerScore} : ${state.aiScore}。"`
        : (won ? diff.winQuote : diff.loseQuote)
    );
    setDomText(DOM.podiumStatParries, String(state.parriesLanded));
    setDomText(DOM.podiumStatRipostes, String(state.ripostesLanded));
    setDomText(DOM.podiumStatStreak, `${state.maxHypeCombo}x`);
    setDomText(DOM.podiumStatWeapon, wCfg.frenchName.toUpperCase());
    if (DOM.btnPodiumNextRival) {
      DOM.btnPodiumNextRival.classList.toggle('hidden', state.gameMode === GameMode.SPLIT_2P);
    }
    if (DOM.btnResumeBout) DOM.btnResumeBout.classList.add('hidden');
    DOM.victoryPodiumOverlay.classList.remove('hidden');
  } else if (DOM.modalOverlay) {
    DOM.modalOverlay.classList.remove('hidden');
  }

  refVoice.speakCue('victory');
}

function setGameMode(mode) {
  state.gameMode = mode;
  const is2P = mode === GameMode.SPLIT_2P;
  const isTut = mode === GameMode.TUTORIAL;
  const targetBtn = is2P ? DOM.modeBtn2P : (isTut ? DOM.modeBtnTutorial : DOM.modeBtn1P);
  triggerPlateClickEffect(targetBtn);
  state.showcaseWeaponPulse = 0.75;
  sound.playUIClick(is2P ? 1020 : (isTut ? 1140 : 880));

  if (DOM.twoPlayerGuideBox) DOM.twoPlayerGuideBox.classList.toggle('hidden', !is2P);

  const baseCls = 'mode-btn skew-plate text-left p-2.5 bg-slate-900/80 hover:bg-slate-800/90 border-l-4 border-slate-700 border-y border-r border-slate-800 transition';
  setDomClass(
    DOM.modeBtn1P,
    mode === GameMode.SINGLE
      ? 'mode-btn skew-plate text-left p-2.5 bg-gradient-to-r from-cyan-950/90 to-slate-900/95 border-l-4 border-cyan-400 border-y border-r border-slate-700/80 transition'
      : baseCls
  );
  setDomClass(
    DOM.modeBtn2P,
    is2P
      ? 'mode-btn skew-plate text-left p-2.5 bg-gradient-to-r from-indigo-950/90 to-slate-900/95 border-l-4 border-indigo-400 border-y border-r border-slate-700/80 transition'
      : baseCls
  );
  setDomClass(
    DOM.modeBtnTutorial,
    isTut
      ? 'mode-btn skew-plate text-left p-2.5 bg-gradient-to-r from-amber-950/90 to-slate-900/95 border-l-4 border-amber-400 border-y border-r border-slate-700/80 transition'
      : 'mode-btn skew-plate text-left p-2.5 bg-slate-900/80 hover:bg-slate-800/90 border-l-4 border-amber-500/60 border-y border-r border-slate-800 transition'
  );

  const diff = DIFFICULTIES[state.difficulty] || DIFFICULTIES.normal;
  setDomText(DOM.p1TitleLabel, is2P ? 'P1 GAUCHE' : 'YOU · CHALLENGER');
  setDomText(DOM.p2TitleLabel, is2P ? 'P2 DROITE' : (isTut ? 'MAÎTRE COACH' : `${diff.rivalName.split(' ')[1]} [${diff.country}]`));

  updateTutorialUI();
  updateScoreHUD();
}

function updateScoreHUD() {
  setDomText(DOM.scorePlayer, String(state.playerScore));
  setDomText(DOM.scoreAI, String(state.aiScore));

  const wCfg = WEAPON_CHANNELS[state.selectedWeapon];
  setDomText(DOM.weaponModeBadge, `${wCfg.frenchName.toUpperCase()} · ${wCfg.shortName}`);
  if (DOM.cardPlayerBadge) DOM.cardPlayerBadge.classList.toggle('hidden', state.playerYellowCards === 0);
  if (DOM.cardAiBadge) DOM.cardAiBadge.classList.toggle('hidden', state.aiYellowCards === 0);

  const isMatchPoint = state.running && state.gameMode !== GameMode.TUTORIAL &&
    (state.playerScore === state.targetScore - 1 || state.aiScore === state.targetScore - 1) &&
    state.playerScore < state.targetScore && state.aiScore < state.targetScore;
  if (DOM.matchPointBanner) {
    DOM.matchPointBanner.classList.toggle('hidden', !isMatchPoint);
  }
}

function updateGame(dt) {
  for (let i = state.sparks.length - 1; i >= 0; i--) {
    const sp = state.sparks[i];
    sp.px = sp.x;
    sp.py = sp.y;
    sp.x += sp.vx * dt;
    sp.y += sp.vy * dt;
    sp.vy += 720 * dt;
    sp.life -= dt;
    if (sp.life <= 0) state.sparks.splice(i, 1);
  }

  for (let i = state.slashRibbons.length - 1; i >= 0; i--) {
    state.slashRibbons[i].life -= dt;
    if (state.slashRibbons[i].life <= 0) state.slashRibbons.splice(i, 1);
  }

  for (let i = state.shockwaves.length - 1; i >= 0; i--) {
    const sw = state.shockwaves[i];
    sw.life -= dt;
    const prog = 1 - Math.max(0, sw.life / sw.maxLife);
    sw.r = 10 + (sw.maxR - 10) * (1 - Math.pow(1 - prog, 3));
    if (sw.life <= 0) state.shockwaves.splice(i, 1);
  }

  for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
    const ft = state.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.vy *= 0.92;
    ft.life -= dt;
    if (ft.life <= 0) state.floatingTexts.splice(i, 1);
  }

  if (state.clashLightIntensity > 0) {
    state.clashLightIntensity = Math.max(0, state.clashLightIntensity - dt * 12.0);
  }
  if (state.speedLinesAlpha > 0) state.speedLinesAlpha = Math.max(0, state.speedLinesAlpha - dt * 2.2);
  if (state.killCamSlashAlpha > 0) state.killCamSlashAlpha = Math.max(0, state.killCamSlashAlpha - dt * 2.4);
  if (state.sabreSlashPhase > 0) state.sabreSlashPhase = Math.max(0, state.sabreSlashPhase - dt * 2.9);
  if (state.p2SabreSlashPhase > 0) state.p2SabreSlashPhase = Math.max(0, state.p2SabreSlashPhase - dt * 2.9);

  state.bladeTrail.push({ x: state.tipX, y: state.tipY, ext: state.playerExtension, life: 0.14, maxLife: 0.14 });
  for (let i = state.bladeTrail.length - 1; i >= 0; i--) {
    state.bladeTrail[i].life -= dt;
    if (state.bladeTrail[i].life <= 0 || state.bladeTrail.length > 14) state.bladeTrail.splice(i, 1);
  }
  if (state.gameMode === GameMode.SPLIT_2P) {
    state.p2BladeTrail.push({ x: state.p2TipX, y: state.p2TipY, ext: state.aiExtension, life: 0.14, maxLife: 0.14 });
    for (let i = state.p2BladeTrail.length - 1; i >= 0; i--) {
      state.p2BladeTrail[i].life -= dt;
      if (state.p2BladeTrail[i].life <= 0 || state.p2BladeTrail.length > 14) state.p2BladeTrail.splice(i, 1);
    }
  }

  if (state.screenFlash > 0) state.screenFlash = Math.max(0, state.screenFlash - dt * 1.4);
  if (state.camShake > 0) state.camShake = Math.max(0, state.camShake - dt * 1.8);
  if (state.p2CamShake > 0) state.p2CamShake = Math.max(0, state.p2CamShake - dt * 1.8);
  if (state.pinnedHitTimer > 0) {
    state.pinnedHitTimer = Math.max(0, state.pinnedHitTimer - dt);
    if (state.pinnedHitTimer <= 0) {
      state.pinnedHitActive = false;
      state.bladeBuckleAmp = 0;
    }
  }
  if (state.p2PinnedHitTimer > 0) {
    state.p2PinnedHitTimer = Math.max(0, state.p2PinnedHitTimer - dt);
    if (state.p2PinnedHitTimer <= 0) {
      state.p2PinnedHitActive = false;
      state.p2BladeBuckleAmp = 0;
    }
  }

  const rawTargetHR = 90 + (100 - state.stamina) * 0.85 + (100 - state.bladePoise) * 0.45 + (state.roundPhase === RoundPhase.FIGHTING ? 18 : 0);
  const targetHR = Math.max(CONSTANTS.HEART_RATE_MIN, Math.min(CONSTANTS.HEART_RATE_MAX, rawTargetHR));
  state.heartRate += (targetHR - state.heartRate) * Math.min(1, dt * 2.5);
  state.breathPhase += dt * (1.8 + (state.heartRate - 90) * 0.035);

  if (state.hitStopTimer > 0) {
    state.hitStopTimer -= dt;
    return;
  }

  if (state.paused || !state.running) {
    sound.tickDynamicArenaMusic(false, 0);
    return;
  }

  // Advance Live FIE Electrical Lockout Window if active!
  if (state.lockoutActive && state.roundPhase === RoundPhase.FIGHTING) {
    state.lockoutTimer -= dt;
    if (state.lockoutTimer <= 0) {
      resolveLockoutPhrase();
      if (state.roundPhase === RoundPhase.HALT) {
        updateHUDWidgets();
        return;
      }
    }
  }

  state.waggleHeat = Math.max(0, state.waggleHeat - dt * 3.0);
  if (state.waggleHeat < 0.45 && state.parryWhiffLockout <= 0) {
    state.bladePoise = Math.min(100, state.bladePoise + dt * 46);
  }
  if (state.swipeParryCooldown > 0) state.swipeParryCooldown = Math.max(0, state.swipeParryCooldown - dt);
  if (state.parryWhiffLockout > 0) state.parryWhiffLockout = Math.max(0, state.parryWhiffLockout - dt);
  if (state.remiseCooldown > 0) state.remiseCooldown = Math.max(0, state.remiseCooldown - dt);
  if (state.coquilleDeflectCooldown > 0) state.coquilleDeflectCooldown = Math.max(0, state.coquilleDeflectCooldown - dt);
  if (state.punishCooldown > 0) state.punishCooldown = Math.max(0, state.punishCooldown - dt);

  if (state.playerPosture === Posture.JUMP) {
    state.playerY += state.playerVelY * dt;
    state.playerVelY -= 6.8 * dt;
    if (state.playerY <= 0) {
      state.playerY = 0;
      state.playerVelY = 0;
      state.playerPosture = state.duckHeld ? Posture.DUCK : Posture.STAND;
      sound.playFootstep(true);
    }
  } else if (state.duckHeld) {
    state.playerPosture = Posture.DUCK;
    state.duckHoldDuration += dt;
    state.stamina = Math.max(0, state.stamina - 22 * dt);
    if (state.stamina <= 5) {
      state.duckHeld = false;
      state.playerPosture = Posture.STAND;
      state.duckHoldDuration = 0;
    } else if (state.gameMode === GameMode.SINGLE && state.duckHoldDuration > CONSTANTS.DUCK_CAMP_LIMIT && state.aiAction === Action.IDLE && state.punishCooldown <= 0) {
      state.punishCooldown = 1.1;
      launchAIScheme('fleche_blitz', true);
    }
    state.playerY += (-0.48 - state.playerY) * Math.min(1, dt * 14);
  } else {
    state.playerPosture = Posture.STAND;
    state.duckHoldDuration = 0;
    state.playerY += (0 - state.playerY) * Math.min(1, dt * 12);
  }

  const dist = state.aiZ - state.playerZ;
  updateReal3DBladeContactPhysics(dt, dist);

  state.physicsAccumulator += dt;
  while (state.physicsAccumulator >= CONSTANTS.FIXED_DT) {
    stepSpringPhysicsSubstep(CONSTANTS.FIXED_DT);
    state.physicsAccumulator -= CONSTANTS.FIXED_DT;
  }

  state.prevQuadrant = state.quadrant;
  state.quadrant = getQuadrant(state.guardX, state.guardY, state.selectedWeapon);

  if (state.roundPhase === RoundPhase.READY) {
    state.phaseTimer -= dt;
    if (state.readySubStage === 0 && state.phaseTimer <= 0.52) {
      state.readySubStage = 1;
      state.rowReason = 'PRÊTS? · 预备';
      showCallout('PRÊTS?', '预备…', 'text-amber-300', 0.45);
      refVoice.speakCue('prets');
    }
    if (state.phaseTimer <= 0) {
      state.roundPhase = RoundPhase.FIGHTING;
      state.readySubStage = 2;
      state.rowReason = 'ALLEZ! · 开始交锋';
      showCallout('ALLEZ!', '开始交锋！', 'text-emerald-400', 0.75);
      refVoice.speakCue('allez');
    }
    sound.tickDynamicArenaMusic(false, 0);
    updateHUDWidgets();
    return;
  }

  if (state.roundPhase === RoundPhase.HALT) {
    state.phaseTimer -= dt;
    if (!state.pinnedHitActive) {
      state.playerExtension += (0 - state.playerExtension) * dt * 8;
    }
    if (!state.p2PinnedHitActive) {
      state.aiExtension += (0 - state.aiExtension) * dt * 8;
    }
    if (state.phaseTimer <= 0 && state.playerScore < state.targetScore && state.aiScore < state.targetScore && !state.transitionActive) {
      state.transitionActive = true;
      const boutNum = state.playerScore + state.aiScore + 1;
      triggerBroadcastStinger(
        `GRAND PALAIS // SCORE ${state.playerScore} - ${state.aiScore}`,
        `ASSAUT #${boutNum} // EN GARDE`,
        WEAPON_CHANNELS[state.selectedWeapon].validTargetDesc,
        'bg-amber-400',
        () => {
          state.transitionActive = false;
          state.camFovZoom = -0.16;
          resetPositionsForNextPoint();
        }
      );
    }
    sound.tickDynamicArenaMusic(false, 0);
    updateHUDWidgets();
    return;
  }

  if (state.gameMode !== GameMode.TUTORIAL) {
    state.boutTimeRemaining = Math.max(0, state.boutTimeRemaining - dt);
    if (state.boutTimeRemaining <= 0) {
      finishBout();
      return;
    }
  }

  if (state.playerAction === Action.IDLE && state.waggleHeat < 0.6 && !state.duckHeld) {
    state.stamina = Math.min(100, state.stamina + 24 * dt);
  }
  if (state.riposteBonusTimer > 0) state.riposteBonusTimer = Math.max(0, state.riposteBonusTimer - dt);
  if (state.parryActiveWindow > 0) state.parryActiveWindow = Math.max(0, state.parryActiveWindow - dt);
  if (state.swipeParryWindow > 0) state.swipeParryWindow = Math.max(0, state.swipeParryWindow - dt);
  if (state.beatCooldown > 0) state.beatCooldown = Math.max(0, state.beatCooldown - dt);
  if (state.playerMarchTimer > 0) state.playerMarchTimer = Math.max(0, state.playerMarchTimer - dt);

  let moveDir = 0;
  if (state.keys.right) moveDir += 1;
  if (state.keys.left) moveDir -= 1;

  const marchLimit = state.selectedWeapon === WeaponId.SABRE ? CONSTANTS.SABRE_MARCH_LIMIT : CONSTANTS.MARCH_HESITATION_LIMIT;
  if (moveDir > 0 && state.playerAction === Action.IDLE) {
    state.marchHoldDuration += dt;
    if (state.marchHoldDuration > marchLimit && state.aiAction === Action.IDLE && state.punishCooldown <= 0) {
      state.punishCooldown = 1.0;
      state.rightOfWay = 'ai';
      state.rowMeter = 85;
      if (state.gameMode === GameMode.SINGLE) launchAIScheme('stop_hit_retreat');
    }
  } else if (moveDir <= 0) {
    state.marchHoldDuration = Math.max(0, state.marchHoldDuration - dt * 2.5);
  }

  if (state.stepBurstTimer > 0) {
    state.stepBurstTimer -= dt;
    moveDir = state.stepBurstDir * 1.38;
  }

  // Inertial Ground-Reaction Footwork with Explosive Rear-Leg Lunge Impulse + Sole Braking Skid!
  const wFootMult = state.selectedWeapon === WeaponId.SABRE ? 1.32 : (state.selectedWeapon === WeaponId.EPEE ? 0.94 : 1.06);
  let targetPlayerVelZ = 0;
  if (state.playerAction === Action.LUNGE) {
    const lungeProgress = 1 - Math.max(0, state.playerActionTimer / 0.27);
    const peakLungeV = state.selectedWeapon === WeaponId.SABRE ? 5.35 : 4.75;
    targetPlayerVelZ = lungeProgress < 0.56 ? peakLungeV : 0.85;
  } else if (state.playerAction === Action.REMISE) {
    targetPlayerVelZ = 1.15;
  } else if (state.playerAction === Action.RECOVERY) {
    targetPlayerVelZ = state.selectedWeapon === WeaponId.SABRE ? -2.10 : -1.70;
  } else {
    const stepPulse = 0.88 + 0.25 * Math.sin(state.camBobPhase * 2);
    const duckSlowdown = state.playerPosture === Posture.DUCK ? 0.65 : 1.0;
    targetPlayerVelZ = moveDir * 2.40 * wFootMult * stepPulse * duckSlowdown;
  }

  state.playerVelZ = accelerateWithPisteTraction(
    state.playerVelZ,
    targetPlayerVelZ,
    dt,
    state.playerAction === Action.LUNGE ? 42.0 : CONSTANTS.FOOTWORK_ACCEL,
    CONSTANTS.FOOTWORK_FRICTION
  );

  if (state.selectedWeapon === WeaponId.FOIL && state.playerAction === Action.IDLE &&
      moveDir >= 0 && Math.abs(state.playerVelZ) < 1.25 &&
      Math.abs(state.guardX) < 0.26 && Math.abs(state.guardY) < 0.26 &&
      state.bladePoise >= 75 && dist > 1.85) {
    state.pointInLineTimer += dt;
    if (state.pointInLineTimer >= 0.42) {
      if (!state.pointInLineActive) {
        state.pointInLineActive = true;
        showCallout('POINTE EN LIGNE! (伸臂亮剑威慑)', '对手若不先敲剑直冲将直接撞上你的剑尖！', 'text-cyan-300', 1.1);
      }
      state.rightOfWay = 'player';
      state.rowMeter = -85;
      state.rowReason = 'POINTE EN LIGNE · 花剑亮剑先手';
    }
  } else {
    state.pointInLineTimer = Math.max(0, state.pointInLineTimer - dt * 3.0);
    if (state.pointInLineTimer <= 0) state.pointInLineActive = false;
  }

  state.playerZ += state.playerVelZ * dt;

  if (Math.abs(state.playerVelZ) > 0.15 && state.playerAction !== Action.LUNGE) {
    const prevPhase = state.camBobPhase;
    state.camBobPhase += dt * 11.5;
    if (Math.floor(prevPhase / Math.PI) !== Math.floor(state.camBobPhase / Math.PI)) {
      sound.playFootstep(false);
    }
  }

  const wCfg = WEAPON_CHANNELS[state.selectedWeapon];
  let effectiveMaxReach = wCfg.optimalMax + (state.masterStrikeActive ? 0.22 : 0);
  if (state.selectedWeapon === WeaponId.EPEE) {
    if (state.quadrant === Quadrant.NE) effectiveMaxReach = CONSTANTS.EPEE_WRIST_MAX_REACH + (state.masterStrikeActive ? 0.12 : 0);
    else if (state.quadrant === Quadrant.SE) effectiveMaxReach = CONSTANTS.EPEE_FOOT_MAX_REACH;
    else effectiveMaxReach = CONSTANTS.EPEE_BODY_MAX_REACH;
  }

  if (state.playerAction === Action.LUNGE || state.playerAction === Action.REMISE) {
    state.playerActionTimer -= dt;
    const extSpeed = state.playerAction === Action.REMISE ? 13.8 : 10.8;
    state.playerExtension = Math.min(1, state.playerExtension + dt * extSpeed);
    state.camFovZoom = state.playerExtension * 0.14;
    state.camPitchOffset = state.playerExtension * 22;

    if (!state.playerStrikeEvaluated && state.playerExtension > 0.68 && dist <= effectiveMaxReach) {
      evaluatePlayerLungeHit(dist);
    }
    if (state.playerActionTimer <= 0 && state.roundPhase === RoundPhase.FIGHTING) {
      state.playerAction = Action.RECOVERY;
      state.playerActionTimer = 0.26;
      state.masterStrikeActive = false;
    }
  } else if (state.playerAction === Action.RECOVERY) {
    state.playerActionTimer -= dt;
    state.playerExtension = Math.max(0, state.playerExtension - dt * 6.0);
    state.camFovZoom *= 0.82;
    state.camPitchOffset *= 0.82;
    if (state.playerActionTimer <= 0) {
      state.playerAction = Action.IDLE;
      state.playerExtension = 0;
      if (state.rightOfWay === 'player' && state.riposteBonusTimer <= 0) {
        state.rightOfWay = 'none';
        state.rowMeter = 25;
        state.rowReason = 'FIN D\'ATTAQUE · 落空收剑';
      }
    }
  } else if (state.playerAction === Action.PARRY) {
    state.playerActionTimer -= dt;
    state.camRollOffset = (state.guardX >= 0 ? 1 : -1) * 0.032;
    if (state.playerActionTimer <= 0) {
      state.playerAction = Action.IDLE;
      state.camRollOffset = 0;
    }
  } else {
    state.playerExtension = Math.max(0, state.playerExtension - dt * 6.5);
    state.camFovZoom *= 0.85;
    state.camPitchOffset *= 0.85;
    state.camRollOffset *= 0.85;
  }

  if (state.gameMode === GameMode.SPLIT_2P) updatePlayer2Human(dt);
  else if (state.gameMode === GameMode.TUTORIAL) updateTutorialCoachAI(dt);
  else updateAIOpponent(dt);

  updateContinuousPriorite(dt);

  if (state.aiZ - state.playerZ < CONSTANTS.CORPS_A_CORPS_DIST && state.roundPhase === RoundPhase.FIGHTING) {
    if (state.playerVelZ > 0.4 && state.playerVelZ >= -state.aiVelZ) {
      triggerCorpsACorpsHalt('p1');
      return;
    } else if (state.gameMode === GameMode.SPLIT_2P && state.aiVelZ < -0.4) {
      triggerCorpsACorpsHalt('p2');
      return;
    } else {
      const mid = (state.aiZ + state.playerZ) * 0.5;
      state.playerZ = mid - 0.65;
      state.aiZ = mid + 0.65;
    }
  }

  if (state.playerZ < -CONSTANTS.PISTE_HALF_LENGTH) {
    triggerPoint('ai', 'Sortie de Piste (退过底线出界)', 'sortie');
  } else if (state.aiZ > CONSTANTS.PISTE_HALF_LENGTH) {
    triggerPoint('player', 'Sortie de Piste (退过底线出界)', 'sortie');
  }

  const isMatchPtNow = (state.playerScore === state.targetScore - 1 || state.aiScore === state.targetScore - 1);
  const musicIntensity = isMatchPtNow ? 2 : ((state.hypeCombo >= 2 || state.masterGauge >= 100) ? 1 : 0);
  sound.tickDynamicArenaMusic(state.roundPhase === RoundPhase.FIGHTING && !state.paused && state.running, musicIntensity);
  updateHUDWidgets();
}
