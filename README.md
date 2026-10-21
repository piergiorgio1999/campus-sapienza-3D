# Campus Sapienza 3D

Modello 3D web (three.js) del Vecchio Edificio di Chimica (CU014) e degli edifici entro 50 m.

- `index.html` + `campus-3d.js`: pagina e scena
- `cortile/chimica-esterni.json`: terrazza, aree, scale antincendio, pergolato (u, v, altezza, passo, copertura 0..1 = quanto fogliame, fogliame_da = quota in m sotto cui i fianchi sono quasi spogli, prato, ringhiera, aiuole, lampioni) (coordinate u/v sul lato della sagoma OSM)
- `cortile/modello.json`: cortile dell'azoto liquido (`portico.piani` = piani del corpo sopra il portico oltre il piano terra, 1 = solo il primo piano, con un solo tetto piano liscio senza attico; `portico.corpoU` = impronta del ponte; `vuoti` = un unico rettangolo u 0.2→16.6 per i due cortili, azoto e interno, nel quale resta solo il ponte; il cortile interno non è più in `courtyards.json`)
- `tools/`: script di verifica (playwright + Chromium) per render e misure
- `editor.js`: pulsanti **Commenta** e **Modifica** sulla scena 3D. Il tasto **🌳 Alberi** (sempre visibile, stato ricordato nel browser) nasconde o mostra tutti gli alberi (OSM, magnolie, palme, pini, quelli del catalogo): in `campus-3d.js` sono marcati `userData.albero` e `window.campus3d.alberiVisibili(on)` li gestisce, anche dopo le ricostruzioni. I dati vivono nel db dell'artifact:
  - `segnalazioni`: commenti con punto 3D, lon/lat, coordinate u/v sul lato 0 e nel cortile, oggetto toccato e vista della camera;
    `foto`: id degli asset dell'artifact allegati (JPEG ridotti a 2048 px, si leggono con `/_blob/<id>`);
  - `modifiche`: oggetti cambiati con la scatola di ridimensionamento. Oggetti dei JSON: documento `sorgente:percorso`
    (es. `esterni:elementi.0.prato`) con `valore` e `originale` nei campi del file. Primitive (ogni altro solido):
    documento `prim:<percorso nella scena>`, `sorgente: "primitiva"`, con la scatola `originale` e quella nuova (`valore`)
    in coordinate u/v/h della `cornice` (`esterni:<elemento>`, `cortile` o `lato0`).
    Altri documenti: `albero:<id>` (posizione `p`, raggio `r`, `rimosso`, `nuovo`), `aggiunta:<id>` (primitive con
    `forma`, `materiale`, `box`, `angolo` in gradi (positivo = antiorario visto dall'alto, ruota il solido o l'oggetto attorno
    al centro della `box`, che nel file resta dritta); marciapiedi e aiuole con `poligono`, `base`, `altezza`, `discese`, `tipo`, `terreno`,
    `cordolo` (aiuole: spessore del cordolo; marciapiedi: spessore del bordo a cornice in travertino bianco, default 0,2 m, 0 = senza bordo), `raggio` per tutti gli angoli e `raggi` per angolo; `forma: "oggetto"` è una copia di un oggetto del catalogo
    di `campus-3d.js` con `modello`, `ruota` (0/90/180/270), `scritta` per totem e scritte, stirata nella `box`;
    `cornice` = `cortile` o `esterni:<elemento>` per i duplicati fatti in quelle coordinate), `edificio:<codice>`
    (texture `facciata` e celle `finestre` tolte o aggiunte; la texture di un solo lato è una toppa `tipo: "texture"` in `finestre`, come «Texture di un muro»).
  Nel trascinamento c'è la calamita (allineamenti, misure, spaziature, con le guide colorate; Alt la sospende).
  Selettore **⤡ Sposta / ⟳ Ruota** in cima alla scheda (e tasto flottante «⟳ Ruota» accanto a «▤ Scheda» quando la scheda è
  nascosta; scorciatoia **R**, non mentre si scrive in un campo). In «Ruota» le maniglie della scatola lasciano il posto a un
  anello orizzontale con una maniglia: trascinandola (o l'anello) l'oggetto gira attorno al centro della scatola, passo 5°,
  aggancio magnetico a 0/90/180/270° e agli angoli dei solidi vicini già ruotati (soglia 4°; Alt o un secondo dito lo sospendono),
  angolo mostrato nel suggerimento in alto; al rilascio salva il campo `angolo` come il cursore «Rotazione». Vale per i solidi
  e gli oggetti del catalogo; per totem e panchine «Ruota» alterna `orienta` u/v (ora salvato nei campi); per gli altri
  oggetti dei JSON il tasto è spento con un suggerimento.
  Claude le legge, le riporta nei file (`cortile/*.json`, `trees.json`, `cortile/facciate.json`) e segna la modifica
  `stato: "applicata"` (la pagina ignora quelle applicate). Gli oggetti eliminati restano nei JSON con `rimosso: true`.

- `cammina.js`: passeggiata in prima persona (tasto **Cammina**): W A S D o frecce, tasti 1–9 per la velocità (4 = passo
  normale), Maiuscolo corre, Spazio salta. Da computer il mouse è catturato e si guarda muovendolo (Esc lo libera, un
  secondo Esc esce); levetta, «Corri» e «Salta» solo su telefono e iPad. Mirino al centro: E (o «Modifica») apre la scheda
  dell'editor e C (o «Commenta») un commento su quello che si mira; la passeggiata va in pausa e riparte chiusa la scheda.
  Collisioni con edifici, esterni, cortile e tronchi; si salgono gradini e cordoli fino a 45 cm.

- Magnolie del cortile: modello 3D in `models/magnolia.json` + `models/magnolia_<a|b>_<chioma|tronco>.wasm` (chiome ampie dell'artifact della scansione; `altezza` e `raggio` scalano rispetto ai valori di riferimento del JSON), texture in `tex/magnolia-*`.
  La stagione delle foglie segue la data (ora di Roma: primavera mar–mag, estate (foglie verdi) giu–15 nov, autunno
  (foglie marroni) 16 nov–31 dic, inverno gen–feb); si forza con `?stagione=autunno` nell'URL, con `magnolie[k].stagione` o con `stagione` in `cortile/modello.json`
  (`"auto"` = dalla data).

Anteprima locale: `python3 -m http.server 8765` e apri `index.html?standalone`.
Artifact pubblicato: https://claude.ai/code/artifact/b6b40dff-1e58-4b65-a386-6d4bab8d31ed
