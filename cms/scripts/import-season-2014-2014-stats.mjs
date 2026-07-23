// One-off import: player_season_stats for Indonesia Super League 2014 (single-year
// championship series format), sourced from a squad stats table (tabel.html at repo
// root, Transfermarkt-style export). Creates any player missing from the `players`
// collection, backfills `posisi` from this data, and upserts one player_season_stats
// row per player for the 2014 season. Sibling of import-season-2017-2018-stats.mjs.
// Run with: node cms/scripts/import-season-2014-2014-stats.mjs

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
  'Depan-Tengah': 'Penyerang Tengah',
  'Penyerang': 'Penyerang Tengah' // no left/right/center qualifier in this era's table; treat as center-forward
}

// Rows where the source's display name doesn't slug-match an already-seeded
// player, but is confirmed the same person under a shortened name.
const slugAliases = new Map()

const rows = [
  { nomor: 1, nama: 'Muhammad Natshir', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 12, nama: 'Shahar Ginanjar', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 90 },
  { nomor: 78, nama: 'Made Wirawan', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 27, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 2430 },
  { nomor: 16, nama: 'Achmad Jufriyanto', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 27, jumlah_gol: 2, jumlah_assist: 0, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 2430 },
  { nomor: 3, nama: 'Vladimir Vujović', posisi: 'Bek-Tengah', negara: ['Montenegro'], jumlah_laga: 27, jumlah_gol: 6, jumlah_assist: 0, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 2421 },
  { nomor: 18, nama: 'Jajang Sukmara', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 8, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 214 },
  { nomor: 22, nama: 'Supardi', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 28, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 2520 },
  { nomor: 28, nama: 'Abdul Rahman', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 12, jumlah_gol: 1, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 384 },
  { nomor: 10, nama: 'Makan Konate', posisi: 'Gel. Serang', negara: ['Mali'], jumlah_laga: 28, jumlah_gol: 13, jumlah_assist: 0, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 2482 },
  { nomor: 8, nama: 'Muhammad Taufiq', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 25, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 1809 },
  { nomor: 24, nama: 'Hariono', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 22, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 1654 },
  { nomor: 6, nama: 'Tony Sucipto', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 25, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 2221 },
  { nomor: 13, nama: 'Agung Pribadi', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 8, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 151 },
  { nomor: 15, nama: 'Firman Utina', posisi: 'Gel. Serang', negara: ['Indonesia'], jumlah_laga: 27, jumlah_gol: 3, jumlah_assist: 1, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 2087 },
  { nomor: 11, nama: 'Rudiyana', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 3, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 33 },
  { nomor: 7, nama: 'Atep', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 28, jumlah_gol: 6, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 976 },
  { nomor: 17, nama: 'Ferdinan Sinaga', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 23, jumlah_gol: 11, jumlah_assist: 0, kartu_kuning: 6, kartu_merah: 1, jumlah_menit_bermain: 1758 },
  { nomor: 23, nama: 'Muhammad Ridwan', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 18, jumlah_gol: 2, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 1383 },
  { nomor: 82, nama: 'Tantan', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 26, jumlah_gol: 2, jumlah_assist: 0, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 1617 },
  { nomor: 19, nama: 'Sigit Hermawan', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 21, nama: 'Djibril Coulibaly', posisi: 'Penyerang', negara: ['Mali'], jumlah_laga: 21, jumlah_gol: 8, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 1096 }
]

async function main() {
  await login()

  const seasons = await apiRetry('/items/seasons?filter[tahun_mulai][_eq]=2014&filter[tahun_selesai][_eq]=2014&limit=1')
  const season = seasons.data[0]
  if (!season) throw new Error('Season 2014 not found in seasons collection')
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
