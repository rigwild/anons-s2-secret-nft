<script setup lang="ts">
import ElementComponent from '../components/Element.vue'
import { elementsFixed } from './utils'

const props = defineProps({ elementId: String })

const elementId = +props.elementId!

const elementIndex = elementsFixed.findIndex(x => x.id === elementId)
const element = elementIndex >= 0 ? elementsFixed[elementIndex] : undefined
</script>

<template>
  <div v-if="!element">
    <h2 class="text-center">Could not find Anon S2 with ID {{ elementId }}!</h2>
  </div>
  <div v-else-if="!element.revealed">
    <h2 class="text-center">The Anon S2 with ID {{ elementId }} is minted but not revealed!</h2>
  </div>
  <div v-else>
    <ElementComponent :element="(element as any)" :element-index="elementIndex" />
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
