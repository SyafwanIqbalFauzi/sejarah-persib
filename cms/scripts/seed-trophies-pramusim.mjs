// Seeds Persib's pre-season tournament titles into `trophies`, linked to the
// matching pramusim_seasons rows via the `pramusim_season` m2o. These are the two
// editions Persib actually won (Piala Presiden 2015, Celebes Cup II 2012).
// Idempotent: matches existing trophies by nama_gelar.
// Run with: node cms/scripts/seed-trophies-pramusim.mjs

import { api, login } from './lib/directus-client.mjs'

const titles = [
  { nama_gelar: 'Juara Piala Presiden 2015', nama_kompetisi: 'Piala Presiden', tahun_mulai: 2015 },
  { nama_gelar: 'Juara Celebes Cup 2012', nama_kompetisi: 'Celebes Cup', tahun_mulai: 2012 }
]

async function main() {
  await login()

  for (const t of titles) {
    const existing = await api(`/items/trophies?filter[nama_gelar][_eq]=${encodeURIComponent(t.nama_gelar)}`)
    if (existing.data.length > 0) {
      console.log(`= trophy "${t.nama_gelar}" already exists, skipping`)
      continue
    }
    const ps = await api(
      `/items/pramusim_seasons?filter[nama_kompetisi][_eq]=${encodeURIComponent(t.nama_kompetisi)}&filter[tahun_mulai][_eq]=${t.tahun_mulai}`
    )
    if (!ps.data.length) {
      console.log(`! pramusim_season "${t.nama_kompetisi} ${t.tahun_mulai}" not found, skipping "${t.nama_gelar}"`)
      continue
    }
    await api('/items/trophies', {
      method: 'POST',
      body: JSON.stringify({
        nama_gelar: t.nama_gelar,
        jenis: 'klub',
        kategori_turunan: 'kompetisi_pramusim',
        pramusim_season: ps.data[0].id,
        status: 'published'
      })
    })
    console.log(`+ created trophy "${t.nama_gelar}"`)
  }
  console.log('\nDone seeding pramusim trophies.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
