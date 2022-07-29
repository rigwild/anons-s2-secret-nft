export type Element = {
  id: number
  imageUrl: string
  revealed: boolean
  isMinted: boolean

  headItem: string
  body: string
  tattoos: string
  backgrounds: string
  baseLayer: string
  topLayer: string
  eyes: string
  neck: string
  mouth: string
  ears: string
}

export const categories = [
  'headItem',
  'body',
  'tattoos',
  'backgrounds',
  'baseLayer',
  'topLayer',
  'eyes',
  'neck',
  'mouth',
  'ears'
] as const

export type TraitRarity = { count: number; totalPercent: number; score: number }
export type CategoryRarity = { [trait: string]: TraitRarity }
export type ElementRarity = { score: number; rank: number }
export type ElementsRarity = {
  elements: { [id: number]: ElementRarity }
  categories: { [category: string]: CategoryRarity }
  traitsAmountRarity: { [traitsCount: string]: { count: number; percent: number } }
}

export type ElementTraitInfo = TraitRarity & { name: string }
export type ElementWithRarity = Element & {
  rarity: ElementRarity & {
    traits: {
      headItem: ElementTraitInfo
      body: ElementTraitInfo
      tattoos: ElementTraitInfo
      backgrounds: ElementTraitInfo
      baseLayer: ElementTraitInfo
      topLayer: ElementTraitInfo
      eyes: ElementTraitInfo
      neck: ElementTraitInfo
      mouth: ElementTraitInfo
      ears: ElementTraitInfo
    }
  }
}
