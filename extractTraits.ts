import { fs } from 'zx'
import { categories } from './types.js'

// A small script just to extract all traits for each categories

const elements = await fs.readJSON('_input_elements.json')

// console.log(elements)

const traitsCategories = Object.fromEntries(categories.map(x => [x, new Set()]))

for (const [category, set] of Object.entries(traitsCategories)) {
  elements.forEach(element => {
    // ignore `null`
    if (element[category]) set.add(element[category])
  })

  // Export to input files
  const data = [...set].sort()
  await fs.writeJSON(`_input_traits_${category}.json`, data, { spaces: 2 })
  console.log(data)
}
