<script setup lang="ts">
import rarity from '../../_output_rarity.json'
import elementsFixed from '../../_output_elementsNullTraitsAsNone.json'
import { getElementBlockHeight } from '../src/utils'
import { Element, categories } from '../../types'

const { element, elementIndex } = defineProps<{ element: Element; elementIndex: number }>()
const blockHeight = getElementBlockHeight(elementIndex)

// Get the compressed image version URL sitting at `/elements-images/<element>.webp`
let imageUrlCompressed = ''
if (element.revealed) {
  imageUrlCompressed = new URL(element.imageUrl).pathname.split('/').slice(-1)[0]
  imageUrlCompressed = `/elements-images/${imageUrlCompressed.split('.').slice(0, -1).join('.')}.webp`
}
</script>

<template>
  <div class="element-block" :style="`height: ${blockHeight}px`">
    <div class="element-card" :key="`element-${element.id}`">
      <div class="element-img-container" :style="`flex-basis: ${blockHeight}px;`">
        <img :src="element.revealed ? imageUrlCompressed : '/placeholder.jpg'" :alt="`element ${element.id}`" />
      </div>
      <div class="element-stats">
        <h2>
          Anon S2 #{{ element.id }}
          <span v-if="element.revealed"
            >(Rank {{ rarity.elements[(element.id + '') as keyof typeof rarity.elements].rank }} /
            {{ elementsFixed.length }})</span
          >
          <router-link :to="`/element/${element.id}`" class="pointer">🔗</router-link>
        </h2>
        <div v-if="element.revealed">
          <h4>Traits</h4>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Trait</th>
                <th class="text-right">Trait Count</th>
                <th class="text-right">Trait %</th>
                <th class="text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              <template v-for="(category, index) of categories">
                <tr v-if="element[category]" :key="index">
                  <td>{{ category }}</td>
                  <td>{{ element[category] }}</td>
                  <td class="text-right">
                    {{ rarity.categories[category][element[category]].count }} / {{ elementsFixed.length }}
                  </td>
                  <td class="text-right">
                    {{ rarity.categories[category][element[category]].totalPercent.toFixed(3) }} %
                  </td>
                  <td class="text-right">{{ rarity.categories[category][element[category]].score.toFixed(3) }}</td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
        <div v-else>
          <h4>This Anon S2 is minted but not revealed!</h4>
        </div>
        <h3>
          <span v-if="element.revealed">
            Total Rarity Score:
            {{ rarity.elements[(element.id + '') as keyof typeof rarity.elements].score.toFixed(3) }}
            -
          </span>
          <a
            :href="`https://anons.army/anon/secret1havcaujmnf73tah35c0rs3u5hmunvq29pvwnm3/${element.id}`"
            target="_blank"
            rel="noopener"
            >See on anons.army</a
          >
        </h3>
      </div>
    </div>
  </div>
</template>

<style scoped>
.element-card {
  max-width: 1200px;
  margin: 40px auto;
  height: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #2e3844;
  border-radius: 30px;
  box-shadow: 0 5px 24px 5px #00000042;
}
.element-card > .element-img-container {
  width: 100%;
  height: 100%;
  flex-grow: 0;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
}

.element-img-container img {
  width: 100%;
  height: 100%;
  border-radius: 20px 0 0 20px;
}

.element-stats {
  width: 100%;
  padding: 0 15px;
}

/* Phone & tablet */
@media only screen and (max-width: 1280px) {
  .element-card {
    height: fit-content;
    text-align: center;
    flex-direction: column;
    margin: 50px 0;
  }
  .element-card > .element-img-container {
    width: 100%;
    height: 100%;
    margin: 0;
    flex-basis: initial !important;
    flex-grow: initial;
    flex-shrink: initial;
  }
  .element-stats {
    padding: 5px 0;
  }
}

/* Phone */
@media only screen and (max-width: 640px) {
  .element-card img {
    height: auto;
    width: 100%;
    border-radius: 30px 30px 0px 0px;
  }
}

/* Tablet */
@media only screen and (min-width: 640px) and (max-width: 1280px) {
  .element-card {
    height: fit-content;
  }
  .element-card > .element-img-container {
    width: initial;
    height: initial;
    margin: 0;
    flex-basis: initial !important;
    flex-grow: initial;
    flex-shrink: initial;
  }
  .element-card img {
    height: 500px;
    width: 500px;
    border-radius: 30px;
    margin-top: 30px;
    box-shadow: 0 5px 24px 5px #00000042;
  }
}
</style>
