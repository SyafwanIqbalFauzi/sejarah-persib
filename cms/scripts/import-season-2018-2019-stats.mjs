// One-off import: player_season_stats for GoJek Liga 1 2018/2019, sourced from a
// squad stats table (tabel.html at repo root, Transfermarkt-style export).
// Creates any player missing from the `players` collection, backfills `posisi`
// from this data, and upserts one player_season_stats row per player for the
// 2018/2019 season. Sibling of import-season-2019-2020-stats.mjs.
// Run with: node cms/scripts/import-season-2018-2019-stats.mjs

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
  { nomor: 30, nama: 'Aqil Savik', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 2, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 135 },
  { nomor: 1, nama: 'Muhammad Natshir', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 3, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 213 },
  { nomor: 78, nama: 'Made Wirawan', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 31, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 2710 },
  { nomor: 81, nama: 'Dhika Bayangkara', posisi: 'Kiper', negara: ['Indonesia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 2 },
  { nomor: 2, nama: 'Nick Kuipers', posisi: 'Bek-Tengah', negara: ['Belanda'], jumlah_laga: 17, jumlah_gol: 2, jumlah_assist: 1, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 1530 },
  { nomor: 12, nama: 'Henhen Herdiana', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 11, jumlah_gol: 0, jumlah_assist: 2, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 797 },
  { nomor: 3, nama: 'Ardi Idrus', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 31, jumlah_gol: 0, jumlah_assist: 4, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 2761 },
  { nomor: 17, nama: 'Zalnando', posisi: 'Bek-Kiri', negara: ['Indonesia'], jumlah_laga: 7, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 479 },
  { nomor: 15, nama: 'Fabiano Beltrame', posisi: 'Bek-Tengah', negara: ['Indonesia', 'Brasil'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 16, nama: 'Achmad Jufriyanto', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 26, jumlah_gol: 2, jumlah_assist: 1, kartu_kuning: 9, kartu_merah: 0, jumlah_menit_bermain: 2340 },
  { nomor: null, nama: 'Bojan Malisic', posisi: 'Bek-Tengah', negara: ['Serbia'], jumlah_laga: 14, jumlah_gol: 1, jumlah_assist: 1, kartu_kuning: 3, kartu_merah: 0, jumlah_menit_bermain: 1260 },
  { nomor: null, nama: 'Saepuloh Maulana', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 2, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 180 },
  { nomor: 19, nama: 'Indra Mustafa', posisi: 'Bek-Tengah', negara: ['Indonesia'], jumlah_laga: 6, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 530 },
  { nomor: 22, nama: 'Supardi', posisi: 'Bek-Kanan', negara: ['Indonesia'], jumlah_laga: 31, jumlah_gol: 0, jumlah_assist: 3, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 2778 },
  { nomor: 18, nama: 'Gian Zola', posisi: 'Gel. Serang', negara: ['Indonesia'], jumlah_laga: 3, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 151 },
  { nomor: 11, nama: 'Dedi Kusnandar', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 18, jumlah_gol: 0, jumlah_assist: 2, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 1048 },
  { nomor: 8, nama: 'Abdul Aziz', posisi: 'Gel. Tengah', negara: ['Indonesia'], jumlah_laga: 25, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 1289 },
  { nomor: 23, nama: 'Kim Kurniawan', posisi: 'Gel. Tengah', negara: ['Indonesia', 'Jerman'], jumlah_laga: 19, jumlah_gol: 2, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 790 },
  { nomor: 24, nama: 'Hariono', posisi: 'Gel. Bertahan', negara: ['Indonesia'], jumlah_laga: 20, jumlah_gol: 1, jumlah_assist: 1, kartu_kuning: 4, kartu_merah: 0, jumlah_menit_bermain: 1374 },
  { nomor: null, nama: 'Rene Mihelic', posisi: 'Gel. Serang', negara: ['Slovenia'], jumlah_laga: 10, jumlah_gol: 0, jumlah_assist: 1, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 900 },
  { nomor: null, nama: 'Srdjan Lopicic', posisi: 'Gel. Serang', negara: ['Montenegro'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: 91, nama: 'Omid Nazari', posisi: 'Gel. Tengah', negara: ['Iran', 'Filipina'], jumlah_laga: 17, jumlah_gol: 1, jumlah_assist: 3, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 1521 },
  { nomor: 7, nama: 'Beckham Putra', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 4, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 85 },
  { nomor: 21, nama: 'Frets Butuan', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 16, jumlah_gol: 3, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 978 },
  { nomor: null, nama: 'Wildan Ramdhani', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 1 },
  { nomor: 13, nama: 'Febri Hariyadi', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 28, jumlah_gol: 9, jumlah_assist: 8, kartu_kuning: 5, kartu_merah: 0, jumlah_menit_bermain: 2332 },
  { nomor: 10, nama: 'Ezechiel Ndouasel', posisi: 'Depan-Tengah', negara: ['Chad'], jumlah_laga: 26, jumlah_gol: 15, jumlah_assist: 6, kartu_kuning: 9, kartu_merah: 0, jumlah_menit_bermain: 2208 },
  { nomor: 9, nama: 'Esteban Vizcarra', posisi: 'Sayap Kiri', negara: ['Indonesia', 'Argentina'], jumlah_laga: 26, jumlah_gol: 3, jumlah_assist: 1, kartu_kuning: 6, kartu_merah: 0, jumlah_menit_bermain: 1817 },
  { nomor: null, nama: 'Artur Gevorkyan', posisi: 'Sayap Kanan', negara: ['Turkmenistan', 'Armenia'], jumlah_laga: 9, jumlah_gol: 3, jumlah_assist: 0, kartu_kuning: 1, kartu_merah: 0, jumlah_menit_bermain: 519 },
  { nomor: null, nama: 'Muchlis Hadi', posisi: 'Depan-Tengah', negara: ['Indonesia'], jumlah_laga: 0, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 0 },
  { nomor: null, nama: 'Agung Mulyadi', posisi: 'Sayap Kanan', negara: ['Indonesia'], jumlah_laga: 2, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 19 },
  { nomor: 20, nama: 'Kevin van Kippersluis', posisi: 'Sayap Kiri', negara: ['Belanda'], jumlah_laga: 15, jumlah_gol: 2, jumlah_assist: 1, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 1105 },
  { nomor: 25, nama: 'Julius Josel', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 1, jumlah_gol: 0, jumlah_assist: 0, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 1 },
  { nomor: 77, nama: 'Ghozali Siregar', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 25, jumlah_gol: 4, jumlah_assist: 2, kartu_kuning: 0, kartu_merah: 0, jumlah_menit_bermain: 1541 },
  { nomor: 93, nama: 'Erwin Ramdani', posisi: 'Sayap Kiri', negara: ['Indonesia'], jumlah_laga: 17, jumlah_gol: 1, jumlah_assist: 1, kartu_kuning: 2, kartu_merah: 0, jumlah_menit_bermain: 273 }
]

async function main() {
  await login()

  const seasons = await apiRetry('/items/seasons?filter[tahun_mulai][_eq]=2018&filter[tahun_selesai][_eq]=2019&limit=1')
  const season = seasons.data[0]
  if (!season) throw new Error('Season 2018/2019 not found in seasons collection')
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
