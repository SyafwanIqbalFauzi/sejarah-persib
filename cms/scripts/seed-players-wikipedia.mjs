// Seed data — nama & negara pemain lokal/asing yang pernah membela Persib Bandung,
// diriset dari https://id.wikipedia.org/wiki/Persib_Bandung (section "Daftar pemain
// lokal dan pemain asing"). Tahun aktif & posisi TIDAK tersedia di sumber ini, jadi
// kolom tersebut dibiarkan kosong — bisa dilengkapi manual nanti di Directus.
// Run with: node cms/scripts/seed-players-wikipedia.mjs

import { api, login } from './lib/directus-client.mjs'

function toSlug(nama) {
  return nama
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// Pemain lokal (semua berkewarganegaraan Indonesia).
// Robby Darwis & Atep sengaja tidak dimasukkan lagi karena sudah ada di collection.
const localPlayers = [
  'Adeng Hudaya', 'Sobur', 'Boyke Adam', 'Wowo Sunaryo', 'Risnandar Soendoro',
  'Nandar Iskandar', 'Dede Iskandar', 'Djajang Nurjaman', 'Max Timisela', 'Heri Kiswanto',
  'Dadang Kurnia', 'Ajat Sudrajat', 'Sutiono Lamso', 'Anwar Sanusi', 'Budiman Yunus',
  'Yadi Mulyadi', 'Kekey Zakaria', "Nur'alim", 'Yaris Riyadi', 'Yudi Guntara',
  'Rahmad Hidayat', 'Maman Abdurrahman', 'Suwita Pata', 'Firman Utina', 'Achmad Jufriyanto',
  'Muhammad Taufiq', 'Dias Angga Putra', 'Muhammad Ridwan', 'Ferdinand Sinaga', 'Zulham Zamrun',
  'Aang Suparman', 'Markus Haris Maulana', 'Asri Akbar', 'Abdul Rahman Sulaeman', 'Rudolof Yanto Basna',
  'David Laly', 'Aliyudin', 'Ricky Kayame', 'Shahar Ginanjar', 'Zaenal Arief',
  'Yandi Sofyan Munawar', 'Tantan', 'Hariono', 'Tony Sucipto', 'Eka Ramdani',
  'Airlangga Sucipto', 'Patrich Wanggai', 'Angga Febryanto', 'Ahmad Baasith', 'Jajang Sukmara',
  'Wildansyah', 'Erwin Ramdani', 'Frets Butuan', 'Fitrul Dwi Rustapa', 'Arsan Makarin',
  'Sheva Sanggasi', 'Dimas Drajad', 'Zulkifli Lukmansyah', 'Ahmad Agung', 'Saddil Ramdani',
  'Al Hamra Hehanussa', 'Alfeandra Dewangga', 'Ikhwan Tanamal', 'Fitrah Maulana', 'Nazriel Alfaro',
  'Rakha Bilhuda', 'Athaya Zahran'
].map((nama) => ({ nama, negara: ['Indonesia'] }))

// Pemain asing (termasuk yang naturalisasi WNI, ditandai dua negara).
const foreignPlayers = [
  ['Amarildo Souza', ['Brasil']],
  ['Ulian de Souza', ['Brasil']],
  ["Antonio 'Toyo' Claudio", ['Brasil']],
  ['Fábio Lopes Alcântara', ['Brasil']],
  ['Hilton Moreira', ['Brasil']],
  ['Marcio Souza Da Silva', ['Brasil']],
  ['Rafael Alves Bastos', ['Brasil']],
  ['Fabiano Beltrame', ['Brasil', 'Indonesia']],
  ['David da Silva', ['Brasil']],
  ['Ciro Alves', ['Brasil']],
  ['Gustavo França', ['Brasil']],
  ['Wiliam Marcílio', ['Brasil']],
  ['Júlio César', ['Brasil']],
  ['Berguinho', ['Brasil']],
  ['Uilliam Barros', ['Brasil']],
  ['Ramon Tanque', ['Brasil']],
  ['Rodrigo Sanhueza', ['Chile']],
  ['Angelo Espinoza', ['Chile']],
  ['Claudio Lizzama', ['Chile']],
  ['Alejandro Tobar', ['Chile']],
  ['Rodrigo Lemunao', ['Chile']],
  ['Julio Lopez', ['Chile']],
  ['Christian Mollina', ['Chile']],
  ['Patricio Jimenez Diaz', ['Chile']],
  ['Lorenzo Cabanas', ['Paraguay']],
  ['Christian Rene Martinez', ['Paraguay']],
  ['Cristian González', ['Uruguay', 'Indonesia']],
  ['Adrián Colombo', ['Uruguay']],
  ['Robertino Pugliara', ['Argentina']],
  ['Marcos Flores', ['Argentina']],
  ['Jonathan Bauman', ['Argentina']],
  ['Luciano Guaycochea', ['Argentina']],
  ['Gervane Kastaneer', ['Curaçao']],
  ['Christian Bekamenga', ['Kamerun']],
  ['George Clement Nyeck Nyobe', ['Kamerun']],
  ['Louis Berty Ayock', ['Kamerun']],
  ['Herman Abanda', ['Kamerun']],
  ['Herman Dzumafo Epandi', ['Kamerun', 'Indonesia']],
  ['Georges Parfait Mbida Messi', ['Kamerun']],
  ['David Pagbe', ['Kamerun']],
  ['Michael Essien', ['Ghana']],
  ['Moses Sakyi', ['Ghana']],
  ["Ezechiel N'Douassel", ['Chad']],
  ['Brahima Traoré', ['Burkina Faso']],
  ['Ekene Ikenwa', ['Nigeria']],
  ['Chioma Kingsley', ['Nigeria']],
  ['Victor Igbonefo', ['Nigeria', 'Indonesia']],
  ['Redouane Barkaoui', ['Maroko']],
  ['Makan Konaté', ['Mali']],
  ['Djibril Coulibaly', ['Mali']],
  ['Erick Weeks Lewis', ['Liberia']],
  ['Lévy Madinda', ['Gabon']],
  ['Mailson Lima', ['Tanjung Verde']],
  ['Maciej Dołęga', ['Polandia']],
  ['Mariusz Mucharski', ['Polandia']],
  ['Piotr Orlinski', ['Polandia']],
  ['Pavel Bocjian', ['Polandia']],
  ['Leontin Chitescu', ['Rumania']],
  ['Miljan Radović', ['Montenegro']],
  ['Ilija Spasojević', ['Montenegro', 'Indonesia']],
  ['Vladimir Vujović', ['Montenegro']],
  ['Zdravko Dragićević', ['Montenegro']],
  ['Sergio van Dijk', ['Belanda', 'Indonesia']],
  ['Raphael Maitimo', ['Belanda', 'Indonesia']],
  ['Kim Jeffrey Kurniawan', ['Jerman', 'Indonesia']],
  ['Srđan Lopičić', ['Montenegro']],
  ['Nick Kuipers', ['Belanda']],
  ['Kevin Van Kippersluis', ['Belanda']],
  ['Esteban Vizcarra', ['Belanda', 'Indonesia']],
  ['Ezra Walian', ['Belanda', 'Indonesia']],
  ['Marc Klok', ['Belanda', 'Indonesia']],
  ['Thom Haye', ['Belanda', 'Indonesia']],
  ['Eliano Reijnders', ['Belanda', 'Indonesia']],
  ['Marko Krasić', ['Serbia']],
  ['Bojan Mališić', ['Serbia']],
  ['Juan Belencoso', ['Spanyol']],
  ['Alberto Rodríguez', ['Spanyol']],
  ['Tyronne del Pino', ['Spanyol']],
  ['Carlton Cole', ['Inggris']],
  ['Adam Przybek', ['Wales']],
  ['Rene Mihelič', ['Slovenia']],
  ['Stefano Beltrame', ['Italia']],
  ['Federico Barba', ['Italia']],
  ['Mateo Kocijan', ['Kroasia']],
  ['Andrew Jung', ['Prancis']],
  ['Noh Alam Shah', ['Singapura']],
  ['Shahril Ishak', ['Singapura']],
  ['Baihakki Khaizan', ['Singapura']],
  ['Nipont Chanarwut', ['Thailand']],
  ['Pradith Taweechai', ['Thailand']],
  ['Suchao Nuchnum', ['Thailand']],
  ['Sinthaweechai Hathairattanakool', ['Thailand']],
  ['Satoshi Otomo', ['Jepang']],
  ['Shohei Matsunaga', ['Jepang']],
  ['Kenji Adachihara', ['Jepang']],
  ['Oh In-kyun', ['Korea Selatan']],
  ['Naser Al Sebai', ['Suriah']],
  ['Mohammed Rashid', ['Palestina']],
  ['Robbie Gaspar', ['Australia']],
  ['Diogo Ferreira', ['Australia']],
  ['Artur Gevorkyan', ['Turkmenistan']],
  ['Omid Nazari', ['Filipina']],
  ['Daisuke Sato', ['Filipina']],
  ['Kevin Ray Mendoza', ['Filipina']],
  ['Frans Putros', ['Irak']]
].map(([nama, negara]) => ({ nama, negara }))

const allPlayers = [...localPlayers, ...foreignPlayers]

async function main() {
  await login()

  let created = 0
  let skipped = 0

  for (const player of allPlayers) {
    const slug = toSlug(player.nama)
    const existing = await api(`/items/players?filter[slug][_eq]=${slug}`)
    if (existing.data.length > 0) {
      console.log(`= player ${slug} already exists, skipping`)
      skipped++
      continue
    }
    await api('/items/players', {
      method: 'POST',
      body: JSON.stringify({
        slug,
        nama: player.nama,
        negara: player.negara,
        status: 'published'
      })
    })
    console.log(`+ created player ${slug}`)
    created++
  }

  console.log(`\nDone. Created: ${created}, skipped (already exists): ${skipped}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
