// One-off migration: coach_periods.periode_mulai/periode_selesai (date fields) ->
// tahun_mulai/tahun_selesai (integer year fields), mirroring player_periods.
// Must run BEFORE `setup-schema.mjs` drops the old date fields, since this script
// reads them to backfill the new ones.
// Run with: node cms/scripts/migrate-coach-periods-to-years.mjs

import { api, login } from './lib/directus-client.mjs'

async function main() {
  await login()

  const { data: periods } = await api('/items/coach_periods?limit=-1&fields=id,periode_mulai,periode_selesai,tahun_mulai,tahun_selesai')

  let migrated = 0
  let skipped = 0

  for (const p of periods) {
    if (p.tahun_mulai != null) {
      skipped++
      continue
    }
    if (!p.periode_mulai) {
      console.log(`! period #${p.id} has no periode_mulai, skipping`)
      skipped++
      continue
    }
    const tahun_mulai = Number(p.periode_mulai.slice(0, 4))
    const tahun_selesai = p.periode_selesai ? Number(p.periode_selesai.slice(0, 4)) : null
    await api(`/items/coach_periods/${p.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ tahun_mulai, tahun_selesai })
    })
    console.log(`~ period #${p.id}: ${p.periode_mulai}–${p.periode_selesai ?? 'sekarang'} -> ${tahun_mulai}–${tahun_selesai ?? 'sekarang'}`)
    migrated++
  }

  console.log(`\nDone. Migrated: ${migrated}, skipped (already migrated or missing source): ${skipped}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
