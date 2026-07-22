// One-off import: player_season_stats for Liga 2025/2026, sourced from a squad
// stats table (tabel.html at repo root, Transfermarkt-style export). Creates any
// player missing from the `players` collection, backfills `posisi` from this
// data (many existing records had posisi left null), and upserts one
// player_season_stats row per player for the 2025/2026 season.
// Run with: node cms/scripts/import-season-2025-2026-stats.mjs

import { api, login } from './lib/directus-client.mjs'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Directus dev instance occasionally drops its pg connection under rapid writes
// ("ROLLBACK - Client has encountered a connection error"); retry with backoff
// rather than aborting the whole import over a transient hiccup.
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
// player, but is confirmed (manually, via fuzzy match + review) to be the same
// person under a different name — NOT a same-surname coincidence.
// "Robi Darwis" (current squad, gelandang) and "Beckham Putra" (current squad,
// sayap) were fuzzy-matched to unrelated legacy players (Robby Darwis the
// 1985-97 defender, Dias Angga Putra) by surname alone and are deliberately
// NOT aliased here — they get their own new player record instead.
const slugAliases = new Map([
  ['Uilliam', 'uilliam-barros'], // Transfermarkt shortens "Uilliam Barros" to "Uilliam"
  ['Hamra Hehanussa', 'al-hamra-hehanussa'] // same person as the already-seeded "Al Hamra Hehanussa"
])

const rows = [
  { nomor: 14, nama: 'Teja Paku Alam', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 31, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 2790 },
  { nomor: 1, nama: 'Adam Przybek', posisi: 'Kiper', negara: ['Inggris', 'Polandia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 90 },
  { nomor: 81, nama: 'Fitrah Maulana', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 2, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 180 },
  { nomor: 78, nama: 'Made Wirawan', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 60, nama: 'Rhaka Syafaka', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 3, nama: 'Layvin Kurzawa', posisi: 'Bek-Kiri', negara: ['Prancis', 'Guadeloupe'], jumlah_laga: 7, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 106 },
  { nomor: 93, nama: 'Federico Barba', posisi: 'Bek-Tengah', negara: ['Italia'], jumlah_laga: 28, jumlah_gol: 5, jumlah_assist: 1, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2197 },
  { nomor: 48, nama: 'Patricio Matricardi', posisi: 'Bek-Tengah', negara: ['Argentina'], jumlah_laga: 31, jumlah_gol: 2, jumlah_assist: 3, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2637 },
  { nomor: 55, nama: 'Frans Putros', posisi: 'Bek-Tengah', negara: ['Irak', 'Denmark'], jumlah_laga: 28, jumlah_gol: 1, jumlah_assist: 2, kartu_kuning: 7, kartu_merah: 1, jumlah_menit_bermain: 2128 },
  { nomor: 4, nama: 'Júlio César', posisi: 'Bek-Tengah', negara: ['Brasil', 'Portugal'], jumlah_laga: 26, jumlah_gol: 1, jumlah_assist: 0, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 1511 },
  { nomor: 5, nama: 'Kakang Rudianto', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 28, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 1903 },
  { nomor: null, nama: 'Hamra Hehanussa', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: null, nama: 'Henhen Herdiana', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 45 },
  { nomor: null, nama: 'Rezaldi Hehanussa', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 23 },
  { nomor: null, nama: 'Zalnando', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 16, nama: 'Achmad Jufriyanto', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 44, nama: 'Dion Markx', posisi: 'Bek-Tengah', negara: ['Indonesia', 'Belanda'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 3 },
  { nomor: 66, nama: 'Kevin Pasha', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 73, nama: 'Zulkifli Lukmansyah', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 33, nama: 'Thom Haye', posisi: 'Gel. Bertahan', negara: ['Indonesia', 'Belanda'], jumlah_laga: 28, jumlah_gol: 5, jumlah_assist: 5, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 2110 },
  { nomor: 23, nama: 'Marc Klok', posisi: 'Gel. Tengah', negara: ['Indonesia', 'Belanda'], jumlah_laga: 25, jumlah_gol: 0, jumlah_assist: 2, kartu_kuning: 7, kartu_merah: 0, jumlah_menit_bermain: 1641 },
  { nomor: 97, nama: 'Berguinho', posisi: 'Gel. Serang', negara: ['Brasil'], jumlah_laga: 29, jumlah_gol: 2, jumlah_assist: 10, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 2040 },
  { nomor: 18, nama: 'Adam Alis', posisi: 'Gel. Tengah', negara: ['Indonesia'], jumlah_laga: 28, jumlah_gol: 4, jumlah_assist: 3, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 1496 },
  { nomor: null, nama: 'Wiliam Marcilio', posisi: 'Gel. Serang', negara: ['Brasil'], jumlah_laga: 7, jumlah_gol: 0, jumlah_assist: 2, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 328 },
  { nomor: 8, nama: 'Luciano Guaycochea', posisi: 'Gel. Serang', negara: ['Argentina'], jumlah_laga: 26, jumlah_gol: 5, jumlah_assist: 2, kartu_kuning: 4, kartu_merah: 1, jumlah_menit_bermain: 1685 },
  { nomor: 19, nama: 'Alfeandra Dewangga', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 9, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 547 },
  { nomor: 6, nama: 'Robi Darwis', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 16, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 146 },
  { nomor: 11, nama: 'Dedi Kusnandar', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 2, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 11 },
  { nomor: null, nama: 'Abdul Aziz', posisi: 'Gel. Tengah', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 85, nama: 'Nazriel Alfaro', posisi: 'Gel. Tengah', negara: ['Indonesia'], jumlah_laga: 3, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 13 },
  { nomor: 2, nama: 'Eliano Reijnders', posisi: 'Sayap Kanan', negara: ['Indonesia', 'Belanda'], jumlah_laga: 28, jumlah_gol: 0, jumlah_assist: 3, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2300 },
  { nomor: 90, nama: 'Andrew Jung', posisi: 'Depan-Tengah', negara: ['Prancis'], jumlah_laga: 25, jumlah_gol: 11, jumlah_assist: 2, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 1318 },
  { nomor: 7, nama: 'Beckham Putra', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 31, jumlah_gol: 3, jumlah_assist: 3, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 1539 },
  { nomor: 17, nama: 'Sergio Castel', posisi: 'Depan-Tengah', negara: ['Spanyol'], jumlah_laga: 6, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 90 },
  { nomor: 67, nama: 'Saddil Ramdani', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 25, jumlah_gol: 3, jumlah_assist: 1, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 801 },
  { nomor: 94, nama: 'Uilliam', posisi: 'Depan-Tengah', negara: ['Brasil'], jumlah_laga: 33, jumlah_gol: 8, jumlah_assist: 2, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2450 },
  { nomor: 98, nama: 'Ramon Tanque', posisi: 'Depan-Tengah', negara: ['Brasil'], jumlah_laga: 28, jumlah_gol: 8, jumlah_assist: 2, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 1279 },
  { nomor: null, nama: 'Dimas Drajad', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 1 },
  { nomor: null, nama: 'Febri Hariyadi', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 8, jumlah_gol: 1, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 137 },
  { nomor: 36, nama: 'Athaya Zahran', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 }
]

async function main() {
  await login()

  const seasons = await apiRetry('/items/seasons?filter[tahun_mulai][_eq]=2025&filter[tahun_selesai][_eq]=2026&limit=1')
  const season = seasons.data[0]
  if (!season) throw new Error('Season 2025/2026 not found in seasons collection')
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
