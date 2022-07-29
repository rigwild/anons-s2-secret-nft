import { fs } from 'zx'

// A small script just to extract all traits for each categories

const elements = await fs.readJSON('_input_elements.json')

// console.log(elements)

const traitsCategories = {
  headItem: new Set(),
  body: new Set(),
  tattoos: new Set(),
  backgrounds: new Set(),
  baseLayer: new Set(),
  topLayer: new Set(),
  eyes: new Set(),
  neck: new Set(),
  mouth: new Set(),
  ears: new Set()
}

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
