# Anons S2 NFT Rarity Scores

This project contains some rarity scores for each Anons S2 "The Army" NFTs from [anons.army](https://anons.army/) on [Secret Network](https://scrt.network/).

Anons S1 "OGs" NFTs rarity scores: [rigwild/anons-secret-nft](https://github.com/rigwild/anons-secret-nft).

The rarity score is calculed following [these formulas (`Rarity Score: How is it Calculated?` section)](https://raritytools.medium.com/ranking-rarity-understanding-rarity-calculation-methods-86ceaeb9b98c#2942). A rarity score can be calculated in a lot of different ways with each their specific strengths and flaws. **This is not an official ranking.**

Any traits that is set to `No` is renamed to `None`. `None` is treated as any other trait, **it counts in the scores!** An NFT with all traits to `None` would then be very rare.

The count of traits rarity is calculated, but the scores and ranks without it are also provided. You can toggle it in the website.

⭐ Star the project! ⭐

## Website

A website is available at [anons2.rigwild.dev](https://anons2.rigwild.dev/)

![website screenshot](./screenshot.webp)

## Raw Rarity Scores

- Human-readable version: [`_output_results.log`](./_output_results.log)
- JSON:
  - [`_output_elementsNullTraitsAsNone.json`](./_output_elementsNullTraitsAsNone.json): Elements with `null` traits set to `none`
  - [`_output_rarity.json`](./_output_rarity.json): Rarity scores
  - [`_output_elementsWithRarity.json`](./_output_elementsWithRarity.json): Elements with its rarity

## Reproduce calculations

```sh
pnpm install
pnpm build
pnpm exportScores
```

If the generated [`_output_elementsWithRarity.json`](./_output_elementsWithRarity.json) file has not changed, you are sure I did not cheat by manually editing it!

SHA256 hashes:

```
$ sha256sum _*
b20c6239bf4116a0c83587615ea19b39d268c1f9671c51cec820a00bb0629a71  _input_elements.json
6317ef8f0701b2fa51f63c975cbf01df0388143205ec11704d90cfde66d60071  _output_elementsNullTraitsAsNone.json
0ff0b2eb2c0493b422a3cfb66596fca50ee798878b762f8585507f80962559c2  _output_elementsWithRarity.json
1399882a00d6ada990812e7ae2e902dc889f10b611f0804e41fbc5e2d65099a5  _output_rarity.json
355a78ab053f4c47943becf1ffc21d44139a5f99657eea5ef1d6f86fe7f36b28  _output_results.log
```

**Note:** Your hashes may be different if you just updated the data, as some nft were probably revealed since my hashes were produced.

## Update rarity scores and website

Download the latest data from the API, calculate the rarity from scratch and update the website.

```sh
pnpm i -g zx @squoosh/cli

export ELEMENTS_API_URI='https://rest-api.anons.army/api/anons/s2'
zx ./scripts/updateWebsite.mjs
```

## Get rankings of NFTs list

```sh
ELEMENTS='1300 1523 187 755 780 870'
ELEMENTS='1300,1523 187| 755 -780;870' # any format, parameters are cleaned!
zx scripts/getRanking.mjs $ELEMENTS ; zx scripts/getRanking.mjs $ELEMENTS | clipboard
```

Output (+ copied to clipboard):

```
   187: Ranked   98 of 592 - score  77.08995339
   755: Ranked  265 of 592 - score  62.45316002
   780: Ranked  186 of 592 - score  67.95338584
   870: Ranked  435 of 592 - score  50.10635172
  1300: Ranked  493 of 592 - score  45.18967711
  1523: Ranked   77 of 592 - score  80.58123589

⭐ Star https://github.com/rigwild/anons-s2-secret-nft
```

## Reuse this project for your NFT collection

This project is open source. You can reuse it for your own project! ✌

The only requirements are:

- Mention my pseudo in your license
- Mention in your README that this was initially built by me, with a link to this repo.
- Mention in your website that this was initially built by me, with a link to this repo.

The code is as generic as possible, you only need to import your data in `_input_elements.json` (with the same format), edit [`./types.ts`](./types.ts) with your traits and change some texts in the website.

You may need to edit stuff if your NFTs collection doesn't have a "reveal" feature (`element.revealed: 1`).

### Deploy

Run with Node.js 16. To do this on [Cloudflare Pages](https://pages.cloudflare.com/), set the `NODE_ENV` environment variable to `16` (see [Language support and tools](https://developers.cloudflare.com/pages/platform/build-configuration/#language-support-and-tools)).

Build command: `cd vite-project && npm install -D && npm run build`

Build output directory: `/vite-project/dist`

### Automatically update the website

Create a Cloudflare Worker.

```js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request).catch(err => new Response(err.stack, { status: 500 })))
})

/**
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
  const _output_rarity = await ranks.get('_output_rarity.json')
  const _output_elementsNullTraitsAsNone = await ranks.get('_output_elementsNullTraitsAsNone.json')
  return new Response(
    `{"_output_rarity":${_output_rarity},"_output_elementsNullTraitsAsNone":${_output_elementsNullTraitsAsNone}}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'max-age=600' // Cache client-side for 10 minutes
      }
    }
  )
}
```

Store the data into a Cloudflare Workers KV namespace. This script will update the data every 10 minutes.

```sh
ELEMENTS_API_URI='https://rest-api.anons.army/api/anons/s2' \
CLOUDFLARE_ACCOUNT_ID=<CLOUDFLARE_ACCOUNT_ID> \
CLOUDFLARE_API_KEY=<CLOUDFLARE_API_KEY> \
CLOUDFLARE_NAMESPACE_ID=<CLOUDFLARE_NAMESPACE_ID> \
zx ./scripts/updateCloudflareWorkersKV.mjs
```

Then configure your worker service by binding the KV namespace to it with the variable `ranks`.

When deploying the website, set the `VITE_API_URI` environment variable to your worker API endpoint.

Voilà! The website will auto update every 10 minutes. Keep in mind that new images will be fetched using the element `imageUrl` and uncompressed.
It is a good idea to update the website sometimes so users load the compressed images instead of the remote ones.

## License

[The MIT License](./LICENSE)
