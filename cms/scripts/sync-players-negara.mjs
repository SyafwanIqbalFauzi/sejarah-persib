// One-off sync: check/update `negara` (and create missing) players from a user-supplied
// country-grouped list. Merges duplicate name entries (a player can appear under more
// than one country heading, e.g. naturalized players) before diffing against Directus.
// Run with: node cms/scripts/sync-players-negara.mjs

import { api, login } from './lib/directus-client.mjs'

function toSlug(nama) {
  return nama
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// [nama, negara[]] — as transcribed from the user-provided list, one entry per
// heading occurrence (duplicates across headings merged below).
const raw = [
  // #Indonesia
  ['Adam Alis', ['Indonesia']], ['Adeng Hudaya', ['Indonesia']], ['Sobur', ['Indonesia']],
  ['Boyke Adam', ['Indonesia']], ['Wowo Sunaryo', ['Indonesia']], ['Risnandar Soendoro', ['Indonesia']],
  ['Nandar Iskandar', ['Indonesia']], ['Dede Iskandar', ['Indonesia']], ['Djajang Nurjaman', ['Indonesia']],
  ['Max Timisela', ['Indonesia']], ['Heri Kiswanto', ['Indonesia']], ['Dadang Kurnia', ['Indonesia']],
  ['Ajat Sudrajat', ['Indonesia']], ['Robby Darwis', ['Indonesia']], ['Sutiono Lamso', ['Indonesia']],
  ['Anwar Sanusi', ['Indonesia']], ['Budiman Yunus', ['Indonesia']], ['Yadi Mulyadi', ['Indonesia']],
  ['Kekey Zakaria', ['Indonesia']], ["Nur'alim", ['Indonesia']], ['Yaris Riyadi', ['Indonesia']],
  ['Yudi Guntara', ['Indonesia']], ['Rahmad Hidayat', ['Indonesia']], ['Maman Abdurrahman', ['Indonesia']],
  ['Suwita Pata', ['Indonesia']], ['Firman Utina', ['Indonesia']], ['Achmad Jufriyanto', ['Indonesia']],
  ['Muhammad Taufiq', ['Indonesia']], ['Dias Angga Putra', ['Indonesia']], ['Muhammad Ridwan', ['Indonesia']],
  ['Ferdinand Sinaga', ['Indonesia']], ['Zulham Zamrun', ['Indonesia']], ['Aang Suparman', ['Indonesia']],
  ['Markus Haris Maulana', ['Indonesia']], ['Asri Akbar', ['Indonesia']], ['Abdul Rahman Sulaeman', ['Indonesia']],
  ['Rudolof Yanto Basna', ['Indonesia']], ['Abdul Aziz', ['Indonesia']], ['David Laly', ['Indonesia']],
  ['Aliyudin', ['Indonesia']], ['Ricky Kayame', ['Indonesia']], ['Shahar Ginanjar', ['Indonesia']],
  ['Zaenal Arief', ['Indonesia']], ['Yandi Sofyan Munawar', ['Indonesia']], ['Tantan', ['Indonesia']],
  ['Hariono', ['Indonesia']], ['Atep', ['Indonesia']], ['Tony Sucipto', ['Indonesia']],
  ['Eka Ramdani', ['Indonesia']], ['Airlangga Sucipto', ['Indonesia']], ['Patrich Wanggai', ['Indonesia']],
  ['Raphael Maitimo', ['Indonesia']], ['Angga Febryanto', ['Indonesia']], ['Ahmad Baasith', ['Indonesia']],
  ['Jajang Sukmara', ['Indonesia']], ['Sergio van Dijk', ['Indonesia']], ['Wildansyah', ['Indonesia']],
  ['Erwin Ramdani', ['Indonesia']], ['Frets Butuan', ['Indonesia']], ['Fitrul Dwi Rustapa', ['Indonesia']],
  ['Arsan Makarin', ['Indonesia']], ['Sheva Sanggasi', ['Indonesia']], ['Dimas Drajad', ['Indonesia']],
  ['Zulkifli Lukmansyah', ['Indonesia']], ['Ahmad Agung', ['Indonesia']], ['Saddil Ramdani', ['Indonesia']],
  ['Al Hamra Hehanussa', ['Indonesia']], ['Rezaldi Hehanussa', ['Indonesia']], ['Alfeandra Dewangga', ['Indonesia']],
  ['Ikhwan Tanamal', ['Indonesia']], ['Fitrah Maulana', ['Indonesia']], ['Nazriel Alfaro', ['Indonesia']],
  ['Rakha Bilhuda', ['Indonesia']], ['Athaya Zahran', ['Indonesia']], ['Henhen Herdiana', ['Indonesia']],
  ['Zalnando', ['Indonesia']], ['Adzikry Fadlillah', ['Indonesia']], ['Faris Abdul', ['Indonesia']],

  ['Fabiano Beltrame', ['Brasil', 'Indonesia']],
  ['Cristian González', ['Uruguay', 'Indonesia']],

  // #Pemain Brazil
  ['Amarildo Souza', ['Brasil']], ['Ulian de Souza', ['Brasil']], ["Antonio 'Toyo' Claudio", ['Brasil']],
  ['Fábio Lopes Alcântara', ['Brasil']], ['Hilton Moreira', ['Brasil']], ['Marcio Souza Da Silva', ['Brasil']],
  ['Rafael Alves Bastos', ['Brasil']], ['David da Silva', ['Brasil']], ['Ciro Alves', ['Brasil']],
  ['Gustavo França', ['Brasil']], ['Wiliam Marcílio', ['Brasil']], ['Júlio César', ['Brasil']],
  ['Berguinho', ['Brasil']], ['Uilliam Barros', ['Brasil']], ['Ramon Tanque', ['Brasil']],
  ['William Marcilio', ['Brasil']],

  // #Chili (Chile)
  ['Rodrigo Sanhueza', ['Chile']], ['Angelo Espinoza', ['Chile']], ['Claudio Lizzama', ['Chile']],
  ['Alejandro Tobar', ['Chile']], ['Rodrigo Lemunao', ['Chile']], ['Julio Lopez', ['Chile']],
  ['Christian Mollina', ['Chile']], ['Patricio Jimenez Diaz', ['Chile']],

  // #Paraguay
  ['Lorenzo Cabanas', ['Paraguay']], ['Christian Rene Martinez', ['Paraguay']],

  // #Uruguay
  ['Adrián Colombo', ['Uruguay']],

  ['Esteban Vizcarra', ['Argentina', 'Indonesia']],

  // #Argentina
  ['Robertino Pugliara', ['Argentina']], ['Marcos Flores', ['Argentina']], ['Jonathan Bauman', ['Argentina']],
  ['Luciano Guaycochea', ['Argentina']], ['Mariano Peralta', ['Argentina']],

  ['Gervane Kastaneer', ['Curaçao']],

  ['Herman Dzumafo Epandi', ['Kamerun', 'Indonesia']],

  // #Kamerun
  ['Christian Bekamenga', ['Kamerun']], ['George Clement Nyeck Nyobe', ['Kamerun']], ['Louis Berty Ayock', ['Kamerun']],
  ['Herman Abanda', ['Kamerun']], ['Georges Parfait Mbida Messi', ['Kamerun']], ['David Pagbe', ['Kamerun']],

  // #Ghana
  ['Michael Essien', ['Ghana']], ['Moses Sakyi', ['Ghana']],

  ["Ezechiel N'Douassel", ['Chad']],
  ['Brahima Traoré', ['Burkina Faso']],

  // #Nigeria
  ['Ekene Ikenwa', ['Nigeria']], ['Chioma Kingsley', ['Nigeria']],
  ['Victor Igbonefo', ['Nigeria', 'Indonesia']],

  ['Redouane Barkaoui', ['Maroko']],

  // #Mali
  ['Makan Konaté', ['Mali']], ['Djibril Coulibaly', ['Mali']],

  ['Erick Weeks Lewis', ['Liberia']],
  ['Lévy Madinda', ['Gabon']],
  ['Mailson Lima', ['Tanjung Verde']],

  // #Singapura
  ['Noh Alam Shah', ['Singapura']], ['Shahril Ishak', ['Singapura']], ['Baihakki Khaizan', ['Singapura']],

  // #Thailand
  ['Nipont Chanarwut', ['Thailand']], ['Pradith Taweechai', ['Thailand']], ['Suchao Nuchnum', ['Thailand']],
  ['Sinthaweechai Hathairattanakool', ['Thailand']],

  // #Jepang
  ['Satoshi Otomo', ['Jepang']], ['Shohei Matsunaga', ['Jepang']], ['Kenji Adachihara', ['Jepang']],
  ['Gakuto Notsuda', ['Jepang']],

  ['Oh In-kyun', ['Korea Selatan']],
  ['Naser Al Sebai', ['Suriah']],
  ['Mohammed Rashid', ['Palestina']],

  // #Australia
  ['Robbie Gaspar', ['Australia']], ['Diogo Ferreira', ['Australia']],

  ['Artur Gevorkyan', ['Turkmenistan']],

  // #Filipina
  ['Omid Nazari', ['Filipina']], ['Daisuke Sato', ['Filipina']], ['Kevin Ray Mendoza', ['Filipina']],

  ['Frans Putros', ['Irak', 'Denmark']],

  // #Polandia
  ['Maciej Dołęga', ['Polandia']], ['Mariusz Mucharski', ['Polandia']], ['Piotr Orlinski', ['Polandia']],
  ['Pavel Bocjian', ['Polandia']],

  ['Leontin Chitescu', ['Rumania']],
  ['Ilija Spasojević', ['Montenegro', 'Indonesia']],

  // #Montenegro
  ['Miljan Radović', ['Montenegro']], ['Vladimir Vujović', ['Montenegro']], ['Zdravko Dragićević', ['Montenegro']],
  ['Srđan Lopičić', ['Montenegro']], ['Balsa Sekulic', ['Montenegro']],

  // #Belanda & Indonesia
  ['Sergio van Dijk', ['Belanda', 'Indonesia']], ['Raphael Maitimo', ['Belanda', 'Indonesia']],
  ['Ezra Walian', ['Belanda', 'Indonesia']], ['Marc Klok', ['Belanda', 'Indonesia']],
  ['Thom Haye', ['Belanda', 'Indonesia']], ['Eliano Reijnders', ['Belanda', 'Indonesia']],
  ['Ragnar Oratmangoen', ['Belanda', 'Indonesia']], ['Dion Markx', ['Belanda', 'Indonesia']],

  ['Sandy Walsh', ['Belgia', 'Indonesia']],
  ['Kim Jeffrey Kurniawan', ['Jerman', 'Indonesia']],

  // #Belanda
  ['Nick Kuipers', ['Belanda']], ['Kevin Van Kippersluis', ['Belanda']],

  // #Serbia
  ['Marko Krasić', ['Serbia']], ['Bojan Mališić', ['Serbia']],

  // #Spanyol
  ['Juan Belencoso', ['Spanyol']], ['Alberto Rodríguez', ['Spanyol']], ['Tyronne del Pino', ['Spanyol']],
  ['Sergio Castel', ['Spanyol']],

  ['Carlton Cole', ['Inggris']],
  ['Adam Przybek', ['Wales']],
  ['Rene Mihelič', ['Slovenia']],

  // #Italia
  ['Stefano Beltrame', ['Italia']], ['Federico Barba', ['Italia']],

  ['Mateo Kocijan', ['Kroasia']],
  ['Luka Menalo', ['Kroasia', 'Bosnia-Herzegovina']],

  // #Prancis
  ['Andrew Jung', ['Prancis']], ['Layvin Kurzawa', ['Prancis']],

  ['Gabriel Mutombo', ['Prancis', 'Republik Demokratik Kongo']]
]

// Merge duplicate names (e.g. appearing under two country headings) into one
// entry with the union of countries. Also folds the "William Marcilio" /
// "Wiliam Marcílio" spelling variant into a single canonical entry.
const spellingAliases = new Map([['William Marcilio', 'Wiliam Marcílio']])

const merged = new Map()
for (const [nameRaw, negara] of raw) {
  const nama = spellingAliases.get(nameRaw) ?? nameRaw
  const key = toSlug(nama)
  if (!merged.has(key)) {
    merged.set(key, { nama, negara: new Set(negara) })
  } else {
    const entry = merged.get(key)
    for (const n of negara) entry.negara.add(n)
  }
}

function sameSet(a, b) {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  return sa.every((v, i) => v === sb[i])
}

async function main() {
  await login()

  let created = 0
  let updated = 0
  let unchanged = 0

  for (const [slug, { nama, negara }] of merged) {
    const negaraArr = [...negara]
    const existing = await api(`/items/players?filter[slug][_eq]=${encodeURIComponent(slug)}`)

    if (existing.data.length === 0) {
      await api('/items/players', {
        method: 'POST',
        body: JSON.stringify({ slug, nama, negara: negaraArr, status: 'published' })
      })
      console.log(`+ created ${slug} -> [${negaraArr.join(', ')}]`)
      created++
      continue
    }

    const player = existing.data[0]
    const currentNegara = player.negara ?? []
    if (sameSet(currentNegara, negaraArr)) {
      unchanged++
      continue
    }

    await api(`/items/players/${player.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ negara: negaraArr })
    })
    console.log(`~ updated ${slug}: [${currentNegara.join(', ')}] -> [${negaraArr.join(', ')}]`)
    updated++
  }

  console.log(`\nDone. Created: ${created}, updated: ${updated}, unchanged: ${unchanged}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
