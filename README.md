# Campus Sapienza 3D

Modello 3D web (three.js) del Vecchio Edificio di Chimica (CU014) e degli edifici entro 50 m.

- `index.html` + `campus-3d.js`: pagina e scena
- `cortile/chimica-esterni.json`: terrazza, aree, scale antincendio (coordinate u/v sul lato della sagoma OSM)
- `cortile/modello.json`: cortile dell'azoto liquido
- `tools/`: script di verifica (playwright + Chromium) per render e misure
- `editor.js`: pulsanti **Commenta** e **Modifica** sulla scena 3D. I dati vivono nel db dell'artifact:
  - `segnalazioni`: commenti con punto 3D, lon/lat, coordinate u/v sul lato 0 e nel cortile, oggetto toccato e vista della camera;
    `foto`: id degli asset dell'artifact allegati (JPEG ridotti a 2048 px, si leggono con `/_blob/<id>`);
  - `modifiche`: oggetti cambiati con la scatola di ridimensionamento. Oggetti dei JSON: documento `sorgente:percorso`
    (es. `esterni:elementi.0.prato`) con `valore` e `originale` nei campi del file. Primitive (ogni altro solido):
    documento `prim:<percorso nella scena>`, `sorgente: "primitiva"`, con la scatola `originale` e quella nuova (`valore`)
    in coordinate u/v/h della `cornice` (`esterni:<elemento>`, `cortile` o `lato0`).
    Altri documenti: `albero:<id>` (posizione `p`, raggio `r`, `rimosso`, `nuovo`), `aggiunta:<id>` (primitive con
    `forma`, `materiale`, `box`; marciapiedi e aiuole con `poligono`, `base`, `altezza`, `discese`, `tipo`, `terreno`,
    `cordolo`, `raggio` per tutti gli angoli e `raggi` per angolo; `forma: "oggetto"` è una copia di un oggetto del catalogo
    di `campus-3d.js` con `modello`, `ruota` (0/90/180/270), `scritta` per totem e scritte, stirata nella `box`;
    `cornice` = `cortile` o `esterni:<elemento>` per i duplicati fatti in quelle coordinate), `edificio:<codice>`
    (texture `facciata` e celle `finestre` tolte o aggiunte).
  Nel trascinamento c'è la calamita (allineamenti, misure, spaziature, con le guide colorate; Alt la sospende).
  Claude le legge, le riporta nei file (`cortile/*.json`, `trees.json`, `cortile/facciate.json`) e segna la modifica
  `stato: "applicata"` (la pagina ignora quelle applicate). Gli oggetti eliminati restano nei JSON con `rimosso: true`.

- `cammina.js`: passeggiata in prima persona (tasto **Cammina**): W A S D o frecce, tasti 1–9 per la velocità (4 = passo
  normale), Maiuscolo corre, Spazio salta. Da computer il mouse è catturato e si guarda muovendolo (Esc lo libera, un
  secondo Esc esce); levetta, «Corri» e «Salta» solo su telefono e iPad. Mirino al centro: E (o «Modifica») apre la scheda
  dell'editor e C (o «Commenta») un commento su quello che si mira; la passeggiata va in pausa e riparte chiusa la scheda.
  Collisioni con edifici, esterni, cortile e tronchi; si salgono gradini e cordoli fino a 45 cm.

Anteprima locale: `python3 -m http.server 8765` e apri `index.html?standalone`.
Artifact pubblicato: https://claude.ai/code/artifact/b6b40dff-1e58-4b65-a386-6d4bab8d31ed
