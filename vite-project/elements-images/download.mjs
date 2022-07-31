#!/usr/bin/env zx
import 'zx/globals'

await $`mkdir -p ${__dirname}/source`
await $`mkdir -p ${__dirname}/compressed`

let elements = await fs.readJSON(__dirname + '/../../_input_elements.json')
elements = elements.filter(e => e.revealed)

for (const element of elements) {
  const imageUrl = element.imageUrl
  const imageName = path.basename(imageUrl)
  const imageDownloadPath = `${__dirname}/source/${imageName}`
  if (await fs.pathExists(imageDownloadPath)) {
    console.log(`Skipped ${imageName}, already exists`)
    continue
  }
  await $`curl --silent -o ${imageDownloadPath} ${imageUrl}`
}
