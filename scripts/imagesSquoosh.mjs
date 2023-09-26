#!/usr/bin/env zx

import 'zx/globals'

await $`export NODE_OPTIONS='--no-experimental-fetch'`

// pnpm i -g @squoosh/cli

await $`mkdir -p ${__dirname}/elements-images/compressed`

const chunk = (a, n) => [...Array(Math.ceil(a.length / n))].map((_, i) => a.slice(n * i, n + n * i))

const compress = files =>
  $`squoosh-cli --resize '{"enabled":true,"width":560,"height":560,"method":"lanczos3","fitMethod":"stretch","premultiply":true,"linearRGB":true}' --webp '{"quality":90,"target_size":0,"target_PSNR":0,"method":6,"sns_strength":50,"filter_strength":60,"filter_sharpness":0,"filter_type":1,"partitions":0,"segments":4,"pass":1,"show_compressed":0,"preprocessing":0,"autofilter":0,"partition_limit":0,"alpha_compression":1,"alpha_filtering":1,"alpha_quality":100,"lossless":0,"exact":0,"image_hint":0,"emulate_jpeg_size":0,"thread_level":0,"low_memory":0,"near_lossless":100,"use_delta_palette":0,"use_sharp_yuv":0}' -d ${__dirname}/elements-images/compressed/ ${files}`

let skippedCount = 0
const files = (await fs.readdir(`${__dirname}/elements-images/source`))
  .filter(file => {
    const outputName = `${file.split('.').slice(0, -1).join('.')}.webp`
    if (fs.pathExistsSync(`${__dirname}/elements-images/compressed/${outputName}`)) {
      skippedCount++
      return false
    }
    return true
  })
  .map(file => `${__dirname}/elements-images/source/${file}`)

console.log(`Skipped ${skippedCount} images that we already have the compressed version of.`)

// Compress 7 by 7, if too much file in one go, will crash out of memory
const filesChunks = chunk(files, 7)
for (const filesChunk of filesChunks) {
  await compress(filesChunk)
}
