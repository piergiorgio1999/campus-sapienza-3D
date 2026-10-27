"""Retro della Ginestra (aula magna di Chimica, CU014): scale laterali ricostruite dalla scansione Scaniverse dell'utente (23/10/2026).

Coordinate della scansione srotolate sulla facciata (raggio 37,3 m): s = arco lungo la facciata dall'asse (+ verso ovest), d = distanza
dalla facciata (+ verso la strada), z = quota sopra la strada. Lato nord della scansione = lato ovest del modello. Misure mediate fra il
lato nord e il lato sud specchiato: la scansione iPad ruota di circa ±2,6° fra le due estremità (deriva), la media a specchio la toglie.
Nel modello: angolo a = asse − s / 37,3 (radianti), raggio r = 37,3 + d. Asse del retro a −90° (centro del ventaglio): lo dicono la sagoma
OSM (rientranza della balconata fra −96,3° e −82,1°), i due STL e la vista dall'alto dell'utente del 27/10 (pensiline da 4,7 a 14,5 m
dall'asse, simmetriche rispetto al centro del ventaglio). Prima era a −92,75°, 1,8 m troppo a ovest. Il lato est è lo specchio del lato ovest.

Misure (lato ovest; s in m lungo la facciata, d in m fuori dalla facciata):
- prima rampa (esterna): mezza dentro e mezza fuori, d −0,9…+1,45, da s 7,0 (pedana a 0,22) a s 11,0 (pianerottolo a 1,23), pedata ~0,44
- pedana in fondo alla prima rampa: d −0,9…+1,45, s 4,8…7,0, 0,22; gradino da 0,11 attorno sui due lati liberi (s da 4,3, d fino a +2,3)
- muro divisorio di travertino fra le due rampe: d −1,45…−0,9, da s 4,95 (balconata) a s 12,0, da terra alla pensilina (4,1)
- cancello fra le due rampe: nel varco in fondo al muro divisorio, s 12,0…13,9, dal pianerottolo a 3,48; sopra l'architrave fino alla pensilina
- seconda rampa (interna, sotto l'edificio): d −3,35…−1,45, dal pianerottolo (s 11,7) alla balconata (s 4,95, quota 3,25), pedata ~0,42
- pianerottolo a 1,23: s 11,0…13,9, dal muro dell'edificio (d −3,35) al parapetto (d +0,85)
- colonna rettangolare di travertino (pilone): d +0,4…+1,2, s 9,9…12,45, da terra alla pensilina, in cima alla prima rampa
- dopo il pilone, sul bordo del pianerottolo: parapetto pieno fino a 1,8, finestra aperta, architrave da 3,45 alla pensilina (stesso filo del pilone)
- testata in fondo al pianerottolo (s 13,9…14,2) con la porta antipanico (uscita di sicurezza) verso il pianerottolo
- pensilina: da s 4,94 (primo pilone della balconata) a s 14,2, da d −1,45 a d +3,0 (r 40,3 = arco OSM), sotto a 4,1, spessa 0,4:
  soffitto di travertino, bordo in intonaco arancione, sopra guaina bituminosa nera (materiale «pensilina»)
"""
import json, math

C = (28.72, -50.38); AX = -90.0; RF = 37.3; rad = math.pi / 180
R2 = lambda x: round(x, 2)
def pol(r, a): return (C[0] + r * math.cos(a * rad), C[1] + r * math.sin(a * rad))
def ang(s): return AX - s / RF / rad              # lato ovest: s > 0
def rr(d): return RF + d

def piece(d0, d1, s0, s1, h0, h1, rise_to=None):
    """scatola tangente fra s0 e s1 (lungo la facciata) e d0..d1 (radiale); rise_to = s verso cui punta +x"""
    r0, r1, aA, aB = rr(d0), rr(d1), ang(s0), ang(s1)
    am = (aA + aB) / 2; rm = (r0 + r1) / 2
    L = 2 * rm * math.sin(abs(aB - aA) / 2 * rad); W = r1 - r0
    to = ang(rise_to) if rise_to is not None else None
    a = am + 90 if (to is None or to > am) else am - 90
    cu, cv = pol(rm, am)
    return {"u0": R2(cu - L / 2), "u1": R2(cu + L / 2), "v0": R2(cv - W / 2), "v1": R2(cv + W / 2), "h0": h0, "h1": h1}, round(a % 360, 2)

def radial(d0, d1, s, h0, h1, w=0.05):
    """scatola sottile radiale (piano a s costante) da d0 a d1"""
    a = ang(s); rm = (rr(d0) + rr(d1)) / 2; L = rr(d1) - rr(d0); cu, cv = pol(rm, a)
    return {"u0": R2(cu - L / 2), "u1": R2(cu + L / 2), "v0": R2(cv - w / 2), "v1": R2(cv + w / 2), "h0": h0, "h1": h1}, round(a % 360, 2)

def sector(d0, d1, s0, s1, step=1.0):
    r0, r1, a0, a1 = rr(d0), rr(d1), ang(s0), ang(s1)
    lo, hi = min(a0, a1), max(a0, a1); n = max(2, int(math.ceil((hi - lo) / step)))
    out = [pol(r1, lo + (hi - lo) * i / n) for i in range(n + 1)] + [pol(r0, hi - (hi - lo) * i / n) for i in range(n + 1)]
    return [[R2(u), R2(v)] for u, v in out]

Q = 3.25; LAND = 1.23; PED = 0.22; PEN = 4.1; PEN_SP = 0.4
FERRO = '#a8492b'   # cancelli, porta e corrimano: metallo verniciato arancio-rosso come nella scansione
# fasce radiali (d) e tratti lungo la facciata (s)
D_IN, D_MURO0, D_MURO1, D_OUT = -3.35, -1.45, -0.9, 1.45
S_BALC, S_PED0, S_R1, S_TOP, S_R2, S_MURO, S_GATE, S_TEST, S_TEST1 = 4.95, 4.8, 7.0, 11.0, 11.7, 12.0, 13.9, 13.9, 14.2
D_PIL0, D_PIL1, S_PIL0, S_PIL1 = 0.4, 1.2, 9.9, 12.45
D_PAR0 = 0.85; H_PAR = 1.8; H_FIN = 3.45; H_GATE = 3.48

west = {}
b, a = piece(D_MURO1, D_OUT, S_R1, S_TOP, PED, LAND, rise_to=S_TOP)
west['rampa-1'] = dict(forma='oggetto', modello='rampaScala', ruota=0, angolo=a, box=b, pedata=0.44)
b, a = piece(D_MURO1, D_OUT, S_PED0, S_TOP, 0, PED); west['base'] = dict(forma='box', materiale='travertino', angolo=a, box=b)
b, a = piece(D_MURO1, 2.3, 4.3, 8.3, 0, 0.11); west['gradino-angolo'] = dict(forma='box', materiale='travertino', angolo=a, box=b)
b, a = piece(D_IN, D_MURO0, S_BALC, S_R2, LAND, Q, rise_to=S_BALC)
west['rampa-2'] = dict(forma='oggetto', modello='rampaScala', ruota=0, angolo=a, box=b, pedata=0.42)
b, a = piece(D_IN, D_MURO0, S_BALC, S_R2, 0, LAND); west['rampa-2-sotto'] = dict(forma='box', materiale='travertino', angolo=a, box=b)
b, a = piece(D_MURO0, D_MURO1, S_BALC, S_MURO, 0, PEN); west['muro'] = dict(forma='box', materiale='travertino', angolo=a, box=b)
b, a = piece((D_MURO0 + D_MURO1) / 2 - 0.025, (D_MURO0 + D_MURO1) / 2 + 0.025, S_MURO, S_GATE, LAND, H_GATE)
west['cancello'] = dict(forma='oggetto', modello='cancelloScala', ruota=0, angolo=a, box=b, colore=FERRO)
b, a = piece(D_MURO0, D_MURO1, S_MURO, S_GATE, H_GATE, PEN); west['architrave'] = dict(forma='box', materiale='travertino', angolo=a, box=b)
west['pianerottolo'] = dict(forma='prisma', materiale='travertino', poligono=sector(D_IN, D_PAR0, S_TOP, S_TEST, step=0.5), base=0, altezza=LAND)
b, a = piece(D_PIL0, D_PIL1, S_PIL0, S_PIL1, 0, PEN); west['pilone'] = dict(forma='box', materiale='travertino', angolo=a, box=b)
b, a = piece(D_PAR0, D_PIL1, S_PIL1, S_TEST, 0, H_PAR); west['parapetto'] = dict(forma='box', materiale='travertino', angolo=a, box=b)
b, a = piece(D_PIL0, D_PIL1, S_PIL1, S_TEST, H_FIN, PEN); west['architrave-finestra'] = dict(forma='box', materiale='travertino', angolo=a, box=b)
b, a = piece(D_IN, D_PIL1, S_TEST, S_TEST1, 0, PEN); west['testata'] = dict(forma='box', materiale='travertino', angolo=a, box=b)
b, a = radial(-0.95, 0.25, S_TEST - 0.04, LAND, LAND + 2.25)
west['porta'] = dict(forma='oggetto', modello='cancelloScala', ruota=0, angolo=a, box=b, colore=FERRO)
# muro dell'edificio lungo la seconda rampa e il pianerottolo, da terra al soffitto della loggia (la loggia è profonda 4 m, la rampa 3,35):
# curvo come la facciata, copre le finestre del piano terra che lì non ci sono
west['muro-scala'] = dict(forma='prisma', materiale='intonaco arancione', poligono=sector(-4.05, D_IN - 0.02, S_BALC, S_TEST1, step=0.5), base=0, altezza=Q + 3.425)
# faccia del muro divisorio verso la seconda rampa: intonaco arancione col corrimano nero (verso la prima rampa è travertino col corrimano rosso)
b, a = piece(D_MURO0 - 0.02, D_MURO0, S_BALC, S_MURO, 0, PEN); west['intonaco-muro'] = dict(forma='box', materiale='intonaco arancione', angolo=a, box=b)
fl2 = lambda s: LAND + (Q - LAND) * (S_R2 - s) / (S_R2 - S_BALC)             # quota dei gradini lungo la seconda rampa
b, a = piece(D_MURO0 - 0.1, D_MURO0 - 0.02, S_BALC + 0.3, S_R2, LAND, fl2(S_BALC + 0.3) + 0.95, rise_to=S_BALC)
west['corrimano-interno'] = dict(forma='oggetto', modello='corrimano', ruota=0, angolo=a, box=b, colore='#1d1f20')
west['pensilina'] = dict(forma='prisma', materiale='pensilina', poligono=sector(D_MURO0, 3.0, 4.94, S_TEST1, step=0.5), base=PEN, altezza=PEN_SP)
# staccionata dell'utente sul bordo esterno della prima rampa (fino al pilone) e corrimano sul muro divisorio
fl = lambda s: PED + (LAND - PED) * (s - S_R1) / (S_TOP - S_R1)          # quota dei gradini lungo la prima rampa
b, a = piece(D_OUT - 0.05, D_OUT, S_R1, S_PIL0, PED, fl(S_PIL0) + 1.0, rise_to=S_PIL0)
west['staccionata-rampa1'] = dict(forma='oggetto', modello='staccionata', ruota=0, angolo=a, box=b)
b, a = piece(D_MURO1, D_MURO1 + 0.08, S_R1, S_TOP, PED, LAND + 0.95, rise_to=S_TOP)
west['corrimano'] = dict(forma='oggetto', modello='corrimano', ruota=0, angolo=a, box=b, colore=FERRO)
for k in west: west[k]['box'] = {kk: R2(v) for kk, v in west[k]['box'].items()} if 'box' in west[k] else None
for k in list(west):
    if west[k].get('box') is None: west[k].pop('box')

def mirror(p):
    q = json.loads(json.dumps(p))
    if 'box' in q:
        b = q['box']; cu = (b['u0'] + b['u1']) / 2; cv = (b['v0'] + b['v1']) / 2; L = b['u1'] - b['u0']; W = b['v1'] - b['v0']
        r = math.hypot(cu - C[0], cv - C[1]); a = math.degrees(math.atan2(cv - C[1], cu - C[0])); u2, v2 = pol(r, 2 * AX - a)
        q['box'].update(u0=R2(u2 - L / 2), u1=R2(u2 + L / 2), v0=R2(v2 - W / 2), v1=R2(v2 + W / 2))
        q['angolo'] = round((2 * AX - q['angolo']) % 360, 2)
    if 'poligono' in q:
        pts = []
        for u, v in q['poligono']:
            r = math.hypot(u - C[0], v - C[1]); a = math.degrees(math.atan2(v - C[1], u - C[0])); pts.append([R2(x) for x in pol(r, 2 * AX - a)])
        q['poligono'] = pts[::-1]
    return q

NOMI = {'rampa-1': 'Prima rampa (mezza fuori dalla facciata)', 'base': 'Pedana in fondo alla prima rampa', 'gradino-angolo': 'Gradino attorno alla pedana',
        'rampa-2': 'Seconda rampa (sotto l’edificio)', 'rampa-2-sotto': 'Pieno sotto la seconda rampa', 'muro': 'Muro divisorio di travertino fra le rampe',
        'cancello': 'Cancello fra le due rampe', 'architrave': 'Architrave sopra il cancello', 'pianerottolo': 'Pianerottolo',
        'pilone': 'Colonna rettangolare di travertino', 'parapetto': 'Parapetto sotto la finestra', 'architrave-finestra': 'Architrave sopra la finestra',
        'testata': 'Testata in fondo al pianerottolo', 'porta': 'Porta antipanico (uscita di sicurezza)', 'muro-scala': 'Muro dell’edificio lungo la seconda rampa',
        'pensilina': 'Pensilina (travertino sotto, guaina sopra)', 'intonaco-muro': 'Intonaco del muro divisorio verso la seconda rampa',
        'corrimano-interno': 'Corrimano sul muro divisorio lungo la seconda rampa', 'staccionata-rampa1': 'Staccionata sulla prima rampa', 'corrimano': 'Corrimano sul muro divisorio'}
IDS = {k: (f'gin-ovest-{k}', f'gin-est-{k}') for k in west}
IDS['muro'] = ('pmvk7o45ss9', 'gin-est-pmvk7o45ss9')                 # id dati dall'editor dell'utente
IDS['staccionata-rampa1'] = ('pmvk7skt3lh', 'gin-est-pmvk7skt3lh')
RIMOSSI = ['gin-ovest-staccionata-testata', 'gin-est-staccionata-testata', 'cancellata-arco', 'cancellata-arco-est']
out = {}
for k, (w, e) in IDS.items():
    out[w] = dict(west[k], nome=NOMI[k] + ' (ovest)'); out[e] = dict(mirror(west[k]), nome=NOMI[k] + ' (est)')
    if k.startswith('corrimano'): out[e]['specchio'] = 'v'   # la rotazione dello specchio porta il muro dall'altro lato della scatola
# balconata: 4 colonne (lesene arancioni fino al tetto) a ±1,43 e ±4,49 m dall'asse (disegno dell'utente sull'alzato della scansione),
# balaustre di travertino fra le colonne, porte a vetri sul fondo della loggia; scatole senza h1 = altezza che hanno già nel file
COLS = [4.49, 1.43, -1.43, -4.49]; CW = 0.89
def tang(r0, r1, s0, s1, h0, h1):            # come piece, ma con i raggi diretti e s anche negativo (lato est)
    return piece(r0 - RF, r1 - RF, s0, s1, h0, h1)
for i, sc in enumerate(COLS, 1):
    b, a = tang(36.4, 37.3, sc - CW / 2 * 37.3 / 36.85, sc + CW / 2 * 37.3 / 36.85, Q, None); out[f'gin-pilone-{i}'] = dict(box=b, angolo=a)
for i in range(3):
    sm = (COLS[i] + COLS[i + 1]) / 2; half = abs(COLS[i] - COLS[i + 1]) / 2 - CW / 2 * 37.3 / 37.15
    b, a = tang(37.0, 37.3, sm - half, sm + half, Q, Q + 1.0); out[f'gin-balaustra-{i + 1}'] = dict(box=b, angolo=a)
    b, a = tang(33.35, 33.43, sm - 1.66 / 2 * 37.3 / 33.39, sm + 1.66 / 2 * 37.3 / 33.39, Q, Q + 2.78); out[f'gin-porta-{i + 1}'] = dict(box=b, angolo=a)
BALC = [f'gin-pilone-{i}' for i in range(1, 5)] + [f'gin-balaustra-{i}' for i in range(1, 4)] + [f'gin-porta-{i}' for i in range(1, 4)]
# solido (cu014-solido.json → ventaglio.balconata): a0/a1 tali che il primo e l'ultimo pilone del solido coincidano con gin-pilone-1 e -4
mg = 0.46 / RF / rad
SOLIDO = {'a0': round(ang(COLS[0]) - mg, 3), 'a1': round(ang(COLS[-1]) + mg, 3)}
json.dump({'pezzi': out, 'rimossi': RIMOSSI, 'balconata': BALC, 'solido': SOLIDO}, open('stair_out2.json', 'w'), indent=1, ensure_ascii=False)
print('solido', SOLIDO)
for k, v in out.items(): print(f"{k:34s}", v.get('box') or ('poly', len(v['poligono'])), v.get('angolo'))
