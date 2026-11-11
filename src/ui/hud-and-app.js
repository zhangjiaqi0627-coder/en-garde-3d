// Module 8: Cached HUD Updaters, Trilingual Flashcards/Quiz, Event Wiring, Self-Tests & Time-Dilated Loop

function openFlashcardModal() {
  sound.playUIClick(1040);
  state.paused = true;
  if (DOM.flashcardModalOverlay) {
    DOM.flashcardModalOverlay.classList.remove('hidden', 'fc-modal-hidden');
  }
  renderCurrentFlashcard();
}

function closeFlashcardModal() {
  sound.playUIClick(720);
  if (DOM.flashcardModalOverlay) {
    DOM.flashcardModalOverlay.classList.add('fc-modal-hidden');
    setTimeout(() => {
      if (DOM.flashcardModalOverlay) DOM.flashcardModalOverlay.classList.add('hidden');
    }, 220);
  }
  if (state.running && DOM.modalOverlay && DOM.modalOverlay.classList.contains('hidden')) {
    state.paused = false;
  }
}

function filterFlashcardsByCategory(cat) {
  state.fcCategory = cat;
  state.fcFilteredList = cat === 'all'
    ? [...FLASHCARD_DECK]
    : FLASHCARD_DECK.filter(item => item.cat === cat);
  state.fcCurrentIndex = 0;

  document.querySelectorAll('.fc-cat-btn').forEach(btn => {
    const bCat = btn.getAttribute('data-fccat');
    btn.className = bCat === cat
      ? 'fc-cat-btn px-2.5 py-1 text-[10px] font-bold bg-amber-500/20 text-amber-300 border-l-2 border-amber-400'
      : 'fc-cat-btn px-2.5 py-1 text-[10px] font-bold bg-slate-800 text-slate-300 border-l-2 border-slate-700';
  });

  renderCurrentFlashcard();
}

function renderCurrentFlashcard() {
  if (state.fcFilteredList.length === 0) return;
  if (DOM.fcCardBox) {
    DOM.fcCardBox.classList.remove('fc-flip-anim');
    void DOM.fcCardBox.offsetWidth;
    DOM.fcCardBox.classList.add('fc-flip-anim');
  }
  const card = state.fcFilteredList[state.fcCurrentIndex];
  setDomText(DOM.fcCategoryBadge, card.catLabel);
  setDomText(DOM.fcIndexLabel, `${state.fcCurrentIndex + 1} / ${state.fcFilteredList.length}`);
  setDomText(DOM.fcTermFr, card.fr);
  setDomText(DOM.fcPhoneticFr, card.phonetic);
  setDomText(DOM.fcTermEn, card.en);
  setDomText(DOM.fcSubEn, card.enSub);
  setDomText(DOM.fcTermZh, card.zh);
  setDomText(DOM.fcSubZh, card.zhSub);
  setDomText(DOM.fcUsageDesc, card.desc);
  setDomText(DOM.fcExampleSentence, `"${card.example}"`);
  setDomText(DOM.fcControlHint, card.control);

  const isMastered = !!state.fcMasteredIds[card.id];
  setDomText(DOM.btnFcToggleMaster, isMastered ? '★ MASTERED · 已掌握' : '☆ MARK MASTERED · 标记');
  setDomClass(
    DOM.btnFcToggleMaster,
    isMastered
      ? 'px-2.5 py-0.5 bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 text-[10px] font-bold transition'
      : 'px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[10px] font-bold transition'
  );

  const totalMastered = Object.keys(state.fcMasteredIds).filter(k => state.fcMasteredIds[k]).length;
  setDomText(DOM.fcMasteredCountBadge, `MASTERED: ${totalMastered} / ${FLASHCARD_DECK.length}`);
}

function switchFlashcardViewMode(isQuiz) {
  state.fcQuizMode = isQuiz;
  if (DOM.fcStudyView) DOM.fcStudyView.classList.toggle('hidden', isQuiz);
  if (DOM.fcQuizView) DOM.fcQuizView.classList.toggle('hidden', !isQuiz);

  if (isQuiz) {
    setDomClass(DOM.btnFcModeQuiz, 'px-3 py-1 bg-amber-500/25 text-amber-300 border-l-2 border-amber-400 text-[11px] font-athletic font-bold uppercase transition');
    setDomClass(DOM.btnFcModeStudy, 'px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border-l-2 border-slate-600 text-[11px] font-athletic font-bold uppercase transition');
    generateFlashcardQuizQuestion();
  } else {
    setDomClass(DOM.btnFcModeStudy, 'px-3 py-1 bg-emerald-500/20 text-emerald-300 border-l-2 border-emerald-400 text-[11px] font-athletic font-bold uppercase transition');
    setDomClass(DOM.btnFcModeQuiz, 'px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border-l-2 border-slate-600 text-[11px] font-athletic font-bold uppercase transition');
    renderCurrentFlashcard();
  }
}

function generateFlashcardQuizQuestion() {
  state.fcQuizAnswered = false;
  const pool = state.fcFilteredList.length >= 4 ? state.fcFilteredList : FLASHCARD_DECK;
  const correctItem = pool[Math.floor(Math.random() * pool.length)];
  state.fcQuizCurrentItem = correctItem;

  const distractors = FLASHCARD_DECK.filter(x => x.id !== correctItem.id);
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
  }
  const choices = [correctItem, distractors[0], distractors[1], distractors[2]];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  state.fcQuizOptions = choices;

  setDomText(DOM.fcQuizPromptFr, correctItem.fr);
  setDomText(DOM.fcQuizPromptEn, correctItem.phonetic);
  setDomText(DOM.fcQuizFeedback, 'Select the matching English / Chinese tactical meaning · 请选择对应释义：');
  setDomClass(DOM.fcQuizFeedback, 'mt-3 text-center text-xs font-bold text-slate-300 min-h-[20px]');

  const letters = ['A', 'B', 'C', 'D'];
  document.querySelectorAll('.fc-quiz-opt').forEach((btn, idx) => {
    const item = choices[idx];
    btn.textContent = `${letters[idx]}. ${item.en} — ${item.enSub} (${item.zh})`;
    btn.className = 'fc-quiz-opt text-left p-2.5 bg-slate-800 hover:bg-slate-700 border-l-2 border-slate-600 text-xs font-bold text-slate-100 transition';
    btn.disabled = false;
  });

  refVoice.speakLangText(correctItem.fr, 'fr-FR', 1.05);
}

function answerFlashcardQuiz(optIdx) {
  if (state.fcQuizAnswered || !state.fcQuizCurrentItem || !state.fcQuizOptions[optIdx]) return;
  state.fcQuizAnswered = true;

  const picked = state.fcQuizOptions[optIdx];
  const correct = state.fcQuizCurrentItem;
  state.fcQuizTotal++;

  const isRight = picked.id === correct.id;
  if (isRight) {
    state.fcQuizCorrect++;
    state.fcQuizStreak++;
    state.fcMasteredIds[correct.id] = true;
    sound.playScoreMachine('player');
    setDomText(DOM.fcQuizFeedback, `Correct! ${correct.fr} = ${correct.en} (${correct.zh}) · 回答正确！`);
    setDomClass(DOM.fcQuizFeedback, 'mt-3 text-center text-xs font-bold text-emerald-400 min-h-[20px]');
  } else {
    state.fcQuizStreak = 0;
    sound.playScoreMachine('ai');
    setDomText(DOM.fcQuizFeedback, `Not quite! Answer: ${correct.en} · ${correct.zh}`);
    setDomClass(DOM.fcQuizFeedback, 'mt-3 text-center text-xs font-bold text-rose-400 min-h-[20px]');
  }

  setDomText(DOM.fcQuizScoreBadge, `STREAK: ${state.fcQuizStreak} | SCORE: ${state.fcQuizCorrect}/${state.fcQuizTotal}`);

  document.querySelectorAll('.fc-quiz-opt').forEach((btn, idx) => {
    btn.disabled = true;
    const item = state.fcQuizOptions[idx];
    if (item.id === correct.id) {
      btn.className = 'fc-quiz-opt text-left p-2.5 bg-emerald-500/25 border-2 border-emerald-400 text-xs font-bold text-emerald-200 transition cursor-default';
    } else if (idx === optIdx && !isRight) {
      btn.className = 'fc-quiz-opt text-left p-2.5 bg-rose-500/25 border-2 border-rose-400 text-xs font-bold text-rose-200 transition cursor-default';
    } else {
      btn.className = 'fc-quiz-opt text-left p-2.5 bg-slate-800/50 border-l-2 border-slate-700 text-xs font-bold text-slate-500 transition cursor-default';
    }
  });

  const totalMastered = Object.keys(state.fcMasteredIds).filter(k => state.fcMasteredIds[k]).length;
  setDomText(DOM.fcMasteredCountBadge, `MASTERED: ${totalMastered} / ${FLASHCARD_DECK.length}`);
}

function updateHUDWidgets() {
  const mins = Math.floor(state.boutTimeRemaining / 60);
  const secs = Math.floor(state.boutTimeRemaining % 60);
  setDomText(
    DOM.clockDisplay,
    state.gameMode === GameMode.TUTORIAL
      ? 'ACADEMY'
      : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  );

  const wCfg = WEAPON_CHANNELS[state.selectedWeapon];
  const dist = Math.max(0.8, state.aiZ - state.playerZ);
  if (state.lockoutActive) {
    setDomText(DOM.stripPosText, `LOCK ${Math.max(0, Math.round(state.lockoutTimer * 1000))}ms`);
  } else if (state.bladeBindActive) {
    setDomText(DOM.stripPosText, `FER ${state.bindLeverage.toFixed(1)}x · ${dist.toFixed(2)}m`);
  } else {
    setDomText(DOM.stripPosText, `DIST ${dist.toFixed(2)}m`);
  }

  if (DOM.priorityPlayerBadge) DOM.priorityPlayerBadge.classList.toggle('hidden', state.selectedWeapon === WeaponId.EPEE || state.rowMeter > -15);
  if (DOM.priorityAiBadge) DOM.priorityAiBadge.classList.toggle('hidden', state.selectedWeapon === WeaponId.EPEE || state.rowMeter < 15);

  const secondVal = state.gameMode === GameMode.SPLIT_2P ? Math.round(state.p2Stamina) : Math.round(state.bladePoise);
  setDomStyle(DOM.poiseBar, 'width', `${secondVal}%`);
  setDomClass(
    DOM.poiseBar,
    secondVal < CONSTANTS.POISE_LOSS_THRESHOLD
      ? 'h-full bg-rose-500 transition-all duration-75'
      : 'h-full bg-cyan-400 transition-all duration-75'
  );

  const puckPercent = Math.max(4, Math.min(96, Math.round(50 + (state.rowMeter / 100) * 46)));
  setDomStyle(DOM.rowPuck, 'left', `${puckPercent}%`);
  setDomText(DOM.rowReasonText, state.rowReason);

  if (state.rowMeter < -15) {
    const pct = Math.min(50, Math.round(Math.abs(state.rowMeter) * 0.5));
    setDomStyle(DOM.rowBarLeft, 'width', `${pct}%`);
    setDomStyle(DOM.rowBarLeft, 'left', `${50 - pct}%`);
    setDomStyle(DOM.rowBarRight, 'width', '0%');
    setDomClass(DOM.rowPuck, 'row-tug-indicator w-2 h-2 bg-emerald-400 absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10');
  } else if (state.rowMeter > 15) {
    const pct = Math.min(50, Math.round(state.rowMeter * 0.5));
    setDomStyle(DOM.rowBarRight, 'width', `${pct}%`);
    setDomStyle(DOM.rowBarRight, 'right', `${50 - pct}%`);
    setDomStyle(DOM.rowBarLeft, 'width', '0%');
    setDomClass(DOM.rowPuck, 'row-tug-indicator w-2 h-2 bg-rose-500 absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10');
  } else {
    setDomStyle(DOM.rowBarLeft, 'width', '0%');
    setDomStyle(DOM.rowBarRight, 'width', '0%');
    setDomClass(DOM.rowPuck, 'row-tug-indicator w-2 h-2 bg-amber-300 absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-10');
  }

  setDomStyle(DOM.staminaBar, 'width', `${Math.round(state.stamina)}%`);
  setDomStyle(DOM.masterGaugeFill, 'width', `${Math.round(state.masterGauge)}%`);
  if (state.masterGauge >= 100) {
    setDomClass(DOM.btnMasterStrike, 'cta-strike-btn px-3.5 py-2 flex flex-col justify-center min-w-[154px] text-left cursor-pointer');
    setDomText(DOM.masterStrikeText, '⚡ [E] UNLEASH SUPER!');
    setDomClass(DOM.masterStrikeText, 'text-[10px] font-athletic font-black italic uppercase tracking-wider text-slate-950');
  } else {
    setDomClass(DOM.btnMasterStrike, 'broadcast-tab px-3.5 py-2 flex flex-col justify-center min-w-[154px] text-left border border-slate-700 transition');
    setDomText(DOM.masterStrikeText, `[E] COUP DE MAÎTRE ${Math.round(state.masterGauge)}%`);
    setDomClass(DOM.masterStrikeText, 'text-[10px] font-athletic font-black italic uppercase tracking-wider text-slate-300');
  }

  const pPct = Math.max(4, Math.min(96, Math.round(((state.playerZ + 7) / 14) * 100)));
  const aPct = Math.max(4, Math.min(96, Math.round(((state.aiZ + 7) / 14) * 100)));
  setDomStyle(DOM.radarPlayer, 'left', `${pPct}%`);
  setDomStyle(DOM.radarAI, 'left', `${aPct}%`);

  setDomStyle(DOM.hudGuardDot, 'left', `${Math.round(50 + state.guardX * 36)}%`);
  setDomStyle(DOM.hudGuardDot, 'top', `${Math.round(50 + state.guardY * 36)}%`);
  setDomStyle(DOM.hudAiDot, 'left', `${Math.round(50 + state.aiGuardX * 36)}%`);
  setDomStyle(DOM.hudAiDot, 'top', `${Math.round(50 + state.aiGuardY * 36)}%`);

  const quadElements = {
    NW: { el: DOM.quadNW, pos: 'top-0.5 left-1.5' },
    NE: { el: DOM.quadNE, pos: 'top-0.5 right-1.5' },
    SW: { el: DOM.quadSW, pos: 'bottom-0.5 left-1.5' },
    SE: { el: DOM.quadSE, pos: 'bottom-0.5 right-1.5' }
  };
  for (const q of [Quadrant.NW, Quadrant.NE, Quadrant.SW, Quadrant.SE]) {
    const item = quadElements[q];
    setDomClass(
      item.el,
      state.quadrant === q
        ? `zone-indicator absolute text-[8px] font-mono-tech font-black text-cyan-300 scale-110 ${item.pos}`
        : `zone-indicator absolute text-[7px] font-mono-tech font-bold text-slate-500 ${item.pos}`
    );
  }

  setDomText(DOM.guardNameText, getQuadrantLabel(state.quadrant, state.selectedWeapon));

  if (state.parryWhiffLockout > 0) {
    setDomText(DOM.rightOfWayText, 'GUARD WHIFF · Press [A] Retreat! · 挥空快后撤');
    setDomClass(DOM.rightOfWayText, 'text-[10px] text-rose-400 font-bold leading-tight');
  } else if (state.bladePoise < CONSTANTS.POISE_LOSS_THRESHOLD) {
    setDomText(DOM.rightOfWayText, 'LOW POISE · Steady mouse! · 稳住鼠标恢复剑威');
    setDomClass(DOM.rightOfWayText, 'text-[10px] text-rose-400 font-bold leading-tight');
  } else if (dist < wCfg.minMeasure) {
    setDomText(DOM.rightOfWayText, 'TOO CLOSE · Press [A] Retreat! · 距离过近后撤');
    setDomClass(DOM.rightOfWayText, 'text-[10px] text-amber-400 font-bold leading-tight');
  } else if (state.riposteBonusTimer > 0) {
    setDomText(DOM.rightOfWayText, state.selectedWeapon === WeaponId.SABRE ? 'RIPOSTE! Slash now (LMB) · 立即挥砍还击!' : 'RIPOSTE! Lunge now (LMB) · 立即左键还击!');
    setDomClass(DOM.rightOfWayText, 'text-[10px] text-emerald-400 font-bold leading-tight');
  } else if (state.aiAction !== Action.IDLE && state.aiAction !== Action.RECOVERY && state.aiAction !== Action.PARRIED) {
    const isYellowFeint = (state.aiAction === Action.FEINT1 || state.aiAction === Action.FEINT2);
    setDomText(
      DOM.rightOfWayText,
      isYellowFeint
        ? 'FEINT WARNING · Hold your parry! · 黄光虚晃别抢挡!'
        : (state.selectedWeapon === WeaponId.SABRE && state.aiAttackQuad === Quadrant.NW ? 'HEAD CUT · Raise mouse for Quinte(5)! · 上抬架顶!' : 'INCOMING · Swipe into red sector! · 红光同侧弹反!')
    );
    setDomClass(DOM.rightOfWayText, isYellowFeint ? 'text-[10px] text-amber-300 font-bold leading-tight' : 'text-[10px] text-rose-400 font-bold leading-tight');
  } else if (state.selectedWeapon === WeaponId.SABRE) {
    setDomText(DOM.rightOfWayText, 'SABRE: Sweep/LMB Slash · Up = Quinte(5) · 佩剑劈砍/架顶');
    setDomClass(DOM.rightOfWayText, 'text-[10px] text-orange-300 font-semibold leading-tight');
  } else if (state.selectedWeapon === WeaponId.EPEE) {
    setDomText(
      DOM.rightOfWayText,
      dist <= CONSTANTS.EPEE_WRIST_MAX_REACH && dist > CONSTANTS.EPEE_BODY_MAX_REACH && state.quadrant === Quadrant.NE
        ? 'WRIST IN 2.74m RANGE · LMB Snipe! · 手腕入射程点刺!'
        : 'ÉPÉE: Snipe closest Wrist · 45ms Double · 远距狙腕'
    );
    setDomClass(DOM.rightOfWayText, 'text-[10px] text-amber-300 font-semibold leading-tight');
  } else {
    setDomText(
      DOM.rightOfWayText,
      dist <= wCfg.optimalMax
        ? `OPTIMAL RANGE (${dist.toFixed(2)}m) · LMB Lunge · 最佳射程突刺`
        : 'WASD Move/Dodge · LMB Lunge · RMB Parry · 步法攻防'
    );
    setDomClass(DOM.rightOfWayText, dist <= wCfg.optimalMax ? 'text-[10px] text-cyan-300 font-semibold leading-tight' : 'text-[10px] text-slate-400 font-medium leading-tight');
  }
}

function updatePointerPosition(clientX, clientY) {
  const nx = Math.max(-1, Math.min(1, ((clientX / window.innerWidth) - 0.5) * 2.2));
  const ny = Math.max(-1, Math.min(1, ((clientY / window.innerHeight) - 0.48) * 2.2));
  handleSwipeBladeMovement(nx, ny);
}

function togglePauseModal() {
  const modal = DOM.modalOverlay;
  if (!modal) return;
  sound.playStingerSwoosh();
  if (modal.classList.contains('hidden')) {
    state.paused = true;
    modal.classList.remove('hidden');
    if (DOM.titleLeftDock) {
      DOM.titleLeftDock.classList.add('dock-slide-out');
      void DOM.titleLeftDock.offsetWidth;
      DOM.titleLeftDock.classList.remove('dock-slide-out');
    }
    if (DOM.titleRightWatermark) {
      DOM.titleRightWatermark.classList.add('watermark-slide-out');
      void DOM.titleRightWatermark.offsetWidth;
      DOM.titleRightWatermark.classList.remove('watermark-slide-out');
    }
  } else if (state.running) {
    if (DOM.titleLeftDock) DOM.titleLeftDock.classList.add('dock-slide-out');
    if (DOM.titleRightWatermark) DOM.titleRightWatermark.classList.add('watermark-slide-out');
    state.camFovZoom = -0.15;
    setTimeout(() => {
      state.paused = false;
      modal.classList.add('hidden');
      if (DOM.titleLeftDock) DOM.titleLeftDock.classList.remove('dock-slide-out');
      if (DOM.titleRightWatermark) DOM.titleRightWatermark.classList.remove('watermark-slide-out');
    }, 280);
  }
}

function wireDOMEvents() {
  window.addEventListener('pointerdown', () => sound.init(), { once: true });
  window.addEventListener('keydown', () => sound.init(), { once: true });
  window.addEventListener('mousemove', (e) => updatePointerPosition(e.clientX, e.clientY));
  canvas.addEventListener('mousedown', (e) => {
    if (state.paused) return;
    if (e.button === 0) performPlayerLunge();
    else if (e.button === 2) performPlayerParry();
  });
  window.addEventListener('contextmenu', (e) => e.preventDefault());

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) updatePointerPosition(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  window.addEventListener('keydown', (e) => {
    const fcModal = DOM.flashcardModalOverlay;
    if (fcModal && !fcModal.classList.contains('hidden')) {
      if (e.code === 'Space') {
        e.preventDefault();
        if (state.fcQuizMode && state.fcQuizCurrentItem) {
          refVoice.speakLangText(state.fcQuizCurrentItem.fr, 'fr-FR', 1.05);
        } else {
          const card = state.fcFilteredList[state.fcCurrentIndex];
          if (card) refVoice.speakLangText(card.fr, 'fr-FR', 1.05);
        }
        return;
      }
      if (!state.fcQuizMode) {
        if (e.code === 'ArrowLeft') {
          state.fcCurrentIndex = (state.fcCurrentIndex - 1 + state.fcFilteredList.length) % state.fcFilteredList.length;
          renderCurrentFlashcard();
        } else if (e.code === 'ArrowRight') {
          state.fcCurrentIndex = (state.fcCurrentIndex + 1) % state.fcFilteredList.length;
          renderCurrentFlashcard();
        }
      }
      if (e.code === 'Escape') closeFlashcardModal();
      return;
    }

    if (e.code === 'KeyA' || (state.gameMode !== GameMode.SPLIT_2P && e.code === 'ArrowLeft')) {
      if (!state.keys.left) triggerFootworkBurst(-1);
      state.keys.left = true;
    }
    if (e.code === 'KeyD' || (state.gameMode !== GameMode.SPLIT_2P && e.code === 'ArrowRight')) {
      if (!state.keys.right) triggerFootworkBurst(1);
      state.keys.right = true;
    }
    if (e.code === 'KeyW' || (state.gameMode !== GameMode.SPLIT_2P && e.code === 'ArrowUp')) {
      e.preventDefault();
      triggerPlayerJump();
    }
    if (e.code === 'KeyS' || (state.gameMode !== GameMode.SPLIT_2P && e.code === 'ArrowDown')) {
      e.preventDefault();
      setPlayerDuck(true);
    }
    if (e.code === 'Space') {
      e.preventDefault();
      performPlayerLunge();
    }
    if (e.code === 'KeyE') {
      e.preventDefault();
      performPlayerMasterStrike();
    }
    if (e.code === 'KeyF' || e.code === 'ShiftLeft') {
      e.preventDefault();
      performPlayerParry();
    }
    if (e.code === 'Digit1') { const c = getQuadCoords(Quadrant.NW, state.selectedWeapon); handleSwipeBladeMovement(c.x, c.y); }
    if (e.code === 'Digit2') { const c = getQuadCoords(Quadrant.NE, state.selectedWeapon); handleSwipeBladeMovement(c.x, c.y); }
    if (e.code === 'Digit3') { const c = getQuadCoords(Quadrant.SW, state.selectedWeapon); handleSwipeBladeMovement(c.x, c.y); }
    if (e.code === 'Digit4') { const c = getQuadCoords(Quadrant.SE, state.selectedWeapon); handleSwipeBladeMovement(c.x, c.y); }

    if (state.gameMode === GameMode.SPLIT_2P) {
      if (e.code === 'ArrowLeft') { e.preventDefault(); if (!state.keys.p2Advance) triggerPlayer2FootworkBurst(-1); state.keys.p2Advance = true; }
      if (e.code === 'ArrowRight') { e.preventDefault(); if (!state.keys.p2Retreat) triggerPlayer2FootworkBurst(1); state.keys.p2Retreat = true; }
      if (e.code === 'ArrowUp') { e.preventDefault(); triggerPlayer2Jump(); }
      if (e.code === 'ArrowDown') { e.preventDefault(); setPlayer2Duck(true); }
      if (e.code === 'KeyI' || e.code === 'Numpad7') setPlayer2Quad(Quadrant.NW);
      if (e.code === 'KeyO' || e.code === 'Numpad9') setPlayer2Quad(Quadrant.NE);
      if (e.code === 'KeyK' || e.code === 'Numpad4') setPlayer2Quad(Quadrant.SW);
      if (e.code === 'KeyL' || e.code === 'Numpad6') setPlayer2Quad(Quadrant.SE);
      if (e.code === 'Enter' || e.code === 'KeyJ' || e.code === 'Numpad0') { e.preventDefault(); performPlayer2Lunge(); }
      if (e.code === 'KeyP' || e.code === 'Semicolon' || e.code === 'NumpadDecimal') { e.preventDefault(); performPlayer2Parry(); }
    }

    if (e.code === 'Escape') togglePauseModal();
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'KeyA' || (state.gameMode !== GameMode.SPLIT_2P && e.code === 'ArrowLeft')) state.keys.left = false;
    if (e.code === 'KeyD' || (state.gameMode !== GameMode.SPLIT_2P && e.code === 'ArrowRight')) state.keys.right = false;
    if (e.code === 'KeyS' || (state.gameMode !== GameMode.SPLIT_2P && e.code === 'ArrowDown')) setPlayerDuck(false);
    if (state.gameMode === GameMode.SPLIT_2P) {
      if (e.code === 'ArrowLeft') state.keys.p2Advance = false;
      if (e.code === 'ArrowRight') state.keys.p2Retreat = false;
      if (e.code === 'ArrowDown') setPlayer2Duck(false);
    }
  });

  const holdBtn = (el, onDown, onUp) => {
    if (!el) return;
    el.addEventListener('mousedown', onDown);
    el.addEventListener('mouseup', onUp);
    el.addEventListener('mouseleave', onUp);
    el.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(); });
    el.addEventListener('touchend', (e) => { e.preventDefault(); onUp(); });
  };

  holdBtn(DOM.btnRetreat, () => { triggerFootworkBurst(-1); state.keys.left = true; }, () => { state.keys.left = false; });
  holdBtn(DOM.btnAdvance, () => { triggerFootworkBurst(1); state.keys.right = true; }, () => { state.keys.right = false; });
  holdBtn(DOM.btnDuck, () => setPlayerDuck(true), () => setPlayerDuck(false));
  if (DOM.btnJump) DOM.btnJump.addEventListener('click', () => triggerPlayerJump());
  if (DOM.btnParry) DOM.btnParry.addEventListener('click', () => performPlayerParry());
  if (DOM.btnLunge) DOM.btnLunge.addEventListener('click', () => performPlayerLunge());
  if (DOM.btnMasterStrike) DOM.btnMasterStrike.addEventListener('click', () => performPlayerMasterStrike());

  DOM.btnToggleTouchHud.addEventListener('click', () => DOM.touchControlsDrawer.classList.toggle('hidden'));
  DOM.btnOpenFlashcards.addEventListener('click', () => openFlashcardModal());
  DOM.btnModalOpenFlashcards.addEventListener('click', () => openFlashcardModal());
  DOM.btnCloseFlashcards.addEventListener('click', () => closeFlashcardModal());
  DOM.btnFcModeStudy.addEventListener('click', () => switchFlashcardViewMode(false));
  DOM.btnFcModeQuiz.addEventListener('click', () => switchFlashcardViewMode(true));

  document.querySelectorAll('.fc-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => filterFlashcardsByCategory(btn.getAttribute('data-fccat')));
  });

  DOM.btnFcPrev.addEventListener('click', () => {
    state.fcCurrentIndex = (state.fcCurrentIndex - 1 + state.fcFilteredList.length) % state.fcFilteredList.length;
    renderCurrentFlashcard();
  });
  DOM.btnFcNext.addEventListener('click', () => {
    state.fcCurrentIndex = (state.fcCurrentIndex + 1) % state.fcFilteredList.length;
    renderCurrentFlashcard();
  });
  DOM.btnFcShuffle.addEventListener('click', () => {
    if (state.fcFilteredList.length > 1) {
      state.fcCurrentIndex = Math.floor(Math.random() * state.fcFilteredList.length);
      renderCurrentFlashcard();
    }
  });
  DOM.btnFcToggleMaster.addEventListener('click', () => {
    const card = state.fcFilteredList[state.fcCurrentIndex];
    if (card) {
      state.fcMasteredIds[card.id] = !state.fcMasteredIds[card.id];
      renderCurrentFlashcard();
    }
  });
  DOM.btnSpeakFr.addEventListener('click', () => {
    const card = state.fcFilteredList[state.fcCurrentIndex];
    if (card) refVoice.speakLangText(card.fr, 'fr-FR', 1.02);
  });
  DOM.btnSpeakEn.addEventListener('click', () => {
    const card = state.fcFilteredList[state.fcCurrentIndex];
    if (card) refVoice.speakLangText(card.en, 'en-US', 1.02);
  });
  DOM.btnSpeakExample.addEventListener('click', () => {
    const card = state.fcFilteredList[state.fcCurrentIndex];
    if (card) refVoice.speakLangText(card.example, 'fr-FR', 1.08);
  });
  DOM.btnTryInArena.addEventListener('click', () => {
    const card = state.fcFilteredList[state.fcCurrentIndex];
    if (card && card.tryWeapon) selectWeaponDiscipline(card.tryWeapon, true);
    closeFlashcardModal();
    if (!state.running) startNewBout();
  });
  DOM.btnQuizReplayAudio.addEventListener('click', () => {
    if (state.fcQuizCurrentItem) refVoice.speakLangText(state.fcQuizCurrentItem.fr, 'fr-FR', 1.02);
  });
  document.querySelectorAll('.fc-quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => answerFlashcardQuiz(parseInt(btn.getAttribute('data-qopt'), 10)));
  });
  DOM.btnQuizNextQuestion.addEventListener('click', () => generateFlashcardQuizQuestion());

  DOM.modeBtn1P.addEventListener('click', () => setGameMode(GameMode.SINGLE));
  DOM.modeBtn2P.addEventListener('click', () => setGameMode(GameMode.SPLIT_2P));
  DOM.modeBtnTutorial.addEventListener('click', () => setGameMode(GameMode.TUTORIAL));

  DOM.btnStartTutorial.addEventListener('click', () => startInteractiveTutorial(0));
  DOM.btnModalEnterTutorial.addEventListener('click', () => startInteractiveTutorial(0));
  DOM.btnTutPrev.addEventListener('click', () => loadTutorialLesson(state.tutorialStep - 1));
  DOM.btnTutResetStep.addEventListener('click', () => loadTutorialLesson(state.tutorialStep));
  DOM.btnTutNext.addEventListener('click', () => loadTutorialLesson((state.tutorialStep + 1) % TUTORIAL_LESSONS.length));
  DOM.btnTutExit.addEventListener('click', () => {
    setGameMode(GameMode.SINGLE);
    startNewBout();
  });
  DOM.btnToggleEncyclopedia.addEventListener('click', () => DOM.fencingEncyclopediaBox.classList.toggle('hidden'));

  DOM.weaponModeBadge.addEventListener('click', () => {
    const order = [WeaponId.FOIL, WeaponId.EPEE, WeaponId.SABRE];
    const nextW = order[(order.indexOf(state.selectedWeapon) + 1) % order.length];
    selectWeaponDiscipline(nextW, false);
    if (state.running && !state.paused && state.gameMode !== GameMode.TUTORIAL) {
      resetPositionsForNextPoint(true);
    }
  });

  DOM.btnToggleBgm.addEventListener('click', (e) => {
    sound.bgmEnabled = !sound.bgmEnabled;
    e.currentTarget.textContent = sound.bgmEnabled ? 'BGM: ON' : 'BGM: OFF';
    sound.playUIClick(sound.bgmEnabled ? 1040 : 680);
  });
  DOM.btnToggleVoice.addEventListener('click', (e) => {
    refVoice.enabled = !refVoice.enabled;
    e.currentTarget.textContent = refVoice.enabled ? 'REF VOICE: ON' : 'REF VOICE: OFF';
    if (refVoice.enabled) refVoice.speakCue('allez');
  });
  DOM.btnToggleSound.addEventListener('click', (e) => {
    sound.enabled = !sound.enabled;
    e.currentTarget.textContent = sound.enabled ? 'SFX: ON' : 'SFX: MUTE';
  });

  DOM.btnPodiumRematch.addEventListener('click', () => {
    DOM.victoryPodiumOverlay.classList.add('hidden');
    startNewBout();
  });
  DOM.btnPodiumNextRival.addEventListener('click', () => {
    DOM.victoryPodiumOverlay.classList.add('hidden');
    const order = ['easy', 'normal', 'master'];
    const nextDiff = order[(order.indexOf(state.difficulty) + 1) % order.length];
    state.difficulty = nextDiff;
    document.querySelectorAll('.diff-btn').forEach(b => {
      b.className = b.getAttribute('data-diff') === nextDiff
        ? 'diff-btn flex-1 py-1 text-[10px] font-athletic font-bold uppercase bg-amber-500/20 text-amber-300 border-b-2 border-amber-400'
        : 'diff-btn flex-1 py-1 text-[10px] font-athletic font-bold uppercase bg-slate-800 text-slate-400';
    });
    updateRivalPersonaUI();
    updateScoreHUD();
    startNewBout();
  });
  DOM.btnPodiumMenu.addEventListener('click', () => {
    DOM.victoryPodiumOverlay.classList.add('hidden');
    DOM.modalOverlay.classList.remove('hidden');
    sound.playStingerSwoosh();
  });

  const setShowcaseCam = (mode) => {
    state.showcaseCamMode = mode;
    state.showcaseWeaponPulse = 0.55;
    sound.playUIClick(mode === 'closeup' ? 1080 : (mode === 'duel' ? 960 : 880));
    const camBtns = [
      { el: DOM.btnCamCloseup, m: 'closeup' },
      { el: DOM.btnCamDuel, m: 'duel' },
      { el: DOM.btnCamPov, m: 'pov' }
    ];
    for (const item of camBtns) {
      if (!item.el) continue;
      item.el.className = item.m === mode
        ? 'px-2.5 py-1 text-[10px] font-mono-tech font-black uppercase bg-amber-400 text-slate-950 transition'
        : 'px-2.5 py-1 text-[10px] font-mono-tech font-bold uppercase bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 transition';
    }
  };
  if (DOM.btnCamCloseup) DOM.btnCamCloseup.addEventListener('click', () => setShowcaseCam('closeup'));
  if (DOM.btnCamDuel) DOM.btnCamDuel.addEventListener('click', () => setShowcaseCam('duel'));
  if (DOM.btnCamPov) DOM.btnCamPov.addEventListener('click', () => setShowcaseCam('pov'));

  DOM.btnOpenSettings.addEventListener('click', () => togglePauseModal());
  DOM.btnStartBout.addEventListener('click', () => startNewBout());
  DOM.btnResumeBout.addEventListener('click', () => togglePauseModal());

  document.querySelectorAll('.weapon-card').forEach(card => {
    card.addEventListener('click', () => selectWeaponDiscipline(card.getAttribute('data-weapon'), false));
  });

  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.difficulty = btn.getAttribute('data-diff');
      triggerPlateClickEffect(btn);
      sound.playUIClick(940);
      state.showcaseWeaponPulse = 0.55;
      document.querySelectorAll('.diff-btn').forEach(b => {
        b.className = 'diff-btn flex-1 py-1 text-[10px] font-athletic font-bold uppercase bg-slate-800 text-slate-400';
      });
      btn.className = 'diff-btn flex-1 py-1 text-[10px] font-athletic font-bold uppercase bg-amber-500/20 text-amber-300 border-b-2 border-amber-400';
      updateRivalPersonaUI();
      updateScoreHUD();
    });
  });

  document.querySelectorAll('.target-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.targetScore = parseInt(btn.getAttribute('data-target'), 10);
      triggerPlateClickEffect(btn);
      sound.playUIClick(1020);
      state.showcaseWeaponPulse = 0.55;
      document.querySelectorAll('.target-btn').forEach(b => {
        b.className = 'target-btn flex-1 py-1 text-[10px] font-athletic font-bold uppercase bg-slate-800 text-slate-400';
      });
      btn.className = 'target-btn flex-1 py-1 text-[10px] font-athletic font-bold uppercase bg-emerald-500/20 text-emerald-300 border-b-2 border-emerald-400';
      updateScoreHUD();
    });
  });

  DOM.btnToggleMask.addEventListener('click', (e) => {
    state.maskEnabled = !state.maskEnabled;
    triggerPlateClickEffect(e.currentTarget);
    sound.playUIClick(860);
    if (state.maskEnabled) {
      DOM.maskOverlay.classList.remove('hidden');
      e.currentTarget.textContent = 'VISOR MESH: ON';
      e.currentTarget.className = 'w-full py-1 text-[10px] font-athletic font-bold uppercase bg-cyan-500/20 text-cyan-300 border-b-2 border-cyan-400';
    } else {
      DOM.maskOverlay.classList.add('hidden');
      e.currentTarget.textContent = 'VISOR MESH: OFF';
      e.currentTarget.className = 'w-full py-1 text-[10px] font-athletic font-bold uppercase bg-slate-800 text-slate-400';
    }
  });
}

function runFencingUnitTests() {
  const assert = (cond, msg) => {
    if (!cond) console.error('[FencingUnitTest FAILED]:', msg);
  };
  assert(getQuadrant(-0.4, -0.3, WeaponId.FOIL) === Quadrant.NW, 'Foil NW');
  assert(getQuadrant(0.4, -0.3, WeaponId.FOIL) === Quadrant.NE, 'Foil NE');
  assert(getQuadrant(-0.4, 0.3, WeaponId.FOIL) === Quadrant.SW, 'Foil SW');
  assert(getQuadrant(0.4, 0.3, WeaponId.FOIL) === Quadrant.SE, 'Foil SE');
  assert(getQuadrant(0.0, -0.5, WeaponId.SABRE) === Quadrant.NW, 'Sabre Quinte overhead');
  assert(getQuadrant(0.48, -0.05, WeaponId.SABRE) === Quadrant.NE, 'Sabre Tierce right');
  assert(getQuadrant(-0.48, -0.05, WeaponId.SABRE) === Quadrant.SW, 'Sabre Quarte left');
  assert(getQuadrant(0.28, 0.35, WeaponId.SABRE) === Quadrant.SE, 'Sabre Seconde low');

  for (const w of [WeaponId.FOIL, WeaponId.EPEE, WeaponId.SABRE]) {
    for (const q of [Quadrant.NW, Quadrant.NE, Quadrant.SW, Quadrant.SE]) {
      const c = getQuadCoords(q, w);
      assert(getQuadrant(c.x, c.y, w) === q, `Roundtrip ${w} ${q}`);
    }
  }

  let caughtTypo = false;
  try { state.undeclared_typo_field = 1; } catch (_) { caughtTypo = true; }
  assert(caughtTypo, 'Strict Proxy catches undeclared state writes');
  assert(computeOffTargetStatus(WeaponId.FOIL, 0.1, 0.1, 0, 0, 90) === false, 'Foil center valid');
  assert(computeOffTargetStatus(WeaponId.SABRE, 0.1, 0.75, 0, 0, 90) === true, 'Sabre Coup Bas');

  // Verify 3D Segment-Segment Blade Collision & Forte/Foible Mechanical Leverage
  const segForte = { hx: -0.10, hy: 1.15, hz: -0.60, tx: -0.10, ty: 1.15, tz: 0.29 };
  const segFoible = { hx: 0.18, hy: 1.15, hz: 0.62, tx: -0.12, ty: 1.15, tz: -0.27 };
  const colRes = solve3DBladeSegmentCollision(segForte, segFoible);
  assert(colRes.dist3D < 0.05, '3D crossed blades detect close contact');
  assert(colRes.leverageP1 > 1.35, 'Forte vs Foible grants >1.35x mechanical leverage');

  // Verify Coquille bell guard intercept & FIE spring axial force physics
  const coqHit = checkCoquilleGuardIntercept(0.18, -0.10, 0.20, -0.12, WeaponId.EPEE, 1.0);
  assert(coqHit.intercepted === true, 'Epee 13.5cm Coquille intercepts aligned tip');
  const strongForce = computeAxialImpactForceN(WeaponId.EPEE, 3.2, 95, 0.1, false);
  const retreatingGraze = computeAxialImpactForceN(WeaponId.EPEE, -2.5, 52, 2.2, true);
  assert(strongForce > CONSTANTS.EPEE_TRIGGER_FORCE_N, 'Committed lunge exceeds 7.35N Epee threshold');
  assert(retreatingGraze < CONSTANTS.EPEE_TRIGGER_FORCE_N, 'Retreating oblique graze falls under 7.35N threshold');
  return true;
}
window.runFencingUnitTests = runFencingUnitTests;

let lastTime = performance.now();
function loop(now) {
  const rawDt = Math.min(CONSTANTS.MAX_FRAME_DT, (now - lastTime) / 1000);
  lastTime = now;
  if (state.slowMoTimer > 0) {
    state.slowMoTimer = Math.max(0, state.slowMoTimer - rawDt);
    if (state.slowMoTimer <= 0) state.timeScale = 1.0;
  } else if (state.timeScale < 1.0) {
    state.timeScale = Math.min(1.0, state.timeScale + rawDt * 4.0);
  }
  updateGame(rawDt * state.timeScale);
  renderScene();
  requestAnimationFrame(loop);
}

window.onload = () => {
  initDOMCache();
  wireDOMEvents();
  resizeCanvas();
  runFencingUnitTests();
  loadSavedMedals();
  updateRivalPersonaUI();
  selectWeaponDiscipline(WeaponId.FOIL, true);
  updateScoreHUD();
  updateHUDWidgets();
  renderCurrentFlashcard();
  requestAnimationFrame(loop);
};
