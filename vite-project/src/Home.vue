<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useVirtualList, useLocalStorage } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'
import ElementComponent from '../components/Element.vue'
import { elementsFixed, rarity } from './utils'
import { categories } from '../../types'
import { getElementBlockHeight } from './utils'

console.log('Use `elements()` to show raw data')
;(window as any).elements = () => {
  console.log('This can be found here: https://github.com/rigwild/anons-s2-secret-nft')
  console.log('elements', elementsFixed)
  console.log('rarity', rarity)
}

let elements = ref(elementsFixed)
let filterId = useRouteQuery<string>('id', '', { mode: 'replace' })
let sortBy = useRouteQuery<'id' | 'score'>('sortBy', 'id', { mode: 'replace' })
let filterTrait = useRouteQuery<string>('filterTrait', '', { mode: 'replace' })
let useTraitsCountRarity = useLocalStorage('useTraitsCountRarity', true)

let stateKey = computed(
  () =>
    // prettier-ignore
    `${filterId.value || '_'}-${sortBy.value || '_'}-${useTraitsCountRarity.value}-${filterId.value || '_'}-${filterTrait.value || '_'}-${elements.value.length}`
)

const elementSoloIndex = computed(() => {
  if (filterId.value) return elementsFixed.findIndex(x => x.id === +filterId.value)
})

const filterElementsById = () => {
  filterTrait.value = ''
  if (!filterId.value) {
    elements.value = elementsFixed
    sortElement()
  } else {
    elements.value = []
    const results = elementsFixed.find(x => filterId.value === `${x.id}`)
    elements.value = results ? [results] : []
  }
}
const filterElementsByTrait = () => {
  filterTrait.value = filterTrait.value.toLowerCase()
  if (!filterTrait.value) {
    elements.value = elementsFixed
    sortElement()
  } else {
    filterId.value = ''
    elements.value = elementsFixed.filter(element =>
      categories.some(category => element[category]?.toLowerCase().includes(filterTrait.value))
    )
  }
}

const sortElement = () => {
  if (sortBy.value === 'id') sortById()
  else if (sortBy.value === 'score') sortByScore()
}
const sortById = () => {
  if (sortBy.value !== 'id') sortBy.value = 'id'
  elements.value = elements.value.sort((a, b) => a.id - b.id)
}
const sortByScore = () => {
  if (sortBy.value !== 'score') sortBy.value = 'score'
  elements.value = elements.value.sort((a, b) =>
    useTraitsCountRarity.value
      ? rarity.elements[`${b.id}`].score - rarity.elements[`${a.id}`].score
      : rarity.elements[`${b.id}`].scoreWithoutTraitsCount - rarity.elements[`${a.id}`].scoreWithoutTraitsCount
  )
}

// Re-sort on use traits count rarity change
watch(useTraitsCountRarity, () => sortElement())

// Set the virtual scroller elements height
// Note: If the height value is invalid the virtual scroller will jump randomly
// Change value in getElementBlockHeight if it jumps!
const { list, containerProps, wrapperProps } = useVirtualList(elements, {
  itemHeight: index => getElementBlockHeight(index)
})

// Apply route query parameters on page load
sortElement()
if (filterTrait.value) filterElementsByTrait()
</script>

<template>
  <div class="actions">
    <button @click="sortById">Show Anons S2 by ID</button>
    <button @click="sortByScore">Show Anons S2 by Score</button>
  </div>
  <div class="filters">
    <div>
      <div>
        <label for="filterId">Anon S2 ID</label>
        <input
          v-model="filterId"
          @input="filterElementsById"
          id="filterId"
          type="text"
          placeholder="Filter by Anon S2 ID"
          :maxlength="5"
        />
      </div>
      <div>
        <label for="filterTrait">Trait Name</label>
        <input
          v-model="filterTrait"
          @input="filterElementsByTrait"
          id="filterTrait"
          type="text"
          placeholder="Filter by Trait Name"
        />
      </div>
      <div>
        <label for="useTraitsCountRarity">Traits Count Rarity</label>
        <input v-model="useTraitsCountRarity" type="checkbox" id="useTraitsCountRarity" />
      </div>
    </div>
  </div>

  <div v-if="filterId && elementSoloIndex">
    <h2 v-if="elementSoloIndex === -1" class="text-center">Could not find Anon S2 with ID {{ filterId }}!</h2>
    <h2 v-else-if="!elementsFixed[elementSoloIndex].revealed" class="text-center">
      The Anon S2 with ID {{ filterId }} is minted but not revealed!
    </h2>
    <ElementComponent
      v-else
      :element="elementsFixed[elementSoloIndex]"
      :element-index="elementSoloIndex"
      :use-traits-count-rarity="useTraitsCountRarity"
      :key="stateKey"
    />
  </div>

  <div v-else>
    <div>
      <h2 class="text-center">{{ elements.length }} / {{ elementsFixed.length }} Anons S2</h2>
    </div>

    <div v-if="elements.length === 0">
      <h2 class="text-center">Nothing found!</h2>
    </div>

    <div v-else :key="stateKey">
      <div v-bind="containerProps" style="height: 94vh">
        <div v-bind="wrapperProps">
          <div v-for="(item, index) in list" :key="`${item.data.id}-${item.index}`">
            <ElementComponent
              :element="item.data"
              :element-index="index"
              :use-traits-count-rarity="useTraitsCountRarity"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.actions {
  text-align: center;
  margin: 15px;
}
.filters {
  text-align: center;
  margin: 15px;
}
.filters input {
  margin: 0 auto;
  text-align: center;
  margin-bottom: 20px;
}
.filters > div {
  display: flex;
  justify-content: center;
  align-items: center;
}
.filters > div > div {
  margin: 15px;
}
.filters input[type='checkbox'] {
  display: block;
  margin-top: 7px;
}

@media (max-width: 1280px) {
  .filters > div {
    flex-direction: column;
  }
}
</style>
