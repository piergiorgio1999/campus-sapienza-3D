# Obiettivi aperti — Campus Sapienza 3D

Stato: artifact pubblicato alla **versione 12**. Sul disco ci sono modifiche non pubblicate
(aiuola girata lungo v, panchine `orienta: "v"`, terrazza 56.3–78.3). Da rivedere secondo i punti sotto.

Riferimenti visivi: foto satellitari e aeree Google Maps inviate dall'utente il 21/10/2026
(vista nord-in-alto dell'intero edificio + viste 3D annotate). Le foto sono la fonte di verità.

Coordinate: lato 0 della sagoma OSM di CU014; u lungo il lato (≈ verso est), v verso l'esterno (≈ verso nord).
La facciata a sud della terrazza è a v = −20.4; il muro dell'edificio a ovest della terrazza è a u = 56.3.

## 1. Terrazza (balcone rialzato) accanto al Museo "Primo Levi"
- [ ] Ricerca dettagliata su tutte le foto aeree e satellitari disponibili (Google Maps, ortofoto AGEA 2020 già nel progetto, altre fonti) prima di rifare la geometria.
- [ ] **Aiuola** (= "cortile"): rettangolo stretto, lato lungo **est-ovest** (parallelo alla facciata sud), come nella vista satellitare nord-in-alto.
      Stima dalla foto: u 68.5–80.0, v −13.5 → −8.8. L'utente ha detto che la versione 12 "è girata di 90°": verificare con lui l'orientamento rispetto alla vista 3D.
- [ ] **Panchine**: due panchine in travertino attaccate al lato lungo nord dell'aiuola, verso est (stima u ≈ 74.0 e 78.4, v ≈ −8.25).
      Ognuna ha una lastra orizzontale sporgente su due lastre verticali basse, rientrate poco prima delle estremità.
- [ ] **Area gialla = livello terra**: rientranza ribassata all'angolo sud-est della terrazza (stima u 70.4–82, v −20.4 → −15.5).
- [ ] **Linee rosse = scalini**:
  - scalinata interna che dalla rientranza a livello terra sale verso ovest al piano rialzato (stima bordo u ≈ 70.4, v −20.4 → −15.5);
  - scalini sul bordo nord, vicino all'estremità ovest (stima u ≈ 57.5–62.5, v = +1.5), verso la scala antincendio.
- [ ] La terrazza **non è rettangolare**: è il piano rialzato meno la rientranza a livello terra.
- [ ] Il rialzo **non finisce dove l'ho messo**: finisce a pari livello con il pavimento in travertino accanto, davanti all'ingresso principale di Chimica. Togliere gli scalini sul lato ovest (u = 56.3) e raccordare con quel pavimento.
- [ ] Bordo est della terrazza a u ≈ 82 (non 88). Togliere gli scalini sul lato est.
- [ ] Togliere l'albero che oggi cade sull'aiuola o sulla terrazza: nelle foto non ci sono alberi sul piano.
- [ ] Riportare l'"area" davanti all'ingresso a v 0 → 6: la versione su disco la estende fino a −20.4 e finisce dentro l'edificio.

## 2. Scale antincendio
- [ ] Rifarle come nelle foto: torre con **pianta a capsula** (stadio), parallela al muro, ≈ 7–8 m × 3.5–4 m.
      Parapetti **pieni color ocra/arancio** a fasce sovrapposte, rampe a forbice all'interno con un setto centrale e pianerottoli semicircolari alle estremità.
      Oggi in `addFireStair` (campus-3d.js) sono scale metalliche aperte con un mezzo cerchio: è sbagliato.
- [ ] Posizioni dalla vista nord-in-alto: sul fianco ovest dell'edificio, sul fianco est e sul lato sud vicino all'anfiteatro.
      Verificare tutte le scale antincendio di CU014, non solo le due già nel JSON (lato 0 u 12.9; lato 19 u 18.6).

## 3. Lato "anfiteatro" (sud dell'edificio)
- [ ] Correggere secondo le foto: piazza grigia con gradinata curva in mattone e travertino e corpo a ventaglio sul fronte sud.
      Da chiarire se la richiesta riguarda la ricostruzione dell'anfiteatro, la sagoma dell'edificio o entrambe.

## 4. Cortile dell'azoto liquido
- [ ] Il cortile (`cortile/modello.json`) e il tubo rosso (`tuboRosso`) risultano attaccati alla parete dell'edificio: vanno staccati.
      Da chiarire con l'utente quale distacco intende.

## Già fatto (non rifare)
- Solo CU014 + edifici entro 50 m; niente sidebar, pulsanti, selezione edifici, CNR.
- Cortili e pozzi luce come volumi negativi chiusi a 4 pareti (polygon-clipping); tetto una sola volta.
- Pergolato sostituito da pavimento in travertino.

## Metodo di lavoro
- Usare le foto aeree come riferimento. Prima di grandi ricostruzioni, confermare con l'utente le interpretazioni ambigue.
- Verifica: `tools/shot.py`, `tools/ortho.py` (playwright + Chromium, server locale sulla porta 8765).
  Prima di ogni pubblicazione aumentare `?v=` in `index.html`.
