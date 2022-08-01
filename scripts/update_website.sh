#!/bin/bash

# cd to the directory of this script
cd "$(dirname "$0")"
# then to project root
cd ..

rm _input_*
rm _output_*
# API endpoint containing your full collection data
curl https://rest-api.anons.army/api/anons/s2 | jq > _input_elements.json
pnpm build
pnpm extractTraits
pnpm exportScores

zx ./scripts/imagesDownload.mjs
zx ./scripts/imagesSquoosh.mjs
rm ./vite-project/public/elements-images/*.webp
cp ./scripts/elements-images/compressed/* vite-project/public/elements-images
