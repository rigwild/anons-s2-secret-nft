#!/usr/bin/env zx

import 'zx/globals'

cd(`${__dirname}/..`)

await $`rm _input_*`.catch(() => {})
await $`rm _output_*`.catch(() => {})

// Update data
const data = await fetch(process.env.ELEMENTS_API_URI || 'https://rest-api.anons.army/api/anons/s2').then(res =>
  res.json()
)
await fs.writeFile('_input_elements.json', JSON.stringify(data, null, 2))
await $`pnpm extractTraits`
await $`pnpm exportScores`

await $`zx ./scripts/imagesDownload.mjs`
await $`zx ./scripts/imagesSquoosh.mjs`
await $`rm ./vite-project/public/elements-images/*.webp`
await $`cp ./scripts/elements-images/compressed/* vite-project/public/elements-images`
