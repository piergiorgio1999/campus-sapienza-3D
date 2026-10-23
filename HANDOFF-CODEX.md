# Handoff per Codex (o altra sessione) — 23/10/2026

Questo branch (`claude/new-session-zh34qp`) contiene **tutti i file pubblicati** nell'artifact
https://claude.ai/artifact/PZYAKsXBaJDsedVB6XZ2hz (versione 65): stessi byte, `index.html` compreso
(l'artifact lo serve dentro uno scheletro HTML minimo; il contenuto è questo).

Per partire leggere, in ordine: `AGENTS.md`, `README.md`, la fine di `DA_FARE.md` (sezioni datate 22–23/10).

## Cosa NON sta nei file: il database dell'artifact
L'editor nella pagina salva le modifiche dell'utente nel db dell'artifact (collezione `modifiche`) e i commenti in `segnalazioni`.
Copia del 23/10 in `db-snapshot/` (un JSON per documento; nel nome `__` sostituisce `:`).
- `modifiche` con `stato: "da applicare"` (17 documenti) **sono visibili nell'artifact ma non ancora nei file**: chi lavora sui
  file deve riportarle (campo `valore`, chiave `sorgente:percorso`; `sorgente` = `aggiunta` → `cortile/chimica-esterni.json → primitive`,
  `esterni` → `cortile/chimica-esterni.json → elementi`, `cortile` → `cortile/modello.json`, `albero` → `trees.json`,
  `edificio` → `cortile/facciate.json`, `prim:` → deformazioni di pezzi del modello, vedi `editor.js`).
  In particolare l'utente stava ancora modificando il retro della Ginestra (gin-ovest-pianerottolo, -cancello, pmvk7o45ss9, gin-pilone-2 eliminato).
- `segnalazioni` con `stato` diverso da `fatta` sono i commenti aperti (puntine numerate nell'ordine di `creato`).
Codex non può scrivere nel db: annotare in `DA_FARE.md` quali documenti ha riportato, così la prossima sessione Claude li segna «applicata».

## Regole dell'utente
Rispondere in italiano; niente test o render locali; pubblicare quando lo chiede; non fermarsi a chiedere. Sullo stesso branch
lavorano più sessioni: `git fetch` e rebase prima di ogni push.
