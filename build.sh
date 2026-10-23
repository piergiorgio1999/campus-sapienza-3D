#!/bin/sh
# Build statico per Cloudflare Pages: copia in dist/ solo i file che servono alla mappa.
# Cloudflare: Build command = sh build.sh · Build output directory = dist
set -e
rm -rf dist && mkdir dist
cp index.html *.js *.json *.geojson *.png *.jpg dist/
cp -r cortile models tex vendor scan dist/
# fuori dal sito: riferimenti/, db-snapshot/, tools/, documenti .md
echo "dist pronto: $(du -sh dist | cut -f1)"
