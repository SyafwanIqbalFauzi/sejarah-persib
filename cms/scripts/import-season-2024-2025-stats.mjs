// One-off import: player_season_stats for BRI Liga 1 2024/2025, sourced from a
// squad stats table (tabel.html at repo root, Transfermarkt-style export).
// Creates any player missing from the `players` collection, backfills `posisi`
// from this data, and upserts one player_season_stats row per player for the
// 2024/2025 season. Sibling of import-season-2025-2026-stats.mjs.
// Run with: node cms/scripts/import-season-2024-2025-stats.mjs

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
// player, but is confirmed the same person under a shortened name — NOT a
// same-surname coincidence. "Ryan Kurnia" was fuzzy-matched to the unrelated
// legacy player "Dadang Kurnia" by surname alone and is deliberately NOT
// aliased here — he gets his own new player record instead.
const slugAliases = new Map([
  ['Tyronne', 'tyronne-del-pino'] // Transfermarkt shortens "Tyronne del Pino" to "Tyronne"
])

const rows = [
  { nomor: 1, nama: 'Kevin Ray Mendoza', posisi: 'Kiper', negara: ['Filipina', 'Denmark'], jumlah_laga: 27, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 2417 },
  { nomor: 14, nama: 'Teja Paku Alam', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 7, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 630 },
  { nomor: 50, nama: 'Fitrah Maulana', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 99, nama: 'Sheva Sanggasi', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 13 },
  { nomor: 4, nama: 'Gustavo França', posisi: 'Bek-Tengah', negara: ['Brasil'], jumlah_laga: 30, jumlah_gol: 6, jumlah_assist: 2, kartu_kuning: 9, kartu_merah: 0, jumlah_menit_bermain: 2607 },
  { nomor: 5, nama: 'Kakang Rudianto', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 25, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2023 },
  { nomor: 97, nama: 'Edo Febriansyah', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 31, jumlah_gol: 1, jumlah_assist: 1, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2574 },
  { nomor: 2, nama: 'Nick Kuipers', posisi: 'Bek-Tengah', negara: ['Belanda'], jumlah_laga: 30, jumlah_gol: 3, jumlah_assist: 1, kartu_kuning: 7, kartu_merah: 0, jumlah_menit_bermain: 2583 },
  { nomor: 12, nama: 'Henhen Herdiana', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 21, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 1056 },
  { nomor: 56, nama: 'Rezaldi Hehanussa', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 56 },
  { nomor: 27, nama: 'Zalnando', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 13, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 355 },
  { nomor: 16, nama: 'Achmad Jufriyanto', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 3, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 3 },
  { nomor: null, nama: 'Faris Abdul', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 32, nama: 'Victor Igbonefo', posisi: 'Bek-Tengah', negara: ['Indonesia', 'Nigeria'], jumlah_laga: 7, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 186 },
  { nomor: null, nama: 'Kevin Pasha', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 73, nama: 'Zulkifli Lukmansyah', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 23, nama: 'Marc Klok', posisi: 'Gel. Tengah', negara: ['Indonesia', 'Belanda'], jumlah_laga: 28, jumlah_gol: 1, jumlah_assist: 7, kartu_kuning: 5, kartu_merah: 1, jumlah_menit_bermain: 2258 },
  { nomor: 18, nama: 'Adam Alis', posisi: 'Gel. Tengah', negara: ['Indonesia'], jumlah_laga: 33, jumlah_gol: 2, jumlah_assist: 3, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 1920 },
  { nomor: null, nama: 'Rachmat Irianto', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 12, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 654 },
  { nomor: 6, nama: 'Robi Darwis', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 17, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 713 },
  { nomor: 10, nama: 'Tyronne', posisi: 'Gel. Serang', negara: ['Spanyol'], jumlah_laga: 31, jumlah_gol: 18, jumlah_assist: 8, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2544 },
  { nomor: null, nama: 'Ahmad Agung', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 7, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 64 },
  { nomor: 11, nama: 'Dedi Kusnandar', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 14, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 888 },
  { nomor: 71, nama: 'Adzikry Fadlillah', posisi: 'Gel. Serang', negara: ['Indonesia'], jumlah_laga: 4, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 24 },
  { nomor: null, nama: 'Nazriel Alfaro', posisi: 'Gel. Tengah', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 17, nama: 'Mateo Kocijan', posisi: 'Gel. Bertahan', negara: ['Kroasia'], jumlah_laga: 28, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 6, kartu_merah: 0, jumlah_menit_bermain: 1665 },
  { nomor: 7, nama: 'Beckham Putra', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 29, jumlah_gol: 6, jumlah_assist: 3, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 1829 },
  { nomor: 8, nama: 'Gervane Kastaneer', posisi: 'Depan-Tengah', negara: ['Curaçao', 'Belanda'], jumlah_laga: 14, jumlah_gol: 1, jumlah_assist: 1, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 642 },
  { nomor: 94, nama: 'Mailson Lima', posisi: 'Sayap Kiri', negara: ['Tanjung Verde', 'Belanda'], jumlah_laga: 13, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 428 },
  { nomor: 77, nama: 'Ciro Alves', posisi: 'Sayap Kanan', negara: ['Brasil'], jumlah_laga: 30, jumlah_gol: 6, jumlah_assist: 13, kartu_kuning: 2, kartu_merah: 1, jumlah_menit_bermain: 2577 },
  { nomor: 9, nama: 'Dimas Drajad', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 14, jumlah_gol: 2, jumlah_assist: 2, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 676 },
  { nomor: 96, nama: 'Ryan Kurnia', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 26, jumlah_gol: 3, jumlah_assist: 0, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 719 },
  { nomor: null, nama: 'David da Silva', posisi: 'Depan-Tengah', negara: ['Brasil'], jumlah_laga: 21, jumlah_gol: 8, jumlah_assist: 2, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 1306 },
  { nomor: 13, nama: 'Febri Hariyadi', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 4, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 51 },
  { nomor: 37, nama: 'Ferdiansyah', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 7, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 106 }
]

async function main() {
  await login()

  const seasons = await apiRetry('/items/seasons?filter[tahun_mulai][_eq]=2024&filter[tahun_selesai][_eq]=2025&limit=1')
  const season = seasons.data[0]
  if (!season) throw new Error('Season 2024/2025 not found in seasons collection')
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
