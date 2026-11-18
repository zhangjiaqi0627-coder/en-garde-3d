// Module 7B: Hardware-Accelerated Three.js r128 PBR 3D Renderer, Analytical 2-Bone IK Pose Solver, Deformable 3D Blades & Tactical 2D HUD Overlay

const ThreeArenaEngine = (() => {
  let initialized = false;
  let failed = false;
  let renderer = null;
  let scene = null;
  let camP1 = null;
  let camP2 = null;
  let arena = null;
  let fencerP1 = null;
  let fencerP2 = null;
  let fpRigP1 = null;
  let fpRigP2 = null;
  let scoreBounceLight = null;
  let clashPointLight = null;
  let clashContactOrb = null;
  let slashWakePool = [];

  // Reusable scratch math objects (zero GC churn per frame)
  const _vStart = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _vEnd = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _vDiff = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _vDir = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _vPole = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _vX = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _vY = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _vZ = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _mBasis = (typeof THREE !== 'undefined' ? new THREE.Matrix4() : null);
  const _projVec = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);

  function init() {
    if (initialized) return true;
    if (failed || typeof THREE === 'undefined' || typeof Fencing3DAssets === 'undefined') {
      return false;
    }
    const webglCanvas = DOM.webglCanvas || document.getElementById('webglCanvas');
    if (!webglCanvas) return false;

    try {
      renderer = new THREE.WebGLRenderer({
        canvas: webglCanvas,
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (THREE.ACESFilmicToneMapping !== undefined) {
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.18;
      }
      if (THREE.sRGBEncoding !== undefined) {
        renderer.outputEncoding = THREE.sRGBEncoding;
      }

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x040915);
      scene.fog = new THREE.FogExp2(0x040915, 0.036);

      camP1 = new THREE.PerspectiveCamera(52, window.innerWidth / Math.max(1, window.innerHeight), 0.08, 60);
      camP2 = new THREE.PerspectiveCamera(52, (window.innerWidth * 0.5) / Math.max(1, window.innerHeight), 0.08, 60);

      // 5-Point Grand Palais Championship Lighting Rig
      const hemi = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.66);
      scene.add(hemi);

      const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.42);
      keyLight.position.set(-3.2, 7.2, -1.6);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 1.0;
      keyLight.shadow.camera.far = 20.0;
      keyLight.shadow.camera.left = -5.5;
      keyLight.shadow.camera.right = 5.5;
      keyLight.shadow.camera.top = 5.5;
      keyLight.shadow.camera.bottom = -5.5;
      keyLight.shadow.bias = -0.0008;
      scene.add(keyLight);

      const coolRim = new THREE.DirectionalLight(0x38bdf8, 0.88);
      coolRim.position.set(3.8, 3.4, 4.8);
      scene.add(coolRim);

      const warmKicker = new THREE.DirectionalLight(0xfbbf24, 0.56);
      warmKicker.position.set(-4.5, 2.4, 3.2);
      scene.add(warmKicker);

      scoreBounceLight = new THREE.PointLight(0x10b981, 0.0, 9.0);
      scoreBounceLight.position.set(0, 1.8, 0);
      scene.add(scoreBounceLight);

      clashPointLight = new THREE.PointLight(0xfde047, 0.0, 3.6);
      clashPointLight.position.set(0, 1.2, 0);
      scene.add(clashPointLight);

      clashContactOrb = new THREE.Group();
      const coreSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.024, 14, 12),
        new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.9 })
      );
      const flareRing = new THREE.Mesh(
        new THREE.SphereGeometry(0.036, 12, 10),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.45 })
      );
      clashContactOrb.add(coreSphere, flareRing);
      clashContactOrb.userData = { coreSphere, flareRing };
      clashContactOrb.frustumCulled = false;
      clashContactOrb.visible = false;
      scene.add(clashContactOrb);

      arena = Fencing3DAssets.buildGrandPalaisArena3D(scene);

      fencerP1 = Fencing3DAssets.createSculptedFencerRig(true);
      fencerP2 = Fencing3DAssets.createSculptedFencerRig(false);
      scene.add(fencerP1.root);
      scene.add(fencerP2.root);

      // Attach deformable 3D blades & threat glows directly to scene (world space)
      for (const f of [fencerP1, fencerP2]) {
        for (const wKey of ['foil', 'epee', 'sabre']) {
          scene.add(f.blades[wKey].mesh);
          scene.add(f.blades[wKey].tipCap);
        }
        scene.add(f.tipThreatGlow);
      }

      fpRigP1 = Fencing3DAssets.createFirstPersonWeaponRig(false);
      fpRigP2 = Fencing3DAssets.createFirstPersonWeaponRig(true);
      scene.add(fpRigP1.rig);
      scene.add(fpRigP2.rig);
      for (const fp of [fpRigP1, fpRigP2]) {
        for (const wKey of ['foil', 'epee', 'sabre']) {
          scene.add(fp.blades[wKey].mesh);
          scene.add(fp.blades[wKey].tipCap);
        }
      }

      // 3D Volumetric Sabre Slash Wake Ribbon Pool
      for (let i = 0; i < 6; i++) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18 * 2 * 3), 3));
        const idx = [];
        for (let s = 0; s < 17; s++) {
          const a = s * 2, b = s * 2 + 1, c = (s + 1) * 2 + 1, d = (s + 1) * 2;
          idx.push(a, b, c, a, c, d);
        }
        geo.setIndex(idx);
        const m = new THREE.Mesh(
          geo,
          new THREE.MeshBasicMaterial({
            color: 0xfb923c,
            transparent: true,
            opacity: 0,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          })
        );
        m.frustumCulled = false;
        m.visible = false;
        scene.add(m);
        slashWakePool.push(m);
      }

      initialized = true;
      return true;
    } catch (err) {
      failed = true;
      return false;
    }
  }

  function resize(w, h) {
    if (!initialized || !renderer) return;
    renderer.setSize(w, h);
    if (camP1) {
      camP1.aspect = w / Math.max(1, h);
      camP1.updateProjectionMatrix();
    }
    if (camP2) {
      camP2.aspect = (w * 0.5) / Math.max(1, h);
      camP2.updateProjectionMatrix();
    }
  }

  // Right-handed det=+1 basis orientation from pStart -> pEnd along bone +Y, facing frontHint (+Z)
  function orientBoneSegment(grp, pStart, pEnd, frontHint) {
    _vY.subVectors(pEnd, pStart);
    const len = _vY.length();
    if (len < 0.0001) return;
    _vY.multiplyScalar(1 / len);

    _vX.crossVectors(_vY, frontHint);
    if (_vX.lengthSq() < 0.0001) {
      _vX.set(1, 0, 0);
      if (Math.abs(_vY.x) > 0.9) _vX.set(0, 0, 1);
      _vX.crossVectors(_vY, _vX);
    }
    _vX.normalize();
    _vZ.crossVectors(_vX, _vY).normalize();

    _mBasis.makeBasis(_vX, _vY, _vZ);
    grp.position.copy(pStart);
    grp.quaternion.setFromRotationMatrix(_mBasis);
  }

  // Exact Analytical 2-Bone 3D Inverse Kinematics Solver
  function solveTwoBoneIK3D(rootPos, targetPos, len1, len2, poleDir, outMid) {
    _vDiff.subVectors(targetPos, rootPos);
    const rawDist = _vDiff.length();
    const maxReach = (len1 + len2) * 0.996;
    const d = Math.max(0.06, Math.min(maxReach, rawDist));

    if (rawDist < 0.0001) _vDir.set(0, -1, 0);
    else _vDir.copy(_vDiff).multiplyScalar(1 / rawDist);

    const cosA = Math.max(-1, Math.min(1, (len1 * len1 + d * d - len2 * len2) / (2 * len1 * d)));
    const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));

    // Project poleDir perpendicular to _vDir
    const dot = poleDir.dot(_vDir);
    _vPole.copy(poleDir).addScaledVector(_vDir, -dot);
    if (_vPole.lengthSq() < 0.0001) {
      _vPole.set(0, 0, 1);
      if (Math.abs(_vDir.z) > 0.9) _vPole.set(1, 0, 0);
      _vPole.addScaledVector(_vDir, -_vPole.dot(_vDir));
    }
    _vPole.normalize();

    outMid.copy(rootPos)
      .addScaledVector(_vDir, len1 * cosA)
      .addScaledVector(_vPole, len1 * sinA);
    return outMid;
  }

  function updateCatenaryCord(lineObj, hipX, hipY, hipZ, reelZ) {
    const pos = lineObj.geometry.attributes.position.array;
    const reelX = 0.62;
    const reelY = 0.06;
    for (let i = 0; i < 16; i++) {
      const t = i / 15;
      const sag = Math.sin(t * Math.PI) * 0.24;
      pos[i * 3]     = hipX + (reelX - hipX) * t;
      pos[i * 3 + 1] = Math.max(0.02, hipY + (reelY - hipY) * t - sag);
      pos[i * 3 + 2] = hipZ + (reelZ - hipZ) * t;
    }
    lineObj.geometry.attributes.position.needsUpdate = true;
  }

  // Updates weapon visibility, conductive lamé shells & team accent colors on a 3D Fencer Rig
  function syncFencerEquipment(fencer, wType, inStrikeRange, rivalProfile) {
    // Single-surface material assignment: ZERO overlapping torso shells = ZERO Z-fighting or garment clipping!
    if (fencer.lowerTorsoMesh && fencer.upperTorsoMesh) {
      fencer.lowerTorsoMesh.visible = true;
      fencer.upperTorsoMesh.visible = true;
      if (wType === WeaponId.FOIL) {
        fencer.lowerTorsoMesh.material = fencer.foilLameMat;
        fencer.upperTorsoMesh.material = fencer.foilLameMat;
      } else if (wType === WeaponId.SABRE) {
        fencer.lowerTorsoMesh.material = fencer.kevlarMat;
        fencer.upperTorsoMesh.material = fencer.sabreLameMat;
      } else {
        fencer.lowerTorsoMesh.material = fencer.kevlarMat;
        fencer.upperTorsoMesh.material = fencer.kevlarMat;
      }
    }
    fencer.bibMesh.material = (
      wType === WeaponId.EPEE ? fencer.kevlarMat : (wType === WeaponId.SABRE ? fencer.sabreLameMat : fencer.foilLameMat)
    );
    if (fencer.maskCordMesh) {
      fencer.maskCordMesh.visible = (wType !== WeaponId.EPEE);
    }
    fencer.hilts.foilHilt.visible = (wType === WeaponId.FOIL);
    fencer.hilts.epeeHilt.visible = (wType === WeaponId.EPEE);
    fencer.hilts.sabreHilt.visible = (wType === WeaponId.SABRE);

    // Sabre conductive sleeves vs white Kevlar sleeves (including both shoulder/elbow bottomBall AND elbow/wrist topBall!)
    const armMat = wType === WeaponId.SABRE ? fencer.sabreLameMat : fencer.kevlarMat;
    for (const seg of [fencer.leadUpperArm, fencer.leadForearm, fencer.rearUpperArm, fencer.rearForearm]) {
      seg.mesh.material = armMat;
      if (seg.bottomBall) seg.bottomBall.material = armMat;
      if (seg.topBall) seg.topBall.material = armMat;
    }

    if (!fencer.isP1 && rivalProfile) {
      fencer.stripeAccentMat.color.set(rivalProfile.accentColor);
      fencer.stripeAccentMat.emissive.set(rivalProfile.visorColor);
    }

    // Subtle target readiness sheen when in valid measure
    fencer.foilLameMat.emissiveIntensity = inStrikeRange ? 0.28 : 0.08;
    fencer.sabreLameMat.emissiveIntensity = inStrikeRange ? 0.30 : 0.08;

    for (const k of ['foil', 'epee', 'sabre']) {
      const active = (k === wType) && fencer.root.visible;
      fencer.blades[k].mesh.visible = active;
      fencer.blades[k].tipCap.visible = active;
    }
  }

  const _pHipL = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pHipR = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pFootLead = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pFootRear = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pKnee = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pShLead = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pShRear = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pElbow = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pHandLead = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pHandRear = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pBladeStart = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pBladeMid = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _pBladeTip = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _frontRef = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _poleVec = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);

  // Full 60° En-Garde Biomechanical 3D Character Pose & Blade Solver
  function poseFencer3D(fencer, cfg, nowSec) {
    if (!fencer.root.visible) {
      for (const k of ['foil', 'epee', 'sabre']) {
        fencer.blades[k].mesh.visible = false;
        fencer.blades[k].tipCap.visible = false;
      }
      fencer.tipThreatGlow.visible = false;
      return;
    }

    const {
      baseZ, jumpY, posture, ext, guardX, guardY,
      action, attackQuad, coupeLift, slashPhase, wType, inRange, rivalProfile,
      oppPelvisZ = (fencer.isP1 ? 99 : -99),
      velZOverride = null
    } = cfg;

    syncFencerEquipment(fencer, wType, inRange, rivalProfile);

    // dirZ: +1 for P1 (advancing toward +Z), -1 for P2/Rival (advancing toward -Z)
    const dirZ = fencer.isP1 ? 1 : -1;
    const swordXSign = -1;

    // Olympic Arm-First Whip Extension (Allongement leads La Fente):
    // Sword arm extends faster than body drive so the tip threatens first, while legs explode behind!
    const armExt = ext < 0.06 ? ext : Math.min(1.0, Math.pow(ext, 0.62));
    const bodyExt = ext < 0.06 ? ext : Math.min(1.0, Math.pow(ext, 1.15));

    const liveVel = velZOverride !== null ? velZOverride : (fencer.isP1 ? (state.playerVelZ || 0) : (state.aiVelZ || 0));
    const speedNorm = Math.min(1.0, Math.abs(liveVel) / 2.2);
    const gaitPhase = nowSec * (6.2 + speedNorm * 6.5) + (fencer.isP1 ? 0 : 1.7);
    const stepBounce = (ext < 0.10 && speedNorm > 0.08 && posture === Posture.STAND)
      ? Math.abs(Math.sin(gaitPhase)) * 0.018 * speedNorm
      : 0;

    const epeeBounce = (wType === WeaponId.EPEE && posture === Posture.STAND && ext < 0.05)
      ? Math.abs(Math.sin(nowSec * 6.8 + (fencer.isP1 ? 0 : 1.4))) * 0.042
      : 0;
    const breath = Math.sin(nowSec * 2.8 + (fencer.isP1 ? 0 : 1.1)) * 0.012;
    const crouchDrop = posture === Posture.DUCK ? -0.22 : 0;
    const airLift = posture === Posture.JUMP ? Math.max(0.14, jumpY * 0.55) : Math.max(0, jumpY * 0.55);

    // Olympic La Fente Split: deep pelvic drop + explosive forward surge while rear foot anchors firmly behind!
    let lungePelvisZ = baseZ + dirZ * (bodyExt * 0.50);
    const pairMidZ = Math.abs(oppPelvisZ) < 50 ? (baseZ + oppPelvisZ) * 0.5 : (dirZ * 99);
    if (Math.abs(oppPelvisZ) < 50) {
      if (dirZ > 0) lungePelvisZ = Math.min(lungePelvisZ, pairMidZ - 0.52, oppPelvisZ - 1.04);
      else lungePelvisZ = Math.max(lungePelvisZ, pairMidZ + 0.52, oppPelvisZ + 1.04);
    }
    // Deep, athletic Olympic lunge sink (pelvis drops 21cm so front thigh goes horizontal & rear leg locks straight!)
    const pelvisY = Math.max(0.46, 0.82 - bodyExt * 0.21 + crouchDrop + airLift + epeeBounce + stepBounce + breath);

    // Turn slightly deeper into sleek profile on full lunge (+0.14 rad) to maximize shoulder-to-tip reach!
    const lungeYawTurn = ext * 0.14;
    const baseYaw = fencer.isP1 ? (0.86 + lungeYawTurn) : (Math.PI - 0.86 - lungeYawTurn);
    fencer.pelvisGroup.position.set(0, pelvisY, lungePelvisZ);
    fencer.pelvisGroup.rotation.set(0, baseYaw, 0);

    // Physical Body-Impact Recoil (Torso & Mask absorb axial spring-tip impulse when struck!)
    const hitRec = fencer.isP1 ? (state.p1HitRecoil || 0) : (state.p2HitRecoil || 0);
    const hitRecX = fencer.isP1 ? (state.p1HitRecoilX || 0) : (state.p2HitRecoilX || 0);
    const hitRecY = fencer.isP1 ? (state.p1HitRecoilY || 0) : (state.p2HitRecoilY || 0);
    const hitZone = fencer.isP1 ? (state.p1HitZone || 'torso_lame') : (state.p2HitZone || 'torso_lame');
    const recoilPulse = hitRec > 0 ? Math.sin(hitRec * Math.PI) : 0;

    // Slight backward pelvic jolt when struck squarely on chest/mask
    fencer.pelvisGroup.position.z = lungePelvisZ - dirZ * (recoilPulse * 0.055);

    // Dynamic forward torso lean (~24° on full lunge) + physical impact recoil twist & jolt!
    const forwardLean = 0.08 + ext * 0.28 - recoilPulse * 0.14;
    const recoilTwistY = recoilPulse * (hitRecX * 1.45);
    const recoilBackZ = (fencer.isP1 ? 1 : -1) * (ext * 0.30 - recoilPulse * (0.22 + Math.max(0, hitRecY) * 0.35));
    fencer.torsoGroup.rotation.set(
      forwardLean * 0.65 - recoilPulse * 0.10,
      (fencer.isP1 ? (-0.22 - ext * 0.10) : (0.22 + ext * 0.10)) + recoilTwistY,
      recoilBackZ
    );
    const maskSnap = (hitZone === 'mask') ? recoilPulse * 0.34 : recoilPulse * 0.12;
    fencer.headGroup.rotation.set(
      -(0.06 + ext * 0.20) - maskSnap,
      (fencer.isP1 ? -0.66 : 0.66) + recoilTwistY * 0.8,
      -(fencer.isP1 ? 1 : -1) * (ext * 0.20 - maskSnap * 0.75) + guardX * 0.04
    );

    fencer.root.updateMatrixWorld(true);

    // Anatomical acetabulum hip & lateral deltoid shoulder sockets with anti-clipping clearance
    _pHipL.set(0.092, -0.062, 0.010).applyMatrix4(fencer.pelvisGroup.matrixWorld);
    _pHipR.set(-0.092, -0.062, 0.010).applyMatrix4(fencer.pelvisGroup.matrixWorld);
    const leadHip = fencer.isP1 ? _pHipR : _pHipL;
    const rearHip = fencer.isP1 ? _pHipL : _pHipR;

    _pShLead.set(fencer.isP1 ? -0.182 : 0.182, 0.390, 0.022).applyMatrix4(fencer.torsoGroup.matrixWorld);
    _pShRear.set(fencer.isP1 ? 0.182 : -0.182, 0.384, -0.020).applyMatrix4(fencer.torsoGroup.matrixWorld);

    // 1. Wide 1.50m Olympic Lunge Leg Split + Directional Marche/Rompez Footwork & Anchored Rear Foot!
    const isAdvancing = (dirZ * liveVel) > 0.12;
    const isRetreating = (dirZ * liveVel) < -0.12;
    const stepWave = ext < 0.12 ? Math.sin(gaitPhase) * (0.014 + speedNorm * 0.042) : 0;
    const leadStepLift = (ext < 0.12 && speedNorm > 0.08)
      ? Math.max(0, Math.sin(gaitPhase + (isAdvancing ? 0.35 : 0))) * (isAdvancing ? 0.038 : 0.022) * speedNorm
      : 0;
    const rearStepLift = (ext < 0.12 && speedNorm > 0.08)
      ? Math.max(0, -Math.sin(gaitPhase + (isRetreating ? 0.35 : 0))) * (isRetreating ? 0.036 : 0.020) * speedNorm
      : 0;

    // Mid-lunge Heel-First Toe Kick (Dorsiflexion peaks around bodyExt=0.50, then snaps flat onto piste at bodyExt>=0.88!)
    const heelKickBell = (bodyExt > 0.10 && bodyExt < 0.90) ? Math.sin(((bodyExt - 0.10) / 0.80) * Math.PI) : 0;
    const leadToePitch = -heelKickBell * 0.26;
    const leadPitchLift = Math.abs(Math.sin(leadToePitch)) * 0.055;

    const footFloorY = 0.086 + airLift * 0.88;
    let leadFootZ = lungePelvisZ + dirZ * (0.36 + bodyExt * 0.15 + stepWave);
    if (Math.abs(oppPelvisZ) < 50) {
      const maxFootZ = pairMidZ - dirZ * 0.12;
      leadFootZ = dirZ > 0 ? Math.min(leadFootZ, maxFootZ) : Math.max(leadFootZ, maxFootZ);
    }
    // Rear foot stays firmly anchored on the piste while pelvis & front leg drive forward (locks rear leg 99% straight!)
    const rearFootZ = lungePelvisZ - dirZ * (0.36 + bodyExt * 0.44 - stepWave * 0.5);
    const laneOffset = fencer.isP1 ? -0.035 : 0.035;
    _pFootLead.set(
      swordXSign * 0.06 + laneOffset,
      footFloorY + leadStepLift + leadPitchLift,
      leadFootZ
    );
    _pFootRear.set(
      -swordXSign * (0.15 - ext * 0.06) + laneOffset,
      footFloorY + rearStepLift,
      rearFootZ
    );

    _poleVec.set(swordXSign * 0.08, 0.28, dirZ * 1.0);
    solveTwoBoneIK3D(leadHip, _pFootLead, fencer.lengths.thighLen, fencer.lengths.calfLen, _poleVec, _pKnee);
    _pKnee.y = Math.max(0.22, _pKnee.y);
    _frontRef.set(0, 0, dirZ);
    orientBoneSegment(fencer.leadThigh.grp, leadHip, _pKnee, _frontRef);
    orientBoneSegment(fencer.leadCalf.grp, _pKnee, _pFootLead, _frontRef);

    fencer.leadShoe.position.set(_pFootLead.x, Math.max(0.002, footFloorY - 0.084 + leadStepLift + leadPitchLift), _pFootLead.z);
    fencer.leadShoe.rotation.set(leadToePitch, fencer.isP1 ? 0 : Math.PI, 0);

    _poleVec.set(-swordXSign * 0.95, 0.25, -dirZ * 0.22);
    solveTwoBoneIK3D(rearHip, _pFootRear, fencer.lengths.thighLen, fencer.lengths.calfLen, _poleVec, _pKnee);
    _pKnee.y = Math.max(0.22, _pKnee.y);
    _frontRef.set(-swordXSign, 0, -dirZ * 0.25).normalize();
    orientBoneSegment(fencer.rearThigh.grp, rearHip, _pKnee, _frontRef);
    orientBoneSegment(fencer.rearCalf.grp, _pKnee, _pFootRear, _frontRef);

    // Authentic Rear-Foot Medial Edge Roll (Pronation) on Full Lunge so inner sole grips the piste cleanly!
    const rearMedialRoll = (fencer.isP1 ? -1 : 1) * ext * 0.44;
    const rollLift = Math.abs(Math.sin(rearMedialRoll)) * 0.048;
    fencer.rearShoe.position.set(_pFootRear.x, Math.max(0.002, footFloorY - 0.084 + rearStepLift + rollLift), _pFootRear.z);
    fencer.rearShoe.rotation.order = 'YXZ';
    fencer.rearShoe.rotation.set(-ext * 0.05, fencer.isP1 ? Math.PI * 0.46 : -Math.PI * 0.46, rearMedialRoll);

    // 2. Rear Counter-Balance Arm: curved scorpion poise in En-Garde -> 100% straight horizontal wing on Full Lunge!
    _pHandRear.set(
      _pShRear.x - swordXSign * (0.18 * (1 - ext * 0.65)),
      _pShRear.y + (0.20 * (1 - ext) + ext * 0.05),
      _pShRear.z - dirZ * (0.22 + ext * 0.34)
    );
    const maxArmReach = (fencer.lengths.upperArmLen + fencer.lengths.forearmLen) * 0.985;
    _vDir.subVectors(_pHandRear, _pShRear);
    if (_vDir.length() > maxArmReach) {
      _pHandRear.copy(_pShRear).addScaledVector(_vDir.normalize(), maxArmReach);
    }
    _poleVec.set(-swordXSign * 0.6, -0.75, -dirZ * 0.5);
    solveTwoBoneIK3D(_pShRear, _pHandRear, fencer.lengths.upperArmLen, fencer.lengths.forearmLen, _poleVec, _pElbow);
    _vDir.subVectors(_pHandRear, _pElbow).normalize();
    _pHandRear.copy(_pElbow).addScaledVector(_vDir, fencer.lengths.forearmLen);
    _frontRef.set(-swordXSign, 0.3, 0).normalize();
    orientBoneSegment(fencer.rearUpperArm.grp, _pShRear, _pElbow, _frontRef);
    orientBoneSegment(fencer.rearForearm.grp, _pElbow, _pHandRear, _frontRef);
    fencer.rearHandGroup.position.copy(_pHandRear);
    fencer.rearHandGroup.quaternion.copy(fencer.rearForearm.grp.quaternion);

    // 3. Lead Sword Arm & 3-Weapon Blade Pose (En-Garde, Lunge, Parry, Quinte Roof & Moulinet Cuts!)
    const isWindup = (
      action === Action.PREP ||
      action === Action.FEINT1 ||
      action === Action.FEINT2 ||
      action === Action.COUPE
    );
    const isAttacking = isWindup || action === Action.LUNGE;
    const isSlashing = (wType === WeaponId.SABRE) && (action === Action.LUNGE || slashPhase > 0);
    const slashProg = slashPhase > 0 ? (1 - slashPhase) : (action === Action.LUNGE ? Math.min(1, ext * 1.15) : 0);

    // FULL OLYMPIC ALLONGEMENT:
    // As ext -> 1.0, the sword hand rises to shoulder height and locks out 99% straight (0.562m ahead of _pShLead)!
    let handWorldX = swordXSign * (0.13 * (1 - armExt * 0.45)) - guardX * (0.22 - armExt * 0.08);
    let handWorldY = _pShLead.y - 0.14 * (1 - armExt * 0.88) - guardY * (0.16 - armExt * 0.06) + coupeLift * 0.16;
    let handWorldZ = _pShLead.z + dirZ * (0.31 + armExt * 0.252);

    const bladeLen = wType === WeaponId.SABRE ? 0.86 : 0.89;
    let tipWorldX = -guardX * 0.30;
    let tipWorldY = handWorldY + (0.05 * (1 - ext)) - guardY * 0.20 + coupeLift * 0.32;
    let tipWorldZ = handWorldZ + dirZ * bladeLen;

    const maskTopY = pelvisY + 0.81;

    if (wType === WeaponId.SABRE) {
      if (isSlashing) {
        if (attackQuad === Quadrant.NW) {
          // Coup à la Tête (Overhead Moulinet cut — stays strictly forward of own mask!)
          handWorldX = -0.14 + slashProg * 0.06;
          handWorldY = maskTopY + 0.05 - slashProg * 0.36;
          handWorldZ = Math.max(0, 0) + _pShLead.z + dirZ * (0.34 + ext * 0.20);
          tipWorldX = -0.04;
          tipWorldY = handWorldY + Math.cos(slashProg * 1.95) * bladeLen * 0.78;
          tipWorldZ = handWorldZ + dirZ * (0.32 + Math.sin(slashProg * 1.60) * bladeLen * 0.72);
        } else if (attackQuad === Quadrant.NE) {
          handWorldX = -0.28 + slashProg * 0.28;
          handWorldY = _pShLead.y + 0.04 - slashProg * 0.12;
          tipWorldX = -0.56 + slashProg * 0.78;
          tipWorldY = handWorldY + 0.18 - slashProg * 0.30;
          tipWorldZ = handWorldZ + dirZ * (bladeLen * 0.86);
        } else if (attackQuad === Quadrant.SW) {
          // Inside cheek cut: keep hand strictly forward of chest so forearm never cuts through ribcage!
          handWorldX = 0.08 - slashProg * 0.28;
          handWorldY = _pShLead.y + 0.04 - slashProg * 0.08;
          handWorldZ = _pShLead.z + dirZ * (0.38 + ext * 0.20);
          tipWorldX = 0.44 - slashProg * 0.78;
          tipWorldY = handWorldY + 0.16 - slashProg * 0.18;
          tipWorldZ = handWorldZ + dirZ * (bladeLen * 0.86);
        } else {
          handWorldX = -0.24 + slashProg * 0.24;
          handWorldY = _pShLead.y - 0.18 + slashProg * 0.14;
          tipWorldX = -0.44 + slashProg * 0.64;
          tipWorldY = handWorldY - 0.10 + slashProg * 0.26;
          tipWorldZ = handWorldZ + dirZ * (bladeLen * 0.88);
        }
      } else if (isWindup) {
        if (attackQuad === Quadrant.NW) {
          // Overhead windup strictly above & forward of mask crown (zero backward blade through head!)
          handWorldX = -0.18; handWorldY = maskTopY + 0.06;
          handWorldZ = _pShLead.z + dirZ * 0.32;
          tipWorldX = 0.06;   tipWorldY = handWorldY + 0.62;
          tipWorldZ = handWorldZ + dirZ * 0.12;
        } else if (attackQuad === Quadrant.NE) {
          handWorldX = -0.32; handWorldY = _pShLead.y + 0.06;
          tipWorldX = -0.62;  tipWorldY = handWorldY + 0.42;
          tipWorldZ = handWorldZ + dirZ * 0.24;
        } else if (attackQuad === Quadrant.SW) {
          handWorldX = 0.08;  handWorldY = _pShLead.y + 0.06;
          handWorldZ = _pShLead.z + dirZ * 0.38;
          tipWorldX = 0.46;   tipWorldY = handWorldY + 0.42;
          tipWorldZ = handWorldZ + dirZ * 0.26;
        } else {
          handWorldX = -0.26; handWorldY = _pShLead.y - 0.18;
          tipWorldX = -0.50;  tipWorldY = handWorldY - 0.24;
          tipWorldZ = handWorldZ + dirZ * 0.28;
        }
      } else if (guardY < -0.22 || (attackQuad === Quadrant.NW && action === Action.PARRYING)) {
        // Authentic Quinte (5) Horizontal Overhead Roof Guard strictly ABOVE & FORWARD of 1600N Mask!
        handWorldX = -0.24;
        handWorldY = maskTopY + 0.06;
        handWorldZ = lungePelvisZ + dirZ * 0.34;
        tipWorldX = 0.34;
        tipWorldY = handWorldY + 0.03;
        tipWorldZ = handWorldZ + dirZ * 0.14;
      } else {
        tipWorldX = handWorldX + (guardX >= 0 ? -0.10 : 0.10);
        tipWorldY = handWorldY + 0.68;
        tipWorldZ = handWorldZ + dirZ * 0.46;
      }
    } else if (isAttacking) {
      const qc = getQuadCoords(attackQuad, wType);
      tipWorldX = -qc.x * 0.34;
      tipWorldY = _pShLead.y - 0.04 - qc.y * 0.26 + coupeLift * 0.36;
      tipWorldZ = handWorldZ + dirZ * bladeLen;
    }

    // ANATOMICAL SELF-COLLISION & OPPONENT-CHEST HAND GUARD CLAMP:
    if (Math.abs(oppPelvisZ) < 50) {
      // Natural elbow/shoulder recoil keeps bell guard ~0.84m from opponent's chest surface (0.89m blade -> 96% straight chord!)
      const oppChestZ = oppPelvisZ - dirZ * 0.21;
      const standOff = wType === WeaponId.SABRE ? 0.68 : (bladeLen - 0.045);
      const maxHandZ = oppChestZ - dirZ * standOff;
      handWorldZ = dirZ > 0 ? Math.min(handWorldZ, maxHandZ) : Math.max(handWorldZ, maxHandZ);
    }
    // FINAL INVARIANT: Keep sword hand strictly forward of own ribcage plane (+0.32m from lungePelvisZ)
    // Applied AFTER opponent standoff so close-range counter-lunges NEVER push the sword hand behind the fencer's own shoulder!
    if (dirZ > 0) handWorldZ = Math.max(handWorldZ, lungePelvisZ + 0.32);
    else handWorldZ = Math.min(handWorldZ, lungePelvisZ - 0.32);
    handWorldX = Math.min(0.10, handWorldX); // Prevent cross-body arm from slicing into own chest

    _pHandLead.set(handWorldX, handWorldY, handWorldZ);
    _vDir.subVectors(_pHandLead, _pShLead);
    if (_vDir.length() > maxArmReach) {
      _pHandLead.copy(_pShLead).addScaledVector(_vDir.normalize(), maxArmReach);
    }
    // Fencing coude-bas: sword elbow points downward & slightly outward (-X) so elbow never clips into ribs!
    _poleVec.set(-0.42, -1.0, -dirZ * 0.18);
    solveTwoBoneIK3D(_pShLead, _pHandLead, fencer.lengths.upperArmLen, fencer.lengths.forearmLen, _poleVec, _pElbow);

    // Push elbow outside torso cylinder if needed
    const elbRelZ = (_pElbow.z - lungePelvisZ);
    const elbRadSq = (_pElbow.x * _pElbow.x) / (0.23 * 0.23) + (elbRelZ * elbRelZ) / (0.18 * 0.18);
    if (_pElbow.y > pelvisY - 0.05 && _pElbow.y < pelvisY + 0.50 && elbRadSq < 1.0) {
      _pElbow.x = Math.min(-0.21, _pElbow.x);
    }

    _vDir.subVectors(_pHandLead, _pElbow).normalize();
    _pHandLead.copy(_pElbow).addScaledVector(_vDir, fencer.lengths.forearmLen);
    _frontRef.set(0, 1, 0);
    orientBoneSegment(fencer.leadUpperArm.grp, _pShLead, _pElbow, _frontRef);
    orientBoneSegment(fencer.leadForearm.grp, _pElbow, _pHandLead, _frontRef);

    // REAL-TIME ANATOMICAL SURFACE PINNING, BLADE STOP & EULER COLUMN-BUCKLING ARCH:
    const rawPinned = fencer.isP1 ? state.pinnedHitActive : state.p2PinnedHitActive;
    // Only pin while the attacker is actually extended (> 0.35) so early/recovery replay frames never snap backward!
    const isMyPinnedHit = Boolean(rawPinned && ext > 0.35);
    let autoContactBuckle = 0;

    if (isMyPinnedHit && wType !== WeaponId.SABRE && Math.abs(oppPelvisZ) < 50) {
      // Always anchor Z to the opponent's live front chest surface (oppPelvisZ - dirZ * 0.21)
      // and NEVER use `||` on Z (since z=0.0 at centerline is falsy in JS!)
      const pinX = fencer.isP1 ? state.pinnedWorldX : state.p2PinnedWorldX;
      const pinY = fencer.isP1 ? state.pinnedWorldY : state.p2PinnedWorldY;
      const oppSurfaceZ = oppPelvisZ - dirZ * 0.21;
      const rawPinZ = fencer.isP1 ? state.pinnedWorldZ : state.p2PinnedWorldZ;
      const candidateZ = (typeof rawPinZ === 'number' && Math.abs(rawPinZ - oppSurfaceZ) < 0.35) ? rawPinZ : oppSurfaceZ;
      const pinZ = fencer.isP1
        ? Math.min(candidateZ, oppSurfaceZ)
        : Math.max(candidateZ, oppSurfaceZ);

      // Verify pinZ is strictly in front of our sword hand along dirZ; if very close, project tip forward along dirZ!
      tipWorldX = pinX;
      tipWorldY = Math.max(0.08, pinY);
      tipWorldZ = dirZ > 0
        ? Math.max(pinZ, _pHandLead.z + 0.62)
        : Math.min(pinZ, _pHandLead.z - 0.62);
      const chord = Math.hypot(tipWorldX - _pHandLead.x, tipWorldY - _pHandLead.y, tipWorldZ - _pHandLead.z);
      const shorten = Math.max(0.008, bladeLen - chord);
      autoContactBuckle = Math.min(0.042, 0.024 + shorten * 0.22);
    } else if (Math.abs(oppPelvisZ) < 50) {
      // Continuous live surface stop against opponent's chest/mask/arm cylinder so blade NEVER pierces through body!
      const oppChestSurfaceZ = oppPelvisZ - dirZ * 0.21;
      const pastSurface = dirZ * (tipWorldZ - oppChestSurfaceZ);
      const hitsSilhouette = (Math.abs(tipWorldX) < 0.34 && tipWorldY > 0.36 && tipWorldY < 1.72);
      if (pastSurface > 0 && hitsSilhouette) {
        tipWorldZ = oppChestSurfaceZ;
        if (wType !== WeaponId.SABRE) {
          const chord = Math.hypot(tipWorldX - _pHandLead.x, tipWorldY - _pHandLead.y, tipWorldZ - _pHandLead.z);
          const shorten = Math.max(0, bladeLen - chord);
          autoContactBuckle = Math.min(0.038, 0.018 + shorten * 0.20);
        }
      }
    }
    // Never let blade tip dip below copper piste floor (y >= 0.018m)
    tipWorldY = Math.max(0.018, tipWorldY);

    // NON-PENETRATING 3D BLADE-ON-BLADE CONTACT & PARRY DEFLECTION CONSTRAINT:
    if (state.parryClashTimer > 0 && ((fencer.isP1 && action === Action.RECOVERY) || (!fencer.isP1 && (action === Action.PARRIED || action === Action.RECOVERY)))) {
      // Attacker's parried blade deflects cleanly outside the 3D clash point instead of ghosting through the defender's guard!
      const deflectOutX = (guardX >= 0 ? -1 : 1) * 0.18 * (state.parryClashTimer / 0.26);
      tipWorldX += deflectOutX;
      tipWorldY += 0.09 * (state.parryClashTimer / 0.26);
    }

    // HARD FORWARD-BLADE INVARIANT: Ensure blade tip is ALWAYS strictly in front of the sword hand along dirZ
    // (Prevents any fencer's sword from ever reversing and stabbing into their own body in live play or replay!)
    const minForwardBladeSpan = wType === WeaponId.SABRE ? 0.10 : 0.45;
    if (dirZ > 0) {
      tipWorldZ = Math.max(tipWorldZ, _pHandLead.z + minForwardBladeSpan);
    } else {
      tipWorldZ = Math.min(tipWorldZ, _pHandLead.z - minForwardBladeSpan);
    }

    // Update Deformable 3D Steel Blade Curve & Orient Hilt Tangent to the Blade Root!
    fencer.swordHandGroup.position.copy(_pHandLead);
    _pBladeTip.set(tipWorldX, tipWorldY, tipWorldZ);

    const vibX = fencer.isP1 ? state.bladeVibX : state.p2BladeVibX;
    const vibY = fencer.isP1 ? state.bladeVibY : state.p2BladeVibY;
    const buckle = Math.max(fencer.isP1 ? state.bladeBuckleAmp : state.p2BladeBuckleAmp, autoContactBuckle);

    if (!isMyPinnedHit) {
      _pBladeTip.x -= vibX * 0.075;
      _pBladeTip.y = Math.max(0.018, _pBladeTip.y - vibY * 0.075);
    }

    // Step _pBladeStart 4.5cm along the exact Hilt -> Tip axis (never along camera forward!)
    _pBladeStart.copy(_pHandLead).addScaledVector(
      _vDir.subVectors(_pBladeTip, _pHandLead).normalize(),
      0.045
    );
    _pBladeMid.lerpVectors(_pBladeStart, _pBladeTip, 0.5);
    // Keep midpoint vibration IN PHASE with tip vibration (same sign, zero S-wave inversion!)
    if (!isMyPinnedHit) {
      _pBladeMid.x -= vibX * 0.038;
      _pBladeMid.y -= vibY * 0.038;
    }

    if (wType === WeaponId.SABRE && buckle <= 0.005) {
      _pBladeMid.y -= 0.014;
    }
    if (buckle > 0.005 && wType !== WeaponId.SABRE) {
      // AUTHENTIC FENCING BLADE FLEX DIRECTION (Soie / Supinated Wrist):
      // In real Foil & Épée, the blade is set slightly downward and strikes from shoulder height into the chest,
      // so the blade belly bows DOWNWARD (-Y, tip dipping into target) and OUTWARD along the guard line!
      const clampedBuckle = Math.min(0.042, buckle);
      _pBladeMid.y -= clampedBuckle;
      _pBladeMid.x += (guardX >= 0 ? -0.016 : 0.016) * (clampedBuckle / 0.035);
    } else if (state.bladeBindActive && Math.abs(state.bindContactWorldZ) < 12) {
      // Subtle steel-on-steel contact flex (capped at 3.0cm so blades stay taut & straight during binds!)
      const sepSign = fencer.isP1 ? -1 : 1;
      const myCompliance = fencer.isP1
        ? (0.28 / Math.max(0.55, state.bindLeverage))
        : (0.36 * Math.min(1.8, state.bindLeverage));
      const bindShiftX = Math.max(-0.030, Math.min(0.030, (state.bindContactWorldX + sepSign * 0.008 - _pBladeMid.x) * 0.45 - state.bindPushVectorX * 0.024 * sepSign * myCompliance));
      const bindShiftY = Math.max(-0.024, Math.min(0.024, (state.bindContactWorldY - _pBladeMid.y) * 0.35 - state.bindPushVectorY * 0.020 * myCompliance));
      _pBladeMid.x += bindShiftX;
      _pBladeMid.y += bindShiftY;
    } else if (ext > 0.72 && inRange && wType !== WeaponId.SABRE) {
      _pBladeMid.y -= 0.015;
    }

    // Orient Sword Gauntlet & Hilt slightly toward the flexed midpoint so hilt & blade root have zero reverse angle!
    fencer.swordHandGroup.lookAt(_pBladeTip);
    Fencing3DAssets.updateDeformableBlade(fencer.blades[wType], _pBladeStart, _pBladeMid, _pBladeTip);

    // 3D Threat Point Halo on Opponent's Blade Tip during Feint (Gold) vs Real Attack (Crimson)
    const isShowcaseMenu = state.paused && DOM.modalOverlay && !DOM.modalOverlay.classList.contains('hidden');
    if (!fencer.isP1 && !isShowcaseMenu && !state.replayActive && isAttacking && wType !== WeaponId.SABRE) {
      const isDeception = (action === Action.FEINT1 || action === Action.FEINT2 || action === Action.COUPE);
      fencer.tipThreatGlow.visible = true;
      fencer.tipThreatGlow.position.copy(_pBladeTip);
      fencer.tipThreatGlow.material.color.setHex(isDeception ? 0xfacc15 : 0xf43f5e);
      fencer.tipThreatGlow.material.opacity = 0.55 + 0.35 * Math.sin(nowSec * 24);
      const sc = isDeception ? 0.9 : 1.25;
      fencer.tipThreatGlow.scale.set(sc, sc, sc);
    } else {
      fencer.tipThreatGlow.visible = false;
    }

    // Update Trailing Catenary Floor Body Cord anchored to rear waist clip (Mousqueton)
    updateCatenaryCord(
      fencer.isP1 ? arena.cordP1 : arena.cordP2,
      rearHip.x * 0.65,
      pelvisY + 0.09,
      lungePelvisZ - dirZ * 0.11,
      fencer.isP1 ? -7.02 : 7.02
    );
  }

  // Positions & Bends the First-Person 3D Gloved Forearm + Hilt + Deformable Blade in Camera View!
  const _fpRight = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _fpUp = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _fpFwd = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _fpHiltPos = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _fpTipPos = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);
  const _fpMidPos = (typeof THREE !== 'undefined' ? new THREE.Vector3() : null);

  function updateFirstPersonWeaponRig3D(fpRig, cam, isP2Pov, visible) {
    fpRig.rig.visible = visible;
    const wType = state.selectedWeapon;
    for (const k of ['foil', 'epee', 'sabre']) {
      const show = visible && (k === wType);
      fpRig.blades[k].mesh.visible = show;
      fpRig.blades[k].tipCap.visible = show;
    }
    if (!visible) return;

    fpRig.hilts.foilHilt.visible = (wType === WeaponId.FOIL);
    fpRig.hilts.epeeHilt.visible = (wType === WeaponId.EPEE);
    fpRig.hilts.sabreHilt.visible = (wType === WeaponId.SABRE);
    fpRig.forearmMesh.material = (wType === WeaponId.SABRE) ? fpRig.sabreSleeveMat : fpRig.sleeveMat;

    cam.updateMatrixWorld(true);
    _fpRight.set(1, 0, 0).applyQuaternion(cam.quaternion).normalize();
    _fpUp.set(0, 1, 0).applyQuaternion(cam.quaternion).normalize();
    _fpFwd.set(0, 0, -1).applyQuaternion(cam.quaternion).normalize();

    const myGuardX = isP2Pov ? state.aiGuardX : state.guardX;
    const myGuardY = isP2Pov ? state.aiGuardY : state.guardY;
    const myTipX = isP2Pov ? state.p2TipX : state.tipX;
    const myTipY = isP2Pov ? state.p2TipY : state.tipY;
    const myExt = isP2Pov ? state.aiExtension : state.playerExtension;
    const myParry = isP2Pov ? (state.aiAction === Action.PARRYING) : (state.playerAction === Action.PARRY);
    const mySlash = isP2Pov ? state.p2SabreSlashPhase : state.sabreSlashPhase;
    const myQuad = isP2Pov ? state.aiQuadrant : state.quadrant;

    let rightOff = 0.22 + myGuardX * 0.24 + (myParry ? (myGuardX >= 0 ? 0.08 : -0.10) : 0) - myExt * 0.05;
    let upOff    = -0.22 - myGuardY * 0.16 + (myParry ? 0.05 : 0) + myExt * 0.05;
    let fwdOff   = 0.46 + myExt * 0.28;

    let tipRight = myTipX * 0.44;
    let tipUp    = 0.03 - myTipY * 0.34 + myExt * 0.08;
    let tipFwd   = 1.34 + myExt * 0.36;

    if (wType === WeaponId.SABRE) {
      if (mySlash > 0) {
        const prog = 1 - mySlash;
        const sx = (isP2Pov ? state.p2SabreSlashStartNormX : state.sabreSlashStartNormX) - 0.5;
        const sy = 0.5 - (isP2Pov ? state.p2SabreSlashStartNormY : state.sabreSlashStartNormY);
        const ex = (isP2Pov ? state.p2SabreSlashEndNormX : state.sabreSlashEndNormX) - 0.5;
        const ey = 0.5 - (isP2Pov ? state.p2SabreSlashEndNormY : state.sabreSlashEndNormY);
        tipRight = (sx + (ex - sx) * prog) * 1.15;
        tipUp    = (sy + (ey - sy) * prog) * 0.85;
        tipFwd   = 1.24;
        rightOff = 0.16 + tipRight * 0.32;
        upOff    = -0.16 + Math.sin(prog * Math.PI) * 0.12;
      } else if (myQuad === Quadrant.NW) {
        // First-Person Quinte (5) Horizontal Overhead Roof Guard!
        rightOff = 0.28 + myGuardX * 0.10;
        upOff    = 0.16 + (myParry ? 0.04 : 0);
        fwdOff   = 0.48;
        tipRight = -0.34 + myGuardX * 0.10;
        tipUp    = 0.21 + (myParry ? 0.04 : 0);
        tipFwd   = 0.62;
      } else {
        tipRight = rightOff - 0.06 + myTipX * 0.24;
        tipUp    = 0.26 - myTipY * 0.22;
        tipFwd   = 0.98;
      }
    }

    _fpHiltPos.copy(cam.position)
      .addScaledVector(_fpRight, rightOff)
      .addScaledVector(_fpUp, upOff)
      .addScaledVector(_fpFwd, fwdOff);

    _fpTipPos.copy(cam.position)
      .addScaledVector(_fpRight, tipRight)
      .addScaledVector(_fpUp, tipUp)
      .addScaledVector(_fpFwd, tipFwd);

    // Real 3D Blade Pinning, Column-Buckling & 22Hz Euler-Bernoulli Steel Ringing!
    const myVibX = isP2Pov ? state.p2BladeVibX : state.bladeVibX;
    const myVibY = isP2Pov ? state.p2BladeVibY : state.bladeVibY;
    const myBuckle = isP2Pov ? state.p2BladeBuckleAmp : state.bladeBuckleAmp;

    _fpTipPos.addScaledVector(_fpRight, myVibX * 0.09).addScaledVector(_fpUp, -myVibY * 0.09);

    // Hard-clamp 1st-person blade tip against opponent's front conductive chest surface so 1P sword NEVER pierces through Rival!
    const oppWorldPelvisZ = isP2Pov
      ? (state.playerZ + state.playerExtension * 0.48)
      : (state.aiZ - state.aiExtension * 0.48);
    const oppFrontSurfaceZ = isP2Pov ? (oppWorldPelvisZ + 0.21) : (oppWorldPelvisZ - 0.21);
    let fpAutoBuckle = 0;
    const fpDirZ = isP2Pov ? -1 : 1;
    if (fpDirZ * (_fpTipPos.z - oppFrontSurfaceZ) > 0 && Math.abs(_fpTipPos.x) < 0.34 && _fpTipPos.y > 0.38 && _fpTipPos.y < 1.70) {
      const overZ = fpDirZ * (_fpTipPos.z - oppFrontSurfaceZ);
      _fpTipPos.z = oppFrontSurfaceZ;
      // Natural 1st-person elbow absorption so hilt retracts smoothly instead of folding the blade!
      _fpHiltPos.z -= fpDirZ * Math.min(0.28, overZ * 0.72);
      if (wType !== WeaponId.SABRE) {
        fpAutoBuckle = Math.min(0.042, 0.018 + overZ * 0.08);
      }
    }
    _fpTipPos.y = Math.max(0.02, _fpTipPos.y);

    // AUTHENTIC 1ST-PERSON BLADE FLEX DIRECTION:
    // Downward/supinated flex (archUp < 0 bows the blade belly downward so the tip dips into the target;
    // archSide bows outward toward the guard side instead of hooking inward!)
    let archUp = -myVibY * 0.040 - fpAutoBuckle;
    let archSide = myVibX * 0.040 + (fpAutoBuckle > 0.008 ? (myGuardX >= 0 ? 0.016 : -0.016) : 0);
    const fpPinned = isP2Pov ? state.p2PinnedHitActive : state.pinnedHitActive;
    if (fpPinned && wType !== WeaponId.SABRE) {
      const px = isP2Pov ? state.p2PinnedWorldX : state.pinnedWorldX;
      const py = isP2Pov ? state.p2PinnedWorldY : state.pinnedWorldY;
      const rawFpZ = isP2Pov ? state.p2PinnedWorldZ : state.pinnedWorldZ;
      const validFpZ = (typeof rawFpZ === 'number' && Math.abs(rawFpZ - oppFrontSurfaceZ) < 0.35) ? rawFpZ : oppFrontSurfaceZ;
      const pz = isP2Pov
        ? Math.max(validFpZ, oppFrontSurfaceZ)
        : Math.min(validFpZ, oppFrontSurfaceZ);
      _fpTipPos.set(px, Math.max(0.10, py), pz);
      // Keep 1st-person hilt ~0.82m behind pinned tip so the blade shows a sleek 3.2cm downward/outward flex!
      const desiredHiltZ = pz - fpDirZ * 0.82;
      if (fpDirZ * (_fpHiltPos.z - desiredHiltZ) > 0) {
        _fpHiltPos.z = desiredHiltZ;
      }
      archUp = -Math.min(0.040, Math.max(0.024, myBuckle));
      archSide = (myGuardX >= 0 ? 0.016 : -0.016);
    } else if (state.bladeBindActive) {
      const compliance = isP2Pov ? Math.min(1.6, state.bindLeverage) : (1 / Math.max(0.6, state.bindLeverage));
      archUp += Math.max(-0.030, Math.min(0.030, -state.bindPushVectorY * 0.032 * compliance));
      archSide += Math.max(-0.032, Math.min(0.032, state.bindPushVectorX * 0.035 * compliance));
    }

    fpRig.rig.position.copy(_fpHiltPos);
    fpRig.rig.lookAt(_fpTipPos);

    // Advance _pBladeStart strictly along the Hilt -> Tip unit vector (NEVER along _fpFwd camera axis, which caused a reverse S-bend at the guard!)
    _vDir.subVectors(_fpTipPos, _fpHiltPos).normalize();
    _pBladeStart.copy(_fpHiltPos).addScaledVector(_vDir, 0.042);
    _fpMidPos.lerpVectors(_pBladeStart, _fpTipPos, 0.50)
      .addScaledVector(_fpUp, archUp - (wType === WeaponId.SABRE ? 0.012 : 0))
      .addScaledVector(_fpRight, archSide);

    Fencing3DAssets.updateDeformableBlade(fpRig.blades[wType], _pBladeStart, _fpMidPos, _fpTipPos);
  }

  function syncArenaTelemetry3D(nowSec) {
    const wCfg = WEAPON_CHANNELS[state.selectedWeapon];
    let railHex = wCfg.bladeColor;
    if (state.roundPhase === RoundPhase.HALT) railHex = state.lastPointColor;
    else if (state.rowMeter < -40) railHex = '#34d399';
    else if (state.rowMeter > 40) railHex = '#fb7185';
    arena.railMat.color.set(railHex);

    // Sync 3D Scoring Apparatus Lamps & Dynamic Floor Bounce Light
    const p1Green = DOM.lampPlayer && DOM.lampPlayer.className.includes('score-lamp-green');
    const p2Red = DOM.lampAI && DOM.lampAI.className.includes('score-lamp-red');
    const w1 = DOM.lampPlayerWhite && DOM.lampPlayerWhite.className.includes('score-lamp-white');
    const w2 = DOM.lampAIWhite && DOM.lampAIWhite.className.includes('score-lamp-white');

    arena.lampP1Mat.color.setHex(p1Green ? 0x10b981 : 0x0f172a);
    arena.lampP2Mat.color.setHex(p2Red ? 0xf43f5e : 0x0f172a);
    arena.lampW1Mat.color.setHex(w1 ? 0xf8fafc : 0x0f172a);
    arena.lampW2Mat.color.setHex(w2 ? 0xf8fafc : 0x0f172a);
    if (arena.podiumLedP1Mat && arena.podiumLedP2Mat) {
      arena.podiumLedP1Mat.color.setHex(p1Green ? 0x10b981 : (w1 ? 0xf8fafc : 0x0284c7));
      arena.podiumLedP2Mat.color.setHex(p2Red ? 0xf43f5e : (w2 ? 0xf8fafc : 0x0284c7));
    }

    if (p1Green || p2Red || w1 || w2) {
      scoreBounceLight.intensity = 2.2;
      scoreBounceLight.color.setHex(p1Green ? 0x10b981 : (p2Red ? 0xf43f5e : 0xf8fafc));
    } else {
      scoreBounceLight.intensity *= 0.88;
    }

    // Real-Time 3D Blade-Contact / Body-Impact Point Light & Glowing Contact Ring
    if (clashPointLight && clashContactOrb) {
      const { coreSphere, flareRing } = clashContactOrb.userData || {};
      if (state.pinnedHitActive || state.p2PinnedHitActive) {
        const isP1Hit = state.pinnedHitActive;
        const hx = isP1Hit ? state.pinnedWorldX : state.p2PinnedWorldX;
        const hy = isP1Hit ? state.pinnedWorldY : state.p2PinnedWorldY;
        const hz = isP1Hit ? state.pinnedWorldZ : state.p2PinnedWorldZ;
        const isOff = isP1Hit ? state.pinnedIsOffTarget : state.p2PinnedIsOffTarget;
        const hitHex = isOff ? 0xf8fafc : (isP1Hit ? 0x10b981 : 0xf43f5e);
        clashPointLight.intensity = 2.1;
        clashPointLight.color.setHex(hitHex);
        clashPointLight.position.set(hx, hy, hz);
        clashContactOrb.visible = true;
        clashContactOrb.position.set(hx, hy, hz);
        if (coreSphere && flareRing) {
          coreSphere.material.color.setHex(0xffffff);
          flareRing.material.color.setHex(hitHex);
          const pulse = 0.95 + 0.25 * Math.sin(nowSec * 28);
          clashContactOrb.scale.set(pulse, pulse, pulse);
        }
      } else if (state.clashLightIntensity > 0.05) {
        clashPointLight.intensity = state.clashLightIntensity;
        clashPointLight.color.setHex(state.clashLightColorHex || 0xfde047);
        clashPointLight.position.set(state.clashLightWorldX, state.clashLightWorldY, state.clashLightWorldZ);
        clashContactOrb.visible = true;
        clashContactOrb.position.copy(clashPointLight.position);
        if (coreSphere && flareRing) {
          coreSphere.material.color.setHex(0xfef08a);
          flareRing.material.color.setHex(state.clashLightColorHex || 0xfde047);
        }
        const s = 0.85 + state.clashLightIntensity * 0.32;
        clashContactOrb.scale.set(s, s, s);
      } else if (state.bladeBindActive) {
        const bindHex = state.bindLeverage >= 1.15 ? 0x38bdf8 : 0xfde047;
        clashPointLight.intensity = 1.05 + state.bindPressure * 1.15;
        clashPointLight.color.setHex(bindHex);
        clashPointLight.position.set(state.bindContactWorldX, state.bindContactWorldY, state.bindContactWorldZ);
        clashContactOrb.visible = true;
        clashContactOrb.position.copy(clashPointLight.position);
        if (coreSphere && flareRing) {
          coreSphere.material.color.setHex(0xfef08a);
          flareRing.material.color.setHex(bindHex);
        }
        const s = 0.78 + state.bindPressure * 0.35;
        clashContactOrb.scale.set(s, s, s);
      } else {
        clashPointLight.intensity = 0;
        clashContactOrb.visible = false;
      }
    }

    // Épée 3D Piste Distance Rings
    const showEpeeRings = (state.selectedWeapon === WeaponId.EPEE) && (state.running || state.showcaseCamMode === 'duel');
    arena.epeeRings3D.wrist.visible = showEpeeRings;
    arena.epeeRings3D.foot.visible = showEpeeRings;
    arena.epeeRings3D.body.visible = showEpeeRings;
    if (showEpeeRings) {
      arena.epeeRings3D.wrist.position.z = state.aiZ - CONSTANTS.EPEE_WRIST_MAX_REACH;
      arena.epeeRings3D.foot.position.z  = state.aiZ - CONSTANTS.EPEE_FOOT_MAX_REACH;
      arena.epeeRings3D.body.position.z  = state.aiZ - CONSTANTS.EPEE_BODY_MAX_REACH;
    }

    // Subtle match-point spotlight pulse
    const isMatchPt = state.running && state.gameMode !== GameMode.TUTORIAL &&
      (state.playerScore === state.targetScore - 1 || state.aiScore === state.targetScore - 1);
    for (let i = 0; i < arena.spotCones.length; i++) {
      arena.spotCones[i].material.color.setHex(isMatchPt ? (i === 1 ? 0xfbbf24 : 0xf43f5e) : 0xbae6fd);
      arena.spotCones[i].material.opacity = isMatchPt ? (0.055 + 0.025 * Math.sin(nowSec * 6)) : 0.038;
    }
    if (arena.bokehPoints) {
      const flashActive = (state.roundPhase === RoundPhase.HALT && (p1Green || p2Red));
      arena.bokehPoints.material.size = flashActive ? (0.18 + 0.06 * Math.abs(Math.sin(nowSec * 28))) : 0.14;
      arena.bokehPoints.material.opacity = flashActive ? 0.82 : 0.52;
    }
  }

  function renderWebGLFrame() {
    if (!init()) return false;

    const w = window.innerWidth;
    const h = window.innerHeight;
    const nowSec = performance.now() * 0.001;
    const wType = state.selectedWeapon;
    const wCfg = WEAPON_CHANNELS[wType];
    const rivalProfile = DIFFICULTIES[state.difficulty] || DIFFICULTIES.normal;

    const isMenuOpen = state.paused && DOM.modalOverlay && !DOM.modalOverlay.classList.contains('hidden') && state.gameMode !== GameMode.SPLIT_2P;
    const dist = state.aiZ - state.playerZ;
    const inRange = dist <= wCfg.optimalMax && dist >= wCfg.minMeasure;

    // Showcase live choreography when Title Screen is open!
    const showcaseCycle = nowSec % 3.4;
    const showcaseWindup = isMenuOpen && showcaseCycle >= 1.5 && showcaseCycle < 2.15;
    const showcaseStrike = isMenuOpen && showcaseCycle >= 2.15 && showcaseCycle < 2.85;
    const showcaseExt = showcaseStrike
      ? Math.sin(((showcaseCycle - 2.15) / 0.70) * Math.PI)
      : state.aiExtension;
    const showcaseSlash = (isMenuOpen && wType === WeaponId.SABRE && showcaseStrike)
      ? Math.max(0, 1 - (showcaseCycle - 2.15) / 0.70)
      : state.p2SabreSlashPhase;
    const showcaseAction = showcaseStrike
      ? Action.LUNGE
      : (showcaseWindup ? Action.PREP : state.aiAction);
    const showcaseQuad = isMenuOpen
      ? ([Quadrant.NE, Quadrant.NW, Quadrant.SW, Quadrant.SE][Math.floor(nowSec / 3.4) % 4])
      : state.aiAttackQuad;

    syncArenaTelemetry3D(nowSec);

    // 3D OLYMPIC SIDE-RAIL SLOW-MOTION BROADCAST REPLAY (Dynamic Dolly Focus + Time-Ramped Ralenti!)
    if (state.replayActive && state.replayFrames.length >= 2 && !isMenuOpen) {
      const idx0 = Math.min(state.replayFrames.length - 1, Math.max(0, Math.floor(state.replayCursor)));
      const idx1 = Math.min(state.replayFrames.length - 1, idx0 + 1);
      const alpha = state.replayCursor - idx0;
      const f0 = state.replayFrames[idx0];
      const f1 = state.replayFrames[idx1];
      const lerp = (a, b) => a + (b - a) * alpha;

      const startIdx = Math.max(0, state.replayFrames.length - 56);
      const impIdx = state.replayImpactIndex >= 0 ? state.replayImpactIndex : Math.max(0, state.replayFrames.length - 8);
      const impProg = Math.max(0, Math.min(1, (state.replayCursor - startIdx) / Math.max(1, impIdx - startIdx)));
      const focusEase = impProg * impProg * (3 - 2 * impProg);

      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, w, h);
      camP1.aspect = w / Math.max(1, h);
      // Smoothly dolly-zoom from 45° wide piste framing down to 36° tight impact framing!
      camP1.fov = 45 - focusEase * 9;
      camP1.updateProjectionMatrix();

      const midZ = lerp(f0.p1Z + f0.p2Z, f1.p1Z + f1.p2Z) * 0.5;
      const sweepAz = state.replayCameraAngle + (state.replayCursor - startIdx) * 0.0085;
      const camRadius = 3.82 - focusEase * 0.62;
      camP1.position.set(
        camRadius * Math.cos(sweepAz),
        1.28 - focusEase * 0.14,
        midZ + Math.sin(sweepAz) * 1.15
      );
      // Gently pan lookAt toward the struck fencer's chest at impact!
      const hitBiasZ = (f1.p1Pin || f0.p1Pin)
        ? (lerp(f0.p2Z, f1.p2Z) - 0.35) * 0.32 + midZ * 0.68
        : ((f1.p2Pin || f0.p2Pin) ? (lerp(f0.p1Z, f1.p1Z) + 0.35) * 0.32 + midZ * 0.68 : midZ);
      const lookZ = midZ + (hitBiasZ - midZ) * focusEase;
      camP1.lookAt(0.0, 1.00 + focusEase * 0.06, lookZ);

      // Temporarily apply recorded blade buckle, vibration, 3D surface pin & body recoil during replay!
      const savedB1 = state.bladeBuckleAmp, savedB2 = state.p2BladeBuckleAmp;
      const savedVx1 = state.bladeVibX, savedVy1 = state.bladeVibY;
      const savedVx2 = state.p2BladeVibX, savedVy2 = state.p2BladeVibY;
      const savedPin1 = state.pinnedHitActive, savedPin2 = state.p2PinnedHitActive;
      const savedPX1 = state.pinnedWorldX, savedPY1 = state.pinnedWorldY, savedPZ1 = state.pinnedWorldZ;
      const savedPX2 = state.p2PinnedWorldX, savedPY2 = state.p2PinnedWorldY, savedPZ2 = state.p2PinnedWorldZ;
      const savedRec1 = state.p1HitRecoil, savedRec2 = state.p2HitRecoil;

      const repP1Ext = lerp(f0.p1Ext, f1.p1Ext);
      const repP2Ext = lerp(f0.p2Ext, f1.p2Ext);
      const repP1PelvisZ = lerp(f0.p1Z, f1.p1Z) + repP1Ext * 0.50;
      const repP2PelvisZ = lerp(f0.p2Z, f1.p2Z) - repP2Ext * 0.50;

      state.bladeBuckleAmp = lerp(f0.p1Buckle, f1.p1Buckle);
      state.p2BladeBuckleAmp = lerp(f0.p2Buckle, f1.p2Buckle);
      state.bladeVibX = lerp(f0.p1VibX, f1.p1VibX);
      state.bladeVibY = lerp(f0.p1VibY, f1.p1VibY);
      state.p2BladeVibX = lerp(f0.p2VibX, f1.p2VibX);
      state.p2BladeVibY = lerp(f0.p2VibY, f1.p2VibY);

      state.pinnedHitActive = Boolean((f0.p1Pin || f1.p1Pin) && repP1Ext > 0.45);
      if (state.pinnedHitActive) {
        state.pinnedWorldX = f1.p1PinX !== undefined ? f1.p1PinX : (f0.p1PinX || 0);
        state.pinnedWorldY = f1.p1PinY !== undefined ? f1.p1PinY : (f0.p1PinY || 1.12);
        // Pin directly onto P2's live front chest plane at this replay frame!
        state.pinnedWorldZ = repP2PelvisZ - 0.21;
      }
      state.p2PinnedHitActive = Boolean((f0.p2Pin || f1.p2Pin) && repP2Ext > 0.45);
      if (state.p2PinnedHitActive) {
        state.p2PinnedWorldX = f1.p2PinX !== undefined ? f1.p2PinX : (f0.p2PinX || 0);
        state.p2PinnedWorldY = f1.p2PinY !== undefined ? f1.p2PinY : (f0.p2PinY || 1.12);
        // Pin directly onto P1's live front chest plane at this replay frame (NEVER positive +Z behind P2!)
        state.p2PinnedWorldZ = repP1PelvisZ + 0.21;
      }
      state.p1HitRecoil = lerp(f0.p1Rec || 0, f1.p1Rec || 0);
      state.p1HitRecoilX = f1.p1RecX || f0.p1RecX || 0;
      state.p1HitRecoilY = f1.p1RecY || f0.p1RecY || 0;
      state.p2HitRecoil = lerp(f0.p2Rec || 0, f1.p2Rec || 0);
      state.p2HitRecoilX = f1.p2RecX || f0.p2RecX || 0;
      state.p2HitRecoilY = f1.p2RecY || f0.p2RecY || 0;

      fencerP1.root.visible = true;
      fencerP2.root.visible = true;
      poseFencer3D(fencerP1, {
        baseZ: lerp(f0.p1Z, f1.p1Z), jumpY: lerp(f0.p1Y, f1.p1Y), posture: f0.p1Posture,
        ext: repP1Ext, guardX: lerp(f0.p1GX, f1.p1GX), guardY: lerp(f0.p1GY, f1.p1GY),
        action: f0.p1Act, attackQuad: f0.p1Quad, coupeLift: 0,
        slashPhase: lerp(f0.p1Slash, f1.p1Slash), wType, inRange: true, rivalProfile: null,
        oppPelvisZ: repP2PelvisZ,
        velZOverride: lerp(f0.p1Vel || 0, f1.p1Vel || 0)
      }, nowSec);
      poseFencer3D(fencerP2, {
        baseZ: lerp(f0.p2Z, f1.p2Z), jumpY: lerp(f0.p2Y, f1.p2Y), posture: f0.p2Posture,
        ext: repP2Ext, guardX: lerp(f0.p2GX, f1.p2GX), guardY: lerp(f0.p2GY, f1.p2GY),
        action: f0.p2Act, attackQuad: f0.p2Quad, coupeLift: lerp(f0.p2Coupe, f1.p2Coupe),
        slashPhase: lerp(f0.p2Slash, f1.p2Slash), wType, inRange: true, rivalProfile,
        oppPelvisZ: repP1PelvisZ,
        velZOverride: lerp(f0.p2Vel || 0, f1.p2Vel || 0)
      }, nowSec);

      state.bladeBuckleAmp = savedB1; state.p2BladeBuckleAmp = savedB2;
      state.bladeVibX = savedVx1; state.bladeVibY = savedVy1;
      state.p2BladeVibX = savedVx2; state.p2BladeVibY = savedVy2;
      state.pinnedHitActive = savedPin1; state.p2PinnedHitActive = savedPin2;
      state.pinnedWorldX = savedPX1; state.pinnedWorldY = savedPY1; state.pinnedWorldZ = savedPZ1;
      state.p2PinnedWorldX = savedPX2; state.p2PinnedWorldY = savedPY2; state.p2PinnedWorldZ = savedPZ2;
      state.p1HitRecoil = savedRec1; state.p2HitRecoil = savedRec2;

      updateFirstPersonWeaponRig3D(fpRigP1, camP1, false, false);
      updateFirstPersonWeaponRig3D(fpRigP2, camP2, true, false);
      renderer.render(scene, camP1);
      return true;
    }

    if (state.gameMode === GameMode.SPLIT_2P && !isMenuOpen) {
      // 2P Split-Screen Scissor Rendering: Both 3D Fencers + Both First-Person Rigs!
      renderer.setScissorTest(true);

      // Left Viewport: P1 POV looking at 3D Fencer P2
      const halfW = Math.floor(w * 0.5);
      camP1.aspect = halfW / Math.max(1, h);
      camP1.fov = 52 - state.camFovZoom * 24;
      camP1.updateProjectionMatrix();

      const shake1X = state.camShake > 0 ? (Math.random() - 0.5) * state.camShake * 0.08 : 0;
      const shake1Y = state.camShake > 0 ? (Math.random() - 0.5) * state.camShake * 0.08 : 0;
      camP1.position.set(
        shake1X - state.guardX * 0.05,
        1.42 + state.playerY * 0.52 + Math.sin(state.camBobPhase) * 0.016 + shake1Y,
        state.playerZ - 0.28 + state.playerExtension * 0.44
      );
      camP1.lookAt(-state.guardX * 0.08, 1.24 + state.aiY * 0.35 - state.camPitchOffset * 0.004, state.aiZ);
      camP1.rotation.z += state.camRollOffset;

      fencerP1.root.visible = false;
      fencerP2.root.visible = true;
      poseFencer3D(fencerP1, {
        baseZ: state.playerZ, jumpY: state.playerY, posture: state.playerPosture,
        ext: state.playerExtension, guardX: state.guardX, guardY: state.guardY,
        action: state.playerAction, attackQuad: state.quadrant, coupeLift: 0,
        slashPhase: state.sabreSlashPhase, wType, inRange, rivalProfile: null, oppPelvisZ: state.aiZ - state.aiExtension * 0.48
      }, nowSec);
      poseFencer3D(fencerP2, {
        baseZ: state.aiZ, jumpY: state.aiY, posture: state.aiPosture,
        ext: state.aiExtension, guardX: state.aiGuardX, guardY: state.aiGuardY,
        action: state.aiAction, attackQuad: state.aiAttackQuad, coupeLift: 0,
        slashPhase: state.p2SabreSlashPhase, wType, inRange, rivalProfile, oppPelvisZ: state.playerZ + state.playerExtension * 0.48
      }, nowSec);
      updateFirstPersonWeaponRig3D(fpRigP1, camP1, false, true);
      updateFirstPersonWeaponRig3D(fpRigP2, camP2, true, false);

      renderer.setViewport(0, 0, halfW, h);
      renderer.setScissor(0, 0, halfW, h);
      renderer.render(scene, camP1);

      // Right Viewport: P2 POV looking at 3D Fencer P1
      camP2.aspect = (w - halfW) / Math.max(1, h);
      camP2.fov = 52 - state.p2CamFovZoom * 24;
      camP2.updateProjectionMatrix();

      const shake2X = state.p2CamShake > 0 ? (Math.random() - 0.5) * state.p2CamShake * 0.08 : 0;
      const shake2Y = state.p2CamShake > 0 ? (Math.random() - 0.5) * state.p2CamShake * 0.08 : 0;
      camP2.position.set(
        shake2X + state.aiGuardX * 0.05,
        1.42 + state.aiY * 0.52 + Math.sin(state.p2CamBobPhase) * 0.016 + shake2Y,
        state.aiZ + 0.28 - state.aiExtension * 0.44
      );
      camP2.lookAt(state.aiGuardX * 0.08, 1.24 + state.playerY * 0.35 - state.p2CamPitchOffset * 0.004, state.playerZ);
      camP2.rotation.z += state.p2CamRollOffset;

      fencerP1.root.visible = true;
      fencerP2.root.visible = false;
      poseFencer3D(fencerP1, {
        baseZ: state.playerZ, jumpY: state.playerY, posture: state.playerPosture,
        ext: state.playerExtension, guardX: state.guardX, guardY: state.guardY,
        action: state.playerAction, attackQuad: state.quadrant, coupeLift: 0,
        slashPhase: state.sabreSlashPhase, wType, inRange, rivalProfile: null, oppPelvisZ: state.aiZ - state.aiExtension * 0.48
      }, nowSec);
      poseFencer3D(fencerP2, {
        baseZ: state.aiZ, jumpY: state.aiY, posture: state.aiPosture,
        ext: state.aiExtension, guardX: state.aiGuardX, guardY: state.aiGuardY,
        action: state.aiAction, attackQuad: state.aiAttackQuad, coupeLift: 0,
        slashPhase: state.p2SabreSlashPhase, wType, inRange, rivalProfile, oppPelvisZ: state.playerZ + state.playerExtension * 0.48
      }, nowSec);
      updateFirstPersonWeaponRig3D(fpRigP1, camP1, false, false);
      updateFirstPersonWeaponRig3D(fpRigP2, camP2, true, true);

      renderer.setViewport(halfW, 0, w - halfW, h);
      renderer.setScissor(halfW, 0, w - halfW, h);
      renderer.render(scene, camP2);
      renderer.setScissorTest(false);
      return true;
    }

    // Single-Viewport Rendering (Title Screen 3D Showcase OR 1P/Academy Gameplay)
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, w, h);
    camP1.aspect = w / Math.max(1, h);

    if (isMenuOpen && state.showcaseCamMode !== 'pov') {
      const pulseZoom = state.showcaseWeaponPulse * 4.5;
      if (state.showcaseCamMode === 'duel') {
        // CAM 02: Wide Grand Palais Championship Duel Orbit at True Long Olympic Measure (-1.35m vs +1.35m = 2.70m)!
        camP1.fov = 47 - pulseZoom;
        camP1.updateProjectionMatrix();
        const orbitAz = Math.sin(nowSec * 0.42) * 0.20 + state.mouseX * 0.28;
        camP1.position.set(
          3.85 + Math.cos(orbitAz) * 0.22,
          1.34 + state.mouseY * -0.18,
          0.05 + Math.sin(orbitAz) * 0.55
        );
        camP1.lookAt(0.0, 0.90, w > 900 ? 0.34 : 0.0);

        fencerP1.root.visible = true;
        fencerP2.root.visible = true;
        const p1CounterExt = (!showcaseStrike && !showcaseWindup) ? Math.max(0, Math.sin(nowSec * 3.0)) * 0.94 : 0.14;
        const p1ShowcasePelvisZ = -1.16 + p1CounterExt * 0.50;
        const p2ShowcasePelvisZ = 1.16 - showcaseExt * 0.50;
        const savedP2Rec = state.p2HitRecoil, savedP1Rec = state.p1HitRecoil;
        state.p1HitRecoil = showcaseExt > 0.72 ? (showcaseExt - 0.72) * 2.8 : 0;
        state.p2HitRecoil = p1CounterExt > 0.72 ? (p1CounterExt - 0.72) * 2.8 : 0;
        poseFencer3D(fencerP1, {
          baseZ: -1.16, jumpY: 0, posture: Posture.STAND,
          ext: p1CounterExt, guardX: state.mouseX * 0.5, guardY: state.mouseY * 0.5,
          action: p1CounterExt > 0.3 ? Action.LUNGE : Action.IDLE,
          attackQuad: state.quadrant, coupeLift: 0,
          slashPhase: 0, wType, inRange: true, rivalProfile: null,
          oppPelvisZ: p2ShowcasePelvisZ
        }, nowSec);
        poseFencer3D(fencerP2, {
          baseZ: 1.16, jumpY: 0, posture: Posture.STAND,
          ext: showcaseExt, guardX: state.aiGuardX, guardY: state.aiGuardY,
          action: showcaseAction, attackQuad: showcaseQuad, coupeLift: 0,
          slashPhase: showcaseSlash, wType, inRange: true, rivalProfile,
          oppPelvisZ: p1ShowcasePelvisZ
        }, nowSec);
        state.p1HitRecoil = savedP1Rec;
        state.p2HitRecoil = savedP2Rec;
        updateFirstPersonWeaponRig3D(fpRigP1, camP1, false, false);
        updateFirstPersonWeaponRig3D(fpRigP2, camP2, true, false);
      } else {
        // CAM 01 (Default): Heroic 3/4 Open-Chest Sculpted Model Full-Body Inspection!
        camP1.fov = 43 - pulseZoom;
        camP1.updateProjectionMatrix();
        const orbitAngle = 0.42 + state.mouseX * 0.52 + Math.sin(nowSec * 0.55) * 0.10;
        const radius = 2.68;
        const targetZ = 1.25;
        camP1.position.set(
          Math.sin(orbitAngle) * radius,
          1.14 - state.mouseY * 0.22,
          targetZ - Math.cos(orbitAngle) * radius
        );
        // Shift lookAt toward camera's left (+X) so Rival 3D model + full Sabre/Foil blade stand cleanly in the open right 60% of the screen!
        const dockShiftX = w > 900 ? 0.34 : 0.0;
        camP1.lookAt(dockShiftX, 0.88, targetZ - 0.06);

        fencerP1.root.visible = false;
        fencerP2.root.visible = true;
        poseFencer3D(fencerP1, {
          baseZ: -1.3, jumpY: 0, posture: Posture.STAND, ext: 0, guardX: 0, guardY: 0,
          action: Action.IDLE, attackQuad: Quadrant.NE, coupeLift: 0, slashPhase: 0, wType, inRange: false, rivalProfile: null
        }, nowSec);
        poseFencer3D(fencerP2, {
          baseZ: targetZ, jumpY: 0, posture: Posture.STAND,
          ext: showcaseExt * 0.72, guardX: state.mouseX * 0.45, guardY: state.mouseY * 0.45,
          action: showcaseAction, attackQuad: showcaseQuad, coupeLift: 0,
          slashPhase: showcaseSlash, wType, inRange: true, rivalProfile
        }, nowSec);
        updateFirstPersonWeaponRig3D(fpRigP1, camP1, false, false);
        updateFirstPersonWeaponRig3D(fpRigP2, camP2, true, false);
      }
    } else {
      // First-Person Mask POV (Active 1P Bout, Academy Tutorial, or CAM 03 POV Preview)
      camP1.fov = 52 - state.camFovZoom * 24;
      camP1.updateProjectionMatrix();

      const shakeX = state.camShake > 0 ? (Math.random() - 0.5) * state.camShake * 0.08 : 0;
      const shakeY = state.camShake > 0 ? (Math.random() - 0.5) * state.camShake * 0.08 : 0;
      const menuRatioShift = (isMenuOpen && w > 820) ? 0.42 : 0.0;

      camP1.position.set(
        shakeX - state.guardX * 0.05,
        1.42 + state.playerY * 0.54 + Math.sin(state.camBobPhase) * 0.016 + Math.sin(state.breathPhase) * 0.006 + shakeY,
        state.playerZ - 0.28 + state.playerExtension * 0.44
      );
      camP1.lookAt(
        menuRatioShift - state.guardX * 0.08,
        1.22 + state.aiY * 0.32 - state.camPitchOffset * 0.004,
        state.aiZ
      );
      camP1.rotation.z += state.camRollOffset;

      fencerP1.root.visible = false;
      fencerP2.root.visible = true;
      poseFencer3D(fencerP1, {
        baseZ: state.playerZ, jumpY: state.playerY, posture: state.playerPosture,
        ext: state.playerExtension, guardX: state.guardX, guardY: state.guardY,
        action: state.playerAction, attackQuad: state.quadrant, coupeLift: 0,
        slashPhase: state.sabreSlashPhase, wType, inRange, rivalProfile: null, oppPelvisZ: state.aiZ - state.aiExtension * 0.48
      }, nowSec);
      poseFencer3D(fencerP2, {
        baseZ: state.aiZ, jumpY: state.aiY, posture: state.aiPosture,
        ext: isMenuOpen ? showcaseExt : state.aiExtension,
        guardX: state.aiGuardX, guardY: state.aiGuardY,
        action: isMenuOpen ? showcaseAction : state.aiAction,
        attackQuad: isMenuOpen ? showcaseQuad : state.aiAttackQuad,
        coupeLift: state.aiCoupeLiftY,
        slashPhase: isMenuOpen ? showcaseSlash : state.p2SabreSlashPhase,
        wType, inRange, rivalProfile, oppPelvisZ: state.playerZ + state.playerExtension * 0.48
      }, nowSec);

      updateFirstPersonWeaponRig3D(fpRigP1, camP1, false, true);
      updateFirstPersonWeaponRig3D(fpRigP2, camP2, true, false);
    }

    renderer.render(scene, camP1);
    return true;
  }

  // Projects 3D Rival Wrist & Lead Foot into 2D Screen Coordinates for Precision Épée Lock-On Callouts
  function getOpponentTargetScreenCoords(vw, vh) {
    if (!initialized || !fencerP2 || !camP1) return null;
    _projVec.setFromMatrixPosition(fencerP2.swordHandGroup.matrixWorld).project(camP1);
    const wristX = (_projVec.x * 0.5 + 0.5) * vw;
    const wristY = (-_projVec.y * 0.5 + 0.5) * vh;

    _projVec.setFromMatrixPosition(fencerP2.leadShoe.matrixWorld);
    _projVec.y += 0.05;
    _projVec.project(camP1);
    const footX = (_projVec.x * 0.5 + 0.5) * vw;
    const footY = (-_projVec.y * 0.5 + 0.5) * vh;

    return { wristX, wristY, footX, footY };
  }

  function projectWorldToScreen(wx, wy, wz, isP2Pov = false) {
    if (!initialized || !camP1) return null;
    const activeCam = (state.gameMode === GameMode.SPLIT_2P && isP2Pov && camP2) ? camP2 : camP1;
    const vp = getViewportMetrics(isP2Pov);
    _projVec.set(wx, wy, wz).project(activeCam);
    if (_projVec.z > 1.05) return null;
    return {
      x: vp.vx + (_projVec.x * 0.5 + 0.5) * vp.vw,
      y: (-_projVec.y * 0.5 + 0.5) * vp.vh
    };
  }

  return {
    init,
    resize,
    renderWebGLFrame,
    getOpponentTargetScreenCoords,
    projectWorldToScreen,
    isActive: () => initialized && !failed
  };
})();
window.ThreeArenaEngine = ThreeArenaEngine;

// ============================================================================
// 2D TACTICAL HUD OVERLAY & ADDITIVE VFX LAYER (Drawn on transparent #gameCanvas)
// ============================================================================
function renderInWorldGuardRing(vw, vh, isP2Pov) {
  if (!state.inWorldRingEnabled) return;
  const cx = vw * 0.5;
  const cy = vh * 0.46;
  const radius = Math.min(vw, vh) * 0.155;
  const wType = state.selectedWeapon;
  const myQuad = isP2Pov ? state.aiQuadrant : state.quadrant;
  const oppAction = isP2Pov ? state.playerAction : state.aiAction;
  const oppAttackQuad = isP2Pov ? state.quadrant : state.aiAttackQuad;
  const oppGuardQuad = isP2Pov ? state.quadrant : state.aiQuadrant;

  const isOppThreat = (
    oppAction === Action.PREP ||
    oppAction === Action.FEINT1 ||
    oppAction === Action.FEINT2 ||
    oppAction === Action.COUPE ||
    oppAction === Action.LUNGE
  );
  const isFeint = (oppAction === Action.FEINT1 || oppAction === Action.FEINT2 || oppAction === Action.COUPE);

  const sectors = wType === WeaponId.SABRE
    ? [
        { q: Quadrant.NW, a0: -Math.PI * 0.78, a1: -Math.PI * 0.22 },
        { q: Quadrant.NE, a0: -Math.PI * 0.18, a1:  Math.PI * 0.22 },
        { q: Quadrant.SE, a0:  Math.PI * 0.26, a1:  Math.PI * 0.74 },
        { q: Quadrant.SW, a0:  Math.PI * 0.78, a1:  Math.PI * 1.18 }
      ]
    : [
        { q: Quadrant.NW, a0: -Math.PI * 0.94, a1: -Math.PI * 0.54 },
        { q: Quadrant.NE, a0: -Math.PI * 0.46, a1: -Math.PI * 0.06 },
        { q: Quadrant.SE, a0:  Math.PI * 0.06, a1:  Math.PI * 0.46 },
        { q: Quadrant.SW, a0:  Math.PI * 0.54, a1:  Math.PI * 0.94 }
      ];

  ctx.save();
  const pulse = 0.65 + 0.35 * Math.sin(performance.now() * 0.025);
  for (const sec of sectors) {
    const isMyActive = myQuad === sec.q;
    const isThreatSector = isOppThreat && oppAttackQuad === sec.q;
    const isOppPassive = !isOppThreat && oppGuardQuad === sec.q;

    let strokeCol = 'rgba(148, 163, 184, 0.20)';
    let width = 3.5;

    if (isThreatSector) {
      strokeCol = isFeint ? `rgba(250, 204, 21, ${0.88 * pulse})` : 'rgba(244, 63, 94, 0.96)';
      width = isFeint ? 6.5 : 9.2;
    } else if (isMyActive) {
      strokeCol = isP2Pov ? 'rgba(251, 113, 133, 0.85)' : WEAPON_CHANNELS[wType].bladeColor;
      width = 6.5;
    } else if (isOppPassive) {
      strokeCol = 'rgba(244, 63, 94, 0.34)';
      width = 4.2;
    }

    ctx.strokeStyle = strokeCol;
    ctx.lineWidth = width;
    ctx.lineCap = 'butt';
    ctx.beginPath();
    ctx.arc(cx, cy, radius, sec.a0, sec.a1);
    ctx.stroke();

    if (isMyActive && isThreatSector && !isFeint) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4.0;
      ctx.beginPath();
      ctx.arc(cx, cy, radius - 9, sec.a0, sec.a1);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function renderViewportReticle(vw, vh, isP2Pov) {
  const wType = state.selectedWeapon;
  const wCfg = WEAPON_CHANNELS[wType];
  const dist = state.aiZ - state.playerZ;
  const myTipX = isP2Pov ? state.p2TipX : state.tipX;
  const myTipY = isP2Pov ? state.p2TipY : state.tipY;
  const myExt = isP2Pov ? state.aiExtension : state.playerExtension;
  const myQuad = isP2Pov ? state.aiQuadrant : state.quadrant;

  const aimX = vw * 0.5 + myTipX * 165;
  const aimY = vh * 0.45 + myTipY * 130 - myExt * 42;

  ctx.save();
  const maxReach = (wType === WeaponId.EPEE && myQuad === Quadrant.NE) ? CONSTANTS.EPEE_WRIST_MAX_REACH : wCfg.optimalMax;
  const inRange = dist <= maxReach && dist >= wCfg.minMeasure;
  const reticleColor = dist < wCfg.minMeasure
    ? '#f59e0b'
    : (inRange ? (isP2Pov ? '#fb7185' : wCfg.bladeColor) : 'rgba(148, 163, 184, 0.55)');

  // Project 3D Épée Wrist & Foot Lock-On Brackets directly onto the 3D Fencer's joints!
  if (!isP2Pov && wType === WeaponId.EPEE && ThreeArenaEngine.isActive()) {
    const pts = ThreeArenaEngine.getOpponentTargetScreenCoords(vw, vh);
    if (pts) {
      const wristOpen = dist <= CONSTANTS.EPEE_WRIST_MAX_REACH && dist >= 1.34;
      ctx.save();
      ctx.strokeStyle = wristOpen ? '#fde047' : 'rgba(251, 191, 36, 0.42)';
      ctx.lineWidth = myQuad === Quadrant.NE ? 2.4 : 1.4;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(pts.wristX, pts.wristY, 17, 0, Math.PI * 2);
      ctx.stroke();
      if (wristOpen && myQuad === Quadrant.NE) {
        ctx.fillStyle = '#fde047';
        ctx.font = '800 10px "JetBrains Mono", monospace';
        ctx.fillText('POIGNET 2.74m', pts.wristX + 20, pts.wristY - 6);
      }

      ctx.strokeStyle = dist <= CONSTANTS.EPEE_FOOT_MAX_REACH ? '#fbbf24' : 'rgba(251, 191, 36, 0.34)';
      ctx.lineWidth = myQuad === Quadrant.SE ? 2.4 : 1.3;
      ctx.beginPath();
      ctx.arc(pts.footX, pts.footY, 14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();
    }
  }

  // Foil Point-in-Line Tactical Laser Overlay
  if (!isP2Pov && wType === WeaponId.FOIL && state.pointInLineActive) {
    ctx.save();
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(aimX, aimY);
    ctx.lineTo(vw * 0.5, vh * 0.44);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#22d3ee';
    ctx.font = '800 10px "JetBrains Mono", monospace';
    ctx.fillText('⚡ POINTE EN LIGNE', aimX + 16, aimY - 8);
    ctx.restore();
  }

  ctx.strokeStyle = reticleColor;
  ctx.lineWidth = 2.2;
  if (wType === WeaponId.SABRE) {
    ctx.beginPath();
    if (myQuad === Quadrant.NW) {
      ctx.moveTo(aimX - 26, aimY - 9);
      ctx.lineTo(aimX + 26, aimY - 9);
      ctx.moveTo(aimX, aimY - 20);
      ctx.lineTo(aimX, aimY + 12);
    } else {
      ctx.arc(aimX, aimY, inRange ? 20 : 14, -0.65, 0.65);
      ctx.moveTo(aimX - 18, aimY + 10);
      ctx.lineTo(aimX - 5, aimY - 10);
    }
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.arc(aimX, aimY, inRange ? 17 : 11, 0, Math.PI * 2);
    ctx.stroke();
    if (inRange) {
      ctx.beginPath();
      ctx.arc(aimX, aimY, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = reticleColor;
      ctx.fill();
    }
  }

  // Live 3D Blade Leverage & FIE Lockout Micro-Telemetry beside Reticle!
  if (!isP2Pov && state.lockoutActive) {
    const remMs = Math.max(0, Math.round(state.lockoutTimer * 1000));
    ctx.font = '800 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`⚡ FIE LOCK ${remMs}ms`, aimX + 22, aimY - 12);
  } else if (!isP2Pov && state.bladeBindActive) {
    const isStrong = state.bindLeverage >= 1.15;
    ctx.font = '800 10px "JetBrains Mono", monospace';
    ctx.fillStyle = isStrong ? '#38bdf8' : '#fbbf24';
    const tag = isStrong ? `FORTE ${state.bindLeverage.toFixed(1)}x` : `FER ${state.bindLeverage.toFixed(1)}x`;
    ctx.fillText(tag, aimX + 22, aimY + 18);
  } else if (!isP2Pov && state.playerAction === Action.RECOVERY && state.remiseCooldown <= 0) {
    ctx.font = '800 9px "JetBrains Mono", monospace';
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText('LMB · REMISE 补刺', aimX + 20, aimY + 20);
  }
  ctx.restore();
}

function renderScene() {
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Decay paused showcase VFX smoothly
  if (state.paused) {
    if (state.showcaseWeaponPulse > 0) state.showcaseWeaponPulse = Math.max(0, state.showcaseWeaponPulse - 0.035);
    if (state.aiExtension > 0) state.aiExtension = Math.max(0, state.aiExtension - 0.035);
    if (state.p2SabreSlashPhase > 0) state.p2SabreSlashPhase = Math.max(0, state.p2SabreSlashPhase - 0.04);
    if (state.camShake > 0) state.camShake = Math.max(0, state.camShake - 0.03);
    for (let i = state.shockwaves.length - 1; i >= 0; i--) {
      const sw = state.shockwaves[i];
      sw.life -= 0.016;
      const prog = 1 - Math.max(0, sw.life / sw.maxLife);
      sw.r = 10 + (sw.maxR - 10) * (1 - Math.pow(1 - prog, 3));
      if (sw.life <= 0) state.shockwaves.splice(i, 1);
    }
    for (let i = state.sparks.length - 1; i >= 0; i--) {
      const sp = state.sparks[i];
      sp.px = sp.x; sp.py = sp.y;
      sp.x += sp.vx * 0.016; sp.y += sp.vy * 0.016;
      sp.vy += 720 * 0.016; sp.life -= 0.016;
      if (sp.life <= 0) state.sparks.splice(i, 1);
    }
  }

  const usedWebGL = ThreeArenaEngine.renderWebGLFrame();

  // Offline / Headless Non-WebGL Backdrop Fallback (only if THREE is absent)
  if (!usedWebGL) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#040915');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#020617');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);
  }

  const isMenuOpen = state.paused && DOM.modalOverlay && !DOM.modalOverlay.classList.contains('hidden') && state.gameMode !== GameMode.SPLIT_2P;

  if (state.gameMode === GameMode.SPLIT_2P && !isMenuOpen) {
    // Left P1 Tactical Ring & Reticle
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, w * 0.5, h); ctx.clip();
    renderInWorldGuardRing(w * 0.5, h, false);
    renderViewportReticle(w * 0.5, h, false);
    ctx.restore();

    // Right P2 Tactical Ring & Reticle
    ctx.save();
    ctx.beginPath(); ctx.rect(w * 0.5, 0, w * 0.5, h); ctx.clip();
    ctx.translate(w * 0.5, 0);
    renderInWorldGuardRing(w * 0.5, h, true);
    renderViewportReticle(w * 0.5, h, true);
    ctx.restore();

    // Split-Screen Center Divider
    ctx.save();
    const divGrad = ctx.createLinearGradient(0, 0, 0, h);
    divGrad.addColorStop(0, '#0284c7');
    divGrad.addColorStop(0.5, '#38bdf8');
    divGrad.addColorStop(1, '#f43f5e');
    ctx.strokeStyle = divGrad;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.5, h);
    ctx.stroke();

    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = 'rgba(16, 185, 129, 0.88)';
    ctx.fillText('P1 · GAUCHE (WASD + MOUSE)', 14, h - 18);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.88)';
    ctx.textAlign = 'right';
    ctx.fillText('P2 · DROITE (ARROWS + IJKL + ENTER)', w - 14, h - 18);
    ctx.restore();
  } else if (state.replayActive && !isMenuOpen) {
    // FIE TV Official 3D Slow-Motion Replay Broadcast Frame & Scrubber Bar!
    ctx.save();
    ctx.strokeStyle = 'rgba(251, 191, 36, 0.55)';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 66, w - 36, h - 138);

    // Top-left Live REC / RALENTI badge
    ctx.fillStyle = 'rgba(2, 6, 23, 0.86)';
    ctx.fillRect(30, 78, 290, 44);
    ctx.fillStyle = '#f43f5e';
    if (Math.sin(performance.now() * 0.012) > -0.3) {
      ctx.beginPath();
      ctx.arc(46, 100, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }
    const impIdxHud = state.replayImpactIndex >= 0 ? state.replayImpactIndex : Math.max(0, state.replayFrames.length - 8);
    const distHud = Math.abs(state.replayCursor - impIdxHud);
    const speedTag = distHud <= 7 ? '0.20x IMPACT' : (distHud <= 15 ? '0.33x LUNGE' : '0.48x APPROCHE');
    const lampLit = state.replayCursor >= impIdxHud - 1;

    ctx.font = 'italic 900 18px "Barlow Condensed", sans-serif';
    ctx.fillStyle = '#fde047';
    ctx.fillText(`RALENTI OFFICIEL 3D // ${speedTag}`, 60, 98);
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = lampLit ? (state.lastPointColor || '#34d399') : '#cbd5e1';
    ctx.fillText(lampLit ? '● TOUCHÉ ENREGISTRÉ · CLICK / SPACE 跳过' : 'CLICK / SPACE 跳过回放 · [R] 重播本剑', 60, 114);

    // Top-right Olympic Broadcast Biomechanical Telemetry Readout (Measure, Tip Velocity & Extension %)
    if (state.replayFrames.length >= 2) {
      const rIdx = Math.min(state.replayFrames.length - 1, Math.max(1, Math.floor(state.replayCursor)));
      const rfCurr = state.replayFrames[rIdx];
      const rfPrev = state.replayFrames[rIdx - 1];
      const repDist = Math.max(0, rfCurr.p2Z - rfCurr.p1Z);
      const peakExtPct = Math.round(Math.max(rfCurr.p1Ext || 0, rfCurr.p2Ext || 0) * 100);
      const dExt = Math.max(Math.abs((rfCurr.p1Ext || 0) - (rfPrev.p1Ext || 0)), Math.abs((rfCurr.p2Ext || 0) - (rfPrev.p2Ext || 0)));
      const dBody = Math.max(Math.abs((rfCurr.p1Z || 0) - (rfPrev.p1Z || 0)), Math.abs((rfCurr.p2Z || 0) - (rfPrev.p2Z || 0)));
      const tipSpeedMs = Math.min(18.8, 1.8 + (dExt * 0.92 + dBody) * 60 * 0.85);

      const teleW = 286;
      const teleX = w - teleW - 30;
      ctx.fillStyle = 'rgba(2, 6, 23, 0.86)';
      ctx.fillRect(teleX, 78, teleW, 44);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '700 10px "JetBrains Mono", monospace';
      ctx.fillText(`DISTANCE D'ASSAUT: ${repDist.toFixed(2)}m`, teleX + 12, 95);
      ctx.fillStyle = '#fde047';
      ctx.fillText(`POINTE: ${tipSpeedMs.toFixed(1)} m/s · ALLONGEMENT: ${peakExtPct}%`, teleX + 12, 113);
    }

    // Replay Timeline Progress Bar (with golden impact tick!)
    const startIdx = Math.max(0, state.replayFrames.length - 56);
    const denom = Math.max(1, state.replayFrames.length - 1 - startIdx);
    const prog = Math.max(0, Math.min(1, (state.replayCursor - startIdx) / denom));
    const barW = Math.min(360, w * 0.42);
    const barX = (w - barW) * 0.5;
    const barY = h - 84;
    ctx.fillStyle = 'rgba(2, 6, 23, 0.85)';
    ctx.fillRect(barX - 10, barY - 22, barW + 20, 34);
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'center';
    ctx.fillText(state.replaySummaryText || 'GRAND PALAIS PISTE CAMERA', w * 0.5, barY - 8);
    ctx.fillStyle = 'rgba(51, 65, 85, 0.9)';
    ctx.fillRect(barX, barY, barW, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(barX, barY, barW * prog, 4);
    ctx.restore();
  } else if (!isMenuOpen) {
    renderInWorldGuardRing(w, h, false);
    renderViewportReticle(w, h, false);
  }

  // Additive Neon Glow Pass for Sabre Slash Ribbons, Sparks & Shockwaves
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (const sr of state.slashRibbons) {
    const alpha = Math.max(0, sr.life / sr.maxLife);
    const dx = sr.x2 - sr.x1;
    const dy = sr.y2 - sr.y1;
    const midX = (sr.x1 + sr.x2) * 0.5 + dy * 0.28;
    const midY = (sr.y1 + sr.y2) * 0.5 - Math.abs(dx) * 0.22 - 38;
    const innerMidX = (sr.x1 + sr.x2) * 0.5 + dy * 0.10;
    const innerMidY = (sr.y1 + sr.y2) * 0.5 - Math.abs(dx) * 0.08 - 12;

    const waveGrad = ctx.createLinearGradient(sr.x1, sr.y1, sr.x2, sr.y2);
    waveGrad.addColorStop(0, 'rgba(251, 146, 60, 0.0)');
    waveGrad.addColorStop(0.45, sr.color === '#fb7185' ? `rgba(244, 63, 94, ${alpha * 0.56})` : `rgba(251, 146, 60, ${alpha * 0.56})`);
    waveGrad.addColorStop(1, `rgba(254, 240, 138, ${alpha * 0.85})`);

    ctx.fillStyle = waveGrad;
    ctx.beginPath();
    ctx.moveTo(sr.x1, sr.y1);
    ctx.quadraticCurveTo(midX, midY, sr.x2, sr.y2);
    ctx.quadraticCurveTo(innerMidX, innerMidY, sr.x1, sr.y1);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = sr.color;
    ctx.globalAlpha = alpha * 0.80;
    ctx.lineWidth = 18 * alpha;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sr.x1, sr.y1);
    ctx.quadraticCurveTo(midX, midY, sr.x2, sr.y2);
    ctx.stroke();

    ctx.strokeStyle = '#fffbeb';
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 5.5 * alpha;
    ctx.beginPath();
    ctx.moveTo(sr.x1, sr.y1);
    ctx.quadraticCurveTo(midX, midY, sr.x2, sr.y2);
    ctx.stroke();
  }

  if (state.sparks.length > 0 && typeof Path2D !== 'undefined') {
    const pathsByColor = {};
    const headsPath = new Path2D();
    for (const sp of state.sparks) {
      if (!pathsByColor[sp.color]) pathsByColor[sp.color] = new Path2D();
      pathsByColor[sp.color].moveTo(sp.px, sp.py);
      pathsByColor[sp.color].lineTo(sp.x, sp.y);
      headsPath.moveTo(sp.x + 1.8, sp.y);
      headsPath.arc(sp.x, sp.y, 1.8, 0, Math.PI * 2);
    }
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.globalAlpha = 0.92;
    for (const col of Object.keys(pathsByColor)) {
      ctx.strokeStyle = col;
      ctx.stroke(pathsByColor[col]);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fill(headsPath);
  }

  for (const sw of state.shockwaves) {
    const alpha = Math.max(0, sw.life / sw.maxLife);
    ctx.strokeStyle = sw.color;
    ctx.globalAlpha = alpha * 0.88;
    ctx.lineWidth = Math.max(1.5, 6.5 * alpha);
    ctx.beginPath();
    ctx.arc(sw.x, sw.y, sw.r, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;

  // Radial Action Speed Lines (During Lunges, Perfect Parries & Slow-Mo Kill-Cams)
  if (state.speedLinesAlpha > 0.02) {
    ctx.save();
    const slAlpha = state.speedLinesAlpha * 0.42;
    const cx = w * 0.5;
    const cy = h * 0.46;
    const outerR = Math.hypot(w, h) * 0.62;
    const innerR = Math.min(w, h) * 0.30;
    ctx.strokeStyle = state.slowMoTimer > 0 ? '#fef08a' : '#e2e8f0';
    ctx.globalAlpha = slAlpha;
    for (let i = 0; i < 36; i++) {
      const ang = (i / 36) * Math.PI * 2 + (performance.now() * 0.002);
      const jitter = ((i * 17) % 7) * 0.03;
      const r0 = innerR * (0.92 + jitter);
      ctx.lineWidth = (i % 3 === 0) ? 3.2 : 1.4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
      ctx.lineTo(cx + Math.cos(ang) * outerR, cy + Math.sin(ang) * outerR);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Diagonal Fighting-Game Impact Slash Flash on Clean Touché
  if (state.killCamSlashAlpha > 0.02) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = state.killCamSlashAlpha * 0.80;
    ctx.strokeStyle = state.screenFlashColor === '#f43f5e' ? '#fb7185' : '#34d399';
    ctx.lineWidth = 28 * state.killCamSlashAlpha;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.82);
    ctx.lineTo(w * 0.88, h * 0.16);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8 * state.killCamSlashAlpha;
    ctx.beginPath();
    ctx.moveTo(w * 0.15, h * 0.79);
    ctx.lineTo(w * 0.85, h * 0.19);
    ctx.stroke();
    ctx.restore();
  }

  // Slanted 3D Floating Combat Pop-ups
  if (state.floatingTexts.length > 0) {
    ctx.save();
    for (const ft of state.floatingTexts) {
      const prog = 1 - (ft.life / ft.maxLife);
      const alpha = prog < 0.75 ? 1 : Math.max(0, (1 - prog) / 0.25);
      const scale = prog < 0.14 ? (0.65 + (prog / 0.14) * 0.55) : (1.20 - Math.min(0.20, (prog - 0.14) * 0.3));
      ctx.save();
      ctx.translate(ft.x, ft.y);
      ctx.scale(scale, scale);
      ctx.rotate(-0.07);
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';

      ctx.font = 'italic 900 31px "Barlow Condensed", sans-serif';
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'rgba(2, 6, 23, 0.96)';
      ctx.strokeText(ft.text, 0, 0);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      if (ft.subText) {
        ctx.font = '800 11px "JetBrains Mono", monospace';
        ctx.lineWidth = 3.5;
        ctx.strokeText(ft.subText, 0, 17);
        ctx.fillStyle = '#f8fafc';
        ctx.fillText(ft.subText, 0, 17);
      }
      ctx.restore();
    }
    ctx.restore();
  }

  if (state.screenFlash > 0) {
    ctx.save();
    ctx.fillStyle = state.screenFlashColor;
    ctx.globalAlpha = state.screenFlash;
    if (state.gameMode === GameMode.SPLIT_2P && state.screenFlashColor === '#10b981') {
      ctx.fillRect(0, 0, w * 0.5, h);
    } else if (state.gameMode === GameMode.SPLIT_2P && state.screenFlashColor === '#f43f5e') {
      ctx.fillRect(w * 0.5, 0, w * 0.5, h);
    } else {
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }
}
