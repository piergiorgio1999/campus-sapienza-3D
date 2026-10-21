# Handoff — lavori terminati il 21/10/2026 su richiesta dell'utente

- **Pubblicato:** artifact https://claude.ai/code/artifact/b6b40dff-1e58-4b65-a386-6d4bab8d31ed, versione 32
  (capacità `db`, `user`, `assets`).
- **Codice:** branch `claude/new-session-zh34qp`; la v32 corrisponde al commit `29b21e2`.
- **Da riprendere per primo:** il totem nuovo (sotto). È già scritto ma non applicato né pubblicato: è in
  `handoff/totem-nuovo.patch`, da applicare con `git apply handoff/totem-nuovo.patch` (tocca `addTotem` in
  `campus-3d.js` e la scatola del totem in `editor.js`). L'ho provato solo in un render locale: aspetto giusto,
  cartelli leggibili. Va pubblicato e poi segnata «fatta» la nota del totem.
- **Prove:** server locale `python3 -m http.server 8765` in questa cartella, pagina `index.html?standalone`, Chromium
  headless (playwright, swiftshader).
  - Gli script di prova usati in sessione non sono nel repo; servono tre controlli:
    - render prima/dopo identici per le viste del cortile, dell'ingresso, della terrazza e della scala;
    - prove dell'editor con un `window.claude` finto (db, user, assets);
    - prove di `cammina.js` con `campus3dCammina.prova(secondi, tasti)`.

### Totem CU014 (indicazioni dell'utente, 21/10/2026)
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
    `riferimenti/logo-museo-m.jpg` così com'è (come il logo Nippon Gases sul silos, disegnata nella texture del
    cartello). La patch `handoff/totem-nuovo.patch` disegna ancora una «m» di testo: va sostituita con l'immagine.
- **Cartello 3:** mappa della città universitaria con l'edificio evidenziato. L'utente la sta ricostruendo in vettoriale
  e la manda lui: usare quella così com'è nella texture del cartello in basso. La mappa disegnata dalla patch con le
  sagome degli edifici è solo provvisoria.
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

### Totem CU014 vero (foto `riferimenti/totem-cu014.jpg`, 21/10/2026)
Il totem attuale (base e fascia rosse, corpo bianco) va rifatto come nella foto:
- **Pannello:** alto e stretto (circa 0,8 m × 2,7 m, spessore circa 12 cm), in lamiera rosso Sapienza scuro, forata
  a micro-fori, con cornice piena dello stesso rosso.
- **Targa con il codice:** in alto, bianca, quasi larga quanto il pannello, con «**CU**014» («CU» in grassetto, «014»
  normale, grigio scuro).
- **Targa del nome:** sotto, bianca, con:
  - «Edificio di Chimica Stanislao Cannizzaro»;
  - «Facoltà di Scienze matematiche, fisiche e naturali · Dipartimento di Chimica · Aula Aldo La Ginestra»;
  - «Polo museale Sapienza · Museo di Chimica Primo Levi», con i loghi (sigillo Sapienza e «m» del museo).
  - Senza gli adesivi.
- **Mappa:** piccola targa bianca «Sei qui» più in basso, spostata a destra.
- **Base:** in basso il pannello è aperto (telaio rosso con un vano) e davanti c'è un cubo di travertino di circa
  40 cm con un piccolo riquadro rosso; tutto poggia su una pedana rossa a terra.
- **Posizione:** sul prato accanto al percorso tattile e al cordolo in travertino.
- **Da verificare:** l'orientamento. Nella foto le targhe guardano chi arriva lungo il vialetto, mentre il totem
  attuale ha il lato lungo parallelo al vialetto (indicazione del 21/10).

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
