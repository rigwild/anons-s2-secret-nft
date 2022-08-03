#!/usr/bin/env zx

import 'zx/globals'

// Cloudflare Workers KV code pulled from
// https://github.com/Kikobeats/cloudflare-workers-kv

const throwError = ({ message, code }) => {
  const error = new Error(`${message}`)
  error.code = code
  throw error
}

const authentication = ({ email, key }) =>
  email ? { 'X-Auth-Email': email, 'X-Auth-Key': key } : { Authorization: `Bearer ${key}` }

function CloudFlareWorkersKV(options) {
  if (!(this instanceof CloudFlareWorkersKV)) {
    return new CloudFlareWorkersKV(options)
  }

  const { accountId, email, key, namespaceId } = options
  const auth = authentication({ email, key })

  const baseUrl = (key = '') =>
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`

  const fetchOptions = (opts = {}, props) => ({
    ...opts,
    headers: {
      ...opts.headers,
      ...auth
    },
    ...props
  })

  const get = async (key, opts) => {
    const response = await fetch(baseUrl(key), fetchOptions(opts))
    if (response.status === 404) return undefined
    return response.json()
  }

  const set = async (key, value, ttl, opts = {}) => {
    const url = baseUrl(key)
    const searchParams = new URLSearchParams(ttl ? { expiration_ttl: ttl / 1000 } : {})

    const { success, errors } = await fetch(
      `${url}?${searchParams.toString()}`,
      fetchOptions(opts, {
        body: typeof value === 'string' ? value : JSON.stringify(value),
        method: 'PUT'
      })
    ).then(res => res.json())

    return success || throwError(errors[0])
  }

  const _delete = async (key, opts) => {
    await fetch(baseUrl(key), fetchOptions(opts, { method: 'DELETE' }))
    return true
  }

  return { get, set, delete: _delete }
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
const key = process.env.CLOUDFLARE_API_KEY
const namespaceId = process.env.CLOUDFLARE_NAMESPACE_ID

if (!accountId || !key || !namespaceId) {
  throw new Error('CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_KEY, and CLOUDFLARE_NAMESPACE_ID must be set')
}

const store = CloudFlareWorkersKV({
  accountId,
  key,
  namespaceId
})

async function run() {
  console.log('Updating Cloudflare Workers KV...')
  // Update data
  const data = await fetch(process.env.ELEMENTS_API_URI || 'https://rest-api.anons.army/api/anons/s2').then(res =>
    res.json()
  )
  await fs.writeFile('_input_elements.json', JSON.stringify(data, null, 2))
  await $`pnpm exportScores`

  // Update Cloudflare Workers KV
  // We read as json to make sure no garbage data was created when updating (let it crash!)
  const _output_elementsNullTraitsAsNone = await fs.readJSON('_output_elementsNullTraitsAsNone.json')
  const _output_rarity = await fs.readJSON('_output_rarity.json')
  await Promise.all([
    store.set('_output_elementsNullTraitsAsNone.json', JSON.stringify(_output_elementsNullTraitsAsNone)),
    store.set('_output_rarity.json', JSON.stringify(_output_rarity))
  ])
  console.log('Cloudflare Workers KV updated!')
}

run().then(() => {
  // Update every 10 minutes
  setInterval(run, 10 * 60 * 1000)
})
