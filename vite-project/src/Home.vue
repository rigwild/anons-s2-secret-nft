<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useBreakpoints, useVirtualList } from '@vueuse/core'
import { useRouteQuery } from '@vueuse/router'

import ElementComponent from '../components/Element.vue'

import elementsFixed from '../../_output_elementsNullTraitsAsNone.json'
import rarity from '../../_output_rarity.json'
import { categories } from '../../types'

console.log('Use `elements()` to show raw data')
;(window as any).elements = () => {
  console.log('This can be found here: https://github.com/rigwild/anons-s2-club-nft#raw-rarity-scores')
  console.log('elements', elementsFixed)
  console.log('rarity', rarity)
}

const props = defineProps({
  sortBy: String,
  filterTrait: String
})

if (props.sortBy !== 'id' && props.sortBy !== 'score') throw new Error('Invalid sort')

let elements = ref(elementsFixed)
let filterId = ref()
let filterTrait = ref('')
let sortBy = ref(props.sortBy || 'id')

const filterTraitQuery = useRouteQuery('filterTrait')

let stateKey = computed(
  () => `${sortBy.value}-${filterId.value || '_'}-${filterTrait.value || '_'}-${elements.value.length}`
)

// Keep `sortBy` route query prop in sync with state
watch(
  () => props.sortBy,
  value => {
    if (value) sortBy.value = value
  }
)

// Auto-apply element sort on sort type change
watch(
  () => sortBy.value,
  () => sortElement()
)

// Keep `filterTrait` state in sync with route query prop
watch(
  () => filterTrait.value,
  value => {
    if (value) filterTraitQuery.value = value
  }
)

const filterElementsById = () => {
  filterTrait.value = ''
  if (!filterId.value) {
    elements.value = elementsFixed
    sortElement()
  } else {
    elements.value = []
    const results = elementsFixed.find(x => filterId.value === `${x.id}`)
    nextTick(() => {
      elements.value = results ? [results] : []
    })
  }
}
const filterElementsByTrait = () => {
  filterId.value = ''
  filterTrait.value = filterTrait.value.toLowerCase()
  if (!filterTrait.value) {
    elements.value = elementsFixed
    sortElement()
  } else {
    elements.value = elementsFixed.filter(element =>
      categories.some(category => element[category]?.toLowerCase().includes(filterTrait.value))
    )
  }
}

const sortElement = () => {
  if (sortBy.value === 'id') sortById()
  else if (sortBy.value === 'score') sortByScore()
}
const sortById = () => (elements.value = elements.value.sort((a, b) => a.id - b.id))
const sortByScore = () =>
  (elements.value = elements.value.sort((a, b) => rarity.elements[b.id].score - rarity.elements[a.id].score))

// Set the virtual scroller properties
// Note: If the height value is invalid here or in `Element.vue`,
// the virtual scroller will jump randomly
const breakpoints = useBreakpoints({ laptop: 1024 })
const { list, containerProps, wrapperProps } = useVirtualList(elements, {
  itemHeight: i => {
    if (breakpoints.isGreater('laptop')) return 557
    else return elements.value[i]?.revealed ? 1250 : 650
  }
})

// Apply route query parameters on page load
sortElement()
filterTrait.value = props.filterTrait!
if (filterTrait.value) filterElementsByTrait()
</script>

<template>
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
    </div>
  </div>

  <div>
    <h2 class="text-center">{{ elements.length }} / {{ elementsFixed.length }} Anons S2</h2>
  </div>
  <div v-if="elements.length === 0">
    <h2 class="text-center">Nothing found!</h2>
  </div>

  <div v-else :key="stateKey">
    <div v-bind="containerProps" style="height: 94vh">
      <div v-bind="wrapperProps">
        <div v-for="item in list" :key="`${item.data.id}-${item.index}`">
          <ElementComponent :element="(item.data as any)" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
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

@media (max-width: 1280px) {
  .filters > div {
    flex-direction: column;
  }
}
</style>
