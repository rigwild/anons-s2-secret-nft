import { argv, fs } from 'zx'
import { categories as traitsCategories } from './types.js'
import type { Element, ElementWithRarity, ElementsRarity, CategoryRarity, TraitRarity } from './types.js'

const pad = (n: number | string, length = 4) => (n + '').padStart(length, ' ')
const percent = (a: number, b: number) => (a / b) * 100
const percentStr = (data: number, paddingLength = 5) => `${pad(data.toFixed(2), paddingLength)} %`

const traits = Object.fromEntries(
  await Promise.all(
    traitsCategories.map(async category => {
      return [category, await fs.readJson(`_input_traits_${category}.json`)] as [string, string[]]
    })
  )
)
const elements: Element[] = await fs.readJson('_input_elements.json')

// Replace elements null traits with "None"
const traitsCategoriesWithNullTraits = new Set<string>()
elements.forEach(element =>
  traitsCategories.forEach(category => {
    if (element[category] === null) {
      traitsCategoriesWithNullTraits.add(category)
      element[category] = 'None'
    }
  })
)
// Add "None" traits to categories that includes null traits
traitsCategoriesWithNullTraits.forEach(category => traits[category].push('None'))

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

// Elements rarity, add up all traits score for each element
// Compute scores https://raritytools.medium.com/ranking-rarity-understanding-rarity-calculation-methods-86ceaeb9b98c#2942
const elementsRarity = elements.reduce<Record<string, { score: number; traitsCount: 0 }>>((acc, element) => {
  acc[element.id] = traitsCategories.reduce(
    (acc, category) => {
      if (!!element[category]) acc.score += rarity.categories[category][element[category]].score
      if (!!element[category] && element[category] !== 'None') acc.traitsCount++
      return acc
    },
    { score: 0, traitsCount: 0 }
  )
  return acc
}, {})

// Compute ranks
rarity.elements = Object.fromEntries(
  Object.entries(elementsRarity)
    .sort(([, a], [, b]) => b.score - a.score)
    .map(([id, elementRarity], i) => [id, { ...elementRarity, rank: i + 1 }])
)
// console.log(scores)
// console.log(rarity.elements)

// Traits count rarity (bonus, not counted in scores)
const countTraits = (element: Element) => {
  return traitsCategories.reduce(
    (acc, category) => (!!element[category] && element[category] !== 'None' ? ++acc : acc),
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

// Merge each element traits, rarity rank + score and traits rarity into one object
/*
[
  {
    "id": 1,
    "headItem": "Helmet",
    "body": "Brown",
    "tattoos": "No",
    "backgrounds": "Season1",
    "baseLayer": "Crew",
    "topLayer": "Tactical",
    "eyes": "None",
    "neck": "None",
    "mouth": "None",
    "ears": "None",
    "imageUrl": "https://images.anons.army/img/0004_Custom.jpg",
    "revealed": 1,
    "isMinted": 1,
    "arweaveImageUrl": "https://arweave.net/Q8WrMqVjDp4vy1KvPeAiBdS4OX8BPTxP6blhEcvePII",
    "rarity": {
      "score": 82.32549644085665,
      "traitsCount": 6,
      "rank": 232,
      "traits": {
        "headItem": {
          "count": 40,
          "totalPercent": 2.2988505747126435,
          "score": 43.5,
          "name": "Helmet"
        },
        [...]
      }
    }
  },
  [...]
]
*/
const elementsWithRarity: ElementWithRarity[] = elements.map(element => ({
  ...element,
  rarity: {
    ...rarity.elements[element.id],
    traits: {
      ...(Object.fromEntries(
        traitsCategories.map(category => [
          category,
          {
            ...rarity.categories[category][element[category]],
            name: element[category]
          }
        ])
      ) as any)
    }
  }
}))

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
  console.log(`  ${pad(amount, 2)} traits: ${pad(count)} of ${elements.length} - ${percentStr(percent)}`)
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
