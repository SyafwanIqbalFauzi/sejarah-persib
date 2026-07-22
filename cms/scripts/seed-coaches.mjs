// Seed data — pelatih Persib Bandung & periode kepelatihannya.
// Sumber: daftar pelatih per negara yang diberikan user (belum diverifikasi ulang
// terhadap sumber primer, tandai untuk verifikasi lanjutan).
// Run with: node cms/scripts/seed-coaches.mjs

import { api, login } from './lib/directus-client.mjs'

function toSlug(nama) {
  return nama
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function period(mulai, selesai) {
  return {
    tahun_mulai: mulai,
    tahun_selesai: selesai == null ? null : selesai
  }
}

// [nama, negara, [[mulai, selesai], ...]] — selesai null berarti masih menjabat.
const raw = [
  // #Indonesia
  ['Risnandar Soendoro', 'Indonesia', [[1980, 1983], [1995, 1996], [2005, 2006]]],
  ['Omo Suratmo', 'Indonesia', [[1983, 1984]]],
  ['Ade Dana', 'Indonesia', [[1984, 1985], [1989, 1993]]],
  ['Nandar Iskandar', 'Indonesia', [[1985, 1988], [1996, 1998]]],
  ['Indra Thohir', 'Indonesia', [[1993, 1995], [2000, 2001], [2005, 2005]]],
  ['M. Suryamin', 'Indonesia', [[1998, 2000]]],
  ['Deny Syamsudin', 'Indonesia', [[2001, 2002]]],
  ['Bambang Sukowiyono', 'Indonesia', [[2003, 2003]]],
  ['Iwan Sunarya', 'Indonesia', [[2003, 2003]]],
  ['Djadjang Nurdjaman', 'Indonesia', [[2007, 2007], [2012, 2016], [2016, 2017]]],
  ['Robby Darwis', 'Indonesia', [[2007, 2007], [2010, 2010], [2012, 2012]]],
  ['Jaya Hartono', 'Indonesia', [[2008, 2010]]],
  ['Daniel Roekito', 'Indonesia', [[2010, 2011]]],
  ['Herrie Setyawan', 'Indonesia', [[2016, 2016], [2017, 2017]]],
  ['Budiman Yunus', 'Indonesia', [[2022, 2022]]],
  ['Yaya Sunarya', 'Indonesia', [[2023, 2023]]],

  // Pelatih asing
  ['Marek Śledzianowski', 'Polandia', [[2002, 2003]]],
  ['Juan Páez', 'Chile', [[2003, 2005]]],
  ['Iurie Arcan', 'Moldova', [[2006, 2007]]],
  ['Darko Janacković', 'Prancis', [[2010, 2010]]],
  ['Jovo Cuckovic', 'Serbia', [[2010, 2010]]],
  ['Dejan Antonić', 'Serbia', [[2016, 2016]]],
  ['Mario Gómez', 'Argentina', [[2017, 2018]]],
  ['Miljan Radovic', 'Montenegro', [[2018, 2019]]],
  ['Robert Rene Alberts', 'Belanda', [[2019, 2022]]],
  ['Luis Milla', 'Spanyol', [[2022, 2023]]],
  ['Drago Mamić', 'Kroasia', [[2011, 2012]]],
  ['Bojan Hodak', 'Kroasia', [[2023, 2026]]],
  ['Igor Tolić', 'Kroasia', [[2026, null]]]
]

const coaches = raw.map(([nama, negara, periods]) => ({
  slug: toSlug(nama),
  nama,
  negara: [negara],
  periods: periods.map(([mulai, selesai]) => period(mulai, selesai))
}))

function periodKey(p) {
  return `${p.tahun_mulai}|${p.tahun_selesai}`
}

async function main() {
  await login()

  let created = 0
  let updatedCoach = 0
  let periodsAdded = 0
  let periodsRemoved = 0

  for (const coach of coaches) {
    const existing = await api(`/items/coaches?filter[slug][_eq]=${coach.slug}`)

    let coachId
    if (existing.data.length === 0) {
      const res = await api('/items/coaches', {
        method: 'POST',
        body: JSON.stringify({ slug: coach.slug, nama: coach.nama, negara: coach.negara, status: 'published' })
      })
      coachId = res.data.id
      console.log(`+ created coach ${coach.slug}`)
      created++
    } else {
      const record = existing.data[0]
      coachId = record.id
      const currentNegara = record.negara ?? []
      if (JSON.stringify([...currentNegara].sort()) !== JSON.stringify([...coach.negara].sort())) {
        await api(`/items/coaches/${coachId}`, { method: 'PATCH', body: JSON.stringify({ negara: coach.negara }) })
        console.log(`~ updated coach ${coach.slug} negara -> [${coach.negara.join(', ')}]`)
        updatedCoach++
      }
    }

    // Reconcile periods: drop any stale period not in the desired set, add any missing one.
    const existingPeriods = await api(`/items/coach_periods?filter[coach][_eq]=${coachId}&limit=-1`)
    const desiredKeys = new Set(coach.periods.map(periodKey))
    const existingKeys = new Set(existingPeriods.data.map(periodKey))

    for (const p of existingPeriods.data) {
      if (!desiredKeys.has(periodKey(p))) {
        await api(`/items/coach_periods/${p.id}`, { method: 'DELETE' })
        console.log(`- removed stale period ${coach.slug}: ${p.tahun_mulai}–${p.tahun_selesai ?? 'sekarang'}`)
        periodsRemoved++
      }
    }
    for (const p of coach.periods) {
      if (!existingKeys.has(periodKey(p))) {
        await api('/items/coach_periods', { method: 'POST', body: JSON.stringify({ coach: coachId, ...p }) })
        console.log(`+ added period ${coach.slug}: ${p.tahun_mulai}–${p.tahun_selesai ?? 'sekarang'}`)
        periodsAdded++
      }
    }
  }

  console.log(`\nDone. Coaches created: ${created}, coaches updated: ${updatedCoach}, periods added: ${periodsAdded}, periods removed: ${periodsRemoved}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
