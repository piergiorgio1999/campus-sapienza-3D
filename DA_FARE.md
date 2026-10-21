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

### Editor: effetto magnetico (allineamenti e proporzioni, come nell'impaginazione)
Quando si sposta o si ridimensiona un solido con la scatola:
- **Calamita sugli allineamenti:** i bordi, il centro e la quota della scatola si agganciano a quelli degli
  oggetti vicini nella stessa cornice (u0/u1/centro u, v0/v1/centro v, h0/h1). Soglia piccola, circa 10 px sullo
  schermo o 0,15 m. Mentre aggancia si disegna una linea guida sottile colorata attraverso i due oggetti.
- **Calamita sulle proporzioni:** larghezza, profondità e altezza uguali a quelle di un vicino; spaziature uguali
  fra tre oggetti in fila; rapporti semplici (1:1, 1:2) fra i lati.
- **Dove intervenire:** in `editor.js`, in `moveDrag` dopo `snap()`. Si raccolgono le scatole degli oggetti entro
  ~15 m (`liveItems()` nella stessa `frameKey`, escluso quello selezionato), si cerca il valore più vicino entro la
  soglia, si corregge `b` e si disegnano le guide in `fx`. Con un dito in più sull'iPad (o un tasto da computer)
  la calamita si sospende.

### Pergolato da rifare (foto `riferimenti/pergolato-1.png` … `pergolato-10.png`, Street View 2015)
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

### Facciata dell'ingresso principale
Il rivestimento attorno al portone (oggi lastre quasi bianche, `rivestimento` in `buildEntrance`) deve essere dello
stesso travertino del resto dell'edificio.

### Commento 2 — corpo sopra il portico e cortile interno (`segnalazioni/4koi46r8db3vpkeooc9c`)
«Un solo rettangolo che collega i due lati dell'edificio; il cortile interno è un rettangolo semplice, senza il
rettangolino in più, ed è largo quanto quello esterno.»
Piano: in `cortile/modello.json` il portico va da u 1.5 a 16.6, mentre le pareti del cortile dell'azoto sono a u 0.2
e 16.6. Il buco del cortile interno viene da `courtyards.json` (CU014, rilevato dall'ortofoto) e lascia il
rettangolino. Va sostituito con un rettangolo nella cornice del cortile, u 0.2 → 16.6 (stessa larghezza del cortile
dell'azoto), da v 13.0 fino al fondo misurato sull'ortofoto. Il corpo sopra il portico va steso su u 0.2 → 16.6,
così diventa un solo blocco fra le due ali. Il buco interno va tolto da `courtyards.json` o messo nei `vuoti`.

### Commento 3 — cancello fra i due cortili (`segnalazioni/mid7pp1ka9564qvf5h3q`)
Il cancello in fondo al portico non è largo quanto tutto il portico: sta dentro una parete. In attesa delle foto
promesse. Piano: `fondo` in `modello.json` con un `varco` [u0, u1] per il cancello a barre e una parete (stessa
facciata) sul resto della larghezza.

### Commento 4 — rotazione (`segnalazioni/wvncis7t2zxs4pi37fwp`)
Fatto: transenna a strisce nel catalogo; «Ruota di 90°» per gli oggetti del catalogo.
Da fare: rotazione anche per parallelepipedi, cilindri e sfere, e un angolo libero per tutti.
- Campo `angolo` (gradi) sulle primitive con `box`.
- In `buildPrimitive` un gruppo-perno al centro della scatola con `rotation.y`.
- Nell'editor una cornice ruotata (`rot:<id>`, un Object3D figlio della cornice base messo al centro della
  scatola), così maniglie e scatola girano con l'oggetto; `apply` riporta il centro nella cornice base.
- In `refreshSel` va aggiornato `sel.frameKey`.
- Nella scheda: tasto «Ruota di 90°» per i solidi e cursore «Rotazione» 0–355°.

### Commento 5 — bordo dei marciapiedi (`segnalazioni/471gbrlr71ggbi0hzmf2`)
Bordo a cornice in blocchi di travertino bianco.
- In `buildSidewalk`: anello del cordolo, cioè il contorno raccordato meno il contorno spostato verso l'interno di
  `cordolo` (≈ 0,2 m, raggi ridotti come per le aiuole), in un travertino bianco nuovo.
- Asfalto solo dentro l'anello.
- Giunti scuri ogni ~0,9 m lungo il contorno (InstancedMesh di listelli sul piano e sulla faccia esterna).
- Le discese restano a filo.

### Texture di facciata per singolo lato (richiesta in chat)
La tendina «Texture della facciata» della scheda edificio cambia tutto l'edificio; deve cambiare solo il lato
toccato, interno o esterno.
- Piano: alla selezione dell'edificio memorizzare la riga di muro toccata (`cellFromHit` → riga intera, come
  «Texture di un muro»).
- La tendina crea le toppe `texture` di `wallPatches` per quella riga.
- Tenere eventualmente un'opzione separata «tutto l'edificio».

### Modifiche nel db non ancora riportate nei file (`modifiche`, stato «da applicare»)
L'editor le applica dal vivo; vanno riportate nei JSON e segnate «applicata»:
- `aggiunta:pmvi5eehk4w` (asfalto) e `aggiunta:pmvi77470sy` (marciapiede ovest con discesa);
  `aggiunta:pmvi579i36b` e `aggiunta:pmvi74yrjm4` sono già `rimosso`;
- 10 alberi `albero:*` spostati o tolti;
- `cortile:tombini.0`, `cortile:transenne.0`;
- `esterni:elementi.6.aiuole.0`, `.aiuole.1`, `.fiori`, `.rastrelliera` (prati e fiori dell'ingresso ingranditi).

Restano «sospese» in attesa di conferma: `cortile:pavimento`, `cortile:portico` e i pezzi
`prim:cortile-modello.0.*`.

### Commenti nella mappa
- Commento 1 segnato «fatta».
- Commenti 2–5 restano aperti finché non sono fatti.
