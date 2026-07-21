// Grants the Public role read access to content collections, so the Nuxt
// frontend can query Directus without authentication. Run after setup-schema.mjs.
// Run with: node cms/scripts/setup-permissions.mjs

import { api, login } from './lib/directus-client.mjs'

// collections with a `status` field are restricted to status = published for Public;
// junction/translation/stat tables have no status field, so they're open (they're only
// ever reached by joining from an already-published parent).
const restricted = ['eras', 'coaches', 'players', 'seasons', 'cup_seasons', 'asia_seasons', 'pramusim_seasons', 'matches', 'trophies', 'stories', 'sources']
const open = ['languages', 'eras_translations', 'coaches_translations', 'players_translations', 'matches_translations', 'stories_translations', 'player_season_stats', 'directus_files']

async function grantRead(policyId, collection, permissions) {
  const existing = await api(`/permissions?filter[collection][_eq]=${collection}&filter[policy][_eq]=${policyId}&filter[action][_eq]=read`)
  if (existing.data.length > 0) {
    console.log(`= public read permission for ${collection} already exists, skipping`)
    return
  }
  await api('/permissions', {
    method: 'POST',
    body: JSON.stringify({ collection, action: 'read', policy: policyId, permissions, fields: ['*'] })
  })
  console.log(`+ granted public read on ${collection}`)
}

// Create-only: visitors can submit feedback but can never read back others'
// submissions (no read permission granted for this collection).
async function grantCreate(policyId, collection, fields) {
  const existing = await api(`/permissions?filter[collection][_eq]=${collection}&filter[policy][_eq]=${policyId}&filter[action][_eq]=create`)
  if (existing.data.length > 0) {
    console.log(`= public create permission for ${collection} already exists, skipping`)
    return
  }
  await api('/permissions', {
    method: 'POST',
    body: JSON.stringify({ collection, action: 'create', policy: policyId, permissions: {}, fields })
  })
  console.log(`+ granted public create on ${collection}`)
}

async function main() {
  await login()

  // Directus 11 uses Policies rather than direct role permissions; find the
  // built-in Public policy (the one attached to the Public role).
  const policies = await api('/policies?filter[icon][_eq]=public')
  const publicPolicy = policies.data[0]
  if (!publicPolicy) throw new Error('Could not find built-in Public policy')

  for (const c of restricted) await grantRead(publicPolicy.id, c, { status: { _eq: 'published' } })
  for (const c of open) await grantRead(publicPolicy.id, c, {})
  await grantCreate(publicPolicy.id, 'feedback', ['nama', 'email', 'kategori', 'pesan'])

  console.log('\nDone. Public role can now read published content.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
