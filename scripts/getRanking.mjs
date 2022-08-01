import { promises as fs } from 'fs'

const needed = process.argv
  .slice(2)
  .join(' ')
  .trim()
  .replace(/[;\|,-]/g, ' ')
  .replace(/\s+/g, ' ')
  .split(' ')
// console.log(needed)

const data = /** @type {string} */ (await fs.readFile('_output_results.log', 'utf8'))
let anons = data.split('\n').filter(line => needed.some(aNeeded => line.includes(` ${aNeeded}: `)))
anons = [...new Set(anons)]
console.log(`\`\`\`\n${anons.join('\n')}\n\`\`\`\n⭐ Star https://github.com/rigwild/anons-s2-secret-nft`)
