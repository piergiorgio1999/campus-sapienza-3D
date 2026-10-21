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
- **Modello:** 3DExport «magnolia» (https://3dexport.com/3d-model-magnolia-tree-321349, fornito dall'utente: verificare la
  licenza prima della pubblicazione), solo l'albero `magnolia_003` (~5000 vertici), convertito con Blender in GLB senza
  texture, alto 10 m con i piedi a quota 0, centrato sul tronco.
- **File:** `models/magnolia.json` (config: altezza e raggio di riferimento del modello), `models/magnolia-glb.json` (GLB
  in base64, come la statua), `tex/magnolia-corteccia.jpg`, `tex/magnolia-foglie-{primavera,estate,autunno,inverno}.png`
  (256 px). Codice: `magnoliaTree` in `campus-3d.js`; l'albero di prima resta come ripiego (`magnoliaProcedurale`) finché
  il GLB non è pronto o se non si carica.
- **Posizione e misure:** `u`, `v` posizionano; `altezza` → scala Y; `raggio` → scala orizzontale (raggio della chioma al
  95° percentile); l'editor che sposta o ridimensiona le magnolie funziona come prima. Ombre attive.
- **Stagione:** automatica dalla data, ora di Roma (primavera mar–mag, estate giu–ago, autunno set–nov, inverno dic–feb).
  Si forza con `?stagione=primavera|estate|autunno|inverno` nell'URL (vale per tutte), oppure nel JSON con
  `magnolie[k].stagione` (per un albero) o `stagione` nell'oggetto del cortile (per tutti); `"auto"` = dalla data.
  Ordine: URL, albero, cortile, data. La foglia usa `alphaTest` per i bordi.
- **Da controllare dopo il rendering:** proporzioni della chioma rispetto alle misure precedenti e verso delle normali.

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
verificato con la passeggiata: si attraversa da capo a capo), ringhiera a montanti con saettoni verso l'edificio, prato
con aiuole di begonie rosse/rosa/bianche, cordolo e due lampioni verdi verso la strada; pini già nel modello. Nel modello
non c'era nessun pergolato posato (solo il pezzo del catalogo, ora riscritto): posizione scelta sul lato 0, u 16,5–43,
v 12,1–14,7, tra la scala antincendio ovest e il vialetto dell'ingresso, evitando i tronchi esistenti. Nell'editor è un
oggetto selezionabile (u, v, altezza); prato, ringhiera, aiuole e lampioni si spostano con lui. Da confermare con l'utente
posizione e lunghezza (26,5 m).
**Aggiornamento (v111):** foglie con la foto di vite (ambientCG LeafSet029, CC0, `tex/vite_LeafSet029_*`, vedi
`tex/ATTRIBUTION.md`) con `alphaMap` + `alphaTest` e ombre bucate (`customDepthMaterial`); quattro gusci sfalsati con vuoti
fra le foglie; la densità sale con la quota (quasi nulla sotto `fogliame_da`, 1 m, massima sul tetto; `copertura` la scala), quindi in
basso si vedono gli archi in ferro. Uno o due fusti contorti per campata (hash fisso, lato e posizione variabili, spesso
vicini al montante) dal cordolo fino al fogliame. Da verificare nella pipeline: aspetto delle foglie, densità e fusti.
L'utente non vuole il pergolato attuale (archi con foglie rosse e arancio). Come nelle foto:
- **Struttura:** galleria lunga e stretta parallela alla facciata, lungo il viale. Archi a tutto sesto di tondino di
  ferro scuro, uno ogni ~1,5–2 m, che partono dai cordoli in travertino ai due lati del vialetto.
- **Vialetto:** al centro, pavimentato a lastre irregolari di pietra grigia (opus incertum).
- **Copertura:** vite o edera verde fitta che copre tetto e fianchi, così che da fuori sembra una siepe lunga e
  arrotondata, alta circa 3 m, con l'apertura ad arco alle estremità.
- **Intorno:**
  - verso il prato: ringhiera in ferro a montanti con saettoni diagonali;
  - verso la strada: striscia di prato con aiuole fiorite (begonie rosse, rosa e bianche), pini, lampioni verdi e
    cordolo in travertino sull'asfalto.
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
