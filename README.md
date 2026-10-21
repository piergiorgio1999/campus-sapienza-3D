# Campus Sapienza 3D

Modello 3D web (three.js) del Vecchio Edificio di Chimica (CU014) e degli edifici entro 50 m.

- `index.html` + `campus-3d.js`: pagina e scena
- `cortile/chimica-esterni.json`: terrazza, aree, scale antincendio, due pergolati (elementi `pergolato`: u, v, altezza, passo, copertura 0..1 = quanto fogliame, fogliame_da = quota in m sotto cui i fianchi sono quasi spogli; solo la galleria con la vite), lampioni verdi (elementi `lampione`: u, v, altezza) (coordinate u/v sul lato della sagoma OSM)
- `cortile/modello.json`: cortile dell'azoto liquido (`portico.piani` = piani del corpo sopra il portico oltre il piano terra, 1 = solo il primo piano, con un solo tetto piano liscio senza attico; `portico.corpoU` = impronta del ponte; `vuoti` = un unico rettangolo u 0.2→16.6 per i due cortili, azoto e interno, nel quale resta solo il ponte; il cortile interno non è più in `courtyards.json`)
- `cu014-solido.json`: solido di CU014 ricavato da `riferimenti/cu014-vettoriale.stl` (il file STL non viene caricato dalla pagina). Contiene
  `altezzaBase` (19 m) e `ali`: rettangoli `[u0, v0, u1, v1]` nelle coordinate del lato 0 con la quota del loro tetto (in m sopra il terreno;
  l'ultima ala della lista vince dove si sovrappongono), usati da `cuSolidoParts` in `campus-3d.js` per estrudere la sagoma OSM
  (meno i cortili di `courtyards.json` e i vuoti/pieni del cortile) ala per ala, con le stesse texture di facciata (i piani del corpo
  si adattano alla quota, interpiano ≈ 3,95 m); `fondi`: cortili con il pavimento in quota (il cortile nord è a 6 m, `addCuFondi` mette la soletta);
  `stl`: trasformazione scala/rotazione/traslazione dall'STL ai metri del lato 0 e piano del terreno. Senza il file la pagina torna alla sagoma intera
  a 21 m. Da dove vengono le misure: l'STL è una mesh binaria di 103 594 triangoli a scala arbitraria (z in alto, 1 unità ≈ 86,2 m, 4,6 MB):
  scala, rotazione (178,07°) e traslazione sono state trovate sovrapponendo i muri verticali dell'STL ai lati della sagoma OSM (correlazione 2D,
  poi affinamento a passo fine; l'impronta coincide con quella OSM entro circa 1 m, quindi la sagoma non cambia); sui punti fuori sagoma
  si è interpolato il terreno (inclinato di 2,4°: difetto della scansione, tolto), e le quote dei tetti sono la mediana alta (80°
  percentile) delle facce rivolte in su dentro ogni rettangolo. `python3 -I tools/cu014_stl.py` rifà le misure e le confronta con il JSON.
- `tools/`: script di verifica (playwright + Chromium) per render e misure
- `editor.js`: pulsanti **Commenta** e **Modifica** sulla scena 3D. Il tasto **🌳 Alberi** (sempre visibile, stato ricordato nel browser) nasconde o mostra tutti gli alberi (OSM, magnolie, palme, pini, quelli del catalogo): in `campus-3d.js` sono marcati `userData.albero` e `window.campus3d.alberiVisibili(on)` li gestisce, anche dopo le ricostruzioni. I dati vivono nel db dell'artifact:
  - `segnalazioni`: commenti con punto 3D, lon/lat, coordinate u/v sul lato 0 e nel cortile, oggetto toccato e vista della camera;
    `foto`: id degli asset dell'artifact allegati (JPEG ridotti a 2048 px, si leggono con `/_blob/<id>`);
  - `modifiche`: oggetti cambiati con la scatola di ridimensionamento. Oggetti dei JSON: documento `sorgente:percorso`
    (es. `esterni:elementi.0.prato`) con `valore` e `originale` nei campi del file. Primitive (ogni altro solido):
    documento `prim:<percorso nella scena>`, `sorgente: "primitiva"`, con la scatola `originale` e quella nuova (`valore`)
    in coordinate u/v/h della `cornice` (`esterni:<elemento>`, `cortile` o `lato0`).
    Con `rimosso: true` il pezzo è eliminato (mesh invisibile, istanza di un InstancedMesh scalata a zero; fuori da clic e collisioni della passeggiata): `valore` è la scatola al momento dell'eliminazione, `originale` serve a riconoscere il pezzo; «Annulla»/«Ripristina originale» cancellano il documento.
    Altri documenti: `albero:<id>` (posizione `p`, raggio `r`, `rimosso`, `nuovo`), `aggiunta:<id>` (primitive con
    `forma`, `materiale`, `box`, `angolo` in gradi (positivo = antiorario visto dall'alto, ruota il solido o l'oggetto attorno
    al centro della `box`, che nel file resta dritta); marciapiedi e aiuole con `poligono`, `base`, `altezza`, `discese` (marciapiedi: `[{lato, t, larghezza, profondita}]`, rampa interna al marciapiede: `profondita` è la lunghezza della rampa misurata dal bordo esterno verso l'interno, dove il piano scende fino alla quota della strada a filo del bordo; piano e cordolo vi sono ritagliati), `tipo`, `terreno`,
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
