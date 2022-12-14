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
await $`pnpm build`
await $`pnpm exportScores`

await $`zx ./scripts/imagesDownload.mjs`
await $`zx ./scripts/imagesSquoosh.mjs`
await $`rm ./vite-project/public/elements-images/*.webp`
await $`cp ./scripts/elements-images/compressed/* vite-project/public/elements-images`

// Update SHA256 hashes
const { stdout: hashes } = await $`sha256sum _*`
let README = (await fs.readFile('README.md', 'utf8')).replace(
  /sha256sum _*[\s\S]*?\`\`\`/,
  `sha256sum _*\n${hashes.trim()}\n\`\`\``
)
await fs.writeFile('README.md', README)
