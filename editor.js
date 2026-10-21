(() => {
  'use strict';
  // Editor sul posto della scena 3D.
  // · Commenta: tocchi un punto e scrivi; il commento si salva con le coordinate (collezione "segnalazioni").
  // · Modifica: ogni solido ha una scatola di ridimensionamento a parallelepipedo, con una maniglia su ognuna delle sei
  //   facce, sugli angoli e una (rossa, in alto) per spostarlo. Gli oggetti descritti nei JSON (terrazza, panchine, scale,
  //   cortile…) cambiano i loro dati; ogni altro pezzo ("primitiva": una barra, un tubo, un edificio…) viene deformato
  //   con una trasformazione. Tutto finisce nella collezione "modifiche" del db dell'artifact, che Claude riporta nei file.
  const SNAP = 0.05, MIN = 0.05, HANDLE_PX = 28;
  const ROOTS = ['chimica-esterni', 'cortile-modello', 'alberi', 'edifici', 'minerva', 'planimetria'];
  const KEYS = ['u0', 'u1', 'v0', 'v1', 'h0', 'h1'];
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
    else if (mode === 'modifica') hint('Tocca un oggetto: compare la sua scatola. Facce: un lato · angoli: due lati · rossa in alto: sposta.' + offline);
    else hint('');
    if (pins) pins.visible = true;
  }

  /* ---------- cornici e coordinate ---------- */
  // cornice = gruppo con X = u, Y = h, Z = −v: un lato della sagoma di Chimica (esterni) o il cortile dell'azoto;
  // tutto il resto usa il lato 0 di Chimica, allineato con gli edifici vicini
  function frameEsterni(i) { const h = scene.getObjectByName('chimica-esterni'); return h ? h.children.find((g) => g.userData.elemento === i) || null : null; }
  function frameCortile() { const h = scene.getObjectByName('cortile-modello'); return h ? h.children[0] : null; }
  function frameBy(key) { if (key === 'cortile') return frameCortile(); const m = /^esterni:(\d+)$/.exec(key || ''); return frameEsterni(m ? Number(m[1]) : 0); }
  function frameKeyOf(obj) {
    for (let o = obj; o; o = o.parent) {
      if (o.parent && o.parent.name === 'chimica-esterni' && o.userData.elemento !== undefined) return 'esterni:' + o.userData.elemento;
      if (o.name === 'cortile-modello') return 'cortile';
    }
    return 'lato0';
  }
  const toLocal = (f, w) => { f.updateWorldMatrix(true, false); const p = f.worldToLocal(w.clone()); return { u: p.x, v: -p.z, h: p.y }; };
  const toWorld = (f, u, v, h) => { f.updateWorldMatrix(true, false); return f.localToWorld(new T.Vector3(u, h, -v)); };
  function pointerNdc(e) { const r = canvas.getBoundingClientRect(); return new T.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); }
  function rayFrom(e) { const rc = new T.Raycaster(); rc.setFromCamera(pointerNdc(e), camera); return rc; }
  const shown = (o) => { for (let x = o; x; x = x.parent) if (!x.visible) return false; return true; };
  function hits(e) {
    const rc = rayFrom(e), targets = scene.children.filter((o) => o !== fx && o !== pins && o.visible);
    return rc.intersectObjects(targets, true).filter((h) => {
      const o = h.object, mat = Array.isArray(o.material) ? o.material[(h.face && h.face.materialIndex) || 0] : o.material;
      return shown(o) && !(mat && mat.visible === false) && !o.isSprite;
    });
  }
  function describe(obj) {
    for (let o = obj; o; o = o.parent) {
      if (o.name === 'chimica-esterni') { let f = obj; while (f && f.userData.elemento === undefined) f = f.parent; const e = f && C.esterni.cfg.elementi[f.userData.elemento]; return 'esterni di Chimica' + (e ? ': ' + (e.nome || e.tipo) : ''); }
      if (o.name === 'cortile-modello') return "cortile dell'azoto";
      if (o.name === 'alberi') return 'albero';
      if (o.name === 'minerva') return 'piazzale della Minerva';
      if (o.userData && o.userData.code) return 'edificio ' + o.userData.code;
      if (o.name === 'edifici') return 'edificio';
    }
    return 'terreno o contesto';
  }

  /* ---------- scatole ---------- */
  const bboxPts = (pts) => { const us = pts.map((p) => p[0]), vs = pts.map((p) => p[1]); return { u0: Math.min(...us), u1: Math.max(...us), v0: Math.min(...vs), v1: Math.max(...vs) }; };
  // una coordinata dentro la vecchia scatola finisce nello stesso punto relativo della nuova; su un asse piatto segue la faccia mossa
  function sc(c, o0, o1, n0, n1) { if (o1 - o0 > 1e-3) return n0 + ((c - o0) * (n1 - n0)) / (o1 - o0); return c + (Math.abs(n0 - o0) > 1e-9 ? n0 - o0 : n1 - o1); }
  const scalePts = (pts, o, n) => pts.map((p) => { const q = [round(sc(p[0], o.u0, o.u1, n.u0, n.u1)), round(sc(p[1], o.v0, o.v1, n.v0, n.v1))]; if (p.length > 2) q.push(round(sc(p[2], o.h0, o.h1, n.h0, n.h1))); return q; });
  const vol = (b) => Math.max(b.u1 - b.u0, 0.05) * Math.max(b.v1 - b.v0, 0.05) * Math.max(b.h1 - b.h0, 0.05);
  const inBox = (b, q, pad) => q.u >= b.u0 - pad && q.u <= b.u1 + pad && q.v >= b.v0 - pad && q.v <= b.v1 + pad && q.h >= b.h0 - pad && q.h <= b.h1 + pad;
  const roundBox = (b) => { const o = {}; for (const k of KEYS) o[k] = round(b[k]); return o; };
  function defQuote(piani) { const out = []; for (let k = 1, prev = 0; k <= piani; k += 1) { const f = 5.25 + 3.95 * (k - 1); out.push(round((prev + f) / 2), round(f)); prev = f; } return out; }

  /* ---------- oggetti descritti nei file (cambiano i loro dati) ---------- */
  function items(E, M) {
    const out = [];
    const add = (it) => {
      const { fields, obj } = it;
      out.push(Object.assign(it, {
        key: `${it.sorgente}:${it.percorso}`, lock: it.lock || {},
        get: () => { const r = {}; for (const k of fields) if (obj[k] !== undefined) r[k] = clone(obj[k]); return r; },
        set: (val) => { for (const k of fields) if (val && val[k] !== undefined) obj[k] = clone(val[k]); },
      }));
    };
    if (E) (E.elementi || []).forEach((e, i) => {
      const b = { sorgente: 'esterni', frameKey: 'esterni:' + i, nome: e.nome || e.tipo, obj: e }, P = `elementi.${i}`;
      if (e.tipo === 'terrazza') {
        const th = () => Number(e.altezza) || 0.8;
        add({ ...b, percorso: P, label: 'Terrazza', fields: ['poligono', 'altezza'], lock: { h0: true },
          box: () => ({ ...bboxPts(e.poligono), h0: 0, h1: th() }),
          apply: (o, n) => { e.poligono = scalePts(e.poligono, o, n); e.altezza = round(n.h1); },
          verts: { get: () => e.poligono, set: (q) => { e.poligono = q; } } });
        if (e.prato) add({ ...b, percorso: P + '.prato', label: 'Aiuola della terrazza', fields: ['prato'], lock: { h0: true, h1: true },
          box: () => ({ u0: e.prato[0], v0: e.prato[1], u1: e.prato[2], v1: e.prato[3], h0: th(), h1: th() + 0.18 }),
          apply: (o, n) => { e.prato = [n.u0, n.v0, n.u1, n.v1].map(round); } });
        (e.panchine || []).forEach((p, k) => add({ ...b, obj: p, percorso: `${P}.panchine.${k}`, label: `Panchina ${k + 1}`, fields: ['u', 'v', 'lunghezza', 'profondita', 'altezza'], lock: { h0: true },
          box: () => { const L = Number(p.lunghezza) || 2.2, D = Number(p.profondita) || 0.45, av = p.orienta === 'v', du = av ? D : L, dv = av ? L : D; return { u0: p.u - du / 2, u1: p.u + du / 2, v0: p.v - dv / 2, v1: p.v + dv / 2, h0: th(), h1: th() + (Number(p.altezza) || 0.42) }; },
          apply: (o, n) => { const av = p.orienta === 'v'; p.u = round((n.u0 + n.u1) / 2); p.v = round((n.v0 + n.v1) / 2); p.lunghezza = round(av ? n.v1 - n.v0 : n.u1 - n.u0); p.profondita = round(av ? n.u1 - n.u0 : n.v1 - n.v0); p.altezza = round(n.h1 - th()); } }));
        (e.ringhiere || []).forEach((l, k) => add({ ...b, percorso: `${P}.ringhiere.${k}`, label: `Ringhiera ${k + 1}`, fields: ['ringhiere', 'ringhiera'], lock: { h0: true },
          box: () => ({ ...bboxPts(e.ringhiere[k]), h0: th(), h1: th() + (Number((e.ringhiera || {}).altezza) || 1) }),
          apply: (o, n) => { e.ringhiere[k] = scalePts(e.ringhiere[k], o, n); e.ringhiera = Object.assign({}, e.ringhiera, { altezza: round(n.h1 - th()) }); },
          verts: { get: () => e.ringhiere[k], set: (q) => { e.ringhiere[k] = q; } } }));
      } else if (e.tipo === 'area' || e.tipo === 'pilastro') {
        const pil = e.tipo === 'pilastro';
        add({ ...b, percorso: P, label: b.nome, fields: pil ? ['poligono', 'altezza'] : ['poligono'], lock: pil ? { h0: true } : { h0: true, h1: true },
          box: () => ({ ...bboxPts(e.poligono), h0: 0, h1: pil ? Number(e.altezza) || 2.5 : 0.04 }),
          apply: (o, n) => { e.poligono = scalePts(e.poligono, o, n); if (pil) e.altezza = round(n.h1); },
          verts: { get: () => e.poligono, set: (q) => { e.poligono = q; } } });
      } else if (e.tipo === 'scala') {
        const quote = () => (Array.isArray(e.quote) ? e.quote.map(Number) : defQuote(Math.max(1, Number(e.piani) || 2)));
        add({ ...b, percorso: P, label: b.nome, fields: ['u', 'lunghezza', 'larghezza', 'distacco', 'quote'], lock: { h0: true },
          box: () => { const L = Number(e.lunghezza) || 8.4, W = Number(e.larghezza) || 4.3, d = Number(e.distacco) || 0.5, q = quote(); return { u0: e.u - L / 2, u1: e.u + L / 2, v0: d, v1: d + W, h0: 0, h1: q[q.length - 1] + 1 }; },
          apply: (o, n) => { const k = (n.h1 - 1) / Math.max(0.5, o.h1 - 1); e.quote = quote().map((x) => round(x * k)); e.u = round((n.u0 + n.u1) / 2); e.lunghezza = round(n.u1 - n.u0); e.distacco = round(Math.max(0.05, n.v0)); e.larghezza = round(n.v1 - n.v0); } });
      } else if (e.tipo === 'palo') {
        add({ ...b, percorso: P, label: b.nome, fields: ['u', 'v', 'altezza'], lock: { h0: true },
          box: () => ({ u0: e.u - 0.2, u1: e.u + 0.2, v0: e.v - 0.2, v1: e.v + 0.2, h0: 0, h1: Number(e.altezza) || 11 }),
          apply: (o, n) => { e.u = round((n.u0 + n.u1) / 2); e.v = round((n.v0 + n.v1) / 2); e.altezza = round(n.h1); } });
      }
    });
    if (M) {
      const b = { sorgente: 'cortile', frameKey: 'cortile' };
      const rect = (o, h0, h1) => ({ u0: o.u[0], u1: o.u[1], v0: o.v[0], v1: o.v[1], h0, h1 });
      const setRect = (o, n) => { o.u = [round(n.u0), round(n.u1)]; o.v = [round(n.v0), round(n.v1)]; };
      const circ = (o, r) => ({ u0: o.u - r, u1: o.u + r, v0: o.v - r, v1: o.v + r });
      const mid = (n) => [round((n.u0 + n.u1) / 2), round((n.v0 + n.v1) / 2)];
      const side = (n) => round(Math.max(n.u1 - n.u0, n.v1 - n.v0));
      if (M.pavimento) add({ ...b, obj: M.pavimento, percorso: 'pavimento', label: 'Pavimento del cortile', fields: ['u', 'v'], lock: { h0: true, h1: true }, box: () => rect(M.pavimento, 0, 0.03), apply: (o, n) => setRect(M.pavimento, n) });
      (M.aiuole || []).forEach((a, k) => add({ ...b, obj: a, percorso: `aiuole.${k}`, label: `Aiuola ${a.id || k + 1} del cortile`, fields: ['u', 'v', 'altezza'], lock: { h0: true }, box: () => rect(a, 0, Number(a.altezza) || 0.42), apply: (o, n) => { setRect(a, n); a.altezza = round(n.h1); } }));
      const G = M.gabbia;
      if (G) {
        add({ ...b, obj: G, percorso: 'gabbia', label: 'Gabbia del silos', fields: ['u', 'v', 'altezza'], lock: { h0: true }, box: () => rect(G, 0.42, 0.42 + (Number(G.altezza) || 2)), apply: (o, n) => { setRect(G, n); G.altezza = round(n.h1 - 0.42); } });
        if (G.porta && typeof G.porta === 'object') add({ ...b, obj: G, percorso: 'gabbia.porta', label: 'Porticina della gabbia', fields: ['porta'],
          box: () => ({ u0: G.u[0] - 0.07, u1: G.u[0] - 0.01, v0: G.porta.v[0], v1: G.porta.v[1], h0: Number(G.porta.soglia) || 0.12, h1: Number(G.porta.sommita) || 2.05 }),
          apply: (o, n) => { G.porta = Object.assign({}, G.porta, { v: [round(n.v0), round(n.v1)], soglia: round(n.h0), sommita: round(n.h1) }); } });
      }
      (M.pilastri || []).forEach((p, k) => add({ ...b, obj: p, percorso: `pilastri.${k}`, label: `Pilastro ${k + 1} del portico`, fields: ['u', 'v', 'altezza'], lock: { h0: true }, box: () => rect(p, 0, Number(p.altezza) || 4.5), apply: (o, n) => { setRect(p, n); p.altezza = round(n.h1); } }));
      if (M.portico) add({ ...b, obj: M.portico, percorso: 'portico', label: 'Portico', fields: ['u', 'v', 'soffitto'], lock: { h0: true }, box: () => rect(M.portico, 0, Number(M.portico.soffitto) || 4.5), apply: (o, n) => { setRect(M.portico, n); M.portico.soffitto = round(n.h1); } });
      (M.magnolie || []).forEach((m, k) => add({ ...b, obj: m, percorso: `magnolie.${k}`, label: `Magnolia ${m.id || k + 1}`, fields: ['u', 'v', 'raggio', 'altezza'], lock: { h0: true }, box: () => ({ ...circ(m, Number(m.raggio) || 3), h0: 0, h1: Number(m.altezza) || 12 }), apply: (o, n) => { [m.u, m.v] = mid(n); m.raggio = round(side(n) / 2); m.altezza = round(n.h1); } }));
      const S = M.serbatoio;
      if (S) add({ ...b, obj: S, percorso: 'serbatoio', label: "Silos dell'azoto", fields: ['u', 'v', 'raggio', 'altezza'], lock: { h0: true }, box: () => ({ ...circ(S, Number(S.raggio) || 0.8), h0: 0, h1: Number(S.altezza) || 4.2 }), apply: (o, n) => { [S.u, S.v] = mid(n); S.raggio = round(side(n) / 2); S.altezza = round(n.h1); } });
      (M.tombini || []).forEach((t, k) => add({ ...b, obj: t, percorso: `tombini.${k}`, label: `Tombino ${k + 1}`, fields: ['u', 'v', 'lato'], lock: { h0: true, h1: true }, box: () => ({ ...circ(t, (Number(t.lato) || 0.6) / 2), h0: 0, h1: 0.04 }), apply: (o, n) => { [t.u, t.v] = mid(n); t.lato = side(n); } }));
      (M.transenne || []).forEach((t, k) => add({ ...b, obj: t, percorso: `transenne.${k}`, label: `Transenna ${k + 1}`, fields: ['u', 'v', 'lunghezza'], lock: { h0: true, h1: true }, box: () => ({ u0: t.u, u1: t.u + (Number(t.lunghezza) || 2), v0: t.v - 0.05, v1: t.v + 0.05, h0: 0, h1: 1.1 }), apply: (o, n) => { t.u = round(n.u0); t.lunghezza = round(n.u1 - n.u0); t.v = round((n.v0 + n.v1) / 2); } }));
      const TS = M.tuboScarico;
      if (TS && Array.isArray(TS.percorso)) {
        const r = Number(TS.raggio) || 0.08, inner = (x) => ({ u0: x.u0 + r, u1: x.u1 - r, v0: x.v0 + r, v1: x.v1 - r, h0: x.h0 + r, h1: x.h1 - r });
        add({ ...b, obj: TS, percorso: 'tuboScarico', label: 'Tubo di scarico del silos', fields: ['percorso', 'canaletta'],
          box: () => { const bb = bboxPts(TS.percorso), hs = TS.percorso.map((p) => p[2]); return { u0: bb.u0 - r, u1: bb.u1 + r, v0: bb.v0 - r, v1: bb.v1 + r, h0: Math.min(...hs) - r, h1: Math.max(...hs) + r }; },
          apply: (o, n) => {
            const f0 = TS.percorso[TS.percorso.length - 1]; TS.percorso = scalePts(TS.percorso, inner(o), inner(n)); const f1 = TS.percorso[TS.percorso.length - 1];
            if (TS.canaletta) TS.canaletta = Object.assign({}, TS.canaletta, { u: round(TS.canaletta.u + f1[0] - f0[0]), v: TS.canaletta.v.map((x) => round(x + f1[1] - f0[1])) });
          } });
      }
    }
    return out;
  }
  const liveItems = () => items(C.esterni.cfg, C.cortile.M);
  const findItem = (key) => liveItems().find((it) => it.key === key) || null;
  function baseValue(it) { const twin = items(base.esterni, base.cortile).find((x) => x.key === it.key); return twin ? clone(twin.get()) : null; }
  // l'oggetto descritto più piccolo la cui scatola contiene il punto toccato
  function itemAt(world) {
    let best = null;
    for (const it of liveItems()) {
      const f = frameBy(it.frameKey); if (!f) continue;
      const b = it.box();
      if (inBox(b, toLocal(f, world), 0.25) && (!best || vol(b) < best.v)) best = { it, v: vol(b) };
    }
    return best ? best.it : null;
  }

  /* ---------- primitive (ogni altro solido: deformato con una trasformazione) ---------- */
  const rootOf = (o) => { for (let x = o; x; x = x.parent) if (ROOTS.includes(x.name)) return x; return null; };
  function pathOf(mesh) { const parts = []; let o = mesh; while (o.parent && !ROOTS.includes(o.name)) { parts.unshift(o.parent.children.indexOf(o)); o = o.parent; } return ROOTS.includes(o.name) ? [o.name].concat(parts).join('/') : null; }
  function byPath(path) { const [root, ...idx] = String(path).split('/'); let o = scene.getObjectByName(root); for (const i of idx) { if (!o) return null; o = o.children[Number(i)]; } return o || null; }
  const primId = (p) => ('prim:' + p.path.replace(/\//g, '.') + (p.inst != null ? '@' + p.inst : '')).replace(/[^A-Za-z0-9_\-.~:@+]/g, '_');
  function primWorld(p, original) {
    const m = p.mesh; m.updateWorldMatrix(true, false);
    const W = original && m.userData.edL0 ? new T.Matrix4().multiplyMatrices(m.parent.matrixWorld, m.userData.edL0) : m.matrixWorld.clone();
    if (p.inst != null) {
      const I = new T.Matrix4(), s = m.userData.edI0 && m.userData.edI0[p.inst];
      if (original && s) I.copy(s); else m.getMatrixAt(p.inst, I);
      W.multiply(I);
    }
    return W;
  }
  function primBox(p, original) {
    const f = frameBy(p.frameKey); f.updateWorldMatrix(true, false);
    const g = p.mesh.geometry; if (!g.boundingBox) g.computeBoundingBox();
    const bb = g.boundingBox, M = new T.Matrix4().copy(f.matrixWorld).invert().multiply(primWorld(p, original));
    const o = { u0: Infinity, u1: -Infinity, v0: Infinity, v1: -Infinity, h0: Infinity, h1: -Infinity };
    for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) {
      const q = new T.Vector3(x, y, z).applyMatrix4(M);
      o.u0 = Math.min(o.u0, q.x); o.u1 = Math.max(o.u1, q.x); o.h0 = Math.min(o.h0, q.y); o.h1 = Math.max(o.h1, q.y); o.v0 = Math.min(o.v0, -q.z); o.v1 = Math.max(o.v1, -q.z);
    }
    return roundBox(o);
  }
  function primFromHit(h) {
    const o = h.object;
    if (!o || !o.isMesh || !rootOf(o)) return null;
    const p = { mesh: o, inst: h.instanceId != null ? h.instanceId : null, path: pathOf(o), frameKey: frameKeyOf(o) };
    if (!p.path || !frameBy(p.frameKey)) return null;
    const b = primBox(p);
    return Math.hypot(b.u1 - b.u0, b.v1 - b.v0, b.h1 - b.h0) > 250 ? null : p; // niente terreno o quartiere unito
  }
  function axisMap(o0, o1, n0, n1) { if (o1 - o0 > 1e-4) { const s = (n1 - n0) / (o1 - o0); return [s, n0 - o0 * s]; } return [1, (n0 + n1) / 2 - (o0 + o1) / 2]; }
  function boxMatrix(o, n) { // nella cornice: x = u, y = h, z = −v
    const [sx, tx] = axisMap(o.u0, o.u1, n.u0, n.u1), [sy, ty] = axisMap(o.h0, o.h1, n.h0, n.h1), [sz, tz] = axisMap(-o.v1, -o.v0, -n.v1, -n.v0);
    return new T.Matrix4().makeScale(sx, sy, sz).setPosition(tx, ty, tz);
  }
  // porta la scatola originale "o" nella scatola "n", partendo sempre dalla trasformazione originale del pezzo
  function primApply(p, o, n) {
    const m = p.mesh, f = frameBy(p.frameKey); if (!f) return;
    f.updateWorldMatrix(true, false); m.updateWorldMatrix(true, false);
    const F = f.matrixWorld, G = new T.Matrix4().multiplyMatrices(F, boxMatrix(o, n)).multiply(new T.Matrix4().copy(F).invert());
    if (p.inst != null) {
      m.userData.edI0 = m.userData.edI0 || {};
      if (!m.userData.edI0[p.inst]) { const I = new T.Matrix4(); m.getMatrixAt(p.inst, I); m.userData.edI0[p.inst] = I; }
      const Wm = m.matrixWorld, I = new T.Matrix4().copy(Wm).invert().multiply(G).multiply(Wm).multiply(m.userData.edI0[p.inst]);
      m.setMatrixAt(p.inst, I); m.instanceMatrix.needsUpdate = true;
    } else {
      if (!m.userData.edL0) m.userData.edL0 = m.matrix.clone();
      const W0 = new T.Matrix4().multiplyMatrices(m.parent.matrixWorld, m.userData.edL0);
      m.matrixAutoUpdate = false; m.matrix.copy(new T.Matrix4().copy(m.parent.matrixWorld).invert().multiply(G).multiply(W0)); m.matrixWorldNeedsUpdate = true;
    }
  }
  function primRestore(p) {
    const m = p.mesh;
    if (p.inst != null) { const s = m.userData.edI0 && m.userData.edI0[p.inst]; if (s) { m.setMatrixAt(p.inst, s); m.instanceMatrix.needsUpdate = true; delete m.userData.edI0[p.inst]; } }
    else if (m.userData.edL0) { m.matrix.copy(m.userData.edL0); m.matrix.decompose(m.position, m.quaternion, m.scale); m.matrixAutoUpdate = true; delete m.userData.edL0; m.matrixWorldNeedsUpdate = true; }
  }
  function reapplyPrims() {
    for (const o of overrides) {
      if (o.sorgente !== 'primitiva' || o.stato === 'applicata' || !o.valore || !o.originale) continue;
      const mesh = byPath(o.percorso); if (!mesh || !mesh.isMesh) continue;
      const p = { mesh, inst: o.istanza != null ? o.istanza : null, path: o.percorso, frameKey: o.cornice || frameKeyOf(mesh) };
      if (!frameBy(p.frameKey)) continue;
      const b0 = primBox(p, true); // il pezzo deve essere ancora quello misurato (i dati possono essere cambiati)
      if (KEYS.every((k) => Math.abs(b0[k] - o.originale[k]) < 0.06)) primApply(p, o.originale, o.valore);
    }
  }

  /* ---------- selezione e maniglie ---------- */
  function selBox() { return sel.type === 'item' ? roundBox(sel.it.box()) : primBox(sel.p); }
  function deselect() {
    if (!sel) return;
    fx.remove(sel.vis); sel.vis.traverse((o) => { if (o.geometry) o.geometry.dispose(); });
    sel = null; closeCard();
  }
  function select(t) {
    deselect();
    sel = Object.assign({ vis: new T.Group(), handles: [] }, t);
    sel.frameKey = t.type === 'item' ? t.it.frameKey : t.p.frameKey;
    sel.box = selBox();
    if (t.type === 'prim') sel.orig = primBox(t.p, true);
    fx.add(sel.vis); drawSel(); infoCard();
  }
  const disp = (b) => { const o = clone(b); for (const a of ['u', 'v', 'h']) if (o[a + '1'] - o[a + '0'] < 0.08) { const c = (o[a + '0'] + o[a + '1']) / 2; o[a + '0'] = c - 0.04; o[a + '1'] = c + 0.04; } return o; };
  function drawSel() {
    const f = frameBy(sel.frameKey); if (!f) return;
    sel.vis.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); sel.vis.clear(); sel.handles = [];
    const b = disp(sel.box), um = (b.u0 + b.u1) / 2, vm = (b.v0 + b.v1) / 2, hm = (b.h0 + b.h1) / 2, lock = sel.type === 'item' ? sel.it.lock : {};
    const c = (i, j, k) => toWorld(f, i ? b.u1 : b.u0, j ? b.v1 : b.v0, k ? b.h1 : b.h0);
    const pts = [];
    for (const [a, z] of [[[0, 0, 0], [1, 0, 0]], [[0, 1, 0], [1, 1, 0]], [[0, 0, 1], [1, 0, 1]], [[0, 1, 1], [1, 1, 1]], [[0, 0, 0], [0, 1, 0]], [[1, 0, 0], [1, 1, 0]], [[0, 0, 1], [0, 1, 1]], [[1, 0, 1], [1, 1, 1]], [[0, 0, 0], [0, 0, 1]], [[1, 0, 0], [1, 0, 1]], [[0, 1, 0], [0, 1, 1]], [[1, 1, 0], [1, 1, 1]]]) pts.push(c(...a), c(...z));
    const edges = new T.LineSegments(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x822433, depthTest: false, transparent: true }));
    edges.renderOrder = 998; sel.vis.add(edges);
    const hs = [];
    for (const [axis, val] of [['u', [b.u0, b.u1]], ['v', [b.v0, b.v1]], ['h', [b.h0, b.h1]]]) val.forEach((x, i) => {
      if (axis === 'h' && lock['h' + i]) return;
      hs.push({ role: 'face', axis, side: String(i), u: axis === 'u' ? x : um, v: axis === 'v' ? x : vm, h: axis === 'h' ? x : hm });
    });
    const flat = b.h1 - b.h0 < 0.3;
    for (const i of [0, 1]) for (const j of [0, 1]) for (const k of flat ? [1] : [0, 1]) hs.push({ role: 'corner', u: String(i), v: String(j), pu: i ? b.u1 : b.u0, pv: j ? b.v1 : b.v0, ph: k ? b.h1 : b.h0 });
    hs.push({ role: 'move', u: um, v: vm, h: b.h1 + 0.45 });
    if (sel.type === 'item' && sel.it.verts) sel.it.verts.get().forEach((q, k) => hs.push({ role: 'vertex', k, u: q[0], v: q[1], h: b.h1 }));
    for (const h of hs) {
      const geo = h.role === 'vertex' ? new T.SphereGeometry(0.5, 12, 8) : new T.BoxGeometry(1, 1, 1);
      const m = new T.Mesh(geo, new T.MeshBasicMaterial({ color: h.role === 'move' ? 0x822433 : h.role === 'vertex' ? 0xf2c84b : 0xffffff, depthTest: false, transparent: true }));
      if (h.role !== 'vertex') { const ed = new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: 0x822433, depthTest: false, transparent: true })); ed.renderOrder = 1000; m.add(ed); }
      m.position.copy(h.role === 'corner' ? toWorld(f, h.pu, h.pv, h.ph) : toWorld(f, h.u, h.v, h.h)); m.renderOrder = 999; m.userData.handle = h;
      sel.vis.add(m); sel.handles.push(m);
    }
    scaleHandles();
  }
  function scaleHandles() {
    if (!sel) return;
    for (const m of sel.handles) { const r = m.userData.handle.role, d = camera.position.distanceTo(m.position); m.scale.setScalar(Math.max(0.08, d * 0.016) * (r === 'move' ? 1.3 : r === 'corner' ? 0.75 : r === 'vertex' ? 0.8 : 1)); }
  }
  function handleAt(e) {
    if (!sel) return null;
    const r = canvas.getBoundingClientRect(); let best = null;
    for (const m of sel.handles) {
      const q = m.position.clone().project(camera); if (q.z > 1) continue;
      const d = Math.hypot(r.left + ((q.x + 1) / 2) * r.width - e.clientX, r.top + ((1 - q.y) / 2) * r.height - e.clientY);
      if (d < HANDLE_PX && (!best || d < best.d)) best = { m, d };
    }
    return best ? best.m : null;
  }
  const dims = (b) => `${round(b.u1 - b.u0)} × ${round(b.v1 - b.v0)} × ${round(b.h1 - b.h0)} m · u ${b.u0} → ${b.u1} · v ${b.v0} → ${b.v1} · h ${b.h0} → ${b.h1}`;
  const overrideOf = () => sel && overrides.find((o) => o.id === (sel.type === 'item' ? docId(sel.it.key) : primId(sel.p)));
  function infoCard() {
    if (!sel) return;
    const title = sel.type === 'item' ? sel.it.label : `Pezzo: ${describe(sel.p.mesh)}`;
    const nodes = [el('h3', '', title), el('p', 'ed-meta', dims(sel.box)),
      el('p', 'ed-meta', 'Facce: un lato · angoli: due lati · rossa in alto: sposta' + (sel.type === 'item' && sel.it.verts ? ' · gialle: vertici' : '') + (sel.type === 'item' && sel.it.lock.h0 ? ' · la base resta ferma' : '') + '.')];
    const row = el('div', 'ed-row');
    if (sel.alt) { const alt = sel.alt, back = sel.type === 'item' ? { type: 'item', it: sel.it } : { type: 'prim', p: sel.p }; row.append(button(alt.type === 'prim' ? 'Solo questo pezzo' : 'Oggetto intero', () => select(Object.assign({}, alt, { alt: back })))); }
    if (overrideOf()) row.append(button('Ripristina originale', restore));
    row.append(button('Fine', () => deselect(), true));
    nodes.push(row); openCard(nodes, 'dock');
  }

  /* ---------- trascinamento ---------- */
  function startDrag(m, e) {
    const h = m.userData.handle, wp = m.position.clone(), f = frameBy(sel.frameKey);
    let plane;
    if (h.role === 'face' && h.axis === 'h') { const dir = new T.Vector3(); camera.getWorldDirection(dir); dir.y = 0; if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1); plane = new T.Plane().setFromNormalAndCoplanarPoint(dir.normalize(), wp); }
    else plane = new T.Plane(new T.Vector3(0, 1, 0), -wp.y);
    const p0 = new T.Vector3(); if (!rayFrom(e).ray.intersectPlane(plane, p0)) return false;
    drag = { h, plane, q0: toLocal(f, p0), box0: clone(sel.box), verts: sel.type === 'item' && sel.it.verts ? clone(sel.it.verts.get()) : null, pointerId: e.pointerId };
    return true;
  }
  function moveDrag(e) {
    const p = new T.Vector3(); if (!rayFrom(e).ray.intersectPlane(drag.plane, p)) return;
    const q = toLocal(frameBy(sel.frameKey), p), d = { u: q.u - drag.q0.u, v: q.v - drag.q0.v, h: q.h - drag.q0.h }, h = drag.h, b = clone(drag.box0);
    const setSide = (ax, s) => { const k = ax + s, val = snap(drag.box0[k] + d[ax]); b[k] = s === '0' ? Math.min(val, b[ax + '1'] - MIN) : Math.max(val, b[ax + '0'] + MIN); };
    if (h.role === 'face') setSide(h.axis, h.side);
    else if (h.role === 'corner') { setSide('u', h.u); setSide('v', h.v); }
    else if (h.role === 'move') { const du = snap(d.u), dv = snap(d.v); b.u0 += du; b.u1 += du; b.v0 += dv; b.v1 += dv; }
    else if (h.role === 'vertex') { drag.vNew = clone(drag.verts); drag.vNew[h.k] = [round(snap(q.u)), round(snap(q.v))]; }
    sel.box = roundBox(b);
    if (sel.type === 'prim') primApply(sel.p, sel.orig, sel.box); // le primitive si deformano subito
    if (h.role === 'vertex') { const vb = bboxPts(drag.vNew); Object.assign(sel.box, roundBox({ ...vb, h0: b.h0, h1: b.h1 })); }
    drawSel();
    hint((sel.type === 'item' ? sel.it.label : 'Pezzo') + ': ' + dims(sel.box));
  }
  function endDrag() {
    const h = drag.h, changed = h.role === 'vertex' ? !!drag.vNew : KEYS.some((k) => sel.box[k] !== drag.box0[k]);
    const box0 = drag.box0, vNew = drag.vNew; drag = null; controls.enabled = true;
    if (!changed) { infoCard(); return; }
    if (sel.type === 'item') {
      const it = sel.it;
      if (h.role === 'vertex') it.verts.set(vNew); else it.apply(box0, sel.box);
      saveItem(it); rebuild(it.sorgente);
    } else saveSelPrim();
  }

  /* ---------- salvataggio ---------- */
  const docId = (key) => String(key).replace(/[^A-Za-z0-9_\-.~:@+]/g, '_');
  async function saveDoc(id, data) {
    if (!db) { hint('Modifica applicata solo su questo schermo: per salvarla apri la pagina da claude.ai.'); return; }
    try { await db.collection('modifiche').doc(id).set(data); hint('Modifica salvata: ' + data.oggetto + '. Claude la vede e la riporta nei file.'); }
    catch (e) { hint('Non sono riuscito a salvare (' + ((e && e.code) || 'errore') + ').'); }
  }
  function saveItem(it) {
    return saveDoc(docId(it.key), { sorgente: it.sorgente, percorso: it.percorso, nome: it.nome || '', oggetto: it.label, tipo: 'oggetto', valore: it.get(), originale: baseValue(it), scatola: roundBox(it.box()), stato: 'da applicare', autore: myId, aggiornato: new Date().toISOString() });
  }
  function saveSelPrim() {
    const p = sel.p;
    infoCard();
    return saveDoc(primId(p), { sorgente: 'primitiva', percorso: p.path, istanza: p.inst, cornice: p.frameKey, oggetto: 'pezzo di ' + describe(p.mesh), tipo: 'primitiva', originale: sel.orig, valore: clone(sel.box), stato: 'da applicare', autore: myId, aggiornato: new Date().toISOString() });
  }
  async function restore() {
    if (!sel) return;
    if (sel.type === 'item') {
      const it = sel.it, orig = baseValue(it); if (!orig) return;
      it.set(orig); rebuild(it.sorgente);
      if (db) { try { await db.collection('modifiche').doc(docId(it.key)).delete(); } catch (_) { /* resta in elenco */ } }
    } else {
      primRestore(sel.p); sel.box = primBox(sel.p); drawSel();
      if (db) { try { await db.collection('modifiche').doc(primId(sel.p)).delete(); } catch (_) { /* resta in elenco */ } }
    }
    infoCard();
  }
  function refreshSel() {
    if (!sel) return;
    if (sel.type === 'item') { const it = findItem(sel.it.key); if (!it) { deselect(); return; } sel.it = it; }
    else if (!rootOf(sel.p.mesh) || !scene.getObjectById(sel.p.mesh.id)) { deselect(); return; }
    if (!drag) { sel.box = selBox(); drawSel(); infoCard(); }
  }
  function rebuild(sorgente) {
    const r = sorgente === 'esterni' ? C.esterni.rebuild() : C.cortile.rebuild();
    Promise.resolve(r).then(() => { reapplyPrims(); refreshSel(); });
  }
  function applyOverrides() {
    const touched = new Set();
    for (const o of overrides) {
      if (o.stato === 'applicata' || !o.valore || o.sorgente === 'primitiva') continue;
      const it = findItem(`${o.sorgente}:${o.percorso}`); if (!it) continue;
      if (JSON.stringify(it.get()) === JSON.stringify(o.valore)) continue;
      it.set(o.valore); touched.add(it.sorgente);
    }
    if (touched.size) for (const s of touched) rebuild(s);
    else { reapplyPrims(); refreshSel(); }
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
    const w = hit.point, it = itemAt(w), lonLat = C.toLonLat ? C.toLonLat(w) : null;
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
      elemento: it ? { chiave: it.key, nome: it.nome || '', etichetta: it.label, sorgente: it.sorgente, percorso: it.percorso } : null,
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
    if (!mode || drag || (e.button !== undefined && e.button !== 0)) return; // un secondo dito durante un trascinamento non conta
    down = { x: e.clientX, y: e.clientY };
    if (mode === 'modifica' && sel) {
      const m = handleAt(e);
      if (m && startDrag(m, e)) {
        controls.enabled = false;
        try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* nessuna cattura */ }
        e.stopImmediatePropagation(); e.preventDefault();
      }
    }
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.pointerId) return;
    moveDrag(e);
    e.stopImmediatePropagation(); e.preventDefault();
  }
  // tocco interrotto dal sistema (gesto di iPadOS, notifica…): annulla il trascinamento e ridà il controllo della vista
  function onCancel(e) {
    down = null;
    if (!drag || (e && e.pointerId !== drag.pointerId)) return;
    sel.box = drag.box0; if (sel.type === 'prim') primApply(sel.p, sel.orig, sel.box);
    drag = null; controls.enabled = true; drawSel(); infoCard();
  }
  function onUp(e) {
    if (drag && e.pointerId !== drag.pointerId) return;
    if (drag) {
      try { canvas.releasePointerCapture(e.pointerId); } catch (_) { /* già rilasciato */ }
      endDrag(); e.stopImmediatePropagation(); return;
    }
    if (!mode || !down) return;
    const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
    if (moved > 6) return; // era una rotazione della vista
    if (mode === 'commenta') {
      const rc = rayFrom(e), ph = rc.intersectObjects(pins.children, false)[0];
      if (ph) { showComment(ph.object.userData.comment, e); return; }
      const hit = hits(e)[0]; if (hit) newComment(hit, e);
    } else if (mode === 'modifica') {
      const hit = hits(e)[0]; if (!hit) { deselect(); return; }
      const prim = primFromHit(hit), it = itemAt(hit.point);
      if (it) select({ type: 'item', it, alt: prim ? { type: 'prim', p: prim } : null });
      else if (prim) select({ type: 'prim', p: prim, alt: null });
      else { deselect(); hint('Qui c’è solo il terreno: tocca un edificio, un muro, un oggetto o un pezzo.'); }
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
    db.collection('modifiche').onSnapshot((snap) => { overrides = snap.docs.filter((x) => x.exists).map((x) => Object.assign({ id: x.id }, x.data())); if (!drag) applyOverrides(); }, () => {});
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
    canvas.addEventListener('pointercancel', onCancel, { capture: true });
    canvas.addEventListener('lostpointercapture', (e) => { if (drag && e.pointerId === drag.pointerId) setTimeout(() => { if (drag && drag.pointerId === e.pointerId) onCancel(e); }, 0); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (ui.card.hidden) setMode(null); else closeCard(); } });
    loop(); connect();
  }
  // aspetta la scena e le due configurazioni (esterni di Chimica e cortile)
  const wait = setInterval(() => {
    const c = window.campus3d;
    if (c && c.scene && c.renderer && c.controls && c.esterni && c.esterni.cfg && c.cortile && c.cortile.M && c.scene.getObjectByName('chimica-esterni') && c.scene.getObjectByName('cortile-modello')) { clearInterval(wait); start(); }
  }, 400);
})();
