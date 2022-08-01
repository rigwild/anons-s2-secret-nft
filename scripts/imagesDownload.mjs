#!/usr/bin/env zx
import 'zx/globals'

await $`mkdir -p ${__dirname}/elements-images/source`
await $`mkdir -p ${__dirname}/elements-images/compressed`

let elements = await fs.readJSON(__dirname + '/../_input_elements.json')
elements = elements.filter(e => e.revealed)

for (const element of elements) {
  const imageUrl = element.imageUrl
  const imageName = path.basename(imageUrl)
  const imageDownloadPath = `${__dirname}/elements-images/source/${imageName}`
  if (await fs.pathExists(imageDownloadPath)) {
    console.log(`Skipped ${imageName}, already exists`)
    continue
  }
  await $`curl --silent -o ${imageDownloadPath} ${imageUrl}`
}
