#!/usr/bin/env zx

// pnpm i -g @squoosh/cli

await $`mkdir -p ${__dirname}/compressed`

const chunk = (a, n) => [...Array(Math.ceil(a.length / n))].map((_, i) => a.slice(n * i, n + n * i))

const compress = files =>
  $`squoosh-cli --resize '{"enabled":true,"width":500,"height":500,"method":"lanczos3","fitMethod":"stretch","premultiply":true,"linearRGB":true}' --webp '{"quality":90,"target_size":0,"target_PSNR":0,"method":6,"sns_strength":50,"filter_strength":60,"filter_sharpness":0,"filter_type":1,"partitions":0,"segments":4,"pass":1,"show_compressed":0,"preprocessing":0,"autofilter":0,"partition_limit":0,"alpha_compression":1,"alpha_filtering":1,"alpha_quality":100,"lossless":0,"exact":0,"image_hint":0,"emulate_jpeg_size":0,"thread_level":0,"low_memory":0,"near_lossless":100,"use_delta_palette":0,"use_sharp_yuv":0}' -d compressed/ ${files}`

const files = (await fs.readdir(`${__dirname}/source`))
  .filter(file => {
    const outputName = `${file.split('.').slice(0, -1).join('.')}.webp`
    if (fs.pathExistsSync(`${__dirname}/compressed/${outputName}`)) {
      console.log(`Skipped ${file}, output ${outputName} already exists`)
      return false
    }
    return true
  })
  .map(file => `${__dirname}/source/${file}`)

// Compress 10 by 10, if too much file in one go, will crash out of memory
const filesChunks = chunk(files, 10)
for (const filesChunk of filesChunks) {
  await compress(filesChunk)
}
