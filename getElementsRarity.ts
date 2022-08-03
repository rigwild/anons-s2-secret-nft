import { argv, fs } from 'zx'
import { categories as traitsCategories } from './types.js'
import type { Element, ElementWithRarity, ElementRarity, ElementsRarity, CategoryRarity, TraitRarity } from './types.js'

const pad = (n: number | string, length = 4) => (n + '').padStart(length, ' ')
const percent = (a: number, b: number) => (a / b) * 100
const percentStr = (data: number, paddingLength = 5) => `${pad(data.toFixed(2), paddingLength)} %`

const elements: Element[] = (await fs.readJson('_input_elements.json')).map((element: Element) => {
  traitsCategories.forEach(category => {
    // Replace traits null or named "No" by "None"
    if (element[category] === null || element[category] === 'No') {
      element[category] = 'None'
    }
  })
  return element
})

// Extract all traits for each categories
const traits: { [category: string]: Array<string | number> } = {}
traitsCategories.forEach(category => {
  const traitsSet = new Set<string>()
  elements.forEach(element => {
    if (element[category]) traitsSet.add(element[category])
  })
  const data = [...traitsSet].sort()
  traits[category] = data
})

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

// Traits count rarity
const countTraits = (element: Element): number | null => {
  return traitsCategories.reduce(
    (acc, category) => (!!element[category] && element[category] !== 'None' ? ++acc : acc),
    0
  )
}
rarity.traitsCountRarity = elements.reduce((acc, element) => {
  const count = countTraits(element)
  if (!(count in acc)) acc[count] = { count: 0 }
  acc[count].count++
  return acc
}, {})
Object.entries(rarity.traitsCountRarity).forEach(([tcount, { count }]) => {
  rarity.traitsCountRarity[tcount].totalPercent = percent(count, elements.length)
  rarity.traitsCountRarity[tcount].score = 1 / (count / elements.length)
})
// console.dir(rarity, { depth: null })

// Elements rarity
// Compute scores
// Add up (+) all traits score  for each element
const elementsRarity = elements.reduce<Record<string, Omit<ElementRarity, 'rank' | 'rankWithoutTraitsCount'>>>(
  (acc, element) => {
    const elementRarity = traitsCategories.reduce(
      (tacc, tcategory) => {
        if (!!element[tcategory]) {
          tacc.score += rarity.categories[tcategory][element[tcategory]].score
          tacc.scoreWithoutTraitsCount += rarity.categories[tcategory][element[tcategory]].score
        }
        if (!!element[tcategory] && element[tcategory] !== 'None') tacc.traitsCount++
        return tacc
      },
      { score: 0, scoreWithoutTraitsCount: 0, traitsCount: 0 }
    )
    acc[element.id] = elementRarity
    return acc
  },
  {}
)
// Add count of trait rarity score for each element
Object.values(elementsRarity).forEach(elementRarity => {
  elementRarity.score += rarity.traitsCountRarity[elementRarity.traitsCount].score
})

// Compute ranks
rarity.elements = elementsRarity as any
// Compute ranks with traits count score
Object.entries(elementsRarity)
  .sort(([, a], [, b]) => b.score - a.score)
  .forEach(([id, elementRarity], i) => (rarity.elements[id].rank = i + 1))
// Compute ranks without traits count score
Object.entries(elementsRarity)
  .sort(([, a], [, b]) => b.scoreWithoutTraitsCount - a.scoreWithoutTraitsCount)
  .forEach(([id, elementRarity], i) => (rarity.elements[id].rankWithoutTraitsCount = i + 1))
// console.log(rarity.elements)

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
      "scoreWithoutTraitsCount": 82.32549644085665,
      "traitsCount": 6,
      "rank": 232,
      "rankWithoutTraitsCount": 232,
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

console.log(`List of Traits:`)
Object.entries(traits).forEach(([category, traits]) => {
  console.log(`  ${category}: ${traits.join(', ')}`)
})
console.log()
console.log(`Total Minted Elements: ${elements.length}`)
console.log()

console.log('Traits Rarity:')
Object.entries(rarity.categories).forEach(([categoryName, categoryRarity]) => {
  console.log(`  ${categoryName}`)

  Object.entries(categoryRarity).forEach(([trait, { count, totalPercent, score }]) =>
    console.log(
      `    ${pad(count)} of ${elements.length} - ` +
        `${percentStr(totalPercent)} - ` +
        `score ${pad(score.toFixed(8), 12)} ${trait}`
    )
  )
  console.log()
})

console.log()
console.log('Traits count Rarity:')
// console.log(rarity.traitsCountRarity)
Object.entries(rarity.traitsCountRarity).forEach(([tcount, { count, totalPercent, score }]) =>
  console.log(
    `  ${pad(count)} of ${elements.length} - ` +
      `${percentStr(totalPercent)} - ` +
      `score ${pad(score.toFixed(8), 12)} - ` +
      `${pad(tcount, 2)} traits`
  )
)

console.log()
console.log()
const logElement = (id: string, score: number, rank: number) =>
  console.log(`  ${pad(id, 4)}: Ranked ${pad(rank)} of ${elements.length} - ` + `score ${pad(score.toFixed(8), 12)}`)

console.log('Elements Rarity Score:')
Object.entries(rarity.elements).forEach(([id, { score, rank }]) => logElement(id, score, rank))

console.log()
console.log()
console.log('Elements Rarity Score (sorted):')
Object.entries(rarity.elements)
  .sort((a, b) => b[1].score - a[1].score)
  .forEach(([id, { score, rank }]) => logElement(id, score, rank))

console.log()
console.log()
console.log('Elements Rarity Score without traits count score:')
Object.entries(rarity.elements).forEach(([id, { scoreWithoutTraitsCount, rankWithoutTraitsCount }]) =>
  logElement(id, scoreWithoutTraitsCount, rankWithoutTraitsCount)
)

console.log()
console.log()
console.log('Elements Rarity Score without traits count score(sorted):')
Object.entries(rarity.elements)
  .sort((a, b) => b[1].score - a[1].score)
  .forEach(([id, { scoreWithoutTraitsCount, rankWithoutTraitsCount }]) =>
    logElement(id, scoreWithoutTraitsCount, rankWithoutTraitsCount)
  )
