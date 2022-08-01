import { useBreakpoints } from '@vueuse/core'
import elementsFixed from '../../_output_elementsNullTraitsAsNone.json'

// Set the virtual scroller elements height
// Note: If the height value is invalid the virtual scroller will jump randomly
const breakpoints = useBreakpoints({ laptop: 1280 })
export const getElementBlockHeight = (index: number) => {
  if (breakpoints.isGreater('laptop')) return 560
  else return elementsFixed[index]?.revealed ? 1250 : 650
}
