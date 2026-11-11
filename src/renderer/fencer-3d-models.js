// Module 7A: Parametric Anatomical 3D Fencer Sculptor, Procedural PBR Textures, 3-Weapon Museum Hilts & Grand Palais 3D Arena (Three.js r128)

const Fencing3DAssets = (() => {
  const _HAS_T = typeof THREE !== 'undefined';
  let _cachedTextures = null;

  function makeCanvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    return c;
  }

  function applyTexSettings(tex, repeatX = 1, repeatY = 1, isSRGB = true) {
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX, repeatY);
    if (isSRGB && THREE.sRGBEncoding) {
      tex.encoding = THREE.sRGBEncoding;
    }
    tex.needsUpdate = true;
    return tex;
  }

  function getProceduralPBRTextures() {
    if (_cachedTextures) return _cachedTextures;

    // 1. Matte Antireflective 1600N Black-Steel Wire Mesh Faceplate Texture + Bump
    const maskDiffC = makeCanvas(256, 256);
    const mctx = maskDiffC.getContext('2d');
    const mg = mctx.createRadialGradient(128, 118, 14, 128, 128, 132);
    mg.addColorStop(0, '#1e293b');
    mg.addColorStop(0.55, '#0f172a');
    mg.addColorStop(1, '#020617');
    mctx.fillStyle = mg;
    mctx.fillRect(0, 0, 256, 256);

    // Subtle athlete brow/eyes glint behind dark steel wire mesh
    mctx.fillStyle = 'rgba(226, 232, 240, 0.13)';
    mctx.beginPath();
    mctx.ellipse(98, 110, 17, 6, -0.06, 0, Math.PI * 2);
    mctx.ellipse(158, 110, 17, 6, 0.06, 0, Math.PI * 2);
    mctx.fill();

    mctx.strokeStyle = 'rgba(148, 163, 184, 0.34)';
    mctx.lineWidth = 1.1;
    for (let i = -256; i < 512; i += 6) {
      mctx.beginPath();
      mctx.moveTo(i, 0);
      mctx.lineTo(i + 256, 256);
      mctx.stroke();
      mctx.beginPath();
      mctx.moveTo(i + 256, 0);
      mctx.lineTo(i, 256);
      mctx.stroke();
    }
    const spineG = mctx.createLinearGradient(122, 0, 134, 0);
    spineG.addColorStop(0, 'rgba(255,255,255,0)');
    spineG.addColorStop(0.5, 'rgba(226, 232, 240, 0.32)');
    spineG.addColorStop(1, 'rgba(255,255,255,0)');
    mctx.fillStyle = spineG;
    mctx.fillRect(120, 0, 16, 256);

    const maskBumpC = makeCanvas(128, 128);
    const mbctx = maskBumpC.getContext('2d');
    mbctx.fillStyle = '#262626';
    mbctx.fillRect(0, 0, 128, 128);
    mbctx.strokeStyle = '#d4d4d8';
    mbctx.lineWidth = 1.2;
    for (let i = -128; i < 256; i += 5) {
      mbctx.beginPath();
      mbctx.moveTo(i, 0);
      mbctx.lineTo(i + 128, 128);
      mbctx.stroke();
      mbctx.beginPath();
      mbctx.moveTo(i + 128, 0);
      mbctx.lineTo(i, 128);
      mbctx.stroke();
    }

    // 2. 800N FIE Piqué White Kevlar Uniform Weave Texture + Bump
    const kevC = makeCanvas(256, 256);
    const kctx = kevC.getContext('2d');
    kctx.fillStyle = '#f4f7fb';
    kctx.fillRect(0, 0, 256, 256);
    kctx.fillStyle = '#e6ecf5';
    for (let y = 0; y < 256; y += 4) {
      for (let x = (y % 8 === 0 ? 0 : 2); x < 256; x += 4) {
        kctx.fillRect(x, y, 2, 2);
      }
    }
    kctx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
    kctx.lineWidth = 1;
    for (let i = -256; i < 512; i += 8) {
      kctx.beginPath();
      kctx.moveTo(i, 0);
      kctx.lineTo(i + 256, 256);
      kctx.stroke();
    }

    // 3. Metallic Brocade Conductive Lamé Weave (Foil Silver-Nickel & Sabre Champagne-Steel)
    const lameFoilC = makeCanvas(256, 256);
    const lfctx = lameFoilC.getContext('2d');
    const lfg = lfctx.createLinearGradient(0, 0, 256, 256);
    lfg.addColorStop(0, '#94a3b8');
    lfg.addColorStop(0.5, '#cbd5e1');
    lfg.addColorStop(1, '#64748b');
    lfctx.fillStyle = lfg;
    lfctx.fillRect(0, 0, 256, 256);
    lfctx.strokeStyle = 'rgba(224, 242, 254, 0.44)';
    lfctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 3) {
      lfctx.beginPath();
      lfctx.moveTo(0, y);
      lfctx.lineTo(256, y + (y % 6 === 0 ? 2 : -2));
      lfctx.stroke();
    }

    const lameSabreC = makeCanvas(256, 256);
    const lsctx = lameSabreC.getContext('2d');
    const lsg = lsctx.createLinearGradient(0, 0, 256, 256);
    lsg.addColorStop(0, '#a8a29e');
    lsg.addColorStop(0.5, '#e7e5e4');
    lsg.addColorStop(1, '#78716c');
    lsctx.fillStyle = lsg;
    lsctx.fillRect(0, 0, 256, 256);
    lsctx.strokeStyle = 'rgba(254, 215, 170, 0.44)';
    lsctx.lineWidth = 1;
    for (let y = 0; y < 256; y += 3) {
      lsctx.beginPath();
      lsctx.moveTo(0, y);
      lsctx.lineTo(256, y);
      lsctx.stroke();
    }

    // 4. Grounded Metallic Piste Surface with Official FIE Markings
    const pisteC = makeCanvas(512, 2048);
    const pctx = pisteC.getContext('2d');
    const pg = pctx.createLinearGradient(0, 0, 512, 0);
    pg.addColorStop(0, '#1e293b');
    pg.addColorStop(0.12, '#334155');
    pg.addColorStop(0.5, '#475569');
    pg.addColorStop(0.88, '#334155');
    pg.addColorStop(1, '#1e293b');
    pctx.fillStyle = pg;
    pctx.fillRect(0, 0, 512, 2048);

    pctx.strokeStyle = 'rgba(203, 213, 225, 0.14)';
    pctx.lineWidth = 1;
    for (let y = 0; y < 2048; y += 4) {
      pctx.beginPath();
      pctx.moveTo(16, y);
      pctx.lineTo(496, y);
      pctx.stroke();
    }
    pctx.fillStyle = 'rgba(248, 250, 252, 0.06)';
    pctx.fillRect(216, 0, 80, 2048);

    const zToY = (z) => ((z + 7) / 14) * 2048;
    pctx.fillStyle = 'rgba(244, 63, 94, 0.20)';
    pctx.fillRect(20, zToY(-7), 472, zToY(-5) - zToY(-7));
    pctx.fillRect(20, zToY(5), 472, zToY(7) - zToY(5));

    const drawPisteLine = (zMeters, color, pxThick) => {
      const yy = zToY(zMeters);
      pctx.fillStyle = color;
      pctx.fillRect(18, yy - pxThick * 0.5, 476, pxThick);
    };
    drawPisteLine(0, '#fbbf24', 10);
    drawPisteLine(-2, '#38bdf8', 8);
    drawPisteLine(2, '#38bdf8', 8);
    drawPisteLine(-5, '#f43f5e', 7);
    drawPisteLine(5, '#f43f5e', 7);
    drawPisteLine(-6.85, '#ffffff', 9);
    drawPisteLine(6.85, '#ffffff', 9);

    pctx.fillStyle = 'rgba(248, 250, 252, 0.80)';
    pctx.fillRect(14, 0, 8, 2048);
    pctx.fillRect(490, 0, 8, 2048);

    _cachedTextures = {
      maskMap: applyTexSettings(new THREE.CanvasTexture(maskDiffC), 1, 1, true),
      maskBump: applyTexSettings(new THREE.CanvasTexture(maskBumpC), 2, 2, false),
      kevlarMap: applyTexSettings(new THREE.CanvasTexture(kevC), 3, 3, true),
      kevlarBump: applyTexSettings(new THREE.CanvasTexture(kevC), 4, 4, false),
      lameFoilMap: applyTexSettings(new THREE.CanvasTexture(lameFoilC), 3, 3, true),
      lameSabreMap: applyTexSettings(new THREE.CanvasTexture(lameSabreC), 3, 3, true),
      pisteMap: applyTexSettings(new THREE.CanvasTexture(pisteC), 1, 1, true)
    };
    return _cachedTextures;
  }

  function buildSculptedLoftGeometry(slices, radialSegs = 28, capBottom = true, capTop = true) {
    const ringCount = slices.length;
    const stride = radialSegs + 1;
    const positions = [];
    const uvs = [];
    const indices = [];

    for (let i = 0; i < ringCount; i++) {
      const s = slices[i];
      const ox = s.ox || 0;
      const oz = s.oz || 0;
      const frontS = s.frontScale !== undefined ? s.frontScale : 1.0;
      const backS = s.backScale !== undefined ? s.backScale : 1.0;
      const v = i / Math.max(1, ringCount - 1);

      for (let j = 0; j <= radialSegs; j++) {
        const u = j / radialSegs;
        const theta = u * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const asymZ = sinT >= 0 ? frontS : backS;
        positions.push(ox + cosT * s.rx, s.y, oz + sinT * s.rz * asymZ);
        uvs.push(u, v);
      }
    }

    for (let i = 0; i < ringCount - 1; i++) {
      for (let j = 0; j < radialSegs; j++) {
        const a = i * stride + j;
        const b = (i + 1) * stride + j;
        const c = (i + 1) * stride + (j + 1);
        const d = i * stride + (j + 1);
        indices.push(a, b, c, a, c, d);
      }
    }

    if (capBottom && slices[0].rx > 0.001) {
      const s0 = slices[0];
      const cIdx = positions.length / 3;
      positions.push(s0.ox || 0, s0.y, s0.oz || 0);
      uvs.push(0.5, 0);
      for (let j = 0; j < radialSegs; j++) {
        indices.push(cIdx, j, j + 1);
      }
    }

    if (capTop && slices[ringCount - 1].rx > 0.001) {
      const sTop = slices[ringCount - 1];
      const base = (ringCount - 1) * stride;
      const cIdx = positions.length / 3;
      positions.push(sTop.ox || 0, sTop.y, sTop.oz || 0);
      uvs.push(0.5, 1);
      for (let j = 0; j < radialSegs; j++) {
        indices.push(cIdx, base + j + 1, base + j);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }

  function createDeformableBladeMesh(weaponType, mat) {
    const stations = 15;
    const ringVerts = 6;
    const positions = new Float32Array(stations * ringVerts * 3);
    const indices = [];

    for (let i = 0; i < stations - 1; i++) {
      for (let j = 0; j < ringVerts; j++) {
        const nextJ = (j + 1) % ringVerts;
        const a = i * ringVerts + j;
        const b = (i + 1) * ringVerts + j;
        const c = (i + 1) * ringVerts + nextJ;
        const d = i * ringVerts + nextJ;
        indices.push(a, b, c, a, c, d);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4.0);

    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.castShadow = true;

    const tipMat = new THREE.MeshStandardMaterial({
      color: weaponType === 'foil' ? 0xef4444 : (weaponType === 'epee' ? 0xfbbf24 : 0xf8fafc),
      emissive: weaponType === 'foil' ? 0x991b1b : (weaponType === 'epee' ? 0x92400e : 0x475569),
      emissiveIntensity: 0.45,
      metalness: 0.78,
      roughness: 0.22
    });
    const tipGeo = new THREE.CylinderGeometry(
      weaponType === 'epee' ? 0.0050 : 0.0036,
      weaponType === 'epee' ? 0.0044 : 0.0030,
      weaponType === 'foil' ? 0.026 : 0.015,
      10
    );
    const tipCap = new THREE.Mesh(tipGeo, tipMat);
    tipCap.frustumCulled = false;

    return { mesh, tipCap, stations, ringVerts, weaponType };
  }

  const _tmpP = _HAS_T ? new THREE.Vector3() : null;
  const _tmpT = _HAS_T ? new THREE.Vector3() : null;
  const _tmpUp = _HAS_T ? new THREE.Vector3(0, 1, 0) : null;
  const _tmpRight = _HAS_T ? new THREE.Vector3() : null;
  const _tmpNorm = _HAS_T ? new THREE.Vector3() : null;
  const _tmpQuat = _HAS_T ? new THREE.Quaternion() : null;

  function updateDeformableBlade(bladeObj, p0, p1, p2) {
    const { mesh, tipCap, stations, ringVerts, weaponType } = bladeObj;
    const posAttr = mesh.geometry.attributes.position;
    const arr = posAttr.array;

    const baseHalfW = weaponType === 'epee' ? 0.0092 : (weaponType === 'sabre' ? 0.0040 : 0.0055);
    const baseHalfH = weaponType === 'sabre' ? 0.0088 : (weaponType === 'epee' ? 0.0070 : 0.0045);

    for (let i = 0; i < stations; i++) {
      const t = i / (stations - 1);
      const inv = 1 - t;
      _tmpP.set(
        inv * inv * p0.x + 2 * inv * t * p1.x + t * t * p2.x,
        inv * inv * p0.y + 2 * inv * t * p1.y + t * t * p2.y,
        inv * inv * p0.z + 2 * inv * t * p1.z + t * t * p2.z
      );
      _tmpT.set(
        2 * inv * (p1.x - p0.x) + 2 * t * (p2.x - p1.x),
        2 * inv * (p1.y - p0.y) + 2 * t * (p2.y - p1.y),
        2 * inv * (p1.z - p0.z) + 2 * t * (p2.z - p1.z)
      ).normalize();

      _tmpRight.crossVectors(_tmpUp, _tmpT);
      if (_tmpRight.lengthSq() < 0.0001) _tmpRight.set(1, 0, 0);
      else _tmpRight.normalize();
      _tmpNorm.crossVectors(_tmpT, _tmpRight).normalize();

      const taper = 1.0 - t * 0.66;
      const hw = baseHalfW * taper;
      const hh = baseHalfH * taper;

      for (let j = 0; j < ringVerts; j++) {
        const ang = (j / ringVerts) * Math.PI * 2;
        const rx = Math.cos(ang) * hw;
        let ry = Math.sin(ang) * hh;
        if (weaponType === 'epee' && j === 1) ry *= 0.30;
        const idx = (i * ringVerts + j) * 3;
        arr[idx]     = _tmpP.x + _tmpRight.x * rx + _tmpNorm.x * ry;
        arr[idx + 1] = _tmpP.y + _tmpRight.y * rx + _tmpNorm.y * ry;
        arr[idx + 2] = _tmpP.z + _tmpRight.z * rx + _tmpNorm.z * ry;
      }
    }

    posAttr.needsUpdate = true;
    mesh.geometry.computeVertexNormals();

    if (tipCap) {
      tipCap.position.copy(p2);
      _tmpQuat.setFromUnitVectors(_tmpUp, _tmpT);
      tipCap.quaternion.copy(_tmpQuat);
    }
  }

  // 3 Museum-Grade Hilts (Origin 0,0,0 = palm center; +Z = forward toward blade tip!)
  function createThreeWeaponHilts() {
    const steelGuardMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.91,
      roughness: 0.17,
      side: THREE.DoubleSide
    });
    const epeeBrassSteelMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      metalness: 0.89,
      roughness: 0.19,
      side: THREE.DoubleSide
    });
    const sabreChromeMat = new THREE.MeshStandardMaterial({
      color: 0xfed7aa,
      metalness: 0.92,
      roughness: 0.15,
      side: THREE.DoubleSide
    });
    const gripAnodizedMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.55,
      roughness: 0.46
    });
    const padLeatherMat = new THREE.MeshStandardMaterial({
      color: 0x450a0a,
      metalness: 0.06,
      roughness: 0.86,
      side: THREE.DoubleSide
    });

    function buildViscontiGripGroup() {
      const g = new THREE.Group();
      const palmMain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0135, 0.0165, 0.108, 14),
        gripAnodizedMat
      );
      palmMain.rotation.x = Math.PI * 0.45;
      palmMain.position.set(0, -0.010, -0.022);
      g.add(palmMain);

      const lowerProng = new THREE.Mesh(
        new THREE.CylinderGeometry(0.010, 0.007, 0.048, 12),
        gripAnodizedMat
      );
      lowerProng.rotation.x = 0.20;
      lowerProng.position.set(0, -0.042, -0.010);
      g.add(lowerProng);

      const thumbFin = new THREE.Mesh(new THREE.BoxGeometry(0.013, 0.020, 0.032), gripAnodizedMat);
      thumbFin.position.set(-0.008, 0.014, 0.008);
      g.add(thumbFin);

      const pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.0085, 0.024, 12), steelGuardMat);
      pommel.rotation.x = Math.PI * 0.45;
      pommel.position.set(0, -0.020, -0.078);
      g.add(pommel);
      return g;
    }

    // 1. FOIL HILT (11cm shallow dish; recessed interior pad strictly inside rim!)
    const foilHilt = new THREE.Group();
    const foilProfile = [
      new THREE.Vector2(0.006, 0.066),
      new THREE.Vector2(0.028, 0.063),
      new THREE.Vector2(0.046, 0.052),
      new THREE.Vector2(0.055, 0.038),
      new THREE.Vector2(0.053, 0.034)
    ];
    const foilBell = new THREE.Mesh(new THREE.LatheGeometry(foilProfile, 32), steelGuardMat);
    foilBell.rotation.x = Math.PI * 0.5;
    foilHilt.add(foilBell);

    const foilPad = new THREE.Mesh(new THREE.RingGeometry(0.008, 0.041, 24), padLeatherMat);
    foilPad.position.z = 0.037;
    foilHilt.add(foilPad);
    foilHilt.add(buildViscontiGripGroup());

    // 2. ÉPÉE HILT (13.5cm deep eccentric hemispherical bowl; pad recessed cleanly inside!)
    const epeeHilt = new THREE.Group();
    const epeeProfile = [
      new THREE.Vector2(0.006, 0.082),
      new THREE.Vector2(0.036, 0.078),
      new THREE.Vector2(0.058, 0.060),
      new THREE.Vector2(0.069, 0.034),
      new THREE.Vector2(0.070, 0.022),
      new THREE.Vector2(0.067, 0.018)
    ];
    const epeeBell = new THREE.Mesh(new THREE.LatheGeometry(epeeProfile, 36), epeeBrassSteelMat);
    epeeBell.rotation.x = Math.PI * 0.5;
    epeeBell.position.set(0.010, 0.003, 0);
    epeeHilt.add(epeeBell);

    const epeePad = new THREE.Mesh(new THREE.RingGeometry(0.009, 0.050, 28), padLeatherMat);
    epeePad.position.set(0.010, 0.003, 0.024);
    epeeHilt.add(epeePad);

    const socketBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.020, 0.016, 0.016),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.4, roughness: 0.5 })
    );
    socketBlock.position.set(-0.012, 0.014, 0.034);
    epeeHilt.add(socketBlock);
    epeeHilt.add(buildViscontiGripGroup());

    // 3. SABRE HILT (Asymmetric Dish + Swept 3D Knuckle-Bow Branche)
    const sabreHilt = new THREE.Group();
    const sabreProfile = [
      new THREE.Vector2(0.006, 0.072),
      new THREE.Vector2(0.034, 0.068),
      new THREE.Vector2(0.054, 0.052),
      new THREE.Vector2(0.061, 0.033)
    ];
    const sabreDish = new THREE.Mesh(new THREE.LatheGeometry(sabreProfile, 30, -0.6, Math.PI * 1.45), sabreChromeMat);
    sabreDish.rotation.x = Math.PI * 0.5;
    sabreDish.position.set(0.008, 0, 0);
    sabreHilt.add(sabreDish);

    const bowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.010, 0.042, 0.056),
      new THREE.Vector3(0.058, 0.016, 0.036),
      new THREE.Vector3(0.062, -0.022, -0.018),
      new THREE.Vector3(0.032, -0.030, -0.074),
      new THREE.Vector3(0.000, -0.006, -0.095)
    ]);
    const bowTube = new THREE.Mesh(new THREE.TubeGeometry(bowCurve, 24, 0.0065, 10, false), sabreChromeMat);
    sabreHilt.add(bowTube);

    const sabreGrip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.016, 0.124, 14),
      new THREE.MeshStandardMaterial({ color: 0x1c1917, metalness: 0.25, roughness: 0.72 })
    );
    sabreGrip.rotation.x = Math.PI * 0.5;
    sabreGrip.position.set(0, -0.004, -0.028);
    sabreHilt.add(sabreGrip);

    const sabrePommel = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.011, 0.022, 14), sabreChromeMat);
    sabrePommel.rotation.x = Math.PI * 0.5;
    sabrePommel.position.set(0, -0.006, -0.096);
    sabreHilt.add(sabrePommel);

    return { foilHilt, epeeHilt, sabreHilt };
  }

  function createSculptedFencerRig(isP1 = false) {
    const tex = getProceduralPBRTextures();
    const root = new THREE.Group();

    const kevlarMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      map: tex.kevlarMap,
      bumpMap: tex.kevlarBump,
      bumpScale: 0.006,
      roughness: 0.52,
      metalness: 0.06
    });

    const breechesMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      map: tex.kevlarMap,
      bumpMap: tex.kevlarBump,
      bumpScale: 0.005,
      roughness: 0.56,
      metalness: 0.05
    });

    const foilLameMat = new THREE.MeshStandardMaterial({
      color: isP1 ? 0xbae6fd : 0xcbd5e1,
      map: tex.lameFoilMap,
      bumpMap: tex.lameFoilMap,
      bumpScale: 0.005,
      metalness: 0.82,
      roughness: 0.25,
      emissive: isP1 ? 0x059669 : 0x0284c7,
      emissiveIntensity: 0.14
    });

    const sabreLameMat = new THREE.MeshStandardMaterial({
      color: 0xe7e5e4,
      map: tex.lameSabreMap,
      bumpMap: tex.lameSabreMap,
      bumpScale: 0.005,
      metalness: 0.85,
      roughness: 0.23,
      emissive: 0xc2410c,
      emissiveIntensity: 0.15
    });

    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.44,
      metalness: 0.12
    });

    const darkTrimMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.40,
      metalness: 0.36
    });

    const stripeAccentMat = new THREE.MeshStandardMaterial({
      color: isP1 ? 0x10b981 : 0xf43f5e,
      emissive: isP1 ? 0x065f46 : 0x881337,
      emissiveIntensity: 0.35,
      roughness: 0.30,
      metalness: 0.40
    });

    // 1. Pelvis Brief & Sculpted Torso Hierarchy
    const pelvisGroup = new THREE.Group();
    root.add(pelvisGroup);

    // Organic Pelvic Hip Brief bridging lower torso cleanly into both thigh sockets!
    const pelvisBriefSlices = [
      { y: -0.10, rx: 0.132, rz: 0.098, frontScale: 0.98, backScale: 1.12 },
      { y: -0.04, rx: 0.162, rz: 0.114, frontScale: 0.98, backScale: 1.12 },
      { y:  0.03, rx: 0.156, rz: 0.108, frontScale: 1.00, backScale: 1.06 }
    ];
    const pelvisBriefMesh = new THREE.Mesh(buildSculptedLoftGeometry(pelvisBriefSlices, 28), breechesMat);
    pelvisBriefMesh.castShadow = true;
    pelvisGroup.add(pelvisBriefMesh);

    const torsoGroup = new THREE.Group();
    pelvisGroup.add(torsoGroup);

    const torsoSlices = [
      { y: -0.05, rx: 0.138, rz: 0.098, oz: 0.004, frontScale: 1.05, backScale: 1.02 },
      { y:  0.01, rx: 0.158, rz: 0.112, oz: 0.002, frontScale: 1.00, backScale: 1.06 },
      { y:  0.10, rx: 0.140, rz: 0.100, oz: 0.005, frontScale: 1.02, backScale: 0.96 }, // Athletic waist taper
      { y:  0.21, rx: 0.165, rz: 0.116, oz: 0.010, frontScale: 1.08, backScale: 1.02 }, // Ribcage
      { y:  0.32, rx: 0.188, rz: 0.128, oz: 0.012, frontScale: 1.12, backScale: 1.04 }, // Pectoral chest & lats
      { y:  0.40, rx: 0.196, rz: 0.118, oz: 0.005, frontScale: 1.05, backScale: 1.04 }, // Clavicle/deltoid bridge
      { y:  0.46, rx: 0.124, rz: 0.090, oz: 0.004, frontScale: 1.00, backScale: 1.00 }, // Trapezius slope
      { y:  0.52, rx: 0.072, rz: 0.070, oz: 0.005, frontScale: 1.02, backScale: 1.00 }  // High 800N collar
    ];
    const torsoMesh = new THREE.Mesh(buildSculptedLoftGeometry(torsoSlices, 32), kevlarMat);
    torsoMesh.castShadow = true;
    torsoMesh.receiveShadow = true;
    torsoGroup.add(torsoMesh);

    const foilLameSlices = torsoSlices.map(s => ({
      y: s.y,
      rx: s.rx + 0.0045,
      rz: s.rz + 0.0045,
      oz: s.oz,
      frontScale: s.frontScale,
      backScale: s.backScale
    }));
    const foilLameMesh = new THREE.Mesh(buildSculptedLoftGeometry(foilLameSlices, 32, false, false), foilLameMat);
    foilLameMesh.castShadow = true;
    torsoGroup.add(foilLameMesh);

    const sabreTorsoSlices = torsoSlices.filter(s => s.y >= 0.09).map(s => ({
      y: s.y,
      rx: s.rx + 0.0055,
      rz: s.rz + 0.0055,
      oz: s.oz,
      frontScale: s.frontScale,
      backScale: s.backScale
    }));
    const sabreLameTorsoMesh = new THREE.Mesh(buildSculptedLoftGeometry(sabreTorsoSlices, 32, false, false), sabreLameMat);
    sabreLameTorsoMesh.visible = false;
    torsoGroup.add(sabreLameTorsoMesh);

    const waistTrim = new THREE.Mesh(new THREE.TorusGeometry(0.142, 0.005, 8, 28), stripeAccentMat);
    waistTrim.rotation.x = Math.PI * 0.5;
    waistTrim.scale.set(1.04, 0.74, 1);
    waistTrim.position.set(0, 0.092, 0.005);
    torsoGroup.add(waistTrim);

    // 2. Two-Tone Authentic 1600N FIE Fencing Mask:
    // White/Slate Outer Padded Crown Shell + Jet-Dark Antireflective Wire Faceplate + Draped Bib!
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.515, 0.008);
    torsoGroup.add(headGroup);

    // Outer composite padded mask shell (covers crown, temples & back of head)
    const outerShellSlices = [
      { y:  0.00, rx: 0.072, rz: 0.088, oz: -0.014, frontScale: 0.75, backScale: 1.05 },
      { y:  0.07, rx: 0.098, rz: 0.106, oz: -0.016, frontScale: 0.80, backScale: 1.08 },
      { y:  0.15, rx: 0.104, rz: 0.114, oz: -0.014, frontScale: 0.82, backScale: 1.08 },
      { y:  0.22, rx: 0.092, rz: 0.106, oz: -0.010, frontScale: 0.90, backScale: 1.04 },
      { y:  0.265, rx: 0.048, rz: 0.062, oz: -0.008, frontScale: 1.0, backScale: 1.0 }
    ];
    const outerShellMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      map: tex.kevlarMap,
      roughness: 0.45,
      metalness: 0.15
    });
    const outerMaskShell = new THREE.Mesh(buildSculptedLoftGeometry(outerShellSlices, 28), outerShellMat);
    outerMaskShell.castShadow = true;
    headGroup.add(outerMaskShell);

    // Front Dark Gunmetal 1600N Woven Steel Mesh Faceplate (authentic black fencing mask face!)
    const faceMeshSlices = [
      { y: -0.015, rx: 0.056, rz: 0.068, oz: 0.048, frontScale: 1.15, backScale: 0.45 },
      { y:  0.045, rx: 0.086, rz: 0.082, oz: 0.044, frontScale: 1.18, backScale: 0.45 },
      { y:  0.115, rx: 0.096, rz: 0.088, oz: 0.042, frontScale: 1.20, backScale: 0.45 },
      { y:  0.185, rx: 0.090, rz: 0.084, oz: 0.038, frontScale: 1.16, backScale: 0.45 },
      { y:  0.238, rx: 0.068, rz: 0.066, oz: 0.028, frontScale: 1.05, backScale: 0.45 }
    ];
    const faceWireMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      map: tex.maskMap,
      bumpMap: tex.maskBump,
      bumpScale: 0.014,
      metalness: 0.82,
      roughness: 0.28
    });
    const maskCageMesh = new THREE.Mesh(buildSculptedLoftGeometry(faceMeshSlices, 28), faceWireMat);
    maskCageMesh.castShadow = true;
    headGroup.add(maskCageMesh);

    // 3D Perimeter Mask Bezel Rim framing the dark wire faceplate
    const rimBandCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -0.020, 0.118),
      new THREE.Vector3(0.092, 0.055, 0.068),
      new THREE.Vector3(0.096, 0.175, 0.055),
      new THREE.Vector3(0, 0.246, 0.075),
      new THREE.Vector3(-0.096, 0.175, 0.055),
      new THREE.Vector3(-0.092, 0.055, 0.068),
      new THREE.Vector3(0, -0.020, 0.118)
    ]);
    const maskRimMesh = new THREE.Mesh(new THREE.TubeGeometry(rimBandCurve, 36, 0.0085, 10, true), stripeAccentMat);
    headGroup.add(maskRimMesh);

    // Subtle Visor Eye-Line Telemetry Glint on Front Wire Cage
    const visorArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.094, 0.0038, 8, 22, Math.PI * 0.56),
      stripeAccentMat
    );
    visorArc.rotation.x = Math.PI * 0.5;
    visorArc.rotation.z = Math.PI * 0.22;
    visorArc.position.set(0, 0.128, 0.052);
    headGroup.add(visorArc);

    // Draped Quilted Trapezoidal Bib (offset cleanly OVER front of collar, zero Z-clipping!)
    const bibSlices = [
      { y: -0.095, rx: 0.104, rz: 0.032, oz: 0.102, frontScale: 1.15, backScale: 0.45 },
      { y: -0.048, rx: 0.086, rz: 0.030, oz: 0.094, frontScale: 1.15, backScale: 0.45 },
      { y: -0.004, rx: 0.066, rz: 0.028, oz: 0.086, frontScale: 1.10, backScale: 0.45 }
    ];
    const bibMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      map: tex.lameFoilMap,
      metalness: 0.68,
      roughness: 0.34
    });
    const bibMesh = new THREE.Mesh(buildSculptedLoftGeometry(bibSlices, 20), bibMat);
    headGroup.add(bibMesh);

    // 3. Organic Limb Segments with Seamless Joint Ball Caps (Shoulder Deltoid, Elbow, Knee, Ankle!)
    function createLimbSegment(slices, mat, capRadiusBottom = 0, capRadiusTop = 0) {
      const grp = new THREE.Group();
      const mesh = new THREE.Mesh(buildSculptedLoftGeometry(slices, 24), mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      grp.add(mesh);

      let bottomBall = null;
      if (capRadiusBottom > 0) {
        bottomBall = new THREE.Mesh(new THREE.SphereGeometry(capRadiusBottom, 18, 14), mat);
        bottomBall.castShadow = true;
        grp.add(bottomBall);
      }
      if (capRadiusTop > 0) {
        const topBall = new THREE.Mesh(new THREE.SphereGeometry(capRadiusTop, 16, 12), mat);
        topBall.position.y = slices[slices.length - 1].y;
        grp.add(topBall);
      }
      root.add(grp);
      return { grp, mesh, bottomBall };
    }

    const upperArmLen = 0.30;
    const forearmLen = 0.27;
    const thighLen = 0.43;
    const calfLen = 0.41;

    const upperArmSlices = [
      { y: 0.00, rx: 0.060, rz: 0.062 },
      { y: 0.09, rx: 0.054, rz: 0.056, oz: 0.004 },
      { y: 0.21, rx: 0.045, rz: 0.047 },
      { y: 0.30, rx: 0.040, rz: 0.041 }
    ];
    const forearmSlices = [
      { y: 0.00, rx: 0.041, rz: 0.042 },
      { y: 0.07, rx: 0.045, rz: 0.046, oz: 0.003 },
      { y: 0.19, rx: 0.034, rz: 0.035 },
      { y: 0.27, rx: 0.030, rz: 0.031 }
    ];
    const thighSlices = [
      { y: 0.00, rx: 0.088, rz: 0.094 },
      { y: 0.14, rx: 0.084, rz: 0.092, oz: 0.006, frontScale: 1.08 },
      { y: 0.31, rx: 0.066, rz: 0.070, oz: 0.004 },
      { y: 0.43, rx: 0.056, rz: 0.058 }
    ];
    const calfSlices = [
      { y: 0.00, rx: 0.056, rz: 0.058, oz: 0.003 },
      { y: 0.11, rx: 0.055, rz: 0.063, oz: -0.008, backScale: 1.16 },
      { y: 0.28, rx: 0.039, rz: 0.042 },
      { y: 0.41, rx: 0.034, rz: 0.037 }
    ];

    const leadUpperArm = createLimbSegment(upperArmSlices, kevlarMat, 0.064, 0.041);
    const leadForearm  = createLimbSegment(forearmSlices, kevlarMat, 0.042, 0.030);
    const rearUpperArm = createLimbSegment(upperArmSlices, kevlarMat, 0.064, 0.041);
    const rearForearm  = createLimbSegment(forearmSlices, kevlarMat, 0.042, 0.030);

    const leadThigh = createLimbSegment(thighSlices, breechesMat, 0.088, 0.057);
    const leadCalf  = createLimbSegment(calfSlices, kevlarMat, 0.057, 0.036);
    const rearThigh = createLimbSegment(thighSlices, breechesMat, 0.088, 0.057);
    const rearCalf  = createLimbSegment(calfSlices, kevlarMat, 0.057, 0.036);

    // Crisp National Stripe Ring on Lead Thigh & High Fencing Socks
    const thighStripe1 = new THREE.Mesh(new THREE.CylinderGeometry(0.082, 0.077, 0.028, 22, 1, true), stripeAccentMat);
    thighStripe1.position.y = 0.21;
    leadThigh.grp.add(thighStripe1);

    const sockTopBandL = new THREE.Mesh(new THREE.CylinderGeometry(0.057, 0.056, 0.026, 22, 1, true), stripeAccentMat);
    sockTopBandL.position.y = 0.048;
    leadCalf.grp.add(sockTopBandL);

    const sockTopBandR = new THREE.Mesh(new THREE.CylinderGeometry(0.057, 0.056, 0.026, 22, 1, true), stripeAccentMat);
    sockTopBandR.position.y = 0.048;
    rearCalf.grp.add(sockTopBandR);

    // 4. Sculpted Asymmetric Fencing Shoes
    function createFencingShoeGroup() {
      const sg = new THREE.Group();
      const shoeBodySlices = [
        { y: 0.00, rx: 0.046, rz: 0.124, oz: 0.042, frontScale: 1.18, backScale: 0.72 },
        { y: 0.035, rx: 0.048, rz: 0.126, oz: 0.040, frontScale: 1.16, backScale: 0.75 },
        { y: 0.072, rx: 0.040, rz: 0.088, oz: 0.022, frontScale: 1.05, backScale: 0.80 },
        { y: 0.095, rx: 0.035, rz: 0.046, oz: 0.000, frontScale: 1.00, backScale: 1.00 }
      ];
      const upperMesh = new THREE.Mesh(buildSculptedLoftGeometry(shoeBodySlices, 22), darkTrimMat);
      upperMesh.castShadow = true;
      sg.add(upperMesh);

      const soleRim = new THREE.Mesh(
        new THREE.BoxGeometry(0.090, 0.016, 0.230),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.65, metalness: 0.1 })
      );
      soleRim.position.set(0, 0.008, 0.038);
      sg.add(soleRim);

      const chevron = new THREE.Mesh(new THREE.BoxGeometry(0.094, 0.015, 0.062), stripeAccentMat);
      chevron.position.set(0, 0.044, 0.035);
      sg.add(chevron);

      root.add(sg);
      return sg;
    }

    const leadShoe = createFencingShoeGroup();
    const rearShoe = createFencingShoeGroup();

    // 5. Rear Gloved Hand & Lead Forearm-Wrapped Fencing Gauntlet Cuff + Hilts
    const rearHandGroup = new THREE.Group();
    const rearPalm = new THREE.Mesh(
      new THREE.SphereGeometry(0.034, 14, 12),
      kevlarMat
    );
    rearPalm.scale.set(0.82, 1.18, 0.68);
    rearPalm.position.set(0, 0.018, 0);
    rearHandGroup.add(rearPalm);
    root.add(rearHandGroup);

    // Attach padded gauntlet cuff directly along distal leadForearm so it never detaches when wrist bends!
    const cuffProfile = [
      new THREE.Vector2(0.048, 0.13),
      new THREE.Vector2(0.042, 0.20),
      new THREE.Vector2(0.034, 0.268)
    ];
    const gauntletCuff = new THREE.Mesh(new THREE.LatheGeometry(cuffProfile, 22), gloveMat);
    gauntletCuff.castShadow = true;
    leadForearm.grp.add(gauntletCuff);

    const swordHandGroup = new THREE.Group();

    const gloveFist = new THREE.Mesh(new THREE.SphereGeometry(0.040, 16, 14), gloveMat);
    gloveFist.scale.set(0.86, 0.94, 1.12);
    gloveFist.position.set(0.004, -0.006, -0.022);
    swordHandGroup.add(gloveFist);

    const hilts = createThreeWeaponHilts();
    swordHandGroup.add(hilts.foilHilt);
    swordHandGroup.add(hilts.epeeHilt);
    swordHandGroup.add(hilts.sabreHilt);
    root.add(swordHandGroup);

    // 6. Deformable 3D Blades
    const bladeSteelMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.94,
      roughness: 0.14,
      emissive: isP1 ? 0x0ea5e9 : 0xe11d48,
      emissiveIntensity: 0.12
    });
    const blades = {
      foil: createDeformableBladeMesh('foil', bladeSteelMat),
      epee: createDeformableBladeMesh('epee', bladeSteelMat),
      sabre: createDeformableBladeMesh('sabre', bladeSteelMat)
    };

    const tipThreatGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.040, 16, 14),
      new THREE.MeshBasicMaterial({ color: 0xf43f5e, transparent: true, opacity: 0.0 })
    );
    tipThreatGlow.frustumCulled = false;

    return {
      isP1,
      root,
      pelvisGroup,
      torsoGroup,
      headGroup,
      torsoMesh,
      foilLameMesh,
      sabreLameTorsoMesh,
      bibMesh,
      maskRimMesh,
      visorArc,
      kevlarMat,
      foilLameMat,
      sabreLameMat,
      stripeAccentMat,
      leadUpperArm,
      leadForearm,
      rearUpperArm,
      rearForearm,
      leadThigh,
      leadCalf,
      rearThigh,
      rearCalf,
      leadShoe,
      rearShoe,
      rearHandGroup,
      swordHandGroup,
      hilts,
      blades,
      tipThreatGlow,
      lengths: { upperArmLen, forearmLen, thighLen, calfLen }
    };
  }

  // First-Person 3D Arm + Gauntlet + Hilt + Deformable Blade Rig (Sleeve tucked cleanly behind grip!)
  function createFirstPersonWeaponRig(isP2 = false) {
    const tex = getProceduralPBRTextures();
    const rig = new THREE.Group();

    const sleeveMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      map: tex.kevlarMap,
      bumpMap: tex.kevlarBump,
      bumpScale: 0.006,
      roughness: 0.50,
      metalness: 0.08
    });
    const sabreSleeveMat = new THREE.MeshStandardMaterial({
      color: 0xe7e5e4,
      map: tex.lameSabreMap,
      metalness: 0.84,
      roughness: 0.24,
      emissive: 0xc2410c,
      emissiveIntensity: 0.14
    });
    const gloveMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.42,
      metalness: 0.14
    });

    const armGroup = new THREE.Group();
    const forearmSlices = [
      { y: 0.00, rx: 0.052, rz: 0.054 },
      { y: 0.14, rx: 0.045, rz: 0.047 },
      { y: 0.28, rx: 0.035, rz: 0.037 }
    ];
    // Forearm sits strictly behind the gauntlet cuff (z = -0.46 to -0.18)
    const forearmMesh = new THREE.Mesh(buildSculptedLoftGeometry(forearmSlices, 24), sleeveMat);
    forearmMesh.rotation.x = Math.PI * 0.5;
    forearmMesh.position.set(0, -0.012, -0.46);
    armGroup.add(forearmMesh);

    // Gauntlet cuff flares backward from wrist (-0.06) over sleeve (-0.20)
    const cuffProfile = [
      new THREE.Vector2(0.034, 0.05),
      new THREE.Vector2(0.043, 0.11),
      new THREE.Vector2(0.053, 0.20)
    ];
    const cuffMesh = new THREE.Mesh(new THREE.LatheGeometry(cuffProfile, 24), gloveMat);
    cuffMesh.rotation.x = -Math.PI * 0.5;
    cuffMesh.position.set(0, -0.008, 0);
    armGroup.add(cuffMesh);

    const fistMesh = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 14), gloveMat);
    fistMesh.scale.set(0.86, 0.92, 1.10);
    fistMesh.position.set(0.004, -0.010, -0.028);
    armGroup.add(fistMesh);

    const hilts = createThreeWeaponHilts();
    armGroup.add(hilts.foilHilt);
    armGroup.add(hilts.epeeHilt);
    armGroup.add(hilts.sabreHilt);
    rig.add(armGroup);

    const fpBladeMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0.95,
      roughness: 0.12,
      emissive: isP2 ? 0xf43f5e : 0x38bdf8,
      emissiveIntensity: 0.18
    });
    const blades = {
      foil: createDeformableBladeMesh('foil', fpBladeMat),
      epee: createDeformableBladeMesh('epee', fpBladeMat),
      sabre: createDeformableBladeMesh('sabre', fpBladeMat)
    };

    return {
      rig,
      armGroup,
      forearmMesh,
      sleeveMat,
      sabreSleeveMat,
      fpBladeMat,
      hilts,
      blades
    };
  }

  function buildGrandPalaisArena3D(scene) {
    const tex = getProceduralPBRTextures();
    const arenaGroup = new THREE.Group();
    scene.add(arenaGroup);

    const hallFloor = new THREE.Mesh(
      new THREE.PlaneGeometry(34, 38),
      new THREE.MeshStandardMaterial({ color: 0x060b18, roughness: 0.34, metalness: 0.52 })
    );
    hallFloor.rotation.x = -Math.PI * 0.5;
    hallFloor.position.y = -0.14;
    hallFloor.receiveShadow = true;
    arenaGroup.add(hallFloor);

    const podiumBase = new THREE.Mesh(
      new THREE.BoxGeometry(2.16, 0.135, 15.2),
      new THREE.MeshStandardMaterial({ color: 0x0b1325, roughness: 0.44, metalness: 0.62 })
    );
    podiumBase.position.set(0, -0.07, 0);
    podiumBase.receiveShadow = true;
    arenaGroup.add(podiumBase);

    const pisteTop = new THREE.Mesh(
      new THREE.PlaneGeometry(1.82, 14.2),
      new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        map: tex.pisteMap,
        metalness: 0.65,
        roughness: 0.28
      })
    );
    pisteTop.rotation.x = -Math.PI * 0.5;
    pisteTop.position.y = 0.001;
    pisteTop.receiveShadow = true;
    arenaGroup.add(pisteTop);

    const railMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.026, 14.3), railMat);
    leftRail.position.set(-0.93, 0.008, 0);
    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.038, 0.026, 14.3), railMat);
    rightRail.position.set(0.93, 0.008, 0);
    arenaGroup.add(leftRail, rightRail);

    const makeLaserBar = (hex) => {
      const m = new THREE.Mesh(
        new THREE.PlaneGeometry(1.76, 0.038),
        new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
      );
      m.rotation.x = -Math.PI * 0.5;
      m.position.y = 0.006;
      m.visible = false;
      arenaGroup.add(m);
      return m;
    };
    const epeeRings3D = {
      wrist: makeLaserBar(0xfde047),
      foot: makeLaserBar(0xfbbf24),
      body: makeLaserBar(0xf43f5e)
    };

    const ironVaultMat = new THREE.MeshStandardMaterial({
      color: 0x3b5246,
      metalness: 0.74,
      roughness: 0.34
    });
    const goldRivetMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.84,
      roughness: 0.26
    });

    for (let zArch = -12; zArch <= 12; zArch += 3.0) {
      const archPts = [];
      for (let k = 0; k <= 24; k++) {
        const ang = (k / 24) * Math.PI;
        archPts.push(new THREE.Vector3(-Math.cos(ang) * 9.2, Math.sin(ang) * 8.6 - 0.14, zArch));
      }
      const outerCurve = new THREE.CatmullRomCurve3(archPts);
      const outerRib = new THREE.Mesh(new THREE.TubeGeometry(outerCurve, 32, 0.11, 8, false), ironVaultMat);
      arenaGroup.add(outerRib);

      const innerPts = archPts.map(p => new THREE.Vector3(p.x * 0.94, p.y * 0.94, zArch));
      const innerCurve = new THREE.CatmullRomCurve3(innerPts);
      const innerRib = new THREE.Mesh(new THREE.TubeGeometry(innerCurve, 28, 0.065, 6, false), ironVaultMat);
      arenaGroup.add(innerRib);

      const keystone = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.62, 0.22), goldRivetMat);
      keystone.position.set(0, 8.2, zArch);
      arenaGroup.add(keystone);
    }

    for (const angDeg of [22, 48, 72, 108, 132, 158]) {
      const rad = (angDeg * Math.PI) / 180;
      const purlin = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 25, 6), ironVaultMat);
      purlin.rotation.x = Math.PI * 0.5;
      purlin.position.set(-Math.cos(rad) * 8.9, Math.sin(rad) * 8.3 - 0.14, 0);
      arenaGroup.add(purlin);
    }

    for (const endSign of [-1, 1]) {
      const portalZ = endSign * 8.2;
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.72, roughness: 0.30 });
      const pL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.6, 0.32), pillarMat);
      pL.position.set(-1.65, 1.66, portalZ);
      const pR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 3.6, 0.32), pillarMat);
      pR.position.set(1.65, 1.66, portalZ);
      const lintel = new THREE.Mesh(new THREE.BoxGeometry(3.75, 0.48, 0.36), pillarMat);
      lintel.position.set(0, 3.55, portalZ);
      const goldTrim = new THREE.Mesh(new THREE.BoxGeometry(3.78, 0.06, 0.40), goldRivetMat);
      goldTrim.position.set(0, 3.30, portalZ);
      arenaGroup.add(pL, pR, lintel, goldTrim);
    }

    // FIE 3D Scoring Apparatus Tower at x = -2.15m, z = 0
    const scoreTower = new THREE.Group();
    scoreTower.position.set(-2.15, 0, 0);
    const towerPedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.22, 1.15, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.7, roughness: 0.3 })
    );
    towerPedestal.position.y = 0.45;
    scoreTower.add(towerPedestal);

    const scoreBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.32, 1.32),
      new THREE.MeshStandardMaterial({ color: 0x020617, metalness: 0.6, roughness: 0.35 })
    );
    scoreBox.position.y = 1.12;
    scoreTower.add(scoreBox);

    const lampP1Mat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const lampP2Mat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const lampW1Mat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const lampW2Mat = new THREE.MeshBasicMaterial({ color: 0x0f172a });

    const lampP1Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.42), lampP1Mat);
    lampP1Mesh.position.set(0.02, 1.16, -0.38);
    const lampP2Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.14, 0.42), lampP2Mat);
    lampP2Mesh.position.set(0.02, 1.16, 0.38);
    const lampW1Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.08, 0.20), lampW1Mat);
    lampW1Mesh.position.set(0.02, 1.02, -0.38);
    const lampW2Mesh = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.08, 0.20), lampW2Mat);
    lampW2Mesh.position.set(0.02, 1.02, 0.38);
    scoreTower.add(lampP1Mesh, lampP2Mesh, lampW1Mesh, lampW2Mesh);
    arenaGroup.add(scoreTower);

    const reelGeo = new THREE.CylinderGeometry(0.18, 0.20, 0.10, 18);
    const reelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.3 });
    for (const endZ of [-7.15, 7.15]) {
      const r = new THREE.Mesh(reelGeo, reelMat);
      r.position.set(0.62, 0.05, endZ);
      arenaGroup.add(r);
    }

    const makeBodyCordLine = () => {
      const pts = [];
      for (let i = 0; i < 16; i++) pts.push(new THREE.Vector3());
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.55 }));
      l.frustumCulled = false;
      arenaGroup.add(l);
      return l;
    };
    const cordP1 = makeBodyCordLine();
    const cordP2 = makeBodyCordLine();

    const coneGeo = new THREE.ConeGeometry(2.6, 7.8, 24, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.042,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const spotCones = [];
    for (const zSpot of [-2.8, 0, 2.8]) {
      const c = new THREE.Mesh(coneGeo, coneMat.clone());
      c.position.set(0, 3.9, zSpot);
      arenaGroup.add(c);
      spotCones.push(c);
    }

    const bokehCount = 140;
    const bokehPos = new Float32Array(bokehCount * 3);
    const bokehColors = new Float32Array(bokehCount * 3);
    const palette = [
      new THREE.Color(0x38bdf8),
      new THREE.Color(0xfbbf24),
      new THREE.Color(0xf43f5e),
      new THREE.Color(0xe2e8f0)
    ];
    for (let i = 0; i < bokehCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      bokehPos[i * 3]     = side * (3.8 + Math.random() * 4.5);
      bokehPos[i * 3 + 1] = 0.6 + Math.random() * 2.8;
      bokehPos[i * 3 + 2] = (Math.random() - 0.5) * 18.0;
      const col = palette[i % palette.length];
      bokehColors[i * 3]     = col.r;
      bokehColors[i * 3 + 1] = col.g;
      bokehColors[i * 3 + 2] = col.b;
    }
    const bokehGeo = new THREE.BufferGeometry();
    bokehGeo.setAttribute('position', new THREE.BufferAttribute(bokehPos, 3));
    bokehGeo.setAttribute('color', new THREE.BufferAttribute(bokehColors, 3));
    const bokehPoints = new THREE.Points(
      bokehGeo,
      new THREE.PointsMaterial({
        size: 0.14,
        vertexColors: true,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    arenaGroup.add(bokehPoints);

    return {
      arenaGroup,
      railMat,
      epeeRings3D,
      lampP1Mat,
      lampP2Mat,
      lampW1Mat,
      lampW2Mat,
      cordP1,
      cordP2,
      spotCones
    };
  }

  return {
    createSculptedFencerRig,
    createFirstPersonWeaponRig,
    buildGrandPalaisArena3D,
    updateDeformableBlade
  };
})();
