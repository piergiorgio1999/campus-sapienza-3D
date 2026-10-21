# Da fare (lavoro fermato il 21/10/2026 su richiesta)

Stato pubblicato: artifact versione 32, commit `29b21e2` sul branch `claude/new-session-zh34qp`.

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
