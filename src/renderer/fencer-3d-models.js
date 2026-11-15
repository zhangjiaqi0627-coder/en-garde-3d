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

    // 1. Unified Two-Tone 1600N Mask Texture (Zero-Clipping Single-Mesh UV Layout!)
    // In buildSculptedLoftGeometry: u=0 -> +X, u=0.25 -> +Z (Front Faceplate!), u=0.5 -> -X, u=0.75 -> -Z (Back of Head)
    const maskDiffC = makeCanvas(512, 256);
    const mctx = maskDiffC.getContext('2d');
    // Base: Padded white/slate 1600N composite outer shell covering sides, crown & back
    mctx.fillStyle = '#e2e8f0';
    mctx.fillRect(0, 0, 512, 256);
    mctx.fillStyle = '#cbd5e1';
    mctx.fillRect(0, 0, 512, 28); // Lower chin collar trim
    // Rear elastic strap detail around u=0.75 (x=384)
    mctx.fillStyle = '#0f172a';
    mctx.fillRect(310, 96, 148, 34);

    // Front 1600N Black-Steel Wire Mesh Faceplate Window centered at u=0.25 (x=128, width=168 -> u in [0.086, 0.414])
    mctx.save();
    mctx.beginPath();
    mctx.roundRect(44, 18, 168, 212, 36);
    mctx.clip();

    const mg = mctx.createRadialGradient(128, 122, 12, 128, 124, 118);
    mg.addColorStop(0, '#1e293b');
    mg.addColorStop(0.6, '#0f172a');
    mg.addColorStop(1, '#020617');
    mctx.fillStyle = mg;
    mctx.fillRect(40, 14, 176, 220);

    // Woven 1600N steel diamond grid inside faceplate window
    mctx.strokeStyle = 'rgba(148, 163, 184, 0.30)';
    mctx.lineWidth = 1.0;
    for (let i = -200; i < 360; i += 6) {
      mctx.beginPath(); mctx.moveTo(40 + i, 14); mctx.lineTo(40 + i + 220, 234); mctx.stroke();
      mctx.beginPath(); mctx.moveTo(40 + i + 220, 14); mctx.lineTo(40 + i, 234); mctx.stroke();
    }
    // Center ridge highlight along nose bridge (u=0.25 -> x=128)
    const spineG = mctx.createLinearGradient(121, 0, 135, 0);
    spineG.addColorStop(0, 'rgba(255,255,255,0)');
    spineG.addColorStop(0.5, 'rgba(226, 232, 240, 0.28)');
    spineG.addColorStop(1, 'rgba(255,255,255,0)');
    mctx.fillStyle = spineG;
    mctx.fillRect(120, 18, 16, 212);
    mctx.restore();

    // Crisp rubberized vulcanized bezel border around faceplate window
    mctx.strokeStyle = '#0f172a';
    mctx.lineWidth = 7;
    mctx.beginPath();
    mctx.roundRect(44, 18, 168, 212, 36);
    mctx.stroke();

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

  // Catmull-Rom 1D helper for silky organic anatomical muscle curves between control slices
  function catmullRom1D(p0, p1, p2, p3, t) {
    const t2 = t * t;
    const t3 = t2 * t;
    return 0.5 * (
      (2 * p1) +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3
    );
  }

  function buildSculptedLoftGeometry(rawSlices, radialSegs = 32, capBottom = true, capTop = true) {
    // Subdivide vertical control slices 3x via clamped Catmull-Rom splines so silhouettes are silky-smooth!
    const slices = [];
    const nRaw = rawSlices.length;
    const subSteps = nRaw >= 3 ? 3 : 1;
    for (let i = 0; i < nRaw - 1; i++) {
      const s0 = rawSlices[Math.max(0, i - 1)];
      const s1 = rawSlices[i];
      const s2 = rawSlices[i + 1];
      const s3 = rawSlices[Math.min(nRaw - 1, i + 2)];
      for (let sub = 0; sub < subSteps; sub++) {
        const t = sub / subSteps;
        slices.push({
          y: s1.y + (s2.y - s1.y) * t,
          rx: Math.max(0.001, catmullRom1D(s0.rx, s1.rx, s2.rx, s3.rx, t)),
          rz: Math.max(0.001, catmullRom1D(s0.rz, s1.rz, s2.rz, s3.rz, t)),
          ox: catmullRom1D(s0.ox || 0, s1.ox || 0, s2.ox || 0, s3.ox || 0, t),
          oz: catmullRom1D(s0.oz || 0, s1.oz || 0, s2.oz || 0, s3.oz || 0, t),
          frontScale: catmullRom1D(
            s0.frontScale !== undefined ? s0.frontScale : 1,
            s1.frontScale !== undefined ? s1.frontScale : 1,
            s2.frontScale !== undefined ? s2.frontScale : 1,
            s3.frontScale !== undefined ? s3.frontScale : 1,
            t
          ),
          backScale: catmullRom1D(
            s0.backScale !== undefined ? s0.backScale : 1,
            s1.backScale !== undefined ? s1.backScale : 1,
            s2.backScale !== undefined ? s2.backScale : 1,
            s3.backScale !== undefined ? s3.backScale : 1,
            t
          )
        });
      }
    }
    slices.push(rawSlices[nRaw - 1]);

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
        // Smooth C1 blend between front and back muscle scale so lateral seam has zero normal kink
        const blend = 0.5 + 0.5 * sinT;
        const asymZ = backS + (frontS - backS) * blend;
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

    // Weld UV seam normals (j=0 and j=radialSegs) so cylindrical wrap is 100% seamless
    const normAttr = geo.getAttribute ? geo.getAttribute('normal') : null;
    if (normAttr && normAttr.array) {
      const nArr = normAttr.array;
    for (let i = 0; i < ringCount; i++) {
      const i0 = (i * stride) * 3;
      const i1 = (i * stride + radialSegs) * 3;
      const nx = nArr[i0] + nArr[i1];
      const ny = nArr[i0 + 1] + nArr[i1 + 1];
      const nz = nArr[i0 + 2] + nArr[i1 + 2];
      const len = Math.hypot(nx, ny, nz) || 1;
      nArr[i0] = nArr[i1] = nx / len;
      nArr[i0 + 1] = nArr[i1 + 1] = ny / len;
      nArr[i0 + 2] = nArr[i1 + 2] = nz / len;
    }
      normAttr.needsUpdate = true;
    }
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
    const tipCap = new THREE.Group();
    tipCap.frustumCulled = false;
    if (weaponType === 'sabre') {
      // Authentic FIE Sabre folded safety loop tip (Bout replié)
      const loopMesh = new THREE.Mesh(new THREE.TorusGeometry(0.0048, 0.0018, 8, 14), tipMat);
      loopMesh.scale.set(0.72, 1.35, 1.0);
      tipCap.add(loopMesh);
    } else {
      // Two-part steel barrel + sliding electric plunger button (Pointe d'arrêt)
      const barrelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.92, roughness: 0.18 });
      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(
          weaponType === 'epee' ? 0.0048 : 0.0035,
          weaponType === 'epee' ? 0.0042 : 0.0029,
          weaponType === 'foil' ? 0.019 : 0.013,
          12
        ),
        barrelMat
      );
      barrel.position.y = -0.004;
      const plunger = new THREE.Mesh(
        new THREE.CylinderGeometry(
          weaponType === 'epee' ? 0.0052 : 0.0038,
          weaponType === 'epee' ? 0.0050 : 0.0036,
          0.0065,
          12
        ),
        tipMat
      );
      plunger.position.y = 0.006;
      tipCap.add(barrel, plunger);
    }

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

    // Decompose midpoint p1 into chord midpoint + transverse elastic deflection vector (dX, dY, dZ):
    // Real FIE Maraging steel has a thick rectangular/V-section Forte near the bell guard (t < 0.35)
    // and bends smoothly in the distal Foible third (peak around t ~ 0.62) with ZERO sharp midpoint kink!
    const midChordX = (p0.x + p2.x) * 0.5;
    const midChordY = (p0.y + p2.y) * 0.5;
    const midChordZ = (p0.z + p2.z) * 0.5;
    const defX = p1.x - midChordX;
    const defY = p1.y - midChordY;
    const defZ = p1.z - midChordZ;

    for (let i = 0; i < stations; i++) {
      const t = i / (stations - 1);
      // C1-smooth Foible-weighted beam shape: w(t) = 2.60 * t^1.45 * (1 - t) -> w(0)=0, w'(0)=0 (stiff Forte!), peak=1.0 at t=0.59, w(1)=0
      const w = 2.60 * Math.pow(t, 1.45) * (1 - t);
      const dw = 2.60 * (1.45 * Math.pow(Math.max(1e-4, t), 0.45) * (1 - t) - Math.pow(t, 1.45));
      _tmpP.set(
        p0.x + (p2.x - p0.x) * t + defX * w,
        p0.y + (p2.y - p0.y) * t + defY * w,
        p0.z + (p2.z - p0.z) * t + defZ * w
      );
      _tmpT.set(
        (p2.x - p0.x) + defX * dw,
        (p2.y - p0.y) + defY * dw,
        (p2.z - p0.z) + defZ * dw
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
      // Compact ergonomic pistol grip enclosed cleanly inside gloveFist (zero protrusion through top of glove!)
      const g = new THREE.Group();
      const palmCore = new THREE.Mesh(
        new THREE.CylinderGeometry(0.011, 0.013, 0.072, 12),
        gripAnodizedMat
      );
      palmCore.rotation.x = Math.PI * 0.5;
      palmCore.position.set(0, -0.008, -0.012);
      g.add(palmCore);

      const lowerTriggerProng = new THREE.Mesh(
        new THREE.CylinderGeometry(0.0085, 0.006, 0.034, 10),
        gripAnodizedMat
      );
      lowerTriggerProng.rotation.x = 0.18;
      lowerTriggerProng.position.set(0, -0.034, -0.004);
      g.add(lowerTriggerProng);

      const pommel = new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.008, 0.022, 12), steelGuardMat);
      pommel.rotation.x = Math.PI * 0.5;
      pommel.position.set(0, -0.010, -0.076);
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

    const socketDarkMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.45, roughness: 0.48 });
    const brassPinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.90, roughness: 0.20 });
    function buildInteriorSocket(xOff, yOff, zOff) {
      const sg = new THREE.Group();
      const blk = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.014, 0.014), socketDarkMat);
      const pinGeo = new THREE.CylinderGeometry(0.0018, 0.0018, 0.010, 8);
      const pinA = new THREE.Mesh(pinGeo, brassPinMat);
      pinA.rotation.x = Math.PI * 0.5;
      pinA.position.set(-0.004, 0, -0.009);
      const pinB = new THREE.Mesh(pinGeo, brassPinMat);
      pinB.rotation.x = Math.PI * 0.5;
      pinB.position.set(0.004, 0, -0.009);
      const bail = new THREE.Mesh(new THREE.TorusGeometry(0.0065, 0.0011, 6, 12, Math.PI), steelGuardMat);
      bail.position.set(0, 0.007, -0.004);
      sg.add(blk, pinA, pinB, bail);
      sg.position.set(xOff, yOff, zOff);
      return sg;
    }

    const foilPad = new THREE.Mesh(new THREE.RingGeometry(0.008, 0.043, 28), padLeatherMat);
    foilPad.position.z = 0.037;
    foilHilt.add(foilPad);
    foilHilt.add(buildInteriorSocket(-0.016, 0.015, 0.031));
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

    epeeHilt.add(buildInteriorSocket(-0.015, 0.016, 0.030));
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

    // Sweeps generously outside the gloved knuckles (+X/+Y clearance) from guard rim to pommel with zero glove intersection!
    const bowCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.012, 0.046, 0.052),
      new THREE.Vector3(0.064, 0.018, 0.030),
      new THREE.Vector3(0.068, -0.026, -0.024),
      new THREE.Vector3(0.042, -0.038, -0.076),
      new THREE.Vector3(0.000, -0.008, -0.098)
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

    const sabrePad = new THREE.Mesh(new THREE.RingGeometry(0.008, 0.044, 24), padLeatherMat);
    sabrePad.position.set(0.008, 0, 0.036);
    sabreHilt.add(sabrePad);
    sabreHilt.add(buildInteriorSocket(-0.015, 0.014, 0.030));

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

    // ZERO-CLIPPING PARTITIONED TORSO:
    // Split cleanly at the waist belt (y = 0.094) so Foil/Sabre/Epee switch materials directly on a SINGLE surface
    // instead of stacking two co-planar meshes that Z-fight or poke through each other!
    const lowerTorsoSlices = [
      { y: -0.05, rx: 0.138, rz: 0.098, oz: 0.004, frontScale: 1.05, backScale: 1.02 },
      { y:  0.02, rx: 0.156, rz: 0.110, oz: 0.003, frontScale: 1.01, backScale: 1.05 },
      { y:  0.096, rx: 0.141, rz: 0.100, oz: 0.005, frontScale: 1.02, backScale: 0.97 }
    ];
    const upperTorsoSlices = [
      { y:  0.092, rx: 0.141, rz: 0.100, oz: 0.005, frontScale: 1.02, backScale: 0.97 },
      { y:  0.21, rx: 0.165, rz: 0.116, oz: 0.010, frontScale: 1.08, backScale: 1.02 },
      { y:  0.32, rx: 0.188, rz: 0.128, oz: 0.012, frontScale: 1.12, backScale: 1.04 },
      { y:  0.40, rx: 0.194, rz: 0.118, oz: 0.005, frontScale: 1.05, backScale: 1.04 },
      { y:  0.46, rx: 0.124, rz: 0.090, oz: 0.004, frontScale: 1.00, backScale: 1.00 },
      { y:  0.52, rx: 0.072, rz: 0.070, oz: 0.005, frontScale: 1.02, backScale: 1.00 }
    ];
    const lowerTorsoMesh = new THREE.Mesh(buildSculptedLoftGeometry(lowerTorsoSlices, 32, true, false), kevlarMat);
    lowerTorsoMesh.castShadow = true;
    lowerTorsoMesh.receiveShadow = true;
    torsoGroup.add(lowerTorsoMesh);

    const upperTorsoMesh = new THREE.Mesh(buildSculptedLoftGeometry(upperTorsoSlices, 32, false, true), foilLameMat);
    upperTorsoMesh.castShadow = true;
    upperTorsoMesh.receiveShadow = true;
    torsoGroup.add(upperTorsoMesh);

    // Keep legacy references pointing cleanly for API compatibility
    const torsoMesh = lowerTorsoMesh;
    const foilLameMesh = upperTorsoMesh;
    const sabreLameTorsoMesh = upperTorsoMesh;

    // Concentric Lofted Waist Belt (matches y=0.094 ellipse + 5mm clearance so zero torus-clipping!)
    const waistBeltSlices = [
      { y: 0.084, rx: 0.147, rz: 0.106, oz: 0.005, frontScale: 1.02, backScale: 0.97 },
      { y: 0.104, rx: 0.147, rz: 0.106, oz: 0.005, frontScale: 1.02, backScale: 0.97 }
    ];
    const waistTrim = new THREE.Mesh(buildSculptedLoftGeometry(waistBeltSlices, 32, false, false), stripeAccentMat);
    torsoGroup.add(waistTrim);

    // Authentic FIE Croisée Diagonal Jacket Closure Seam & Back Waist Clip Ring (Mousqueton)
    const seamSide = isP1 ? 1 : -1;
    const seamPipingMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.42, metalness: 0.45 });
    const croiseCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(seamSide * 0.042, 0.485, 0.096),
      new THREE.Vector3(seamSide * 0.096, 0.350, 0.152),
      new THREE.Vector3(seamSide * 0.112, 0.215, 0.134),
      new THREE.Vector3(seamSide * 0.095, 0.104, 0.106)
    ]);
    const croisePiping = new THREE.Mesh(
      new THREE.TubeGeometry(croiseCurve, 22, 0.0028, 6, false),
      seamPipingMat
    );
    torsoGroup.add(croisePiping);

    // Back Waist Body-Cord Clip Housing (at y=0.095, rear -Z)
    const rearCordClip = new THREE.Mesh(
      new THREE.BoxGeometry(0.028, 0.026, 0.022),
      darkTrimMat
    );
    rearCordClip.position.set(seamSide * 0.04, 0.095, -0.106);
    torsoGroup.add(rearCordClip);

    // 2. Unified Single-Surface Two-Tone 1600N FIE Fencing Mask (Zero shell-vs-cage internal clipping!)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.525, 0.008);
    torsoGroup.add(headGroup);

    const unifiedMaskSlices = [
      { y:  0.000, rx: 0.072, rz: 0.086, oz: 0.006, frontScale: 1.12, backScale: 0.96 },
      { y:  0.055, rx: 0.094, rz: 0.106, oz: 0.008, frontScale: 1.16, backScale: 1.02 },
      { y:  0.125, rx: 0.100, rz: 0.114, oz: 0.008, frontScale: 1.18, backScale: 1.04 },
      { y:  0.195, rx: 0.092, rz: 0.108, oz: 0.005, frontScale: 1.12, backScale: 1.02 },
      { y:  0.248, rx: 0.064, rz: 0.078, oz: 0.000, frontScale: 1.02, backScale: 1.00 },
      { y:  0.272, rx: 0.032, rz: 0.040, oz: -0.004, frontScale: 1.00, backScale: 1.00 }
    ];
    const maskGeo = buildSculptedLoftGeometry(unifiedMaskSlices, 36);
    const maskUvAttr = maskGeo.getAttribute ? maskGeo.getAttribute('uv') : null;
    if (maskUvAttr && maskUvAttr.array) {
      const uvArr = maskUvAttr.array;
      const vCols = new Float32Array((uvArr.length / 2) * 3);
      for (let k = 0; k < uvArr.length / 2; k++) {
        const u = uvArr[k * 2];
        const v = uvArr[k * 2 + 1];
        const inFaceWindow = (u >= 0.09 && u <= 0.41 && v >= 0.07 && v <= 0.90);
        if (inFaceWindow) {
          vCols[k * 3] = 0.14; vCols[k * 3 + 1] = 0.18; vCols[k * 3 + 2] = 0.25;
        } else {
          vCols[k * 3] = 0.94; vCols[k * 3 + 1] = 0.96; vCols[k * 3 + 2] = 0.99;
        }
      }
      maskGeo.setAttribute('color', new THREE.Float32BufferAttribute(vCols, 3));
    }
    const unifiedMaskMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      vertexColors: true,
      map: tex.maskMap,
      bumpMap: tex.maskBump,
      bumpScale: 0.008,
      metalness: 0.45,
      roughness: 0.36
    });
    const maskCageMesh = new THREE.Mesh(maskGeo, unifiedMaskMat);
    maskCageMesh.castShadow = true;
    headGroup.add(maskCageMesh);

    // 3D Perimeter Accent Trim sitting cleanly OUTSIDE (+6mm) the mask faceplate border
    const rimBandCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.004, 0.109),
      new THREE.Vector3(0.086, 0.065, 0.078),
      new THREE.Vector3(0.089, 0.175, 0.072),
      new THREE.Vector3(0, 0.238, 0.090),
      new THREE.Vector3(-0.089, 0.175, 0.072),
      new THREE.Vector3(-0.086, 0.065, 0.078),
      new THREE.Vector3(0, 0.004, 0.109)
    ]);
    const maskRimMesh = new THREE.Mesh(new THREE.TubeGeometry(rimBandCurve, 36, 0.0055, 8, true), stripeAccentMat);
    headGroup.add(maskRimMesh);

    // Subtle Visor Eye-Line Glint cleanly +5mm in front of nose bridge (oz + rz*frontScale = 0.008 + 0.114*1.18 = 0.142)
    const visorArc = new THREE.Mesh(
      new THREE.TorusGeometry(0.102, 0.0035, 8, 22, Math.PI * 0.48),
      stripeAccentMat
    );
    visorArc.rotation.x = Math.PI * 0.5;
    visorArc.rotation.z = Math.PI * 0.26;
    visorArc.position.set(0, 0.132, 0.044);
    headGroup.add(visorArc);

    // Authentic Front Trapezoidal Conductive Mask Bib (Bavette) suspended beneath mask chin (+Z front sector only, zero collar clipping!)
    const bibArcGeo = new THREE.CylinderGeometry(0.074, 0.094, 0.068, 20, 3, true, -Math.PI * 0.34, Math.PI * 0.68);
    const bibMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      map: tex.lameFoilMap,
      metalness: 0.78,
      roughness: 0.26,
      side: THREE.DoubleSide
    });
    const bibMesh = new THREE.Mesh(bibArcGeo, bibMat);
    bibMesh.position.set(0, -0.022, 0.024);
    bibMesh.rotation.x = -0.16;
    headGroup.add(bibMesh);

    const bibRimPts = [];
    for (let k = 0; k <= 12; k++) {
      const ang = (-0.34 + 0.68 * (k / 12)) * Math.PI;
      bibRimPts.push(new THREE.Vector3(Math.sin(ang) * 0.095, -0.056, Math.cos(ang) * 0.095 + 0.029));
    }
    const bibBorder = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(bibRimPts), 16, 0.0032, 6, false),
      stripeAccentMat
    );
    headGroup.add(bibBorder);

    // Curved Conductive Mask Clip Cord (Cordon de tête) arching cleanly behind mask for Foil & Sabre!
    const maskCordCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.00, 0.015, -0.084),
      new THREE.Vector3(0.025, -0.018, -0.112),
      new THREE.Vector3(0.015, -0.055, -0.095)
    ]);
    const maskCordMesh = new THREE.Mesh(
      new THREE.TubeGeometry(maskCordCurve, 14, 0.0032, 6, false),
      stripeAccentMat
    );
    headGroup.add(maskCordMesh);

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
      let topBall = null;
      if (capRadiusTop > 0) {
        topBall = new THREE.Mesh(new THREE.SphereGeometry(capRadiusTop, 16, 12), mat);
        topBall.position.y = slices[slices.length - 1].y;
        grp.add(topBall);
      }
      root.add(grp);
      return { grp, mesh, bottomBall, topBall };
    }

    const upperArmLen = 0.30;
    const forearmLen = 0.27;
    const thighLen = 0.46;
    const calfLen = 0.44;

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
      { y: 0.46, rx: 0.055, rz: 0.057 }
    ];
    const calfSlices = [
      { y: 0.00, rx: 0.056, rz: 0.058, oz: 0.003 },
      { y: 0.11, rx: 0.055, rz: 0.063, oz: -0.008, backScale: 1.16 },
      { y: 0.28, rx: 0.039, rz: 0.042 },
      { y: 0.44, rx: 0.034, rz: 0.037 }
    ];

    const leadUpperArm = createLimbSegment(upperArmSlices, kevlarMat, 0.064, 0.041);
    const leadForearm  = createLimbSegment(forearmSlices, kevlarMat, 0.042, 0.030);
    const rearUpperArm = createLimbSegment(upperArmSlices, kevlarMat, 0.064, 0.041);
    const rearForearm  = createLimbSegment(forearmSlices, kevlarMat, 0.042, 0.030);

    const leadThigh = createLimbSegment(thighSlices, breechesMat, 0.088, 0.057);
    const leadCalf  = createLimbSegment(calfSlices, kevlarMat, 0.057, 0.036);
    const rearThigh = createLimbSegment(thighSlices, breechesMat, 0.088, 0.057);
    const rearCalf  = createLimbSegment(calfSlices, kevlarMat, 0.057, 0.036);

    // Concentric Muscle-Matched Lofted Stripes (+4.5mm outside quad & gastrocnemius, zero cylinder-clipping!)
    const stripeOverlayMat = stripeAccentMat.clone();
    stripeOverlayMat.polygonOffset = true;
    stripeOverlayMat.polygonOffsetFactor = -2;
    stripeOverlayMat.polygonOffsetUnits = -2;

    const thighBandSlices = [
      { y: 0.195, rx: 0.087, rz: 0.096, oz: 0.005, frontScale: 1.07, backScale: 1.02 },
      { y: 0.225, rx: 0.083, rz: 0.091, oz: 0.005, frontScale: 1.06, backScale: 1.02 }
    ];
    leadThigh.grp.add(new THREE.Mesh(buildSculptedLoftGeometry(thighBandSlices, 28, false, false), stripeOverlayMat));

    const sockBandSlices = [
      { y: 0.042, rx: 0.060, rz: 0.064, oz: -0.002, frontScale: 1.01, backScale: 1.12 },
      { y: 0.068, rx: 0.060, rz: 0.066, oz: -0.005, frontScale: 1.01, backScale: 1.15 }
    ];
    leadCalf.grp.add(new THREE.Mesh(buildSculptedLoftGeometry(sockBandSlices, 28, false, false), stripeOverlayMat));
    rearCalf.grp.add(new THREE.Mesh(buildSculptedLoftGeometry(sockBandSlices, 28, false, false), stripeOverlayMat));

    // 4. Sculpted Asymmetric Olympic Fencing Shoes (Contoured Gum Outsole, Rounded Lunge Heel Cup & Medial Drag Guard)
    const gumSoleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.58, metalness: 0.08 });
    const shoeSuedeMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.68, metalness: 0.18 });
    function createFencingShoeGroup() {
      const sg = new THREE.Group();
      // Contoured gum-rubber outsole hugging exact shoe footprint (zero rectangular plank overhang!)
      const gumSoleSlices = [
        { y: 0.000, rx: 0.045, rz: 0.122, oz: 0.042, frontScale: 1.16, backScale: 0.72 },
        { y: 0.015, rx: 0.049, rz: 0.128, oz: 0.042, frontScale: 1.18, backScale: 0.75 },
        { y: 0.022, rx: 0.047, rz: 0.125, oz: 0.041, frontScale: 1.16, backScale: 0.74 }
      ];
      const soleMesh = new THREE.Mesh(buildSculptedLoftGeometry(gumSoleSlices, 24), gumSoleMat);
      soleMesh.castShadow = true;
      sg.add(soleMesh);

      // Rounded heel-roll cup wrapping up the back of the Achilles heel for explosive lunge landings!
      const heelCup = new THREE.Mesh(new THREE.SphereGeometry(0.038, 16, 12), gumSoleMat);
      heelCup.scale.set(1.12, 0.92, 0.85);
      heelCup.position.set(0, 0.032, -0.038);
      sg.add(heelCup);

      const shoeBodySlices = [
        { y: 0.016, rx: 0.045, rz: 0.122, oz: 0.042, frontScale: 1.16, backScale: 0.72 },
        { y: 0.040, rx: 0.047, rz: 0.123, oz: 0.039, frontScale: 1.14, backScale: 0.74 },
        { y: 0.074, rx: 0.039, rz: 0.086, oz: 0.020, frontScale: 1.04, backScale: 0.79 },
        { y: 0.098, rx: 0.035, rz: 0.045, oz: 0.000, frontScale: 1.00, backScale: 1.00 }
      ];
      const upperMesh = new THREE.Mesh(buildSculptedLoftGeometry(shoeBodySlices, 24), darkTrimMat);
      upperMesh.castShadow = true;
      sg.add(upperMesh);

      // Reinforced suede toe cap + medial drag-shield bumper
      const toeCap = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 12), shoeSuedeMat);
      toeCap.scale.set(1.04, 0.56, 1.38);
      toeCap.position.set(0, 0.026, 0.138);
      sg.add(toeCap);

      // Twin diagonal speed stripes & ankle collar trim
      for (const zOff of [0.024, 0.056]) {
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.011, 0.018), stripeAccentMat);
        stripe.rotation.x = -0.35;
        stripe.position.set(0, 0.046, zOff);
        sg.add(stripe);
      }
      const ankleCollar = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.0045, 8, 18), gloveMat);
      ankleCollar.rotation.x = Math.PI * 0.5;
      ankleCollar.position.set(0, 0.096, 0.002);
      sg.add(ankleCollar);

      root.add(sg);
      return sg;
    }

    const leadShoe = createFencingShoeGroup();
    const rearShoe = createFencingShoeGroup();

    // 5. Articulated 5-Digit Open Rear Balance Hand & Detailed 800N Sword Gauntlet Cuff + Hilts
    const skinHandMat = new THREE.MeshStandardMaterial({
      color: 0xeac4a8,
      roughness: 0.56,
      metalness: 0.04
    });
    const rearHandGroup = new THREE.Group();
    // Sleeve wrist trim ring
    const wristCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.033, 0.022, 16), stripeAccentMat);
    wristCuff.position.set(0, 0.004, 0);
    rearHandGroup.add(wristCuff);

    // Sculpted metacarpal palm
    const rearPalm = new THREE.Mesh(new THREE.SphereGeometry(0.033, 16, 12), skinHandMat);
    rearPalm.scale.set(0.88, 1.22, 0.50);
    rearPalm.position.set(0, 0.040, 0);
    rearPalm.castShadow = true;
    rearHandGroup.add(rearPalm);

    // Four gracefully curved, fanned poise fingers (Index, Middle, Ring, Pinky)
    const fingerSpecs = [
      { x: -0.019, y: 0.068, len1: 0.030, len2: 0.024, rad: 0.0062, splayZ: -0.14, curlX: 0.22 },
      { x: -0.006, y: 0.072, len1: 0.034, len2: 0.026, rad: 0.0065, splayZ: -0.04, curlX: 0.26 },
      { x:  0.007, y: 0.070, len1: 0.031, len2: 0.024, rad: 0.0060, splayZ:  0.06, curlX: 0.32 },
      { x:  0.019, y: 0.063, len1: 0.025, len2: 0.020, rad: 0.0052, splayZ:  0.17, curlX: 0.38 }
    ];
    for (const fs of fingerSpecs) {
      const fGrp = new THREE.Group();
      fGrp.position.set(fs.x, fs.y, 0.002);
      fGrp.rotation.set(fs.curlX, 0, fs.splayZ);
      const phal1 = new THREE.Mesh(new THREE.CylinderGeometry(fs.rad * 0.9, fs.rad, fs.len1, 10), skinHandMat);
      phal1.position.y = fs.len1 * 0.5;
      fGrp.add(phal1);

      const distGrp = new THREE.Group();
      distGrp.position.y = fs.len1;
      distGrp.rotation.x = fs.curlX * 1.15;
      const phal2 = new THREE.Mesh(new THREE.CylinderGeometry(fs.rad * 0.72, fs.rad * 0.88, fs.len2, 10), skinHandMat);
      phal2.position.y = fs.len2 * 0.5;
      const tipSphere = new THREE.Mesh(new THREE.SphereGeometry(fs.rad * 0.72, 8, 8), skinHandMat);
      tipSphere.position.y = fs.len2;
      distGrp.add(phal2, tipSphere);
      fGrp.add(distGrp);
      rearHandGroup.add(fGrp);
    }

    // Opposable athletic thumb
    const thumbGrp = new THREE.Group();
    thumbGrp.position.set(-0.024, 0.034, 0.008);
    thumbGrp.rotation.set(0.28, 0.20, 0.58);
    const thumbSeg = new THREE.Mesh(new THREE.CylinderGeometry(0.0068, 0.0085, 0.038, 10), skinHandMat);
    thumbSeg.position.y = 0.019;
    const thumbTip = new THREE.Mesh(new THREE.SphereGeometry(0.0068, 8, 8), skinHandMat);
    thumbTip.position.y = 0.038;
    thumbGrp.add(thumbSeg, thumbTip);
    rearHandGroup.add(thumbGrp);
    root.add(rearHandGroup);

    // Attach padded gauntlet cuff + Velcro strap + FIE 800N woven badge along distal leadForearm
    const cuffProfile = [
      new THREE.Vector2(0.052, 0.135),
      new THREE.Vector2(0.046, 0.205),
      new THREE.Vector2(0.037, 0.268)
    ];
    const gauntletCuff = new THREE.Mesh(new THREE.LatheGeometry(cuffProfile, 24), gloveMat);
    gauntletCuff.castShadow = true;
    leadForearm.grp.add(gauntletCuff);

    const cuffStrap = new THREE.Mesh(new THREE.TorusGeometry(0.0515, 0.0038, 8, 24), darkTrimMat);
    cuffStrap.rotation.x = Math.PI * 0.5;
    cuffStrap.position.y = 0.172;
    leadForearm.grp.add(cuffStrap);

    const fieBadgeMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.45, metalness: 0.2 });
    const fieBadge = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.014, 0.006), fieBadgeMat);
    fieBadge.position.set(0, 0.152, 0.0535);
    leadForearm.grp.add(fieBadge);

    const swordHandGroup = new THREE.Group();

    const gloveFist = new THREE.Mesh(new THREE.SphereGeometry(0.040, 16, 14), gloveMat);
    gloveFist.scale.set(0.92, 1.00, 1.24);
    gloveFist.position.set(0.000, -0.009, -0.018);
    swordHandGroup.add(gloveFist);

    // Sculpted gloved thumb & finger knuckle ridges gripping the pistol hilt
    const gloveThumb = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.011, 0.042, 10), gloveMat);
    gloveThumb.rotation.x = Math.PI * 0.46;
    gloveThumb.position.set(-0.012, 0.018, -0.006);
    swordHandGroup.add(gloveThumb);

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
      lowerTorsoMesh,
      upperTorsoMesh,
      foilLameMesh,
      sabreLameTorsoMesh,
      bibMesh,
      maskCordMesh,
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

    // Gauntlet cuff flares backward from wrist (-0.055) cleanly OUTSIDE sleeve (-0.21, radius 0.056 > sleeve 0.045!)
    const cuffProfile = [
      new THREE.Vector2(0.037, 0.052),
      new THREE.Vector2(0.047, 0.12),
      new THREE.Vector2(0.057, 0.21)
    ];
    const cuffMesh = new THREE.Mesh(new THREE.LatheGeometry(cuffProfile, 24), gloveMat);
    cuffMesh.rotation.x = -Math.PI * 0.5;
    cuffMesh.position.set(0, -0.010, 0);
    armGroup.add(cuffMesh);

    const fpStrap = new THREE.Mesh(
      new THREE.TorusGeometry(0.0545, 0.0040, 8, 24),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.42, metalness: 0.35 })
    );
    fpStrap.position.set(0, -0.010, -0.145);
    armGroup.add(fpStrap);

    const fpFiePatch = new THREE.Mesh(
      new THREE.BoxGeometry(0.022, 0.006, 0.015),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.42, metalness: 0.22 })
    );
    fpFiePatch.position.set(0, 0.0475, -0.145);
    armGroup.add(fpFiePatch);

    const fistMesh = new THREE.Mesh(new THREE.SphereGeometry(0.041, 16, 14), gloveMat);
    fistMesh.scale.set(0.92, 1.02, 1.28);
    fistMesh.position.set(0.000, -0.009, -0.018);
    armGroup.add(fistMesh);

    const fpThumb = new THREE.Mesh(new THREE.CylinderGeometry(0.0095, 0.0115, 0.044, 10), gloveMat);
    fpThumb.rotation.x = Math.PI * 0.45;
    fpThumb.position.set(-0.012, 0.020, -0.004);
    armGroup.add(fpThumb);

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

    // Piste-Side Podium Split LED Repeaters (P1 South Half z < 0, P2 North Half z > 0 — flashes like Paris 2024 Olympic Pistes!)
    const podiumLedP1Mat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
    const podiumLedP2Mat = new THREE.MeshBasicMaterial({ color: 0x0ea5e9 });
    for (const sideX of [-1.085, 1.085]) {
      const skirtP1 = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.036, 7.35), podiumLedP1Mat);
      skirtP1.position.set(sideX, -0.035, -3.72);
      const skirtP2 = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.036, 7.35), podiumLedP2Mat);
      skirtP2.position.set(sideX, -0.035, 3.72);
      arenaGroup.add(skirtP1, skirtP2);
    }

    // Armored FIE Floor Cable Reels (Enrouleurs) with guide rollers & tension housings at z = ±7.15m
    const reelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.78, roughness: 0.28 });
    for (const endZ of [-7.15, 7.15]) {
      const reelGrp = new THREE.Group();
      reelGrp.position.set(0.62, 0.0, endZ);
      const basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.025, 0.36), reelMat);
      basePlate.position.y = 0.012;
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.11, 20), reelMat);
      drum.rotation.z = Math.PI * 0.5;
      drum.position.y = 0.095;
      const roller = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.14, 12), goldRivetMat);
      roller.rotation.z = Math.PI * 0.5;
      roller.position.set(0, 0.065, endZ < 0 ? 0.16 : -0.16);
      reelGrp.add(basePlate, drum, roller);
      arenaGroup.add(reelGrp);
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

    // Translucent Nocturnal Skylight Barrel-Vault Canopy & Beaux-Arts Tiered Grandstand Tribunes
    const glassVaultGeo = new THREE.CylinderGeometry(9.35, 9.35, 25.0, 28, 1, true, 0, Math.PI);
    const glassVaultMat = new THREE.MeshBasicMaterial({
      color: 0x0c2442,
      transparent: true,
      opacity: 0.24,
      side: THREE.BackSide,
      depthWrite: false
    });
    const glassVault = new THREE.Mesh(glassVaultGeo, glassVaultMat);
    glassVault.rotation.z = Math.PI * 0.5;
    glassVault.rotation.y = Math.PI * 0.5;
    glassVault.position.set(0, -0.14, 0);
    arenaGroup.add(glassVault);

    const tribuneMat = new THREE.MeshStandardMaterial({ color: 0x0a1328, roughness: 0.52, metalness: 0.45 });
    const trimCyanMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.55 });
    for (const sideSign of [-1, 1]) {
      for (let tier = 0; tier < 3; tier++) {
        const stepBox = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.52 + tier * 0.48, 22.0), tribuneMat);
        stepBox.position.set(sideSign * (4.35 + tier * 1.20), 0.12 + tier * 0.24, 0);
        arenaGroup.add(stepBox);
      }
      const ledRibbon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 22.0), trimCyanMat);
      ledRibbon.position.set(sideSign * 3.74, 0.36, 0);
      arenaGroup.add(ledRibbon);
    }

    // Iconic Paris Grand Palais Monumental Ceremonial Staircase Silhouette at Nave North End (z = +11.2m)
    const stairMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.68, roughness: 0.32 });
    const stairGroup = new THREE.Group();
    stairGroup.position.set(0, -0.12, 11.2);
    for (let st = 0; st < 7; st++) {
      const wStep = 4.6 - st * 0.28;
      const stepM = new THREE.Mesh(new THREE.BoxGeometry(wStep, 0.24, 0.52), stairMat);
      stepM.position.set(0, st * 0.26 + 0.12, st * 0.44);
      stairGroup.add(stepM);
    }
    const landing = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.18, 1.4), goldRivetMat);
    landing.position.set(0, 2.02, 3.3);
    stairGroup.add(landing);
    arenaGroup.add(stairGroup);

    return {
      arenaGroup,
      railMat,
      epeeRings3D,
      lampP1Mat,
      lampP2Mat,
      lampW1Mat,
      lampW2Mat,
      podiumLedP1Mat,
      podiumLedP2Mat,
      cordP1,
      cordP2,
      spotCones,
      bokehPoints
    };
  }

  return {
    createSculptedFencerRig,
    createFirstPersonWeaponRig,
    buildGrandPalaisArena3D,
    updateDeformableBlade
  };
})();
