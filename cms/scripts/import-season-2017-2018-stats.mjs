// One-off import: player_season_stats for GoJek Traveloka Liga 1 2017/2018, sourced
// from a squad stats table (tabel.html at repo root, Transfermarkt-style export).
// Creates any player missing from the `players` collection, backfills `posisi`
// from this data, and upserts one player_season_stats row per player for the
// 2017/2018 season. Sibling of import-season-2018-2019-stats.mjs.
// Run with: node cms/scripts/import-season-2017-2018-stats.mjs

import { api, login } from './lib/directus-client.mjs'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Directus dev instance occasionally drops its pg connection under rapid writes
// ("ROLLBACK - Client has encountered a connection error" / statement timeout);
// retry with backoff rather than aborting the whole import over a transient hiccup.
async function apiRetry(p, options, attempts = 8) {
  for (let i = 1; i <= attempts; i++) {
    try {
      return await api(p, options)
    } catch (err) {
      if (i === attempts) throw err
      console.log(`  (retry ${i}/${attempts - 1} after error: ${err.message.slice(0, 100)})`)
      await sleep(3000 * i)
    }
  }
}

function toSlug(nama) {
  return nama
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Transfermarkt-style position label -> our players.posisi choice.
const posisiMap = {
  'Kiper': 'Kiper',
  'Bek-Kiri': 'Bek Sayap',
  'Bek-Kanan': 'Bek Sayap',
  'Bek-Tengah': 'Bek Tengah',
  'Gel. Bertahan': 'Gelandang Bertahan',
  'Gel. Tengah': 'Gelandang Tengah',
  'Gel. Serang': 'Gelandang Serang',
  'Sayap Kanan': 'Sayap Kanan',
  'Sayap Kiri': 'Sayap Kiri',
  'Depan-Tengah': 'Penyerang Tengah'
}

// Rows where the source's display name doesn't slug-match an already-seeded
// player, but is confirmed the same person under a shortened name.
const slugAliases = new Map()

const rows = [
  { nomor: 30, nama: 'Aqil Savik', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 1, nama: 'Muhammad Natshir', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 26, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2340 },
  { nomor: null, nama: 'Imam Arief', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 78, nama: 'Made Wirawan', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 8, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 720 },
  { nomor: null, nama: 'Mario Jardel', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 12, nama: 'Henhen Herdiana', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 11, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 811 },
  { nomor: 3, nama: 'Ardi Idrus', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 29, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2593 },
  { nomor: null, nama: 'Wildansyah', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 3, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 270 },
  { nomor: 4, nama: 'Bojan Malisic', posisi: 'Bek-Tengah', negara: ['Serbia'], jumlah_laga: 26, jumlah_gol: 2, jumlah_assist: 1, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 2309 },
  { nomor: 16, nama: 'Indra Mustafa', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 10, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 590 },
  { nomor: 22, nama: 'Supardi', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 27, jumlah_gol: 3, jumlah_assist: 5, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2362 },
  { nomor: 32, nama: 'Victor Igbonefo', posisi: 'Bek-Tengah', negara: ['Indonesia', 'Nigeria'], jumlah_laga: 27, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 2430 },
  { nomor: 94, nama: 'M. Sabillah', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 9, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 557 },
  { nomor: null, nama: 'Gian Zola', posisi: 'Gel. Serang', negara: ['Indonesia'], jumlah_laga: 2, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 22 },
  { nomor: 11, nama: 'Dedi Kusnandar', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 23, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 1897 },
  { nomor: 23, nama: 'Kim Kurniawan', posisi: 'Gel. Tengah', negara: ['Indonesia', 'Jerman'], jumlah_laga: 7, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 373 },
  { nomor: 24, nama: 'Hariono', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 22, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 1341 },
  { nomor: null, nama: 'Tony Sucipto', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 20, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 1411 },
  { nomor: 33, nama: 'In-kyun Oh', posisi: 'Gel. Tengah', negara: ['Korea Selatan'], jumlah_laga: 27, jumlah_gol: 3, jumlah_assist: 2, kartu_kuning: 7, kartu_merah: 0, jumlah_menit_bermain: 2381 },
  { nomor: 80, nama: 'Eka Ramdani', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 14, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 407 },
  { nomor: 13, nama: 'Febri Hariyadi', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 17, jumlah_gol: 1, jumlah_assist: 3, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 1329 },
  { nomor: 98, nama: 'Wildan Ramdhani', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 3, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 41 },
  { nomor: 99, nama: 'Jonatan Bauman', posisi: 'Depan-Tengah', negara: ['Argentina'], jumlah_laga: 26, jumlah_gol: 12, jumlah_assist: 8, kartu_kuning: 7, kartu_merah: 0, jumlah_menit_bermain: 2095 },
  { nomor: 10, nama: 'Ezechiel Ndouasel', posisi: 'Depan-Tengah', negara: ['Chad'], jumlah_laga: 22, jumlah_gol: 17, jumlah_assist: 5, kartu_kuning: 8, kartu_merah: 0, jumlah_menit_bermain: 1980 },
  { nomor: null, nama: 'Atep', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 17, jumlah_gol: 1, jumlah_assist: 1, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 835 },
  { nomor: null, nama: 'Airlangga Sucipto', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 6, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 232 },
  { nomor: null, nama: 'Billy Keraf', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 2, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 81 },
  { nomor: 14, nama: 'Agung Mulyadi', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 12, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 607 },
  { nomor: 27, nama: 'Puja Abdillah', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 3, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 164 },
  { nomor: 37, nama: 'Muchlis Hadi', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 6, jumlah_gol: 1, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 160 },
  { nomor: 77, nama: 'Ghozali Siregar', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 32, jumlah_gol: 5, jumlah_assist: 8, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 2555 },
  { nomor: 88, nama: 'Patrich Wanggai', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 13, jumlah_gol: 4, jumlah_assist: 1, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 734 }
]

async function main() {
  await login()

  const seasons = await apiRetry('/items/seasons?filter[tahun_mulai][_eq]=2017&filter[tahun_selesai][_eq]=2018&limit=1')
  const season = seasons.data[0]
  if (!season) throw new Error('Season 2017/2018 not found in seasons collection')
  console.log(`Using season #${season.id} "${season.nama_kompetisi}" ${season.tahun_mulai}/${season.tahun_selesai}\n`)

  let playersCreated = 0
  let posisiUpdated = 0
  let statsCreated = 0
  let statsUpdated = 0

  for (const row of rows) {
    const slug = slugAliases.get(row.nama) ?? toSlug(row.nama)
    const posisi = posisiMap[row.posisi]
    if (!posisi) throw new Error(`No posisi mapping for "${row.posisi}" (${row.nama})`)

    const existing = await apiRetry(`/items/players?filter[slug][_eq]=${slug}&fields=id,nama,posisi`)
    let playerId

    if (existing.data.length === 0) {
      const created = await apiRetry('/items/players', {
        method: 'POST',
        body: JSON.stringify({ slug, nama: row.nama, negara: row.negara, posisi: [posisi], status: 'published' })
      })
      playerId = created.data.id
      console.log(`+ created player ${slug} (${posisi})`)
      playersCreated++
    } else {
      const player = existing.data[0]
      playerId = player.id
      const currentPosisi = player.posisi ?? []
      if (!currentPosisi.includes(posisi)) {
        await apiRetry(`/items/players/${playerId}`, { method: 'PATCH', body: JSON.stringify({ posisi: [...currentPosisi, posisi] }) })
        console.log(`~ updated posisi for ${slug}: [${currentPosisi.join(', ')}] -> [${[...currentPosisi, posisi].join(', ')}]`)
        posisiUpdated++
      }
    }

    const statPayload = {
      nomor_punggung: row.nomor,
      jumlah_laga: row.jumlah_laga,
      jumlah_menit_bermain: row.jumlah_menit_bermain,
      gol: row.jumlah_gol,
      assist: row.jumlah_assist,
      kartu_kuning: row.kartu_kuning,
      kartu_merah: row.kartu_merah
    }

    const existingStat = await apiRetry(`/items/player_season_stats?filter[player][_eq]=${playerId}&filter[season][_eq]=${season.id}`)
    if (existingStat.data.length === 0) {
      await apiRetry('/items/player_season_stats', {
        method: 'POST',
        body: JSON.stringify({ player: playerId, season: season.id, ...statPayload })
      })
      console.log(`  + stats: ${row.nama} — ${row.jumlah_laga} laga, ${row.jumlah_gol} gol, ${row.jumlah_assist} assist, ${row.jumlah_menit_bermain}'`)
      statsCreated++
    } else {
      await apiRetry(`/items/player_season_stats/${existingStat.data[0].id}`, { method: 'PATCH', body: JSON.stringify(statPayload) })
      console.log(`  ~ stats updated: ${row.nama}`)
      statsUpdated++
    }
  }

  console.log(`\nDone. Players created: ${playersCreated}, posisi updated: ${posisiUpdated}, stats created: ${statsCreated}, stats updated: ${statsUpdated}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
