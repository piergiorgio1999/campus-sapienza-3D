# Passaggio a Codex (21/10/2026 sera)
- Artifact pubblicato: v50 (https://claude.ai/code/artifact/b6b40dff-1e58-4b65-a386-6d4bab8d31ed), branch `claude/new-session-zh34qp`.
- Aperto: commento 1 (`segnalazioni/8370inyxicsqy5ulsd2j`, «solido bianco» a lato0 u 43.36, v 8.0, h 3.29): tolto il condizionatore
  sulla facciata dell'ingresso, ma non è certo che fosse quello (lì vicino c'è una palma a u 42.4, v 7.9).
- Da confermare con l'utente: posizione dei due pergolati, misure del varco del cancello (commento 3), raccordo ceppo/tronco
  delle magnolie, chioma B spostata a stima (`chiomaOffset`).
- Nuovo dall'utente (22/10): `riferimenti/cu014-vettoriale.stl`, modello vettoriale di CU014 ("vec cu14"): **usato** per il solido, vedi sotto.

## Ripresa del 22/10/2026 (mattina)
- **Alberi generici (OSM e «Albero» del catalogo):** il tronco sale fino al centro della chioma principale (prima finiva sotto e la chioma
  restava staccata). `buildTrees` in `campus-3d.js`; pini, palme e magnolie invariati. Pubblicato (v52).
- **Commento del solido bianco** (`segnalazioni/8370inyxicsqy5ulsd2j`): era il condizionatore dell'ingresso spostato dall'utente
  (`prim:chimica-esterni.6.6`, scatola d'origine identica); tolto in v49, confermato dall'utente: commento «fatta», prim «scartata».
- **Modifiche del db riportate nei file** (`cortile/chimica-esterni.json`, analisi con verifica avversaria): rivestimento dell'ingresso
  u 41,5–54,45, altezza 4,3; panchina 2 eliminata (`rimosso`); ringhiera 1 (u 44,5) tolta (`ringhiere[0] = []`); primo pergolato allungato
  dall'utente a u 16,5–44,4 (27,9 m; il secondo resta u 52,26–78,76 dove l'ha indicato l'utente, non specchiato). Superate o inerti, da
  segnare senza toccare i file: prim del pergolato 11.101 (scartata), 11.103 (applicata), aggiunte `pmvif9e8er9` e `pmvidbhtrdk`
  (eliminate, applicata), pezzi della cancellata `prim:cortile-modello.0.33/.34/.35` (superati da `cancellata.sporgenza`, applicata) e `.43@2`
  (trascinamento involontario, scartata).
- **Da chiedere all'utente:** la palma 2 a sinistra del portone (`esterni:elementi.6.palme.1`) è stata eliminata 35 s dopo che il condizionatore
  era stato trascinato dentro la sua scatola di selezione: probabilmente voleva togliere il condizionatore. Finché il documento resta
  «da applicare» la pagina la nasconde dal vivo; il file la tiene.
- **Solido STL, difetti confermati e corretti:**
  - interpiano unico 3,425 m per tutte le ali (`cuPieces`, campo `interpiano` in `cu014-solido.json`; via `cuLevelsFor`): prima ogni ala
    aveva il suo (2,6–4,07 m) e le file di finestre non combaciavano; dorsale 21 m e blocco 20 m hanno ora l'attico più alto (2,9 e 1,9 m),
    10,5 m e 17,5 m circa 2,7–2,8 m;
  - ponte sul cancello con la stessa griglia del corpo principale (tetto a 7,87 m, sulla linea dei muri del cortile);
  - nuova ala «basso-cortile-3» a 8 m [41, −64,5, 46, −60] (prima 19 m dove l'STL dà ~8 m e il pavimento del cortile n. 3);
  - tacca sulla facciata sud chiusa: «sud-centro-est» [46, −91, 48,5, −79] a 15,5 m e «sud-est-basso» fino a v −91;
  - «fascia-nord-est» parte da u 56,34 (prima 55: scasso di 1,34 m nello spigolo dell'ala nord verso la terrazza);
  - soletta del cortile nord a 4,4 m invece di 6 (tagliava le finestre del primo piano); è parte di CU014 per l'editor (tetto) e per la
    planimetria ufficiale, e non c'è se CU014 non è disegnato; anche il ponte ha `code: 'CU014'`.
  - Non toccato: la toppa arancione del muro ovest (corpo a 19 m, 4 piani da 3,425: resta valida).

## Solido di CU014 dall'STL (22/10/2026) — fatto, da verificare con il render
- **Cosa contiene l'STL:** mesh binaria, 103 594 triangoli, 2,02 × 2,23 × 0,36 unità (1 unità ≈ 86,2 m, z in alto, origine arbitraria). È una
  nuvola/mesh rumorosa dell'edificio e del suo intorno (alberi, marciapiedi), non un vettoriale pulito: l'impronta c'è, i piani dei tetti si leggono bene.
- **Trasformazione:** scala 86,203 m/unità, rotazione 178,07°, traslazione (1,124; 0,548); numeri in `cu014-solido.json` → `stl`. Registrazione sui muri
  verticali vs sagoma OSM (nessun ribaltamento). Controllo indipendente: il vuoto del cortile dell'azoto (u −3,5→41, v −51,4→−35 nel lato 0) cade
  proprio sul grande vuoto dell'STL. Il piano del terreno è inclinato di 2,4° (scansione): le quote sono corrette con quel piano.
- **Impronta:** coincide con la sagoma OSM entro circa 1 m, quindi `campus-buildings.json` non cambia.
- **Altezze diverse (sopra il terreno):** dorsale centrale 21 m (u 39,5→50, v −60→−20), corpo principale 19 m, blocco sud-est 20 m, ala sud 15–15,5 m (con una dorsale
  stretta a 17,5), ala est 15,5 m, fascia sul bordo est 11,5 m, corpo basso sulla terrazza 10,5 m, corpo basso fra le ali sud 10,5 m. Il «21 m» di OSM è solo la dorsale. Prima tutto era a 21 m.
- **Cortili (`courtyards.json`, CU014):** il cortile nord è rifatto dall'STL (u 14,5→40,5, v −23→−11, prima u 15,6→40,2, v −23,9→−17,9), con il pavimento a **6 m**
  (soletta `fondi`); il vecchio buco n. 0 (u 57→75, v −29→−25) è tolto: era l'ombra di un salto di quota, nell'STL lì c'è tetto (13–19 m). Gli altri quattro buchi
  (ora indici 0–3; i rettificati sono quelli che prima erano 4 e 5) combaciano con i vuoti dell'STL e restano. I pavimenti degli altri cortili stanno a 1,6–2,6 m sopra il terreno: ignorati.
- **Mantenuti:** facciate e texture (stesso `facadeSetFor`), ponte di un piano sul cancello (resta a 8,3 m; l'STL lì dà circa 10 m, **da controllare**),
  vuoto unico dei due cortili (`vuoti`/`pieni`), resto della scena.
- **Aggiustamenti per coerenza:** toppa di facciata del muro ovest in `cortile/facciate.json` (corpo e attico da 21 a 19 m); scala antincendio est a 2 piani e scala del lato 19
  senza le ultime due quote (altrimenti uscivano dal tetto), vedi i campi `nota_stl` in `cortile/chimica-esterni.json`. Il rilievo delle scale arrivava a 17,1 m: da confrontare con l'utente.
- Non fatto: gli angoli smussati e le rientranze minori del tetto (sotto 1 m) restano quelli di OSM; le altre scale antincendio (OBIETTIVI.md) non sono state riverificate.
- Regole dell'utente: niente test o render locali (li fa la pipeline GitHub), pubblicare subito quando lo chiede, non fermarsi a chiedere.

## Secondo STL: ventaglio e gradoni del fronte sud (22/10/2026) — fatto, da verificare con il render
- **Cosa contiene `riferimenti/chimica-anfiteatro.stl`** (solo riferimento, la pagina non lo carica): mesh binaria, 77 424 triangoli, 37,4 × 35,7 × 8,9 unità, tutto CU014 più alberi e marciapiedi attorno; il fronte sud
  a ventaglio si legge bene (falde piane a 15 m con una trave maestra a 18 m, fronte ad arco con gradoni).
- **Trasformazione** (blocco `stlAnfiteatro` di `cu014-solido.json`, stessa formula del primo): scala **3,40 m/unità**, rotazione **181,75°** (nord in basso, nessun ribaltamento), (u, v) = 3,40 · R(181,75°) · (x, y) + (114,77; 23,98).
  Trovata con la correlazione 2D fra le pareti verticali dell'STL e la sagoma OSM (ottimo piatto: scarto di ±0,25° e ±0,02 m/unità), poi controllata sul rendering sovrapposto. Piano del terreno
  z = 3,856 − 0,0207 u − 0,0352 v: pendenza uguale a quella del primo STL (−0,0195 / −0,0365), quindi i due STL concordano sull'inclinazione della scansione.
- **Confronto quote con il primo STL:** concordano entro 0,0–0,6 m (il nuovo è in media 0,25 m più alto); nel JSON ho messo la media arrotondata a 0,1 m. Corretti: base del lato nord 18,4 m (prima 19: area u −1→39,5, v −34→1),
  ala sud-ovest 14,4 m solo per u < 9,6, ventaglio 15,2 (ovest) e 15,4 (est), dorsale 17,8 (era 17,5), ala est 15,7 con il gradino a **u 81,5** (era 80,5) e bordo est 10,9, blocco sud-est 19,9, fascia nord-est 10,6, corpo basso 10,7.
  Restano 19 m il cuore dell'edificio e 21 m la dorsale. Il ponte sul cancello a 8,3 m resta da controllare.
- **Ventaglio:** il fronte sud è un settore di 60° (da −120° a −60°, −90° = sud) con centro (28,72; −50,38) e raggio 40,28 m (cerchio per i vertici OSM dell'arco, scarto < 0,3 m). La facciata dell'edificio sta a r = 37,3 m
  (bordo del tetto a 15,5 m); la trave maestra a 17–18,1 m è in asse a −94°, larga 6° (nel rettangolo 2,4 m).
- **Gradoni** (quota sopra il terreno, misure sul raggio per tre settori): lobo ovest r 37,3→39 a 4,2 m e r 39→40,28 a 2,1 m; rientranza d'ingresso in asse (−97,5°→−88,5°) con fronte a r 38,5 (un gradone a 2,2 m);
  lobo est 4,6 m e 2,5 m. Sono terrazze, non scalini da 17 cm: alzata 2,1–2,5 m, pedata 1,3–1,7 m. Fuori dall'arco il terreno è piano, con cespugli da 1 a 1,5 m (non modellati).
  Le pedate sono in travertino e le alzate in mattoni (materiali delle primitive); se le foto mostrano rampe o scalini veri sulle alzate, vanno aggiunti a parte.
- **Cosa ho rifatto:** `cuSolidoParts` toglie alla sagoma la corona fra r 37,3 e 40,9 (prima il podio veniva estruso come corpo alto 15 m), `addCuVentaglio` costruisce le corone dei gradoni, le ali sono riquotate.
- **Dubbi:** sotto il tetto dell'ala sud l'STL vede un piano a 3,4 m (r 34–35,5) e uno a 4,2–4,6 m: probabilmente il portico dietro i gradoni, non modellato. Le fasce di 16–17 m sul tetto (angoli −116→−108° e −83→−62°) sono
  rialzi di 0,5–1 m, non travi precise: non modellate. L'STL non contiene la «piazza grigia» di OBIETTIVI.md §3: il terreno davanti ai gradoni è solo piano.

# Handoff — lavori terminati il 21/10/2026 su richiesta dell'utente

- **Pubblicato:** artifact https://claude.ai/code/artifact/b6b40dff-1e58-4b65-a386-6d4bab8d31ed, versione 32
  (capacità `db`, `user`, `assets`).
- **Codice:** branch `claude/new-session-zh34qp`; la v32 corrisponde al commit `29b21e2`.
- **Totem nuovo: fatto** (sotto). Applicata la patch, «m» del museo sostituita con l'immagine
  `tex/museo-m-logo.jpg`, campi modificabili nella scheda. Da pubblicare come v33 se non è già pubblicato.
  Resta solo la **mappa vettoriale** del cartello 3, che manda l'utente (la mappa del 21/10 sera era sbagliata: ignorata).
- **Prove:** server locale `python3 -m http.server 8765` in questa cartella, pagina `index.html?standalone`, Chromium
  headless (playwright, swiftshader).
  - Gli script di prova usati in sessione non sono nel repo; servono tre controlli:
    - render prima/dopo identici per le viste del cortile, dell'ingresso, della terrazza e della scala;
    - prove dell'editor con un `window.claude` finto (db, user, assets);
    - prove di `cammina.js` con `campus3dCammina.prova(secondi, tasti)`.

### Totem CU014 (indicazioni dell'utente, 21/10/2026) — fatto
- **Struttura:** base cubica di travertino che sorregge una lastra spessa rossa con tre cartelli bianchi.
- **Orientamento:** lato lungo parallelo al vialetto (confermato).
- **Cartello 1:** «**CU**014», con CU in grassetto.
- **Cartello 2**, testi e formattazione indicati dall'utente:
  - «Edificio di Chimica / Stanislao / Cannizzaro»: grassetto, grande, nero;
  - «Facoltà di Scienze matematiche, fisiche e naturali»: piccolo, grassetto, rosso Sapienza;
  - «Dipartimento di Chimica»: poco più grande, non grassetto, nero;
  - «📍 Aula Aldo La Ginestra»: stessa dimensione del dipartimento, rosso e ancora più sottile;
  - «Polo museale Sapienza»: come la Facoltà;
  - «Museo di Chimica / Primo Levi»: come il Dipartimento;
  - logo «m» del museo, a lato di «Polo museale Sapienza», sullo stesso cartello: usare l'immagine
    `riferimenti/logo-museo-m.jpg` così com'è: fatto, è `tex/museo-m-logo.jpg` disegnata nella texture del cartello
    come il logo Nippon Gases sul silos.
- **Cartello 3:** mappa della città universitaria con l'edificio evidenziato. L'utente la sta ricostruendo in vettoriale
  e la manda lui: usare quella così com'è nella texture del cartello in basso. La mappa disegnata dalla patch con le
  sagome degli edifici è solo provvisoria.
- **Modifica dalla scheda** (richiesta del 21/10): codice («CU» in grassetto, il resto normale), le sei voci del
  cartello con la loro formattazione fissa (voce vuota = sparisce, Invio va a capo in nome e museo) e la spunta
  «Logo «m» del museo». Nel file: `scritta`, `cartello` {nome, facolta, dipartimento, aula, polo, museo},
  `logoMuseo` (false = senza logo); valgono anche per i totem aggiunti dal catalogo e per i duplicati.
- **Foto:** `riferimenti/totem-cu014.jpg`.

## Cortile dell'azoto: corpo sopra il portico e aiuole speculari (21/10) — fatto
- **Ponte sopra il cancello (fix, 21/10):** i due cortili sono un solo vuoto (`vuoti` = [0.2, -4, 16.6, 40.3], buco del cortile interno tolto da `courtyards.json`), ali dritte su u 0.2 e 16.6 (`pieni` a u 0.2); dentro resta solo il ponte di un piano con un unico tetto piano senza attico, soffitto/fondo su `corpoU`. Cause dei pezzi spezzati: striscia u 0.2→1.5 piena a tutta altezza, ali a u 0 / 16.8 / 1.5 invece di 0.2 / 16.6, buco interno coincidente col bordo (scarto di cm) che lasciava lame di facciata, attico sul ponte.
- **Corpo sopra il portico:** alto un solo piano (`portico.piani: 1` in `cortile/modello.json`), dal solaio (soffitto + 0,35)
  fino a `y0 del corpo + piani × altezza del piano`, con le stesse fasce/finestre della facciata e chiuso da tetto piano con
  l'attico sottile; poggia sui pilastri. Le sagome OSM sono già svuotate (`vuoti`) a tutta altezza, quindi sopra si vede il cielo
  e le pareti dei due cortili restano quelle dell'edificio. Codice: `loadCourtyardModel` in `campus-3d.js`.
- **Aiuole speculari:** riferimento l'aiuola B (vicino al silos); la A è il suo specchio (u 1.75–6.15, v 1.45–8.3), senza il varco
  della porticina (che è della gabbia). Entrambe arrivano al pilastro vicino (v fino a 8.3, i pilastri partono da 8.05).
- **Pilastri:** il pilastro sinistro è lo specchio di quello dietro la gabbia (u 5.02–6.22, v 8.05–8.95, altezza 5,75), tiene la scritta AULE.
- **Asse di simmetria:** u = 8.4, mezzeria dei muri del cortile (sinistro u 0.2, destro u 16.6) e del varco del fondo (6.4–10.4); u' = 16.8 − u.

## Cortile dell'azoto: magnolie 3D con foglie stagionali (21/10) — fatto
- **Modello (rifatto dopo la v39):** la prima versione (GLB con un solo materiale) dava alle foglie la texture del tronco.
  Ora si usano le due magnolie «con chiome ampie» dell'artifact della scansione 3D (3DExport 321349, fornito dall'utente:
  verificare la licenza), albero 1 → magnolia A, albero 2 → magnolia B (i piedi dei tronchi cadono a meno di 0,1 m da
  `u`/`v` di A e B). Chioma da 1,65 m in su, tronco separato con la sua texture.
- **Formato dei file geometria (`.wasm`, non WebAssembly):** i `.wasm` dell'artifact erano geometrie grezze, non WebAssembly: `nv` posizioni float32 xyz
  (Z in alto, nel riferimento della scansione), `nv` uv float32, `nf` triangoli uint32. Convertite nel riferimento del
  cortile (X = u, Y = h, Z = −v, origine al piede del tronco) con `angoloDeg` −47,7°, origine (3,66; −6,06) e
  `scanFloorZ` di `scan/scan-georef.json`.
- **File:** `models/magnolia.json` (misure di riferimento, ceppo), `models/magnolia_{a,b}_{chioma,tronco}.wasm` (331 kB in
  tutto), `tex/magnolia-corteccia.jpg`, `tex/magnolia-foglie-{primavera,estate,autunno,inverno}.png` (identiche all'artifact,
  256 px). Codice: `magnoliaTree` in `campus-3d.js`; l'albero procedurale resta come ripiego (`magnoliaProcedurale`) finché
  i file non sono caricati o se non si caricano. Le uv escono da 0..1, quindi texture in `RepeatWrapping`.
- **Ceppo:** il tronco originale parte a 0,74 m (A) e 0,96 m (B), sotto c'era la base scansionata che qui non c'è:
  un cilindro di corteccia lo porta dal terreno (0,36 m) all'anello inferiore.
- **Posizione e misure:** `u`, `v` posizionano; `altezza` e `raggio` scalano rispetto ai valori di riferimento di
  `models/magnolia.json` (A: 11,23 / 3,8; B: 10,63 / 4,2): invariati, l'albero è come nell'artifact. `raggio` è nominale
  (la chioma vera è molto più larga). L'editor che sposta o ridimensiona le magnolie funziona come prima. Ombre attive.
- **Stagione:** automatica dalla data, ora di Roma (primavera mar–mag, estate con foglie verdi giu–15 nov,
  autunno con foglie marroni 16 nov–31 dic, inverno gen–feb: a ottobre le foglie reali sono ancora verdi).
  Si forza con `?stagione=primavera|estate|autunno|inverno` nell'URL (vale per tutte), oppure nel JSON con
  `magnolie[k].stagione` (per un albero) o `stagione` nell'oggetto del cortile (per tutti); `"auto"` = dalla data.
  Ordine: URL, albero, cortile, data. La foglia usa `alphaTest` per i bordi.
- **Chioma dell'albero B (v43):** nel file la chioma B sta circa 4,5 m a sinistra (u) del suo tronco, sopra la chioma di A,
  quindi B sembrava senza chioma (file e dimensioni erano corretti). `chiomaOffset: [3,6; 0; 0,1]` in `models/magnolia.json`
  la riporta sopra il tronco (stesso scarto chioma-tronco di A).
- **Da controllare dopo il rendering:** raccordo del ceppo con il tronco, chiome rispetto alla facciata, ombre.

## Fatto nella versione 32
- Catalogo «Oggetto del modello» in ＋ Aggiungi con tutti gli oggetti costruiti nel modello (anche la transenna a
  strisce bianche e rosse inclinate di 35° in senso orario, del commento 4).
- Aiuole con cordolo in travertino come quelle del cortile dell'azoto; raggio degli angoli per tutti o per angolo
  (tocca la maniglia gialla).
- ✕ sulla scheda (nasconde senza deselezionare), tasto «▤ Scheda», tasto «Duplica».
- Foto allegate ai commenti (capacità `assets`).
- Passeggiata in prima persona (`cammina.js`).
- «Ripristina originale»: scritture in fila per documento; una modifica tolta dal db torna subito com'era nel file.
- Magnolia A riportata all'originale (modifica `cortile:magnolie.0` cancellata dal db).
- Commento 1 (totem): larghezza e spessore si cambiano dalla scatola.

## Rimasto da fare

### Navigazione in prima persona (21/10) — fatta nella v34
- Tasti 1–9 per la velocità (0,6 … 20 m/s, 4 = 3,2 m/s come prima), mostrata per un attimo a schermo e ricordata dal
  browser; Maiuscolo corre a 2,5× la velocità scelta.
- Levetta, «Corri» e «Salta» solo su schermi touch (`pointer: coarse`, o touch senza puntatore fine).
- Da computer lo sguardo segue il mouse senza trascinare (Pointer Lock); se il browser lo nega resta il trascinamento.
- Mirino a croce: E / «Modifica» e C / «Commenta» agiscono su ciò che sta al centro (`campus3dEditor.mira`); la
  passeggiata va in pausa finché la scheda è aperta.
- Da verificare sull'artifact pubblicato: che l'iframe di claude.ai permetta la cattura del mouse.

### Editor: effetto magnetico — fatto nella v35
- Spostando o ridimensionando una scatola (e i vertici di aiuole e marciapiedi) bordi, centro e quota si agganciano a
  quelli degli oggetti entro 15 m nella stessa cornice; misure uguali a un vicino, rapporti 1:1, 1:2, 2:1 fra i lati;
  spaziatura uguale a due vicini in fila. Soglia: ~10 px sullo schermo, almeno 0,15 m.
- Guide: blu allineamenti, magenta misure, arancio spaziature; l'aggancio è scritto anche nel suggerimento in alto.
- Alt (computer) o un secondo dito (iPad) sospendono la calamita.

### Pergolato da rifare (foto `riferimenti/pergolato-1.png` … `pergolato-10.png`, Street View 2015) — fatto
**Fatto (v110, `addPergola` in `campus-3d.js`, elemento `pergolato` in `cortile/chimica-esterni.json`):** galleria di 15
archi a tutto sesto in tondino di ferro (passo 1,8 m, alta 3 m) su cordoli di travertino, vialetto a lastre irregolari
(texture `opusTex`), vite verde fitta in due gusci + fondo scuro (da fuori una siepe arrotondata, aperta alle estremità;
verificato con la passeggiata: si attraversa da capo a capo); pini già nel modello. Nel modello
non c'era nessun pergolato posato (solo il pezzo del catalogo, ora riscritto): posizione scelta sul lato 0, u 16,5–43,
v 12,1–14,7, tra la scala antincendio ovest e il vialetto dell'ingresso, evitando i tronchi esistenti. Nell'editor è un
oggetto selezionabile (u, v, altezza). Da confermare con l'utente
posizione e lunghezza (26,5 m).
**Aggiornamento (v111):** foglie con la foto di vite (ambientCG LeafSet029, CC0, `tex/vite_LeafSet029_*`, vedi
`tex/ATTRIBUTION.md`) con `alphaMap` + `alphaTest` e ombre bucate (`customDepthMaterial`); quattro gusci sfalsati con vuoti
fra le foglie; la densità sale con la quota (quasi nulla sotto `fogliame_da`, 1 m, massima sul tetto; `copertura` la scala), quindi in
basso si vedono gli archi in ferro. Uno o due fusti contorti per campata (hash fisso, lato e posizione variabili, spesso
vicini al montante) dal cordolo fino al fogliame. Da verificare nella pipeline: aspetto delle foglie, densità e fusti.
**Aggiornamento (v49):** il pergolato è solo la galleria (archi, vite, vialetto, cordoli ai lati): tolti ringhiera/staccionata,
prato aggiunto e aiuole di begonie (codice `begoniaMat` compreso). I lampioni verdi sono ora elementi `lampione` a sé
(u, v, altezza; selezionabili, spostabili, duplicabili ed eliminabili; voce «Lampione verde» nel catalogo), quattro: u 24 e 40
nel prato 1, u 55,26 e 71,26 nel prato 2 (specchiati rispetto all'asse del portone u 47,63), v 18,7. Secondo pergolato (elemento
`pergolato`) nel prato 2 dell'ingresso, specchio del primo rispetto al vialetto: u 52,26–78,76, v 12,1–14,7, stessa lunghezza.
Tolto anche il condizionatore bianco sulla facciata dell'ingresso (u ≈ 42,9, h ≈ 3,9).
L'utente non vuole il pergolato attuale (archi con foglie rosse e arancio). Come nelle foto:
- **Struttura:** galleria lunga e stretta parallela alla facciata, lungo il viale. Archi a tutto sesto di tondino di
  ferro scuro, uno ogni ~1,5–2 m, che partono dai cordoli in travertino ai due lati del vialetto.
- **Vialetto:** al centro, pavimentato a lastre irregolari di pietra grigia (opus incertum).
- **Copertura:** vite o edera verde fitta che copre tetto e fianchi, così che da fuori sembra una siepe lunga e
  arrotondata, alta circa 3 m, con l'apertura ad arco alle estremità.
- **Intorno:**
  - (non più nel modello, v49: ringhiera, prato aggiunto e aiuole di begonie; i lampioni verdi sono oggetti separati).
- **Foto 7–10:** mostrano anche il totem vecchio del 2015 (non più valido: vale quello della foto del 21/10) e le
  panchine in travertino.

### Facciata dell'ingresso principale — FATTO
Il rivestimento attorno al portone (oggi lastre quasi bianche, `rivestimento` in `buildEntrance`) deve essere dello
stesso travertino del resto dell'edificio. Fatto: usa la texture del piano terra di CU014 (baseCanvas2, senza finestre) alla stessa scala.

### Commento 2 — corpo sopra il portico e cortile interno (`segnalazioni/4koi46r8db3vpkeooc9c`)
«Un solo rettangolo che collega i due lati dell'edificio; il cortile interno è un rettangolo semplice, senza il
rettangolino in più, ed è largo quanto quello esterno.»
**Fatto.**
- Cortile interno: in `courtyards.json` il buco di CU014 rilevato dall'ortofoto (u 3.1→17.5, v 12.1→40.4, sporgeva oltre
  la parete destra del portico e lasciava il rettangolino) è sostituito da un solo rettangolo nella cornice del cortile,
  u 0.2 → 16.6 (stessa larghezza del cortile dell'azoto), v 13.0 → 40.3 (fondo medio del buco rilevato, 40.2–40.4).
  Le coordinate lon/lat sono quelle dei quattro angoli convertiti con la cornice di `modello.json`; se si ricalibra
  `riferimento` vanno rifatte. Gli altri sei buchi di CU014 sono invariati.
- Corpo sopra il portico: `portico.corpoU` [0.2, 16.6] in `cortile/modello.json` (default `portico.u`); in
  `loadCourtyardModel` (`campus-3d.js`, anello `ringLL`) il corpo si stende su tutta la larghezza fra le due ali.
- Il portico a terra (`portico.u`, `vuoti`) resta 1.5 → 16.6 come prima.
- Verificato con render headless prima/dopo (dall'alto e in obliquo): buco largo quanto il cortile esterno, nessuna
  giunzione a gradino, ingresso e ala ovest identici pixel per pixel; in console solo i 404 di `/api/campus-ortho` e
  `tiles/manifest.json` (backend assente in locale).

### Commento 3 — cancello fra i due cortili (`segnalazioni/mid7pp1ka9564qvf5h3q`)
Il cancello in fondo al portico non è largo quanto tutto il portico: sta dentro una parete. Le foto promesse non sono
arrivate (in `riferimenti/` nessuna mostra il cancello in fondo al portico), quindi le misure sono stime.
Fatto: `fondo` in `cortile/modello.json` ha ora `varco` [6.4, 10.4] (cancello a barre largo 4 m, centrato sul cortile
u 0.2–16.6) e `spessore` 0.24. In `loadCourtyardModel` (`campus-3d.js`) il cancello (barre, correnti, montanti e fondale
del cortile interno) occupa solo il varco; sul resto della larghezza del portico (u 1.5 → 6.4 e 10.4 → 16.6) c'è una
parete piena in travertino (lo stesso `travMat` dei muri del cortile), alta fino al soffitto del portico (4.5 m), v
12.76–13.0. Altezza del cancello invariata (soffitto − 2 cm).
Da confermare con le foto: larghezza e posizione del varco (basta cambiare `varco`), spessore della parete, se la parete
ha porte o finestre, se il cancello ha un architrave sopra (ora arriva quasi al soffitto) e il materiale della parete
(ora travertino, come la fascia bassa dei muri del cortile; la facciata in mattoni sta sopra il soffitto).

### Commento 4 — rotazione (`segnalazioni/wvncis7t2zxs4pi37fwp`) — fatto
Transenna a strisce nel catalogo; «Ruota di 90°» per gli oggetti del catalogo (`ruota`); rotazione anche per
parallelepipedi, cilindri e sfere, e angolo libero per tutti.
- Campo `angolo` (gradi, positivo = antiorario visto dall'alto, come `ruota`) sulle primitive con `box` (`box`,
  `cilindro`, `sfera`, `oggetto`): ruota l'oggetto attorno al centro della scatola, che nel file resta quella dritta.
- `buildPrimitive` (campus-3d.js, `rotatedAboutCenter`): gruppo-perno al centro della scatola con `rotation.y`.
- Editor: cornice ruotata `rot:<id>` (Object3D figlio della cornice base, ruotato attorno al centro della scatola, che
  resta ferma: u/v/h sono ancora quelle della cornice base), così maniglie e scatola girano con l'oggetto; `apply`
  riporta la scatola trascinata nella cornice base (`unturnBox`). `frameBy` risolve `rot:<id>`; `select`/`refreshSel`
  aggiornano `sel.frameKey`; `itemAt` tocca il solido nella sua cornice ruotata. La calamita non aggancia vicini di
  un'altra cornice né vicini ruotati (le loro scatole sono nella cornice dritta).
- Scheda dei solidi: «Ruota di 90°» (+90° all'`angolo`) e cursore «Rotazione» 0–355° (passo 5°); per gli oggetti del
  catalogo solo il cursore (il tasto resta quello di `ruota`). `angolo` è nei `fields` dell'`aggiunta` (con 0 il campo
  resta; «Ripristina» lo toglie) e `Duplica` lo copia insieme al resto.
- Limiti noti: «Solo questo pezzo» (deformazione per primitiva) su un solido ruotato lavora sulla scatola dritta del
  pezzo; marciapiedi e aiuole (`poligono`) non hanno angolo (si ruotano spostando i vertici).

### Selettore Sposta / Ruota — fatto (richiesta dell'utente)
- `editor.js`: `sel.rot` + `turnKind()` ('angolo' per solidi e oggetti del catalogo, 'orienta' per totem e panchine, altrimenti
  nessuna rotazione). Modo Ruota: `drawSel` disegna un anello (`sel.ring`) e una maniglia `rotate` al posto delle maniglie della
  scatola; `startDrag`/`rotMove`/`endDrag` ruotano `angolo` a passi di 5° con `turnMagnet` (0/90/180/270° e angoli dei vicini
  ruotati, soglia 4°, Alt o secondo dito sospendono), ricostruzione ogni 90 ms come il cursore, salvataggio al rilascio.
- Selettore in cima a `infoCard` (`modeSwitch`), tasto flottante `ui.rot` (sincronizzato in `loop`) e tasto R.
- `orienta` aggiunto ai `fields` di totem e panchine (prima non veniva salvato); «Ripristina» lo toglie.
- Limiti: gli altri oggetti dei JSON (pilastri, aiuole, terrazze, alberi, edifici) non hanno rotazione e il tasto è spento;
  in Ruota non si ridimensiona né si sposta (si torna a «Sposta»); non provato nel browser.

### Commento 5 — bordo dei marciapiedi (`segnalazioni/471gbrlr71ggbi0hzmf2`)
Bordo a cornice in blocchi di travertino bianco.
- In `buildSidewalk`: anello del cordolo, cioè il contorno raccordato meno il contorno spostato verso l'interno di
  `cordolo` (≈ 0,2 m, raggi ridotti come per le aiuole), in un travertino bianco nuovo.
- Asfalto solo dentro l'anello.
- Giunti scuri ogni ~0,9 m lungo il contorno (InstancedMesh di listelli sul piano e sulla faccia esterna).
- Le discese restano a filo.

**Fatto** (`campus-3d.js`, `buildSidewalk`, `whiteTravertineMaterial`, `jointMaterial`, `addKerbJoints`): anello del cordolo in
travertino bianco (campo `cordolo` del marciapiede, default 0,2 m, 0 = nessun cordolo; interno con raggi ridotti come le aiuole),
piano nel materiale di prima solo dentro l'anello, giunti scuri ogni ~0,9 m (due InstancedMesh: piano e faccia esterna), materiali
in cache con `courtOnce`. Discese: lo scivolo a cuneo ricopre tutto lo spessore del cordolo (nessun gradino) e i giunti
che cadono sotto lo scivolo sono omessi. Documentato in README (`aggiunta:<id>`).

### Texture di facciata per singolo lato (richiesta in chat) — fatta
La tendina «Texture della facciata» della scheda edificio cambia tutto l'edificio; deve cambiare solo il lato
toccato, interno o esterno.
- Piano: alla selezione dell'edificio memorizzare la riga di muro toccata (`cellFromHit` → riga intera, come
  «Texture di un muro»).
- La tendina crea le toppe `texture` di `wallPatches` per quella riga.
- Tenere eventualmente un'opzione separata «tutto l'edificio».
- Fatto: la riga toccata si memorizza in `selectBuilding`; la tendina crea le toppe `texture` di `wallPatches` per quella
  riga (sostituendo quelle già presenti sulla stessa riga); la spunta «Tutto l'edificio» dà il vecchio comportamento
  (campo `facciata`); sul tetto la spunta è obbligata. Le toppe di un lato restano sopra la texture di tutto l'edificio.

### Modifiche nel db riportate nei file (`modifiche`), da segnare «applicata» dopo la pubblicazione
Riportate nei JSON (34 documenti, verificati dalla pagina con un controllo automatico valore per valore):
- `aggiunta:*` (8) in `primitive` di `cortile/chimica-esterni.json`: asfalto `pmvi5eehk4w`, marciapiede ovest con discesa
  `pmvi77470sy`, aiuole `pmvi7i1ot6y`, `pmvi7k8iv1y`, `pmvi7mhv86q`; con `rimosso: true`: `pmvi579i36b`, `pmvi74yrjm4`, `pmvi7jmdoff`;
- 15 alberi `albero:*` in `trees.json` (9 con `rimosso: true`, 6 spostati/ridimensionati; l'id di un albero spostato
  cambia perché deriva da `p`, quindi i vecchi documenti non servono più);
- `cortile:aiuole.1`, `cortile:pilastri.0`, `cortile:pilastri.1`, `cortile:tombini.0`, `cortile:transenne.0` in `cortile/modello.json`;
- `esterni:elementi.6.aiuole.0`, `.aiuole.1`, `.fiori`, `.rastrelliera` in `cortile/chimica-esterni.json`;
- `edificio:CU014` (facciata «cortina», finestre già nel file) e `edificio:CU006` (travertino) in `cortile/facciate.json`.

Non riportate: restano «sospese» in attesa di conferma `cortile:pavimento`, `cortile:portico` e tutti i pezzi
`prim:cortile-modello.0.*` (anche `.33`, `.34`, `.35`, `.43@2`, ancora «da applicare»). I documenti già «applicata»,
«scartata» o «sospesa» (`esterni:elementi.6`, `prim:edifici.56`, `prim:alberi.1@*`, ecc.) non sono stati toccati;
nessun `prim:edifici` / `prim:alberi` da applicare, quindi niente da riportare lì.

### Commenti nella mappa
- Commento 1 segnato «fatta».
- Commenti 2–5 restano aperti finché non sono fatti.

## Cortile dell'azoto: tre commenti (cancellata, ponte, tombino) — fatto, da verificare con il render
- **Cancellata:** `cancellata.sporgenza` = 0.4 in `cortile/modello.json`: muretto e ringhiera si prolungano di 0.4 m oltre i muri (u −0.2 e 17.0), con 3 barre in più per lato (u −0.13, 0, 0.13 a sinistra; 16.64, 16.77, 16.9 a destra), stesso passo 0.13, sezione e materiale. Il lato destro aveva già la barra a 0.09 dal muro, ma ora è simmetrico.
- **Ponte:** `portico.v` = [8.0, 13.0] (prima 9.4): soffitto e corpo di un piano arrivano a filo delle due colonne (v 8.05→8.95) con 5 cm oltre. Le colonne (`pilastri`) sono alte 4.85 (solaio del ponte) invece di 5.75. Tetto piano liscio come prima.
- **Tombino 1:** u 8.4 (asse), v 4.875 (centro delle aiuole v 1.45–8.3), lato 0.6 invariato.
### Commenti su marciapiedi e cortili CU014 (21/10/2026)
- **Discese dei marciapiedi:** la rampa non sporge più verso la strada ma sta dentro il marciapiede (`buildSidewalk`): piano e
  cordolo in travertino sono ritagliati da una tasca larga `larghezza` e profonda `profondita` dal bordo esterno; la rampa scende
  dal piano alla quota della strada a filo del bordo esterno, senza gradini. Giunti sotto la rampa omessi. `profondita` ora vale
  come lunghezza interna della rampa (minimo spessore cordolo + 0,3 m).
- **Cortili di CU014 rettificati** in `courtyards.json` (indici 4 e 5, quelli sotto i punti u 42,53 v −68,8 e u 12,29 v −72,32 del
  lato 0): sostituiti dal rettangolo allineato al lato 0 con l'ingombro del poligono originale: n. 4 circa 6,2 × 9,0 m
  (u 40,8–47,0, v −73,2…−64,2), n. 5 circa 7,8 × 7,5 m (u 10,3–18,2, v −73,9…−66,3). Gli altri poligoni sono invariati.

## Cortile dell'azoto: tubi del gas (22/10/2026) — da verificare con il render
- Modello dell'utente (USDZ, 6 tubi in matrice 3×2) tagliato a metà: restano 3 tubi in linea, GLB in `models/tubi-glb.json`
  (1,6 MB), campo `tubi` in `cortile/modello.json` (`u` 13.4, `v` 0.8, `ruota` 0, `scala` 1), voce «Tubi del gas» nell'editor.
- Posizione STIMATA: dietro il silos dal lato della cancellata (opposto al portico, v basso), a destra del silos, nella striscia fra
  il muretto (v 0.15) e il cordolo dell'aiuola B (v 1.45), fuori dal tubo di scarico (u 10.48) e dal varco del cancello (u 6–10.6);
  fila parallela alla cancellata. Da confermare con le foto.
- Dimensioni: unità in metri (`metersPerUnit` 1), tubi Ø ≈ 0,19 m e alti 1,67 m con la valvola: plausibili per bombole, ma la scala non
  è verificata sul posto (campo `scala`). Solo uno dei 3 tubi conserva la valvola, come nel modello originale (nessuna valvola in mezzo).
- Non verificato nulla a schermo (niente render): controllare orientamento, ombre e aspetto dei materiali (metallo limitato a 0,35).

## Commenti del 22/10/2026 (branch `commenti-22-10`) — da verificare con il render
- **Cancello del fondo del portico**: tolte le barre verticali e il fondale dipinto opaco; ora una rete metallica fitta (maglia ~5 cm, `wireMeshTex` con `alphaTest`, doppia faccia) dentro il telaio, trasparente: si vede il cortile interno vero.
- **Cassetta antincendio sul muretto** (commento con foto, u 5.09 v −0.15 h 0.67): la foto mostra una cassetta («bocciolone antincendio», vetro scuro in cornice di alluminio, copertina grigia, adesivo bianco), addossata alla faccia su strada del muretto in travertino; a sinistra un tubo rosso, sotto un palo a strisce rosse e bianche (non modellato); le barre della ringhiera dietro sono color crema, non ruggine. Aggiunti `cancellata.cassetta` in `cortile/modello.json` (misure stimate ~100 × 50 × 23 cm, h0 0.42), il tubo rosso di 1 m e il colore crema delle barre della ringhiera.
- **Tubi del gas ruotabili**; **Ruota ora funziona su quasi tutto**: campo `angolo` (gradi, antiorario dall'alto, attorno a un perno) letto dai costruttori (`turned()` in `campus-3d.js`) per panchine, palme, totem, rastrelliera, pergolato, lampione, prati e aiuole dell'ingresso, e nel cortile aiuole, pilastri, magnolie, silos, gabbia, tombini, transenne (`angoloDeg`) e tubi (`ruota`). Poligoni (marciapiedi, aiuole, aree, pilastri, terrazze, ringhiere): Ruota gira i vertici. Non ruotano: edifici, terreno, pavimento e portico del cortile, scale antincendio, portone d'ingresso e rivestimento, percorso tattile, tubo di scarico, fossetta, porticina della gabbia, palo della bandiera, alberi del rilievo; porte e portoni restano attaccati al muro (Ruota disattivato con spiegazione).
- **Vincoli**: porte/portoni (`portone`, `portaAntincendio`) poggiati al suolo e agganciati alla parete più vicina (raggi orizzontali entro 1 m, retro a filo muro, angolo parallelo); tombini sulla superficie orizzontale sotto (campo `quota`); aiuole e marciapiedi sempre a quota 0 della cornice (terreno). Nessuna calamita per questi oggetti.
- **Porta antincendio doppia** (`portaAntincendio` nel CATALOGO): due ante in lamiera marrone, maniglione rosso dietro, maniglia a L in plastica davanti, vasistas sopra. L'oggetto «Portone in legno con stipiti» `aggiunta:pmvjamz7iwe` sta nel db: va cambiato dalla scheda (tendina «Oggetto») oppure con `modello: "portaAntincendio"` (poi trascinarlo per riagganciarlo al muro).
- **Specchia** (↔ lungo u, ↕ lungo v) nella scheda: marciapiedi/aiuole con `poligono` (vertici, `raggi`, `discese`) e oggetti del catalogo (campo `specchio`: `u`, `v`, `uv`, scala −1 nel costruttore). Non per i solidi semplici (simmetrici).
- Non verificato a schermo.

## Annulla / Ripeti nell'editor (22/10/2026) — fatto, non provato nel browser
- `editor.js`: pila `undoStack`/`redoStack`; `saveItem`, `saveSelPrim`, `removePrim`, `saveFacade` e «Ripristina» registrano
  prima/dopo (`remember`, `rememberPrim`). «Prima» = ultimo valore noto (`known`, `primKnown`, `facadeKnown`, aggiornati anche
  da `applyOverrides`/`applyFacadeDoc`), altrimenti il file; `null` = oggetto aggiunto che non c'era o pezzo com'era nel file.
  Salvataggi della stessa chiave entro 0,7 s diventano un solo passo.
- `undo(again)` → `putItem` / `putPrim` / `putFacade`: rimettono il valore, ridisegnano e salvano (o cancellano il documento se
  si torna al file); durante l'annulla `undoing` impedisce di registrare. Tasti ⌘Z / Ctrl+Z, ⇧⌘Z / Ctrl+Y (ignorati nei campi
  di testo), ↶ ↷ nella barra solo in «Modifica». La pila vive solo nella pagina aperta (si perde ricaricando).

## Vista libera, Commenta in Modifica, palma 2 (22/10/2026) — fatto, non provato nel browser
- `campus-3d.js`: `onWheelZoom` (capture su `map3dHost`, sostituisce la rotellina di OrbitControls: passo ∝ `deltaY`, ridotto da
  `zoomPace` fino a 0,2 sotto ~6 m dal punto guardato; pizzico del trackpad = `ctrlKey` ×10) e `freeView` in `renderFrame`
  (distanza che scivola verso `zoomGoal`; `zoomSpeed` del pizzico touch ≥ 0,4; WASD/frecce: W/S in piano a metà della distanza
  al secondo, A/D giro attorno a `controls.target` a (6 + r/4)/r rad/s, max 1; Maiusc ×3; tasti ignorati nei campi e in passeggiata).
- `editor.js`: `commentSel` (tasto «💬 Commenta» nelle schede di oggetto, pezzo, edificio) → `newComment(hit, null, back)`;
  `commentDoc` accetta `hit.item` e `hit.extra` (`scatola`, `pezzo`, `edificio`).
- Palma 2 dell'ingresso (u 42,4, v 7,9): `rimosso: true` nel file su richiesta dell'utente («tolta per ora»).

## Aggiungi: strada asfaltata e file 3D (22/10/2026) — fatto, non provato nel browser
- Strada (`forma: 'strada'`, `poligono`, `base`, `raggio`/`raggi`): `buildRoad` in `campus-3d.js`, `ShapeGeometry` a `base + 0,02`,
  `roadMaterial` trasparente a opacità 1 senza scrittura della profondità, `renderOrder` 3 + base/100 + indice·1e-5 (dopo cartina −2,
  ortofoto 1 e tasselli satellitari 2; ordine fisso tra strade). Con il depth buffer logaritmico `polygonOffset` non basterebbe.
  Editor: vertici, raggi, Specchia, faccia bassa per la quota (`lock.h1`).
- File 3D (`forma: 'file3d'`, `modello3d: { asset, formato, nome, su, misure }`, `box`, `angolo`, `specchio`): `prepareModel` legge e
  misura il file (unità: oltre 500 → mm, oltre 150 → cm), lo comprime con fflate e lo impacchetta come JSON base64 (gli asset non
  accettano binari 3D; limite 20 MB); `userModel` lo riscarica da `/_blob/<asset>` e lo mette in cache; `buildUserModel` lo scala
  nella scatola (segnaposto grigio, rosso se non si carica). USDZ non supportato (three r128 non ha il lettore; quello recente legge
  solo USDA): convertire in GLB. Nel riportarlo nei file la primitiva tiene `modello3d.asset` (l'allegato resta nell'artifact).

## Commento 10 (`segnalazioni/agr20hmujudjh4noslbj`): fronte sud a ventaglio rifatto (22/10/2026) — fatto, non provato nel browser
- I gradoni di 2 m erano sbagliati. Descrizione dell'utente (chat) e 4 foto del commento: ai due lati del fronte curvo una pensilina in travertino copre la
  prima rampa (lungo la curva) fino al mezzo piano; lì il pianerottolo, svolta di 90°, cancello, di nuovo 90° e seconda rampa fino alla balconata, che
  inizia appena prima della prima colonna arancione; ringhiera metallica e una grossa colonna allungata di travertino (il muro fra le rampe sotto la
  pensilina). Al centro la balconata incassata (non sporge) con 4 colonne e 3 parapetti di travertino; dentro 3 o 4 porte a vetri (l'utente non ricorda).
- Dati in `cu014-solido.json → ventaglio.balconata` e `ventaglio.scale` (angoli della balconata −100,3° → −85,2°, loggia profonda 1,6 m, quota 4,4;
  scale: 13 alzate da 17 cm per rampa, pedata 32 cm, fasce 37,3–38,65 / muro 38,65–38,95 / 40,35, pensilina in cima a 4,6 m). Le scale risultano
  ovest −100,3° → −110,9°, est −85,2° → −74,6° (pianerottolo di mezzo a −107,9/−110,9 e −77,6/−74,6, vicino a quanto l'STL vede a 1,9–2,5 m).
- Da confermare con l'utente: numero di porte (messe 3, una per campata), colore della ringhiera (grigio scuro), quota della pensilina (STL: 4,1 ovest, 4,6 est).

## Cresta del ventaglio → impianto dell'aria (22/10/2026, commento 7 e richiesta in chat) — fatto, non provato nel browser
- L'ala `lucernario-sud` (17,8 m) era la «cresta»: nell'STL (17,0–18,1 m lungo −94°) e nelle foto del commento 10 è l'impianto dell'aria sul tetto.
  Ora `ventaglio-centro` [24,6, −91, 30,6, −64,5] a 15,3 m: tetto piano.
- Pezzi nuovi nel catalogo (`campus-3d.js`, la geometria segue la scatola: allungandoli giunti e piedini restano a misura): `condotta` (canale zincato
  con flange ogni 1,25 m e piedini), `uta` (unità di trattamento aria con raccordo rastremato, cappa e griglia), `ventilatore`, `camino` (imbuto),
  `curvaCondotta` (gomito verso l'alto con cappello). Si aggiungono anche da «＋ Aggiungi → Oggetto del modello».
- Posati in `cortile/chimica-esterni.json → primitive` con id `cond-…` (quote = tetto dell'ala + 2 cm): UTA (angolo 86°, in cima 18,0), canale sull'asse
  fino al bordo nord (17,0), canale lungo il bordo nord in tre pezzi (il tetto sale da 15,2 a 15,4), curva a est (17,5), due ventilatori, imbuto.
  Sono primitive dell'editor: l'utente li sposta, allunga e ruota per farli combaciare con Maps; i suoi modelli (in arrivo) si caricano con «File 3D»
  o li adatto io.
- (22/10 sera) **Kit dell'utente** `Ventilation_Modular_GalvanizedSteel.glb` (Sketchfab, 2 zip da 28 MB: 38 pezzi low-poly con sezione 0,54 × 0,39 m,
  un materiale «MetalGalvanizedSteelWorn001» con tre texture PNG 4096 px = 56 MB). Ridotto a `models/ventilazione-glb.json` (GLB 0,5 MB: geometrie
  invariate, texture JPEG 1024/1024/512 px; il GLB originale non è nel repository). `loadVentKit` lo carica una volta; nel catalogo i pezzi
  `kitDritto`, `kitCurva`, `kitSalto`, `kitTi`, `kitGomito`, `kitGriglia`, `kitSerranda`, `kitSupporto` (segnaposto invisibile della misura naturale,
  il pezzo vero arriva col kit). La `condotta` usa i tratti dritti del kit per il corpo, con la sezione allargata alla scatola (i canali del tetto
  sono più grossi del kit: 1,3 × 1,3 m e 0,9 × 0,74 m); UTA, ventilatori, imbuto e curva restano miei. Griglia del kit in testa al canale nord (ovest).

## Commento 11 (`segnalazioni/330rkn3n0q1zt794bh5j`): scale e loggia del fronte sud rifatte (22/10/2026 notte) — fatto, non provato nel browser
- Testo dell'utente (riassunto): la pensilina è una fascia che segue la curva dell'edificio e arriva alla fine del cancello; il cancello sta sotto
  l'edificio (area aperta ma coperta sotto l'anfiteatro), non sotto la pensilina; il primo piano è tutto arretrato di 3–5 m, con i 4 piloni e
  le facciate di fondo in travertino; sopra non c'è ringhiera; alla base delle scale una base quadrata con uno o due gradini d'angolo prima della
  staccionata; prima della svolta, un pilone di travertino largo, lungo il verso delle scale, che finisce in faccia a metà cancello. Foto: primo
  piano arretrato lungo tutto l'arco, pensiline alla quota del primo piano sui due lati, piloni con balaustre al centro.
- `cu014-solido.json → ventaglio.loggia` (rInterno 33,3, da −117° a −63°), `balconata` (piloni 0,9 × 0,9, margine 1,05 m, arretramento 0,4 sopra la
  loggia fra i piloni), `scale` (fasce: sottoscala 35,4–37,3, corsia 37,3–38,65, pilone 38,65–39,25, rampa1 39,25–40,65; cancello largo 1,4 a r 37,25;
  base quadrata 1,4 m con 2 gradini; pilone lungo 3 m; pensilina in cima a 4,6, spessa 0,3: 2,1 m liberi sul pianerottolo).
- Angoli risultanti: ovest arrivo −99,85°, piede seconda rampa e cancello −105,9 → −108,06 (metà −106,98 = fine del pilone e della prima rampa),
  prima rampa −102,39 → −106,98, base −100,38 → −102,39, pianerottolo fino a −109,04, pensilina −99,78 → −108,06; est speculare
  (arrivo −85,65, cancello −79,6 → −77,44, pianerottolo fino a −76,46). L'STL vede la pensilina est fino a −69°: il lato est potrebbe essere più lungo.
- Tolta la ringhiera sopra (pianerottolo alto); la seconda rampa è dentro l'edificio, con la soletta della loggia aperta sopra di lei.

## Retro della Ginestra modificabile dall'utente (22/10/2026 notte) — fatto, non provato nel browser
- La Ginestra è l'aula magna (anfiteatro) di Chimica: il fronte sud a ventaglio è il suo retro. Su richiesta dell'utente scale, base, pianerottoli,
  pilone, pensilina, cancello, staccionate, piloni, balaustre e porte non li costruisce più `addCuVentaglio`: sono 36 primitive dell'editor in
  `cortile/chimica-esterni.json` con id `gin-…`, generate con le misure della v62 (script in scratchpad, logica uguale a quella della pagina).
- Pezzi nuovi: forma `prisma` (solido a pianta libera: `poligono`, `base`, `altezza`, `materiale`, vertici e angoli arrotondati come i marciapiedi;
  anche in «＋ Aggiungi») per pianerottoli e pensiline che seguono la curva; catalogo `rampaScala` (gradini da 32 cm contati dalla lunghezza; alzata
  = altezza/gradini, ma oltre 19 cm la rampa parte da un plinto con alzate di 17 cm), `staccionata` (in pendenza se la scatola supera 1 m),
  `cancelloScala`, `balaustra`, `portaVetri`; materiale `intonaco arancione` per i piloni. Scatole con `angolo` tangente alla curva.
- `addCuVentaglio` costruisce solo la struttura (piano terra, soletta, fondo in travertino, soffitto, volume sopra la loggia) e lascia i vuoti del
  sottoscala e della soletta dove dice `ventaglio.scale`: se l'utente sposta molto le rampe, i vuoti vanno aggiornati nel JSON.

## Finestre spezzate sulla facciata tonda e cancelli nella passeggiata (23/10/2026) — fatto, non provato nel browser
- **Finestre:** `applyWallUVs` dava a ogni lato del muro la u proiettata sulla sua direzione; sull'arco del ventaglio (lati da 2°, 1,3 m) ogni lato
  ripartiva con una fase diversa e le finestre (campata 3,6 m) uscivano a pezzi. Ora i lati del contorno si uniscono in catene (giro < 25° fra un lato
  e il successivo, almeno 3 lati); se i punti stanno su una circonferenza (`fitCircle`, minimi quadrati, scarto ≤ max(5 cm, 1 % del raggio),
  raggio < 300 m) la u è raggio × angolo attorno al centro: continua lungo l'arco e uguale per tutti i pezzi dello stesso arco. Muri dritti come prima.
- **Cancelli (cammina.js):** tasto F e pulsante «🚪 Apri»: l'anta segnata più vicina davanti (entro 3 m, stesso piano) gira di 90° in 0,7 s, poi si
  rifanno le collisioni. Ante segnate in `campus-3d.js` con `userData.anta` (cardine nell'origine del gruppo, `punta`, `apertura` facoltativa,
  altrimenti si spinge lontano da chi cammina): `barGate` (cancelli del catalogo e della cancellata su strada; le due ante principali ora hanno il
  cardine agli estremi del varco e si aprono verso la strada, commento 3), cancello del fondo del portico rifatto in due ante con griglia di barre
  vere da 3,5 cm ogni 15 cm (commento 2: barre più spesse, si aprono verso il cortile esterno), porticina della gabbia, `cancelloScala` della Ginestra.

## Retro della Ginestra: modifiche dell'utente nel file, staccionata, lato est speculare; editor a tre modi; si cammina modificando (23/10/2026)
- Riportate nel file le modifiche dell'utente al lato ovest (gin-ovest-gradino-angolo, -rampa-1 larga 3,76 e lunga 5,76, -pilone, -pensilina,
  staccionata della rampa tolta) e le sue due aggiunte `pmvk7o45ss9` (secondo pilone) e `pmvk7skt3lh` (staccionata). La staccionata ora
  corre sul bordo esterno della rampa, dal primo all'ultimo gradino. Il lato est (`gin-est-…`) è rigenerato come specchio del lato ovest
  rispetto all'asse del fronte (−92,75°): centri e poligoni riflessi, angolo → 2·asse − angolo.
- Editor (commento «frecce dei versori»): modi Sposta (frecce u rossa, v verde, alto blu: si muove solo lungo quell'asse, con la calamita;
  cubo rosso in piano), Ingrandisci (facce, angoli, vertici) e Ruota, scelti in cima alla scheda.
- Passeggiata: con la scheda dell'editor aperta si continua a camminare (tastiera e levetta); scheda sotto la barra in alto, suggerimento spostato.

