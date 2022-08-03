<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { elementsFixed, rarity, getElementBlockHeight } from '../src/utils'
import { Element, categories } from '../../types'

const { element, elementIndex, useTraitsCountRarity } = defineProps<{
  element: Element
  elementIndex: number
  useTraitsCountRarity: boolean
}>()

const elementIdStr = `${element.id}` as unknown as keyof typeof rarity.elements
const rank = useTraitsCountRarity
  ? rarity.elements[elementIdStr].rank
  : rarity.elements[elementIdStr].rankWithoutTraitsCount

const score = useTraitsCountRarity
  ? rarity.elements[elementIdStr].score
  : rarity.elements[elementIdStr].scoreWithoutTraitsCount

const blockHeight = getElementBlockHeight(elementIndex)

// Try to get the compressed image version URL sitting at `/elements-images/<element>.webp`
let imageCompressedUrl: string = ''
if (element.revealed) {
  imageCompressedUrl = new URL(element.imageUrl).pathname.split('/').slice(-1)[0]
  imageCompressedUrl = `/elements-images/${imageCompressedUrl.split('.').slice(0, -1).join('.')}.webp`
}
let imageUrl = ref(element.revealed ? imageCompressedUrl : '/placeholder.jpg')
onMounted(async () => {
  if (element.revealed) {
    // Check the image is present in assets (if not present, it means this one is a new one
    // from the auto-update script and was and not yet compressed/included in the deployment assets)
    // See the README "Automatically update the website" section for more information
    const res = await fetch(imageCompressedUrl)
    if (res.ok && res.headers.get('content-type')?.includes('image')) {
      imageUrl.value = imageCompressedUrl
    } else {
      // Fallback to the original image URL
      imageUrl.value = element.imageUrl
    }
  }
})
</script>

<template>
  <div class="element-block" :style="`height: ${blockHeight}px`">
    <div class="element-card" :key="`element-${element.id}`">
      <div class="element-img-container" :style="`flex-basis: ${blockHeight}px;`">
        <img :src="imageUrl" :alt="`element ${element.id}`" />
      </div>
      <div class="element-stats">
        <div class="element-title">
          <h2>
            Anon S2 #{{ element.id }}
            <!-- <router-link :to="`/element/${element.id}`" class="link-emoji">🔗</router-link> -->
          </h2>
          <h3 v-if="element.revealed">Rank {{ rank }} / {{ elementsFixed.length }}</h3>
        </div>
        <div v-if="element.revealed">
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
              <tr>
                <td :class="{ 'text-strike': !useTraitsCountRarity }">Traits Count</td>
                <td :class="{ 'text-strike': !useTraitsCountRarity }">{{ rarity.elements[element.id].traitsCount }}</td>
                <td class="text-right" :class="{ 'text-strike': !useTraitsCountRarity }">
                  {{ rarity.traitsCountRarity[rarity.elements[element.id].traitsCount].count }} /
                  {{ elementsFixed.length }}
                </td>
                <td class="text-right" :class="{ 'text-strike': !useTraitsCountRarity }">
                  {{ rarity.traitsCountRarity[rarity.elements[element.id].traitsCount].totalPercent.toFixed(3) }} %
                </td>
                <td class="text-right" :class="{ 'text-strike': !useTraitsCountRarity }">
                  {{ rarity.traitsCountRarity[rarity.elements[element.id].traitsCount].score.toFixed(3) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <h4>This Anon S2 is minted but not revealed!</h4>
        </div>
        <h3>
          <span v-if="element.revealed">
            Total Rarity Score
            {{ score.toFixed(3) }}
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
  display: flex;
  flex-direction: column;
  align-content: space-between;
  justify-content: space-between;
  height: 100%;
}

.element-stats > .element-title > h2,
.element-stats > .element-title > h3 {
  margin: 5px 0;
}

.link-emoji {
  margin-left: 5px;
}

/* Phone & Tablet */
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
  .element-stats > .element-title {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 0;
    margin-bottom: 10px;
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
