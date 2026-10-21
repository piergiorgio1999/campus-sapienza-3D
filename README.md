# Campus Sapienza 3D

Modello 3D web (three.js) del Vecchio Edificio di Chimica (CU014) e degli edifici entro 50 m.

- `index.html` + `campus-3d.js`: pagina e scena
- `cortile/chimica-esterni.json`: terrazza, aree, scale antincendio (coordinate u/v sul lato della sagoma OSM)
- `cortile/modello.json`: cortile dell'azoto liquido
- `tools/`: script di verifica (playwright + Chromium) per render e misure
- `editor.js`: pulsanti **Commenta** e **Modifica** sulla scena 3D. I dati vivono nel db dell'artifact:
  - `segnalazioni`: commenti con punto 3D, lon/lat, coordinate u/v sul lato 0 e nel cortile, oggetto toccato e vista della camera;
  - `modifiche`: oggetti cambiati con la scatola di ridimensionamento. Oggetti dei JSON: documento `sorgente:percorso`
    (es. `esterni:elementi.0.prato`) con `valore` e `originale` nei campi del file. Primitive (ogni altro solido):
    documento `prim:<percorso nella scena>`, `sorgente: "primitiva"`, con la scatola `originale` e quella nuova (`valore`)
    in coordinate u/v/h della `cornice` (`esterni:<elemento>`, `cortile` o `lato0`).
    Altri documenti: `albero:<id>` (posizione `p`, raggio `r`, `rimosso`, `nuovo`), `aggiunta:<id>` (primitive con
    `forma`, `materiale`, `box`), `edificio:<codice>` (texture `facciata` e celle `finestre` tolte o aggiunte).
  Claude le legge, le riporta nei file (`cortile/*.json`, `trees.json`, `cortile/facciate.json`) e segna la modifica
  `stato: "applicata"` (la pagina ignora quelle applicate). Gli oggetti eliminati restano nei JSON con `rimosso: true`.

Anteprima locale: `python3 -m http.server 8765` e apri `index.html?standalone`.
Artifact pubblicato: https://claude.ai/code/artifact/b6b40dff-1e58-4b65-a386-6d4bab8d31ed
