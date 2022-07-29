import { argv, fs } from 'zx'
import type { Element, ElementWithRarity, ElementsRarity, CategoryRarity, TraitRarity } from './types'

const getTraits = async (category: string): Promise<string[]> => fs.readJson(`_input_traits_${category}.json`)

const getElements = async (): Promise<Element[]> => fs.readJson('_input_elements.json')

const pad = (n, l = 4) => (n + '').padStart(l, ' ')
const percent = (a, b) => (a / b) * 100
const percentStr = (r, p = 5) => `${pad(r.toFixed(2), p)} %`

const [headItem, body, tattoos, backgrounds, baseLayer, topLayer, eyes, neck, mouth, ears] = await Promise.all([
  getTraits('headItem'),
  getTraits('body'),
  getTraits('tattoos'),
  getTraits('backgrounds'),
  getTraits('baseLayer'),
  getTraits('topLayer'),
  getTraits('eyes'),
  getTraits('neck'),
  getTraits('mouth'),
  getTraits('ears')
])
const traits = {
  headItem,
  body,
  tattoos,
  backgrounds,
  baseLayer,
  topLayer,
  eyes,
  neck,
  mouth,
  ears
}
const traitsCategories = Object.keys(traits)

const elements = await getElements()
// console.log(elements)

// Replace elements null traits with "none"
elements.forEach(element =>
  traitsCategories.forEach(category => {
    if (element[category] === null) element[category] = 'none'
  })
)
// Add "None" traits to categories
traitsCategories.forEach(category => traits[category].push('none'))

const rarity: ElementsRarity = {} as any

// Traits rarity
rarity.categories = Object.entries(traits).reduce<Record<string, CategoryRarity>>((acc, [category, traits]) => {
  const traitsCounts = traits.reduce<Record<string, number>>((tacc, trait) => {
    tacc[trait] = elements.filter(element => element[category] === trait).length
    return tacc
  }, {})

  acc[category] = Object.entries(traitsCounts).reduce<Record<string, TraitRarity>>((tacc, [trait, traitCount]) => {
    tacc[trait] = {
      count: traitCount,
      totalPercent: percent(traitCount, elements.length),
      score: 1 / (traitCount / elements.length)
    }
    return tacc
  }, {})
  return acc
}, {})

// Elements rarity
// Compute scores https://raritytools.medium.com/ranking-rarity-understanding-rarity-calculation-methods-86ceaeb9b98c#2942
const scores = elements.reduce<Record<string, number>>((acc, elements) => {
  acc[elements.id] = traitsCategories.reduce<number>((acc, category) => {
    if (!!elements[category]) return acc + rarity.categories[category][elements[category]].score
    else return acc
  }, 0)
  return acc
}, {})
// Compute rank
rarity.elements = Object.fromEntries(
  Object.entries(scores)
    .sort(([, ascore], [, bscore]) => bscore - ascore)
    .map(([id, score], i) => [id, { score, rank: i + 1 }])
)
// console.log(scores)
// console.log(rarity.elements)

// Traits count rarity (bonus, not counted in scores)
const countTraits = (element: Element) => {
  return traitsCategories.reduce(
    (acc, category) => (!!element[category] && element[category] !== 'none' ? ++acc : acc),
    0
  )
}
rarity.traitsAmountRarity = elements.reduce((acc, element) => {
  const count = countTraits(element)
  if (count in acc) acc[count].count++
  else acc[count] = { count: 1 }
  return acc
}, {})
Object.entries(rarity.traitsAmountRarity).forEach(
  ([amount, { count }]) => (rarity.traitsAmountRarity[amount].percent = percent(count, elements.length))
)
// console.dir(rarity, { depth: null })

// Merge
const elementsWithRarity: ElementWithRarity[] = elements.map(element => {
  const res: ElementWithRarity = { ...element } as any
  res.rarity = {
    ...rarity.elements[element.id],
    traits: {
      headItem: { ...rarity.categories.headItem[element.headItem], name: element.headItem },
      body: { ...rarity.categories.body[element.body], name: element.body },
      tattoos: { ...rarity.categories.tattoos[element.tattoos], name: element.tattoos },
      backgrounds: { ...rarity.categories.backgrounds[element.backgrounds], name: element.backgrounds },
      baseLayer: { ...rarity.categories.baseLayer[element.baseLayer], name: element.baseLayer },
      topLayer: { ...rarity.categories.topLayer[element.topLayer], name: element.topLayer },
      eyes: { ...rarity.categories.eyes[element.eyes], name: element.eyes },
      neck: { ...rarity.categories.neck[element.neck], name: element.neck },
      mouth: { ...rarity.categories.mouth[element.mouth], name: element.mouth },
      ears: { ...rarity.categories.ears[element.ears], name: element.ears }
    }
  }
  return res
})

// Save as files
if (argv.out) {
  await fs.writeJSON('_output_elementsNullTraitsAsNone.json', elements, { spaces: 2 })
  await fs.writeJSON('_output_rarity.json', rarity, { spaces: 2 })
  await fs.writeJSON('_output_elementsWithRarity.json', elementsWithRarity, { spaces: 2 })
}

// Log JSON
if (argv.json) {
  console.log(JSON.stringify(elementsWithRarity, null, 2))
  process.exit(0)
}

console.log(`Total Minted Elements: ${elements.length}`)
console.log()

console.log('Traits rarity:\n')
Object.entries(rarity.categories).forEach(([categoryName, categoryRarity]) => {
  console.log(`${categoryName}`)

  Object.entries(categoryRarity).forEach(([trait, { count, totalPercent }]) =>
    console.log(`  ${pad(count)} of ${elements.length} - ${percentStr(totalPercent)} - ${trait}`)
  )
  console.log()
})

console.log()
console.log('Traits Amount Rarity:')
// console.log(rarity.traitsAmountRarity)
Object.entries(rarity.traitsAmountRarity).forEach(([amount, { count, percent }]) =>
  console.log(`  ${amount} traits: ${pad(count)} of ${elements.length} - ${percentStr(percent)}`)
)

console.log()
console.log()
const logElement = (id, score, rank) =>
  console.log(`  ${pad(id, 4)}: Ranked ${pad(rank)} of ${elements.length} - ` + `score ${pad(score.toFixed(8), 12)}`)
console.log('Elements Rarity Score:')
Object.entries(rarity.elements).forEach(([id, { score, rank }]) => logElement(id, score, rank))

console.log()
console.log()
console.log('Elements Rarity Score (sorted):')
Object.entries(rarity.elements)
  .sort((a, b) => b[1].score - a[1].score)
  .forEach(([id, { score, rank }]) => logElement(id, score, rank))
