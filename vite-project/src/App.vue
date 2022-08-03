<template>
  <div class="credits">
    <div>
      Made with ❤ by <a href="https://github.com/rigwild">rigwild</a> - ⭐ Star on
      <a href="https://github.com/rigwild/anons-s2-secret-nft">GitHub</a> - See
      <a href="https://anons.rigwild.dev/">Anons S1 "OGs"</a>
    </div>
  </div>

  <h1 class="text-center">Anons S2 "The Army" NFT Rarity Scores</h1>

  <router-view></router-view>
</template>

<style>
body {
  max-width: 1260px;
  margin: 0 auto;
}
.text-center {
  text-align: center;
}
.text-right {
  text-align: right;
}
.text-strike {
  text-decoration: line-through;
}

.credits {
  text-align: center;
  margin: 15px;
}

@media (max-width: 1280px) {
  .actions > div {
    flex-direction: column;
  }
}
</style>
