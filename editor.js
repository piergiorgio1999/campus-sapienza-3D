(() => {
  'use strict';
  // Editor sul posto della scena 3D: commenti con coordinate (Commenta) e maniglie di ridimensionamento (Modifica).
  // Commenti e modifiche vivono nel db dell'artifact: collezioni "segnalazioni" e "modifiche", lette da Claude.
  const SNAP = 0.05;
  const round = (x) => Math.round(x * 100) / 100;
  const snap = (x) => Math.round(x / SNAP) * SNAP;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let T = null, C = null, scene = null, camera = null, controls = null, canvas = null;
  let db = null, myId = null, saving = false;
  let mode = null; // 'commenta' | 'modifica' | null
  const base = { esterni: null, cortile: null };
  let overrides = [];
  let comments = [];
  let sel = null, drag = null, down = null;
  const ui = {};
  let fx = null, pins = null;

  /* ---------- interfaccia ---------- */
  function css() {
    const st = document.createElement('style');
    st.textContent = `
    .ed-bar{position:absolute;z-index:20;right:12px;bottom:12px;display:flex;gap:8px;align-items:center;font:600 13px/1.2 Arial,Helvetica,sans-serif}
    .ed-btn{min-height:44px;padding:0 14px;border-radius:10px;border:1px solid #d9d0cc;background:#fffffff2;color:#3b3431;box-shadow:0 4px 14px #32201b22;font:inherit;cursor:pointer}
    .ed-btn[aria-pressed="true"]{background:#822433;border-color:#822433;color:#fff}
    .ed-btn:focus-visible{outline:3px solid #822433;outline-offset:2px}
    .ed-hint{position:absolute;z-index:20;left:12px;right:12px;top:12px;margin:auto;max-width:520px;padding:10px 12px;border-radius:10px;background:#211d1dE6;color:#fff;font:13px/1.4 Arial,Helvetica,sans-serif;text-align:center;pointer-events:none}
    .ed-card{position:absolute;z-index:21;width:min(320px,calc(100% - 24px));padding:12px;border-radius:12px;background:#fff;color:#211d1d;border:1px solid #e3ddd7;box-shadow:0 12px 32px #25191433;font:13px/1.4 Arial,Helvetica,sans-serif}
    .ed-card h3{margin:0 0 6px;font-size:14px}
    .ed-card textarea{width:100%;min-height:84px;box-sizing:border-box;padding:8px;border:1px solid #d6cfcc;border-radius:8px;font:14px/1.4 Arial,Helvetica,sans-serif;resize:vertical}
    .ed-card .ed-row{display:flex;gap:8px;justify-content:flex-end;margin-top:8px;flex-wrap:wrap}
    .ed-card .ed-row button{min-height:40px;padding:0 12px;border-radius:8px;border:1px solid #d6cfcc;background:#fff;font:600 13px Arial,Helvetica,sans-serif;cursor:pointer}
    .ed-card .ed-row button.ed-primary{background:#822433;border-color:#822433;color:#fff}
    .ed-card .ed-meta{color:#6f6866;font-size:12px}
    .ed-card p{margin:0 0 6px;white-space:pre-wrap;overflow-wrap:anywhere}`;
    document.head.appendChild(st);
  }
  function el(tag, cls, text) { const n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function buildUi() {
    const host = document.querySelector('.maparea') || document.body;
    ui.host = host;
    ui.bar = el('div', 'ed-bar');
    ui.comment = el('button', 'ed-btn', '💬 Commenta'); ui.comment.type = 'button'; ui.comment.setAttribute('aria-pressed', 'false');
    ui.edit = el('button', 'ed-btn', '⤡ Modifica'); ui.edit.type = 'button'; ui.edit.setAttribute('aria-pressed', 'false');
    ui.bar.append(ui.comment, ui.edit);
    ui.hint = el('div', 'ed-hint'); ui.hint.hidden = true;
    ui.card = el('div', 'ed-card'); ui.card.hidden = true;
    host.append(ui.bar, ui.hint, ui.card);
    ui.comment.addEventListener('click', () => setMode(mode === 'commenta' ? null : 'commenta'));
    ui.edit.addEventListener('click', () => setMode(mode === 'modifica' ? null : 'modifica'));
  }
  function hint(text) { ui.hint.textContent = text || ''; ui.hint.hidden = !text; }
  function closeCard() { ui.card.hidden = true; ui.card.replaceChildren(); }
  function openCard(nodes, x, y) {
    ui.card.replaceChildren(...nodes); ui.card.hidden = false;
    const r = ui.host.getBoundingClientRect(), w = ui.card.offsetWidth, h = ui.card.offsetHeight;
    if (x === 'dock') { ui.card.style.left = '12px'; ui.card.style.top = Math.max(12, r.height - h - 68) + 'px'; return; } // in basso a sinistra: non copre le maniglie
    const left = Math.max(12, Math.min(r.width - w - 12, (x ?? r.width / 2) - r.left - w / 2));
    const top = Math.max(12, Math.min(r.height - h - 68, (y ?? r.height / 2) - r.top + 16));
    ui.card.style.left = left + 'px'; ui.card.style.top = top + 'px';
  }
  function button(label, fn, primary) { const b = el('button', primary ? 'ed-primary' : '', label); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function setMode(next) {
    mode = next; closeCard(); deselect();
    ui.comment.setAttribute('aria-pressed', String(mode === 'commenta'));
    ui.edit.setAttribute('aria-pressed', String(mode === 'modifica'));
    const offline = db ? '' : ' (senza accesso a claude.ai non si salva)';
    if (mode === 'commenta') hint('Tocca un punto della scena per lasciare un commento. Tocca una puntina per leggerla.' + offline);
    else if (mode === 'modifica') hint('Tocca un oggetto (terrazza, aiuola, panchina, scala…) e trascina le maniglie.' + offline);
    else hint('');
    if (pins) pins.visible = true;
  }

  /* ---------- coordinate ---------- */
  function pointerNdc(e) { const r = canvas.getBoundingClientRect(); return new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
  function rayFrom(e) { const rc = new T.Raycaster(); rc.setFromCamera(pointerNdc(e), camera); return rc; }
  function sceneHit(e) {
    const rc = rayFrom(e), targets = scene.children.filter((o) => o !== fx && o !== pins && o.visible);
    return rc.intersectObjects(targets, true).find((h) => h.object.visible && !(h.object.material && h.object.material.visible === false));
  }
  const toLocal = (frame, w) => { frame.updateWorldMatrix(true, false); const p = frame.worldToLocal(w.clone()); return { u: p.x, v: -p.z, h: p.y }; };
  const toWorld = (frame, u, v, h) => { frame.updateWorldMatrix(true, false); return frame.localToWorld(new T.Vector3(u, h, -v)); };
  function frameEsterni(i) { const h = scene.getObjectByName('chimica-esterni'); return h ? h.children.find((g) => g.userData.elemento === i) || null : null; }
  function frameCortile() { const h = scene.getObjectByName('cortile-modello'); return h ? h.children[0] : null; }
  function describe(obj) {
    for (let o = obj; o; o = o.parent) {
      if (o.name === 'chimica-esterni') { const g = obj; let f = g; while (f && f.userData.elemento === undefined) f = f.parent; const e = f && C.esterni.cfg.elementi[f.userData.elemento]; return 'esterni di Chimica' + (e ? ': ' + (e.nome || e.tipo) : ''); }
      if (o.name === 'cortile-modello') return "cortile dell'azoto";
      if (o.name === 'alberi') return 'albero';
      if (o.userData && o.userData.code) return 'edificio ' + o.userData.code;
    }
    return 'terreno o contesto';
  }

  /* ---------- oggetti modificabili ---------- */
  // forma interna: rect {u0,v0,u1,v1} · poly [[u,v],…] · line [[u,v],…] · point {u,v}
  function items() {
    const out = [], E = C.esterni.cfg, M = C.cortile.M;
    if (E) E.elementi.forEach((e, i) => {
      const frame = () => frameEsterni(i), P = `elementi.${i}`, nome = e.nome || e.tipo;
      const add = (o) => out.push(Object.assign({ sorgente: 'esterni', frame, nome }, o, { key: `esterni:${P}${o.campo ? '.' + o.campo : ''}`, percorso: `${P}${o.campo ? '.' + o.campo : ''}` }));
      const H = Number(e.altezza) || 0;
      if (e.tipo === 'terrazza') {
        add({ campo: 'poligono', label: 'Terrazza (sagoma)', kind: 'poly', h: H + 0.05, get: () => e.poligono, set: (p) => { e.poligono = p; } });
        if (e.prato) add({ campo: 'prato', label: 'Aiuola della terrazza', kind: 'rect', h: H + 0.1, get: () => ({ u0: e.prato[0], v0: e.prato[1], u1: e.prato[2], v1: e.prato[3] }), set: (r) => { e.prato = [r.u0, r.v0, r.u1, r.v1]; } });
        (e.panchine || []).forEach((p, k) => add({ campo: `panchine.${k}`, label: `Panchina ${k + 1}`, kind: 'point', h: H + 0.5, get: () => ({ u: p.u, v: p.v }), set: (q) => { p.u = q.u; p.v = q.v; } }));
        (e.ringhiere || []).forEach((l, k) => add({ campo: `ringhiere.${k}`, label: `Ringhiera ${k + 1}`, kind: 'line', h: H + 1.0, get: () => l, set: (q) => { e.ringhiere[k] = q; } }));
      } else if (e.tipo === 'area' || e.tipo === 'pilastro') {
        add({ campo: 'poligono', label: nome, kind: 'poly', h: e.tipo === 'pilastro' ? (Number(e.altezza) || 2.5) : 0.06, get: () => e.poligono, set: (p) => { e.poligono = p; } });
      } else if (e.tipo === 'scala') {
        add({ campo: '', label: nome, kind: 'pointU', h: 0.2, get: () => ({ u: e.u, v: (Number(e.distacco) || 0.5) + (Number(e.larghezza) || 4.3) / 2 }), set: (q) => { e.u = q.u; } });
      } else if (e.tipo === 'palo') {
        add({ campo: '', label: nome, kind: 'point', h: 0.4, get: () => ({ u: e.u, v: e.v }), set: (q) => { e.u = q.u; e.v = q.v; } });
      }
    });
    if (M) {
      const frame = frameCortile;
      const add = (o) => out.push(Object.assign({ sorgente: 'cortile', frame, nome: o.label }, o, { key: `cortile:${o.percorso}` }));
      const rect2 = (obj) => ({ get: () => ({ u0: obj.u[0], u1: obj.u[1], v0: obj.v[0], v1: obj.v[1] }), set: (r) => { obj.u = [r.u0, r.u1]; obj.v = [r.v0, r.v1]; } });
      const pt = (obj) => ({ get: () => ({ u: obj.u, v: obj.v }), set: (q) => { obj.u = q.u; obj.v = q.v; } });
      if (M.pavimento) add(Object.assign({ percorso: 'pavimento', label: 'Pavimento del cortile', kind: 'rect', h: 0.04 }, rect2(M.pavimento)));
      (M.aiuole || []).forEach((a, k) => add(Object.assign({ percorso: `aiuole.${k}`, label: `Aiuola ${a.id || k + 1} del cortile`, kind: 'rect', h: Number(a.altezza) || 0.42 }, rect2(a))));
      if (M.gabbia) add(Object.assign({ percorso: 'gabbia', label: 'Gabbia del serbatoio', kind: 'rect', h: 0.5 }, rect2(M.gabbia)));
      (M.pilastri || []).forEach((p, k) => add(Object.assign({ percorso: `pilastri.${k}`, label: `Pilastro ${k + 1} del portico`, kind: 'rect', h: Number(p.altezza) || 4.5 }, rect2(p))));
      if (M.portico) add(Object.assign({ percorso: 'portico', label: 'Portico', kind: 'rect', h: Number(M.portico.soffitto) || 4.5 }, rect2(M.portico)));
      (M.magnolie || []).forEach((m, k) => add(Object.assign({ percorso: `magnolie.${k}`, label: `Magnolia ${m.id || k + 1}`, kind: 'point', h: 0.6 }, pt(m))));
      if (M.serbatoio) add(Object.assign({ percorso: 'serbatoio', label: "Serbatoio dell'azoto", kind: 'point', h: 0.6 }, pt(M.serbatoio)));
      (M.tombini || []).forEach((t, k) => add(Object.assign({ percorso: `tombini.${k}`, label: `Tombino ${k + 1}`, kind: 'point', h: 0.06 }, pt(t))));
      (M.transenne || []).forEach((t, k) => add(Object.assign({ percorso: `transenne.${k}`, label: `Transenna ${k + 1}`, kind: 'point', h: 0.6 }, pt(t))));
    }
    return out;
  }
  const shapeArea = (it, s) => it.kind === 'rect' ? Math.abs((s.u1 - s.u0) * (s.v1 - s.v0)) : it.kind === 'poly' ? Math.abs(s.reduce((a, p, i) => { const q = s[(i + 1) % s.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2) : 0;
  function inside(it, s, u, v) {
    if (it.kind === 'rect') return u >= Math.min(s.u0, s.u1) && u <= Math.max(s.u0, s.u1) && v >= Math.min(s.v0, s.v1) && v <= Math.max(s.v0, s.v1);
    if (it.kind === 'poly') { let c = false; for (let i = 0, j = s.length - 1; i < s.length; j = i++) { const [xi, yi] = s[i], [xj, yj] = s[j]; if ((yi > v) !== (yj > v) && u < ((xj - xi) * (v - yi)) / (yj - yi) + xi) c = !c; } return c; }
    return false;
  }
  function pick(world) {
    let best = null;
    for (const it of items()) {
      const f = it.frame(); if (!f) continue;
      const { u, v } = toLocal(f, world), s = it.get();
      let score = null;
      if (it.kind === 'point' || it.kind === 'pointU') { const d = Math.hypot(u - s.u, v - s.v); if (d < (it.kind === 'pointU' ? 4.6 : 1.3)) score = d; }
      else if (it.kind === 'line') { for (let i = 0; i < s.length - 1; i += 1) { const d = segDist(u, v, s[i], s[i + 1]); if (d < 0.6) score = Math.min(score ?? 9, 0.5 + d); } }
      else if (inside(it, s, u, v)) score = 2 + shapeArea(it, s) / 1000;
      if (score != null && (!best || score < best.score)) best = { it, score };
    }
    return best ? best.it : null;
  }
  function segDist(u, v, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1, t = Math.max(0, Math.min(1, ((u - a[0]) * dx + (v - a[1]) * dy) / L)); return Math.hypot(u - a[0] - t * dx, v - a[1] - t * dy); }
  function findItem(sorgente, percorso, nome) {
    const all = items();
    return all.find((it) => it.sorgente === sorgente && it.percorso === percorso && (!nome || it.nome === nome))
      || all.find((it) => it.sorgente === sorgente && nome && it.nome === nome && it.percorso.split('.').slice(2).join('.') === percorso.split('.').slice(2).join('.')) || null;
  }

  /* ---------- maniglie ---------- */
  const handleMat = () => new T.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true });
  const handleGeo = () => new T.BoxGeometry(1, 1, 1);
  function handlesFor(it, s) {
    // [{id, u, v, role}] — angoli e lati come in un riquadro di Office, più "sposta" al centro
    const hs = [];
    if (it.kind === 'rect') {
      const um = (s.u0 + s.u1) / 2, vm = (s.v0 + s.v1) / 2;
      for (const [cu, cv] of [[0, 0], [1, 0], [1, 1], [0, 1]]) hs.push({ role: 'corner', cu, cv, u: cu ? s.u1 : s.u0, v: cv ? s.v1 : s.v0 });
      hs.push({ role: 'side', side: 'v0', u: um, v: s.v0 }, { role: 'side', side: 'u1', u: s.u1, v: vm }, { role: 'side', side: 'v1', u: um, v: s.v1 }, { role: 'side', side: 'u0', u: s.u0, v: vm });
      hs.push({ role: 'move', u: um, v: vm });
    } else if (it.kind === 'poly' || it.kind === 'line') {
      const n = s.length, closed = it.kind === 'poly';
      s.forEach((p, k) => hs.push({ role: 'vertex', k, u: p[0], v: p[1] }));
      for (let k = 0; k < (closed ? n : n - 1); k += 1) { const a = s[k], b = s[(k + 1) % n]; hs.push({ role: 'edge', k, u: (a[0] + b[0]) / 2, v: (a[1] + b[1]) / 2 }); }
      const c = s.reduce((acc, p) => [acc[0] + p[0] / n, acc[1] + p[1] / n], [0, 0]); hs.push({ role: 'move', u: c[0], v: c[1] });
    } else hs.push({ role: 'move', u: s.u, v: s.v });
    return hs;
  }
  function deselect() {
    if (!sel) return;
    fx.remove(sel.vis); sel.vis.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    sel = null; closeCard();
  }
  function select(it) {
    deselect();
    sel = { it, shape: clone(it.get()), vis: new T.Group(), handles: [] };
    fx.add(sel.vis); drawSel(); infoCard();
  }
  function drawSel() {
    const { it, shape, vis } = sel, f = it.frame(); if (!f) return;
    vis.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); vis.clear(); sel.handles = [];
    const pts = it.kind === 'rect' ? [[shape.u0, shape.v0], [shape.u1, shape.v0], [shape.u1, shape.v1], [shape.u0, shape.v1]] : (it.kind === 'poly' || it.kind === 'line') ? shape : null;
    if (pts) {
      const g = new T.BufferGeometry().setFromPoints(pts.map(([u, v]) => toWorld(f, u, v, it.h)));
      const line = new (it.kind === 'line' ? T.Line : T.LineLoop)(g, new T.LineBasicMaterial({ color: 0x822433, depthTest: false, transparent: true }));
      line.renderOrder = 998; vis.add(line);
    }
    for (const h of handlesFor(it, shape)) {
      const m = new T.Mesh(handleGeo(), handleMat());
      m.material.color.set(h.role === 'move' ? 0x822433 : 0xffffff);
      const edge = new T.LineSegments(new T.EdgesGeometry(m.geometry), new T.LineBasicMaterial({ color: 0x822433, depthTest: false, transparent: true }));
      edge.renderOrder = 1000; m.add(edge);
      m.position.copy(toWorld(f, h.u, h.v, it.h)); m.renderOrder = 999; m.userData.handle = h;
      vis.add(m); sel.handles.push(m);
    }
    scaleHandles();
  }
  function scaleHandles() {
    if (!sel) return;
    for (const m of sel.handles) { const d = camera.position.distanceTo(m.position), s = Math.max(0.12, d * 0.018) * (m.userData.handle.role === 'move' ? 1.25 : 1); m.scale.setScalar(s); }
  }
  function fmt(it, s) {
    if (it.kind === 'rect') return `u ${round(Math.min(s.u0, s.u1))} → ${round(Math.max(s.u0, s.u1))} · v ${round(Math.min(s.v0, s.v1))} → ${round(Math.max(s.v0, s.v1))} (${round(Math.abs(s.u1 - s.u0))} × ${round(Math.abs(s.v1 - s.v0))} m)`;
    if (it.kind === 'poly' || it.kind === 'line') return s.map(([u, v]) => `(${round(u)}, ${round(v)})`).join(' ');
    return it.kind === 'pointU' ? `u ${round(s.u)}` : `u ${round(s.u)} · v ${round(s.v)}`;
  }
  function infoCard() {
    if (!sel) return;
    const { it } = sel, ov = overrides.find((o) => o.id === docId(it));
    const nodes = [el('h3', '', it.label), el('p', 'ed-meta', fmt(it, sel.shape))];
    nodes.push(el('p', 'ed-meta', it.kind === 'point' || it.kind === 'pointU' ? 'Trascina la maniglia rossa per spostarlo.' : 'Angoli: due lati · quadratini sui lati: un lato · rosso al centro: sposta tutto.'));
    const row = el('div', 'ed-row');
    if (ov) row.append(button('Ripristina originale', () => restore(it)));
    row.append(button('Fine', () => deselect(), true));
    nodes.push(row);
    openCard(nodes, 'dock');
  }
  function applyDrag(h, u, v) {
    const s = sel.shape, it = sel.it, min = 0.1;
    u = snap(u); v = snap(v);
    if (it.kind === 'rect') {
      if (h.role === 'corner') { if (h.cu) s.u1 = Math.max(u, s.u0 + min); else s.u0 = Math.min(u, s.u1 - min); if (h.cv) s.v1 = Math.max(v, s.v0 + min); else s.v0 = Math.min(v, s.v1 - min); }
      else if (h.role === 'side') { if (h.side === 'u1') s.u1 = Math.max(u, s.u0 + min); if (h.side === 'u0') s.u0 = Math.min(u, s.u1 - min); if (h.side === 'v1') s.v1 = Math.max(v, s.v0 + min); if (h.side === 'v0') s.v0 = Math.min(v, s.v1 - min); }
      else { const du = u - drag.start.u, dv = v - drag.start.v, o = drag.startShape; s.u0 = o.u0 + du; s.u1 = o.u1 + du; s.v0 = o.v0 + dv; s.v1 = o.v1 + dv; }
    } else if (it.kind === 'poly' || it.kind === 'line') {
      const o = drag.startShape, n = o.length;
      if (h.role === 'vertex') s[h.k] = [u, v];
      else if (h.role === 'edge') {
        const a = o[h.k], b = o[(h.k + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], L = Math.hypot(ex, ey) || 1, nx = -ey / L, ny = ex / L;
        const d = snap((u - drag.start.u) * nx + (v - drag.start.v) * ny);
        s[h.k] = [round(a[0] + nx * d), round(a[1] + ny * d)]; s[(h.k + 1) % n] = [round(b[0] + nx * d), round(b[1] + ny * d)];
      } else { const du = u - drag.start.u, dv = v - drag.start.v; o.forEach((p, k) => { s[k] = [round(p[0] + du), round(p[1] + dv)]; }); }
    } else if (it.kind === 'pointU') s.u = u;
    else { s.u = u; s.v = v; }
    for (const k of Object.keys(s)) if (typeof s[k] === 'number') s[k] = round(s[k]);
  }

  /* ---------- salvataggio ---------- */
  const docId = (it) => `${it.sorgente}:${it.percorso}`.replace(/[^A-Za-z0-9_\-.~:@+]/g, '_');
  async function save(it) {
    const valore = clone(sel.shape), orig = baseValue(it);
    it.set(clone(valore)); rebuild(it.sorgente); drawSel(); infoCard();
    if (!db) { hint('Modifica applicata solo su questo schermo: per salvarla apri la pagina da claude.ai.'); return; }
    try {
      await db.collection('modifiche').doc(docId(it)).set({ sorgente: it.sorgente, percorso: it.percorso, nome: it.nome, oggetto: it.label, tipo: it.kind, valore, originale: orig, stato: 'da applicare', autore: myId, aggiornato: new Date().toISOString() });
      hint('Modifica salvata: ' + it.label + '. Claude la vede e la riporta nei file.');
      setTimeout(() => { if (mode === 'modifica') setMode('modifica'); }, 2500);
    } catch (e) { hint('Non sono riuscito a salvare (' + (e && e.code || 'errore') + ').'); }
  }
  // lo stesso oggetto letto sulla copia dei file appena caricati (prima di ogni modifica)
  function baseValue(it) {
    const root = it.sorgente === 'esterni' ? base.esterni : base.cortile;
    if (!root) return null;
    return withConfigs(it.sorgente === 'esterni' ? { esterni: root } : { cortile: root }, () => { const twin = items().find((x) => x.key === it.key); return twin ? clone(twin.get()) : null; });
  }
  function withConfigs(swap, fn) {
    const real = window.campus3d;
    const fake = Object.create(real);
    Object.defineProperty(fake, 'esterni', { value: { cfg: swap.esterni || real.esterni.cfg, rebuild: () => {} } });
    Object.defineProperty(fake, 'cortile', { value: { M: swap.cortile || real.cortile.M, rebuild: () => {} } });
    const keep = C; C = fake;
    try { return fn(); } finally { C = keep; }
  }
  async function restore(it) {
    const orig = baseValue(it); if (!orig) return;
    it.set(clone(orig)); rebuild(it.sorgente);
    sel.shape = clone(orig); drawSel();
    if (db) { try { await db.collection('modifiche').doc(docId(it)).delete(); } catch (_) { /* resta in elenco */ } }
    infoCard();
  }
  function rebuild(sorgente) { if (sorgente === 'esterni') C.esterni.rebuild(); else C.cortile.rebuild(); }
  function applyOverrides(list) {
    const touched = new Set();
    for (const o of list) {
      if (o.stato === 'applicata' || !o.valore) continue;
      const it = findItem(o.sorgente, o.percorso, o.nome); if (!it) continue;
      if (JSON.stringify(it.get()) === JSON.stringify(o.valore)) continue;
      it.set(clone(o.valore)); touched.add(it.sorgente);
    }
    for (const s of touched) rebuild(s);
    if (sel) { const it = findItem(sel.it.sorgente, sel.it.percorso, sel.it.nome); if (it && !drag) { sel.it = it; sel.shape = clone(it.get()); drawSel(); } }
  }

  /* ---------- commenti ---------- */
  function pinTexture(n, done) {
    const c = document.createElement('canvas'); c.width = c.height = 96; const x = c.getContext('2d');
    x.fillStyle = done ? '#6f6866' : '#822433'; x.beginPath(); x.arc(48, 42, 34, 0, Math.PI * 2); x.fill();
    x.beginPath(); x.moveTo(30, 66); x.lineTo(48, 94); x.lineTo(66, 66); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 5; x.beginPath(); x.arc(48, 42, 34, 0, Math.PI * 2); x.stroke();
    x.fillStyle = '#fff'; x.font = 'bold 34px Arial'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(n), 48, 43);
    const t = new T.CanvasTexture(c); return t;
  }
  function drawPins() {
    pins.traverse((o) => { if (o.material) { if (o.material.map) o.material.map.dispose(); o.material.dispose(); } });
    pins.clear();
    comments.filter((c) => c.data.stato !== 'fatta' && c.data.punto).forEach((c, i) => {
      const s = new T.Sprite(new T.SpriteMaterial({ map: pinTexture(i + 1, false), depthTest: false, sizeAttenuation: false }));
      s.center.set(0.5, 0.02); s.scale.set(0.05, 0.05, 1); s.renderOrder = 1001;
      const p = c.data.punto; s.position.set(p.x, p.y, p.z); s.userData.comment = c; pins.add(s);
    });
  }
  function newComment(hit, e) {
    const ta = el('textarea'); ta.placeholder = 'Cosa va cambiato qui?'; ta.setAttribute('aria-label', 'Testo del commento');
    const meta = el('p', 'ed-meta', describe(hit.object));
    const row = el('div', 'ed-row');
    row.append(button('Annulla', closeCard), button('Salva', async () => {
      const testo = ta.value.trim(); if (!testo) { ta.focus(); return; }
      if (!db) { hint('Per salvare i commenti apri la pagina da claude.ai.'); return; }
      if (saving) return; saving = true;
      try { await db.collection('segnalazioni').add(commentDoc(hit, testo)); closeCard(); hint('Commento salvato. Claude lo legge con le coordinate.'); }
      catch (err) { hint('Non sono riuscito a salvare (' + (err && err.code || 'errore') + ').'); }
      finally { saving = false; }
    }, true));
    openCard([el('h3', '', 'Nuovo commento'), meta, ta, row], e.clientX, e.clientY);
    setTimeout(() => ta.focus(), 30);
  }
  function commentDoc(hit, testo) {
    const w = hit.point, it = pick(w), lonLat = C.toLonLat ? C.toLonLat(w) : null;
    const f0 = frameEsterni(0), fc = frameCortile();
    const loc = (f) => { if (!f) return null; const q = toLocal(f, w); return { u: round(q.u), v: round(q.v), h: round(q.h) }; };
    const lc = loc(fc), inCourt = lc && lc.u > -6 && lc.u < 24 && lc.v > -8 && lc.v < 16;
    const tg = controls ? controls.target : new T.Vector3();
    const r3 = (v) => [round(v.x), round(v.y), round(v.z)];
    return {
      testo, stato: 'aperta', creato: new Date().toISOString(), autore: myId,
      punto: { x: round(w.x), y: round(w.y), z: round(w.z) }, quota: round(w.y),
      lonLat: lonLat ? [Number(lonLat[0].toFixed(7)), Number(lonLat[1].toFixed(7))] : null,
      lato0: loc(f0), cortile: inCourt ? lc : null,
      oggetto: describe(hit.object),
      elemento: it ? { chiave: docId(it), nome: it.nome, etichetta: it.label, sorgente: it.sorgente, percorso: it.percorso } : null,
      vista: { camera: r3(camera.position), target: r3(tg) },
    };
  }
  function showComment(c, e) {
    const d = c.data, nodes = [el('h3', '', 'Commento'), el('p', '', d.testo || ''), el('p', 'ed-meta', `${d.oggetto || ''}${d.creato ? ' · ' + new Date(d.creato).toLocaleString('it-IT') : ''}`)];
    const row = el('div', 'ed-row');
    if (db) {
      row.append(button('Elimina', async () => { try { await db.collection('segnalazioni').doc(c.id).delete(); closeCard(); } catch (_) { hint('Non riesco a eliminarlo.'); } }));
      row.append(button('Fatto', async () => { try { await db.collection('segnalazioni').doc(c.id).update({ stato: 'fatta', chiuso: new Date().toISOString() }); closeCard(); } catch (_) { hint('Non riesco ad aggiornarlo.'); } }));
    }
    row.append(button('Chiudi', closeCard, true));
    nodes.push(row); openCard(nodes, e.clientX, e.clientY);
  }

  /* ---------- puntatore ---------- */
  function onDown(e) {
    if (!mode || (e.button !== undefined && e.button !== 0)) return;
    down = { x: e.clientX, y: e.clientY, t: performance.now() };
    if (mode === 'modifica' && sel) {
      const rc = rayFrom(e), hit = rc.intersectObjects(sel.handles, false)[0];
      if (hit) {
        const m = hit.object, h = m.userData.handle, f = sel.it.frame();
        const plane = new T.Plane(new T.Vector3(0, 1, 0), -m.position.y), p = new T.Vector3();
        if (!rc.ray.intersectPlane(plane, p)) return;
        const q = toLocal(f, p);
        drag = { handle: h, plane, start: { u: q.u, v: q.v }, startShape: clone(sel.shape), pointerId: e.pointerId };
        controls.enabled = false;
        try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* nessuna cattura */ }
        e.stopImmediatePropagation(); e.preventDefault();
      }
    }
  }
  function onMove(e) {
    if (!drag) return;
    const rc = rayFrom(e), p = new T.Vector3();
    if (!rc.ray.intersectPlane(drag.plane, p)) return;
    const q = toLocal(sel.it.frame(), p);
    applyDrag(drag.handle, q.u, q.v); drawSel();
    hint(sel.it.label + ': ' + fmt(sel.it, sel.shape));
    e.stopImmediatePropagation(); e.preventDefault();
  }
  function onUp(e) {
    if (drag) {
      const it = sel.it, changed = JSON.stringify(sel.shape) !== JSON.stringify(drag.startShape); drag = null; controls.enabled = true;
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) { /* già rilasciato */ }
      if (changed) save(it); else infoCard();
      e.stopImmediatePropagation(); return;
    }
    if (!mode || !down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
    if (moved > 6) return; // era una rotazione della vista
    if (mode === 'commenta') {
      const rc = rayFrom(e), ph = rc.intersectObjects(pins.children, false)[0];
      if (ph) { showComment(ph.object.userData.comment, e); return; }
      const hit = sceneHit(e); if (hit) newComment(hit, e);
    } else if (mode === 'modifica') {
      const hit = sceneHit(e); if (!hit) { deselect(); return; }
      const it = pick(hit.point);
      if (it) select(it); else { deselect(); hint('Qui non c’è niente di modificabile: prova sulla terrazza, le aiuole, le panchine, le scale o il cortile.'); }
    }
  }
  function loop() { scaleHandles(); requestAnimationFrame(loop); }

  /* ---------- avvio ---------- */
  async function connect() {
    const cl = window.claude;
    if (!cl || typeof cl.use !== 'function') return;
    try {
      const [d, u] = await Promise.all([cl.use('db'), cl.use('user')]);
      db = d; myId = u ? await u.id() : null;
    } catch (_) { db = null; }
    if (!db) return;
    db.collection('segnalazioni').onSnapshot((snap) => { comments = snap.docs.filter((x) => x.exists).map((x) => ({ id: x.id, data: x.data() })).sort((a, b) => String(a.data.creato).localeCompare(String(b.data.creato))); drawPins(); }, () => {});
    db.collection('modifiche').onSnapshot((snap) => { overrides = snap.docs.filter((x) => x.exists).map((x) => Object.assign({ id: x.id }, x.data())); applyOverrides(overrides); }, () => {});
    if (mode) setMode(mode);
  }
  function start() {
    C = window.campus3d; T = window.THREE; scene = C.scene; camera = C.camera; controls = C.controls; canvas = C.renderer.domElement;
    base.esterni = clone(C.esterni.cfg); base.cortile = clone(C.cortile.M);
    fx = new T.Group(); fx.name = 'editor-maniglie'; pins = new T.Group(); pins.name = 'editor-commenti';
    scene.add(fx, pins);
    css(); buildUi();
    canvas.addEventListener('pointerdown', onDown, { capture: true });
    canvas.addEventListener('pointermove', onMove, { capture: true });
    canvas.addEventListener('pointerup', onUp, { capture: true });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (ui.card.hidden) setMode(null); else closeCard(); } });
    loop(); connect();
  }
  // aspetta la scena e le due configurazioni (esterni di Chimica e cortile)
  const wait = setInterval(() => {
    const c = window.campus3d;
    if (c && c.scene && c.renderer && c.controls && c.esterni && c.esterni.cfg && c.cortile && c.cortile.M && c.scene.getObjectByName('chimica-esterni') && c.scene.getObjectByName('cortile-modello')) { clearInterval(wait); start(); }
  }, 400);
})();
