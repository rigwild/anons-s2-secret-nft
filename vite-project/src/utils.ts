import { useBreakpoints } from '@vueuse/core'
import type { Element, ElementsRarity } from '../../types'

export let elementsFixed: Element[]
export let rarity: ElementsRarity

export const loadElementsData = async () => {
  // @ts-ignore
  const API_URI = import.meta.env.VITE_API_URI
  if (API_URI) {
    console.log('Loading elements data from API', API_URI)
    const data = await fetch(API_URI).then(res => res.json())
    elementsFixed = data._output_elementsNullTraitsAsNone
    rarity = data._output_rarity
  } else {
    elementsFixed = (await import('../../_output_elementsNullTraitsAsNone.json')).default as any
    rarity = (await import('../../_output_rarity.json')).default as any
  }
}

// Set the virtual scroller elements height
// Note: If the height value is invalid the virtual scroller will jump randomly
const breakpoints = useBreakpoints({ laptop: 1280 })
export const getElementBlockHeight = (index: number) => {
  if (breakpoints.isGreater('laptop')) return 560
  else return elementsFixed[index]?.revealed ? 1250 : 650
}
