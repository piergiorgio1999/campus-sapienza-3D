# Campus Sapienza 3D

Modello 3D web (three.js) del Vecchio Edificio di Chimica (CU014) e degli edifici entro 50 m.

- `index.html` + `campus-3d.js`: pagina e scena
- `cortile/chimica-esterni.json`: terrazza, aree, scale antincendio (coordinate u/v sul lato della sagoma OSM)
- `cortile/modello.json`: cortile dell'azoto liquido
- `tools/`: script di verifica (playwright + Chromium) per render e misure

Anteprima locale: `python3 -m http.server 8765` e apri `index.html?standalone`.
Artifact pubblicato: https://claude.ai/code/artifact/b6b40dff-1e58-4b65-a386-6d4bab8d31ed
