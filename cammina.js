(() => {
  'use strict';
  // Passeggiata in prima persona, stile videogioco. Occhi a 1,7 m; si sale su gradini, cordoli e panchine fino a 45 cm,
  // muri, ringhiere, gabbie e tronchi fermano il passo; si cade dai bordi e si può saltare.
  // · Tastiera: W A S D (o frecce su e giù) per camminare, frecce sinistra e destra per girarsi, Maiuscolo per correre,
  //   Spazio per saltare, Esc per uscire. Trascinando col mouse ti guardi intorno.
  // · iPad: levetta in basso a sinistra per camminare (spinta fino in fondo corre), trascina altrove per guardarti intorno.
  // Le collisioni usano una copia dei triangoli vicini (edifici, esterni di Chimica, cortile), divisa in celle di 2 m:
  // il corpo e il raggio verso terra controllano solo i triangoli delle celle che toccano.
  const EYE = 1.7, STEP = 0.45, RADIUS = 0.3, WALK = 3.2, RUN = 8, JUMP = 4.4, GRAVITY = 9.8, LOOK = 0.0042, TURN = 1.9;
  const ROOTS = ['edifici', 'chimica-esterni', 'cortile-modello', 'minerva'];
  const CELL = 2, HALF = 70; // regione di collisione: 140 × 140 m attorno a chi cammina
  let C = null, T = null, on = false, saved = null, last = 0, tilesAt = 0;
  const ui = {};
  const st = { x: 0, feet: 0, z: 0, eye: 0, vy: 0, yaw: 0, pitch: 0, grounded: true, keys: new Set(), stick: { x: 0, y: 0, id: null }, look: null, jump: false, run: false };

  /* ---------- triangoli vicini, in celle ---------- */
  const soup = { cx: 0, cz: 0, tris: null, cells: null, sig: '', checked: 0 };
  const visible = (o) => { for (let x = o; x; x = x.parent) if (!x.visible) return false; return true; };
  const rootsNow = () => ROOTS.map((n) => C.scene.getObjectByName(n)).filter((r) => r && visible(r));
  function buildSoup(cx, cz) {
    const tris = [], m = new T.Matrix4(), inst = new T.Matrix4(), v = [new T.Vector3(), new T.Vector3(), new T.Vector3()], sph = new T.Sphere();
    const x0 = cx - HALF, x1 = cx + HALF, z0 = cz - HALF, z1 = cz + HALF;
    const take = (g, M, mats) => {
      const pos = g.attributes.position, idx = g.index, n = idx ? idx.count : pos.count;
      const groups = g.groups && g.groups.length ? g.groups : [{ start: 0, count: n, materialIndex: 0 }];
      for (const gr of groups) {
        const mat = Array.isArray(mats) ? mats[gr.materialIndex] : mats;
        if (!mat || mat.visible === false) continue; // tappi nascosti degli edifici
        for (let i = gr.start; i + 2 < Math.min(n, gr.start + gr.count); i += 3) {
          for (let k = 0; k < 3; k += 1) v[k].fromBufferAttribute(pos, idx ? idx.getX(i + k) : i + k).applyMatrix4(M);
          if (Math.max(v[0].x, v[1].x, v[2].x) < x0 || Math.min(v[0].x, v[1].x, v[2].x) > x1 || Math.max(v[0].z, v[1].z, v[2].z) < z0 || Math.min(v[0].z, v[1].z, v[2].z) > z1) continue;
          tris.push(v[0].x, v[0].y, v[0].z, v[1].x, v[1].y, v[1].z, v[2].x, v[2].y, v[2].z);
        }
      }
    };
    for (const root of rootsNow()) {
      root.updateMatrixWorld(true);
      root.traverse((o) => {
        if (!o.isMesh || !o.geometry || !o.geometry.attributes.position || !visible(o) || o.isSprite) return;
        const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere();
        const near = (M) => { sph.copy(g.boundingSphere).applyMatrix4(M); return Math.abs(sph.center.x - cx) < HALF + sph.radius && Math.abs(sph.center.z - cz) < HALF + sph.radius; };
        if (o.isInstancedMesh) for (let i = 0; i < o.count; i += 1) { o.getMatrixAt(i, inst); m.multiplyMatrices(o.matrixWorld, inst); if (near(m)) take(g, m, o.material); }
        else if (near(o.matrixWorld)) take(g, o.matrixWorld, o.material);
      });
    }
    const P = new Float32Array(tris), N = (2 * HALF) / CELL, cells = Array.from({ length: N * N }, () => []);
    for (let t = 0; t < P.length; t += 9) {
      const ax = Math.min(P[t], P[t + 3], P[t + 6]), bx = Math.max(P[t], P[t + 3], P[t + 6]), az = Math.min(P[t + 2], P[t + 5], P[t + 8]), bz = Math.max(P[t + 2], P[t + 5], P[t + 8]);
      const i0 = Math.max(0, Math.floor((ax - x0) / CELL)), i1 = Math.min(N - 1, Math.floor((bx - x0) / CELL)), j0 = Math.max(0, Math.floor((az - z0) / CELL)), j1 = Math.min(N - 1, Math.floor((bz - z0) / CELL));
      for (let j = j0; j <= j1; j += 1) for (let i = i0; i <= i1; i += 1) cells[j * N + i].push(t);
    }
    Object.assign(soup, { cx, cz, tris: P, cells, sig: signature() });
  }
  const signature = () => rootsNow().map((r) => r.uuid + ':' + r.children.length).join('|');
  function cellAt(x, z) {
    const N = (2 * HALF) / CELL, i = Math.floor((x - soup.cx + HALF) / CELL), j = Math.floor((z - soup.cz + HALF) / CELL);
    return i < 0 || j < 0 || i >= N || j >= N ? null : soup.cells[j * N + i];
  }
  // raggio–triangolo (Möller–Trumbore, entrambe le facce): distanza lungo il raggio o −1
  function hit(t, ox, oy, oz, dx, dy, dz) {
    const P = soup.tris, ax = P[t], ay = P[t + 1], az = P[t + 2];
    const e1x = P[t + 3] - ax, e1y = P[t + 4] - ay, e1z = P[t + 5] - az, e2x = P[t + 6] - ax, e2y = P[t + 7] - ay, e2z = P[t + 8] - az;
    const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz;
    if (Math.abs(det) < 1e-9) return -1;
    const inv = 1 / det, tx = ox - ax, ty = oy - ay, tz = oz - az, u = (tx * px + ty * py + tz * pz) * inv;
    if (u < 0 || u > 1) return -1;
    const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x, w = (dx * qx + dy * qy + dz * qz) * inv;
    if (w < 0 || u + w > 1) return -1;
    return (e2x * qx + e2y * qy + e2z * qz) * inv;
  }
  // la superficie più alta sotto (x, from, z), o null
  function groundAt(x, z, from) {
    const list = cellAt(x, z); if (!list) return null;
    let best = null;
    for (const t of list) { const d = hit(t, x, from, z, 0, -1, 0); if (d >= 0 && (best === null || from - d > best)) best = from - d; }
    return best;
  }
  // il corpo è una scatola larga 2·RADIUS dalle ginocchia (sopra STEP: gradini e cordoli si scavalcano) alla testa;
  // un passo è bloccato se la scatola nella nuova posizione tocca un triangolo (anche barre e reti sottili)
  let stamp = 0, marks = new Uint32Array(0);
  function triBox(t, cx, cy, cz, hx, hy, hz) { // sovrapposizione triangolo–scatola (assi separatori, Akenine-Möller)
    const P = soup.tris;
    const ax = P[t] - cx, ay = P[t + 1] - cy, az = P[t + 2] - cz, bx = P[t + 3] - cx, by = P[t + 4] - cy, bz = P[t + 5] - cz, qx = P[t + 6] - cx, qy = P[t + 7] - cy, qz = P[t + 8] - cz;
    if (Math.min(ax, bx, qx) > hx || Math.max(ax, bx, qx) < -hx || Math.min(ay, by, qy) > hy || Math.max(ay, by, qy) < -hy || Math.min(az, bz, qz) > hz || Math.max(az, bz, qz) < -hz) return false;
    const E = [[bx - ax, by - ay, bz - az], [qx - bx, qy - by, qz - bz], [ax - qx, ay - qy, az - qz]];
    const nx = E[0][1] * E[1][2] - E[0][2] * E[1][1], ny = E[0][2] * E[1][0] - E[0][0] * E[1][2], nz = E[0][0] * E[1][1] - E[0][1] * E[1][0];
    if (Math.abs(nx * ax + ny * ay + nz * az) > hx * Math.abs(nx) + hy * Math.abs(ny) + hz * Math.abs(nz)) return false;
    for (const [ex, ey, ez] of E) for (const [px, py, pz] of [[0, ez, -ey], [-ez, 0, ex], [ey, -ex, 0]]) {
      const p0 = px * ax + py * ay + pz * az, p1 = px * bx + py * by + pz * bz, p2 = px * qx + py * qy + pz * qz;
      const r = hx * Math.abs(px) + hy * Math.abs(py) + hz * Math.abs(pz);
      if (Math.min(p0, p1, p2) > r || Math.max(p0, p1, p2) < -r) return false;
    }
    return true;
  }
  // il triangolo toccato dal corpo in (x, z), preferendo una parete (per scivolarci lungo); −1 se il posto è libero
  function touchAt(x, z) {
    const lo = st.feet + STEP + 0.05, hi = st.feet + EYE + 0.1, cy = (lo + hi) / 2, hy = (hi - lo) / 2;
    if (marks.length !== soup.tris.length / 9) marks = new Uint32Array(soup.tris.length / 9);
    stamp += 1; let any = -1;
    for (const ox of [-RADIUS, RADIUS]) for (const oz of [-RADIUS, RADIUS]) {
      const list = cellAt(x + ox, z + oz); if (!list) continue;
      for (const t of list) {
        if (marks[t / 9] === stamp) continue; marks[t / 9] = stamp;
        if (!triBox(t, x, cy, z, RADIUS, hy, RADIUS)) continue;
        if (wallNormal(t)) return t;
        any = t;
      }
    }
    return any;
  }
  // normale orizzontale di un triangolo quasi verticale (per scivolare lungo i muri), o null
  function wallNormal(t) {
    const P = soup.tris, e1x = P[t + 3] - P[t], e1y = P[t + 4] - P[t + 1], e1z = P[t + 5] - P[t + 2], e2x = P[t + 6] - P[t], e2y = P[t + 7] - P[t + 1], e2z = P[t + 8] - P[t + 2];
    const nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x, l = Math.hypot(nx, nz);
    return l > 0.5 * Math.hypot(nx, ny, nz) ? [nx / l, nz / l] : null;
  }

  /* ---------- tronchi degli alberi: cerchi in pianta ---------- */
  let trunks = [], trunksAt = -1e9;
  function refreshTrunks(now) { // ogni 2 s: l'editor può spostare, togliere o aggiungere alberi
    if (now - trunksAt < 2000) return;
    trunksAt = now;
    const list = (C.alberi && C.alberi.list) || [];
    trunks = list.filter((t) => !t.rimosso && Array.isArray(t.p)).map((t) => { const p = C.project(t.p); return [p.x, p.z, /pinus|pino|needle/i.test(t.g || '') ? 0.35 : 0.3]; });
  }

  /* ---------- movimento ---------- */
  function tryMove(dx, dz) {
    if (Math.hypot(dx, dz) < 1e-6) return;
    if (touchAt(st.x, st.z) >= 0) { st.x += dx; st.z += dz; return; } // già dentro qualcosa (partenza, oggetto appena aggiunto): si esce liberamente
    const t = touchAt(st.x + dx, st.z + dz);
    if (t < 0) { st.x += dx; st.z += dz; return; }
    const n = wallNormal(t); if (!n) return;
    const dot = dx * n[0] + dz * n[1], sx = dx - dot * n[0], sz = dz - dot * n[1]; // scivola lungo il muro
    if (Math.hypot(sx, sz) > 1e-4 && touchAt(st.x + sx, st.z + sz) < 0) { st.x += sx; st.z += sz; }
  }
  function trunksOut() { // i tronchi: cerchi in pianta
    for (const [tx, tz, r] of trunks) {
      const ex = st.x - tx, ez = st.z - tz, d = Math.hypot(ex, ez), min = r + RADIUS;
      if (d < min && d > 1e-4) { st.x = tx + (ex / d) * min; st.z = tz + (ez / d) * min; }
    }
  }
  function step(now = performance.now()) {
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    if (Math.hypot(st.x - soup.cx, st.z - soup.cz) > HALF / 2 || (now - soup.checked > 1000 && ((soup.checked = now), signature() !== soup.sig))) buildSoup(st.x, st.z);
    refreshTrunks(now);
    const k = st.keys;
    if (k.has('ArrowLeft')) st.yaw += TURN * dt;
    if (k.has('ArrowRight')) st.yaw -= TURN * dt;
    let f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) - st.stick.y;
    let s = (k.has('KeyD') ? 1 : 0) - (k.has('KeyA') ? 1 : 0) + st.stick.x;
    const mag = Math.hypot(f, s); if (mag > 1) { f /= mag; s /= mag; }
    const run = st.run || k.has('ShiftLeft') || k.has('ShiftRight') || Math.hypot(st.stick.x, st.stick.y) > 0.92;
    const sp = (run ? RUN : WALK) * dt, sy = Math.sin(st.yaw), cy = Math.cos(st.yaw);
    const dx = (-sy * f + cy * s) * sp, dz = (-cy * f - sy * s) * sp;
    const moved = Math.abs(dx) + Math.abs(dz) > 1e-6;
    if (moved) { tryMove(dx, dz); trunksOut(); }
    // terreno sotto i piedi: si sale fino a STEP, si scende a scalini restando attaccati, altrimenti si cade
    const g = groundAt(st.x, st.z, st.feet + STEP + 0.05), gy = g === null ? 0 : g;
    if (st.jump && st.grounded) { st.vy = JUMP; st.grounded = false; }
    st.jump = false;
    if (st.vy > 0 || st.feet > gy + (st.grounded ? STEP : 0.001)) {
      st.vy -= GRAVITY * dt; st.feet += st.vy * dt;
      if (st.feet <= gy) { st.feet = gy; st.vy = 0; st.grounded = true; } else st.grounded = false;
    } else { st.feet = gy; st.vy = 0; st.grounded = true; }
    // la vista segue i piedi con un po' di morbidezza sui gradini, subito nei salti e nelle cadute
    const target = st.feet + EYE;
    st.eye = st.grounded ? st.eye + (target - st.eye) * Math.min(1, dt * 14) : target;
    const cam = C.camera;
    cam.position.set(st.x, st.eye, st.z);
    cam.rotation.set(st.pitch, st.yaw, 0, 'YXZ');
    if (moved && now - tilesAt > 1500) { tilesAt = now; C.tasselli(); } // tasselli dell'ortofoto attorno a chi cammina
  }

  /* ---------- entrata e uscita ---------- */
  // punto di partenza: il centro della vista a terra; se lì c'è un edificio, il primo punto libero verso la camera
  function startPoint() {
    const cam = C.camera, tg = C.controls.target, dx = cam.position.x - tg.x, dz = cam.position.z - tg.z, l = Math.hypot(dx, dz) || 1;
    for (let d = 0; d <= 60; d += 1) {
      const x = tg.x + (dx / l) * d, z = tg.z + (dz / l) * d, top = groundAt(x, z, 400);
      if (top === null || top <= Math.max(0, tg.y) + 1.3) return { x, z, yaw: Math.atan2(dx, dz) };
    }
    return { x: tg.x, z: tg.z, yaw: Math.atan2(dx, dz) };
  }
  function enter() {
    if (on || !C || !C.camera || !C.controls) return;
    const cam = C.camera;
    saved = { fov: cam.fov, near: cam.near };
    buildSoup(C.controls.target.x, C.controls.target.z);
    const p = startPoint();
    const g = groundAt(p.x, p.z, Math.max(0, C.controls.target.y) + 2);
    Object.assign(st, { x: p.x, z: p.z, feet: g === null ? 0 : g, vy: 0, yaw: p.yaw, pitch: -0.05, grounded: true, run: false, jump: false });
    st.eye = st.feet + EYE; st.keys.clear(); resetStick(); trunksAt = -1e9;
    cam.fov = 70; cam.near = 0.1; cam.updateProjectionMatrix();
    on = true; last = performance.now();
    ui.host.classList.add('cm-on'); ui.layer.hidden = false; ui.run.setAttribute('aria-pressed', 'false');
    const fx = C.scene.getObjectByName('editor-maniglie'); if (fx) fx.visible = false;
    C.primaPersona(step);
    ui.layer.focus({ preventScroll: true }); // non su un tasto: lo Spazio lo premerebbe
  }
  function exit() {
    if (!on) return;
    on = false; C.primaPersona(null);
    const cam = C.camera, sy = Math.sin(st.yaw), cy = Math.cos(st.yaw);
    cam.fov = saved.fov; cam.near = saved.near; cam.updateProjectionMatrix(); cam.rotation.order = 'XYZ';
    // la vista dall'alto riparte da dove sei arrivato, alle tue spalle
    C.controls.target.set(st.x - sy * 4, st.feet, st.z - cy * 4);
    cam.position.set(st.x + sy * 14, st.feet + 11, st.z + cy * 14);
    C.controls.update();
    ui.host.classList.remove('cm-on'); ui.layer.hidden = true;
    const fx = C.scene.getObjectByName('editor-maniglie'); if (fx) fx.visible = true;
    st.keys.clear(); resetStick();
    ui.walk.focus({ preventScroll: true });
  }

  /* ---------- comandi ---------- */
  function resetStick() { st.stick.x = 0; st.stick.y = 0; st.stick.id = null; if (ui.knob) ui.knob.style.transform = ''; }
  const KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight', 'Space']);
  function onKey(e) {
    if (!on) return;
    const typing = e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName);
    if (e.type === 'keydown' && e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); exit(); return; }
    if (typing || !KEYS.has(e.code)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if (e.type === 'keydown') { if (e.code === 'Space') st.jump = true; else st.keys.add(e.code); } else st.keys.delete(e.code);
  }
  function css() {
    const s = document.createElement('style');
    s.textContent = `
    .cm-on .ed-bar,.cm-on .ed-card,.cm-on .ed-hint{display:none!important}
    .cm-layer{position:absolute;inset:0;z-index:30;touch-action:none;cursor:grab;user-select:none;-webkit-user-select:none}
    .cm-layer:active{cursor:grabbing}
    .cm-layer:focus{outline:none}
    .cm-top{position:absolute;left:12px;right:12px;top:12px;display:flex;gap:8px;align-items:flex-start;justify-content:space-between;pointer-events:none}
    .cm-help{max-width:440px;padding:8px 12px;border-radius:10px;background:#211d1dd9;color:#fff;font:13px/1.4 Arial,Helvetica,sans-serif}
    .cm-btn{pointer-events:auto;min-height:44px;padding:0 14px;border-radius:10px;border:1px solid #d9d0cc;background:#fffffff2;color:#3b3431;box-shadow:0 4px 14px #32201b22;font:600 13px/1.2 Arial,Helvetica,sans-serif;cursor:pointer}
    .cm-btn[aria-pressed="true"]{background:#822433;border-color:#822433;color:#fff}
    .cm-btn:focus-visible{outline:3px solid #822433;outline-offset:2px}
    .cm-stick{position:absolute;left:20px;bottom:20px;width:128px;height:128px;border-radius:50%;background:#ffffff38;border:2px solid #ffffffb0;box-shadow:0 4px 18px #0004;touch-action:none}
    .cm-knob{position:absolute;left:39px;top:39px;width:46px;height:46px;border-radius:50%;background:#fffffff0;box-shadow:0 2px 8px #0005;pointer-events:none}
    .cm-acts{position:absolute;right:20px;bottom:20px;display:flex;flex-direction:column;gap:10px}
    .cm-acts .cm-btn{min-width:88px;min-height:52px}
    .cm-dot{position:absolute;left:50%;top:50%;width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:50%;background:#fff;box-shadow:0 0 0 1.5px #0007;pointer-events:none}
    @media (pointer:fine){.cm-stick{opacity:.55}}`;
    document.head.appendChild(s);
  }
  function buildUi() {
    const host = document.querySelector('.maparea') || document.body, el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; };
    ui.host = host;
    ui.walk = el('button', 'ed-btn', '🚶 Cammina'); ui.walk.type = 'button'; ui.walk.title = 'Passeggiata in prima persona';
    ui.walk.addEventListener('click', enter);
    ui.layer = el('div', 'cm-layer'); ui.layer.hidden = true; ui.layer.tabIndex = -1; ui.layer.setAttribute('role', 'application'); ui.layer.setAttribute('aria-label', 'Passeggiata in prima persona');
    const top = el('div', 'cm-top'), help = el('div', 'cm-help');
    help.textContent = matchMedia('(pointer: fine)').matches
      ? 'W A S D o frecce per camminare · trascina per guardarti intorno · Maiuscolo corre · Spazio salta · Esc esce'
      : 'Levetta: cammina (fino in fondo corre) · trascina sullo schermo per guardarti intorno';
    ui.exit = el('button', 'cm-btn', '✕ Esci'); ui.exit.type = 'button'; ui.exit.setAttribute('aria-label', 'Esci dalla passeggiata'); ui.exit.addEventListener('click', exit);
    top.append(help, ui.exit);
    ui.stick = el('div', 'cm-stick'); ui.knob = el('div', 'cm-knob'); ui.stick.append(ui.knob); ui.stick.setAttribute('aria-hidden', 'true');
    const acts = el('div', 'cm-acts');
    ui.run = el('button', 'cm-btn', '🏃 Corri'); ui.run.type = 'button'; ui.run.setAttribute('aria-pressed', 'false');
    ui.run.addEventListener('click', () => { st.run = !st.run; ui.run.setAttribute('aria-pressed', String(st.run)); });
    const jump = el('button', 'cm-btn', '⤒ Salta'); jump.type = 'button'; jump.addEventListener('pointerdown', (e) => { e.stopPropagation(); st.jump = true; });
    acts.append(ui.run, jump);
    ui.layer.append(el('div', 'cm-dot'), top, ui.stick, acts);
    host.append(ui.layer);
    for (const b of [ui.exit, ui.run, jump]) b.addEventListener('pointerdown', (e) => e.stopPropagation());
    // levetta
    const R = 46;
    const stickMove = (e) => {
      const r = ui.stick.getBoundingClientRect(); let x = e.clientX - (r.left + r.width / 2), y = e.clientY - (r.top + r.height / 2);
      const d = Math.hypot(x, y); if (d > R) { x *= R / d; y *= R / d; }
      st.stick.x = x / R; st.stick.y = y / R; ui.knob.style.transform = `translate(${x}px,${y}px)`;
    };
    ui.stick.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); st.stick.id = e.pointerId; try { ui.stick.setPointerCapture(e.pointerId); } catch (_) { /* nessuna cattura */ } stickMove(e); });
    ui.stick.addEventListener('pointermove', (e) => { if (e.pointerId === st.stick.id) stickMove(e); });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) ui.stick.addEventListener(t, (e) => { if (e.pointerId === st.stick.id) resetStick(); });
    // sguardo: trascinamento sul resto dello schermo
    ui.layer.addEventListener('pointerdown', (e) => { if (st.look) return; st.look = { id: e.pointerId, x: e.clientX, y: e.clientY }; try { ui.layer.setPointerCapture(e.pointerId); } catch (_) { /* nessuna cattura */ } });
    ui.layer.addEventListener('pointermove', (e) => {
      if (!st.look || e.pointerId !== st.look.id) return;
      st.yaw -= (e.clientX - st.look.x) * LOOK; st.pitch = Math.max(-1.45, Math.min(1.45, st.pitch - (e.clientY - st.look.y) * LOOK));
      st.look.x = e.clientX; st.look.y = e.clientY;
    });
    for (const t of ['pointerup', 'pointercancel', 'lostpointercapture']) ui.layer.addEventListener(t, (e) => { if (st.look && e.pointerId === st.look.id) st.look = null; });
    window.addEventListener('keydown', onKey, { capture: true });
    window.addEventListener('keyup', onKey, { capture: true });
    window.addEventListener('blur', () => { st.keys.clear(); resetStick(); });
    // il tasto sta nella barra dell'editor quando c'è, altrimenti in una barra sua
    let tries = 0;
    const place = setInterval(() => {
      const bar = host.querySelector('.ed-bar');
      if (bar || ++tries > 25) {
        clearInterval(place);
        if (bar) bar.prepend(ui.walk);
        else { const own = el('div', 'ed-bar'); own.style.cssText = 'position:absolute;z-index:20;right:12px;bottom:12px;display:flex;gap:8px;font:600 13px/1.2 Arial,Helvetica,sans-serif'; ui.walk.style.cssText = 'min-height:44px;padding:0 14px;border-radius:10px;border:1px solid #d9d0cc;background:#fffffff2;cursor:pointer'; own.append(ui.walk); host.append(own); }
      }
    }, 400);
  }
  const wait = setInterval(() => {
    const c = window.campus3d;
    if (c && c.scene && c.camera && c.controls && c.renderer && typeof c.primaPersona === 'function') {
      clearInterval(wait); C = c; T = window.THREE; css(); buildUi();
      // per le prove: prova(secondi, tasti) fa avanzare la passeggiata a passi fissi di 1/60 s
      const prova = (sec, keys = []) => { st.keys = new Set(keys); let t = last; for (let i = 0; i < sec * 60; i += 1) { t += 1000 / 60; step(t); } st.keys = new Set(); last = performance.now(); };
      window.campus3dCammina = { entra: enter, esci: exit, prova, salta: () => { st.jump = true; }, get attivo() { return on; }, get stato() { return { x: st.x, piedi: st.feet, z: st.z, yaw: st.yaw, aTerra: st.grounded }; } };
    }
  }, 400);
})();
