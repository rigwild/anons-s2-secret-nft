#!/bin/bash

rm _input_*
rm _output_*
curl https://rest-api.anons.army/api/anons/s2 | jq > _input_elements.json
pnpm build
pnpm extractTraits
pnpm exportScores

zx vite-project/elements-images/download.mjs
zx vite-project/elements-images/squoosh.mjs
rm vite-project/public/elements-images/*.webp
cp vite-project/elements-images/compressed/* vite-project/public/elements-images
