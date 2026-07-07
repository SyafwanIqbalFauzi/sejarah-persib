# Product Requirement Document
## Website Arsip & Sejarah Persib Bandung — Fase 1

**Versi:** 0.1 (Draft)
**Tanggal:** Juli 2026
**Status:** Draft untuk direview & dieksekusi via Claude Code

---

## 1. Ringkasan Produk

Website informasi berbasis konten sejarah tentang Persib Bandung, mencakup kronologi klub, data pemain, gelar/prestasi, pertandingan bersejarah, pelatih, dan fun facts. Website ini adalah **fondasi database** yang nantinya akan menjadi sumber utama untuk konten media sosial di fase berikutnya (di luar scope dokumen ini).

Proyek ini adalah **fan project** — tidak berafiliasi dengan PT Persib Bandung Bermartabat atau manajemen klub resmi.

---

## 2. Latar Belakang & Tujuan

- Konten seputar Persib di internet saat ini didominasi situs statistik pertandingan real-time (skor, jadwal, klasemen) — bukan sejarah dan storytelling.
- Data sejarah Persib (terutama era Perserikatan/Galatama, pra-2011) tersebar dan tidak konsisten antar sumber.
- Tujuan produk:
  1. Menjadi rumah arsip sejarah Persib yang kredibel dan terstruktur
  2. Membangun database terverifikasi yang bisa di-reuse untuk konten sosial media
  3. Menjadi ruang nostalgia & identitas bagi bobotoh

### Tujuan yang TIDAK termasuk di fase ini (out of scope)
- Integrasi/posting otomatis ke media sosial
- Live score / data pertandingan real-time
- Fitur komunitas (komentar, forum, submit foto dari user) — dipertimbangkan di fase selanjutnya
- E-commerce / merchandise

---

## 3. Target Pengguna

| Persona | Kebutuhan |
|---|---|
| Bobotoh (fans) casual | Mencari info nostalgia, fun fact, cerita ringan |
| Bobotoh die-hard / kolektor sejarah | Mencari data detail, statistik, dan validasi sumber |
| Content creator / media | Mencari referensi cepat dan akurat untuk dikutip |
| (Diri sendiri, sebagai admin) | Input & kelola data secara terstruktur via CMS |

---

## 4. Prinsip Desain Konten (dari riset awal)

- Terinspirasi struktur menu sejarah Real Madrid (Chronology, Players, Trophies, Matches, Coaches), namun **diadaptasi dengan realita ketersediaan data Persib** — bukan direplikasi 1:1.
- Pembagian data berdasarkan tingkat kelengkapan sumber:
  - **Pra-2011/12**: data terbatas → konten lebih naratif/storytelling
  - **2011/12–sekarang**: data lebih lengkap (didukung Transfermarkt) → bisa ditampilkan lebih tabular/statistik
- Diferensiasi dari situs lain: fokus pada **identitas, konteks sosial-historis, dan cerita**, bukan sekadar angka.

---

## 5. Struktur Konten / Information Architecture

### 5.1 Kronologi (Timeline per Era)
Pembagian era yang disarankan:
1. BIVB (1919–1933) — cikal bakal, konteks pra-kemerdekaan
2. PSIB & fusi menjadi Persib (1933–1934)
3. Era Perserikatan (1934–1994)
4. Era Galatama (jika relevan/overlap)
5. Liga Indonesia / Liga Super Indonesia (1994–2017)
6. Era Liga 1 modern (2017–sekarang)

Setiap era memuat: ringkasan naratif, tokoh kunci, momen penting, gelar yang diraih.

### 5.2 Pemain
- Directory pemain, sortable by nama (A-Z), era, posisi
- Field lengkap untuk era modern (2011/12+): foto, biodata, jumlah laga, gol, assist, kartu
- Field minimal untuk era lama: nama, posisi, tahun aktif, catatan naratif (jika data statistik tidak tersedia)

### 5.3 Gelar & Prestasi
- Daftar gelar klub per kompetisi/era
- Penghargaan individu pemain (top scorer liga, pemain terbaik, dsb) — hanya untuk yang memang tersedia datanya, tidak dipaksakan meniru kategori penghargaan klub Eropa (Ballon d'Or dsb tidak relevan)

### 5.4 Pertandingan Bersejarah
- Bukan database lengkap semua pertandingan (tidak realistis untuk era lama), melainkan kurasi pertandingan ikonik: final juara, rivalitas El Clasico Indonesia, comeback legendaris, dsb.
- Untuk era modern, terbuka kemungkinan ekspansi ke data pertandingan lebih lengkap jika sumber memungkinkan.

### 5.5 Pelatih
- Daftar pelatih per periode, pencapaian selama menangani tim.

### 5.6 Fun Facts / Cerita
- Konten pendek, tagged ke era/pemain/pertandingan tertentu
- Didesain agar mudah di-extract jadi konten sosial media (fase 2)

### 5.7 Identitas & Budaya (elemen pembeda dari klub lain)
- Evolusi logo & jersey
- Asal-usul julukan (Maung Bandung)
- Konteks rivalitas & identitas Sunda/Jawa Barat
- Budaya suporter (chant, GBLA, dsb)

---

## 6. Struktur Data (Skema Awal — untuk didetailkan bersama saat development)

Entitas utama yang disarankan di Directus:

- `eras` — id, nama_era, tahun_mulai, tahun_selesai, deskripsi
- `seasons` — id, era_id, tahun/musim, nama_kompetisi, hasil_akhir, posisi_klasemen
- `players` — id, nama, posisi, tahun_aktif_mulai, tahun_aktif_selesai, foto, biodata, sumber_data
- `player_season_stats` — id, player_id, season_id, jumlah_laga, gol, assist, kartu (hanya terisi untuk era dengan data lengkap)
- `matches` — id, season_id, tanggal, lawan, skor, kategori (biasa/ikonik), deskripsi_naratif
- `coaches` — id, nama, periode_mulai, periode_selesai, pencapaian
- `trophies` — id, nama_gelar, tahun, kompetisi, jenis (klub/individu)
- `stories` — id, judul, isi, tag (relasi ke era/player/match), tipe (fun fact/cerita panjang)
- `sources` — id, nama_sumber, url/referensi, tipe (untuk mendukung verifikasi & kredit)

Catatan: setiap entri penting sebaiknya punya relasi ke `sources` untuk keperluan verifikasi dan pertanggungjawaban data.

---

## 7. Kebutuhan Teknis & Arsitektur

### 7.1 Stack yang Dipilih
| Layer | Teknologi | Catatan |
|---|---|---|
| CMS & API | Directus | Sudah menyediakan REST/GraphQL API, auth, dan admin panel bawaan — berfungsi sebagai backend utama |
| Backend tambahan | Node.js (via Directus Extensions/Flows) | Custom logic ditulis sebagai extension Directus, bukan servis Node terpisah, kecuali ada kebutuhan spesifik di kemudian hari |
| Frontend | Nuxt.js (Vue) | Konsumsi data via Directus SDK/REST API |
| UI Component Library | Nuxt UI (v4) | First-party module Nuxt, dibangun di atas Tailwind CSS v4 + Reka UI (accessible primitives); mempercepat development tanpa perlu membangun komponen dari nol |
| Database | PostgreSQL (Supabase free tier) | Digunakan murni sebagai database Postgres; fitur Auth/RLS bawaan Supabase tidak diaktifkan bersamaan agar tidak konflik dengan sistem auth Directus |

### 7.2 Catatan Desain (Nuxt UI + Identitas Warna)
Mengingat belum ada tim designer di fase ini, pendekatan desain yang dipilih adalah **memanfaatkan default styling Nuxt UI apa adanya**, dengan satu penyesuaian utama: mengganti *semantic color token* (`primary`) dari default menjadi warna identitas Persib. Pendekatan ini dipilih karena:
- Nuxt UI sudah "beautifully styled by default" — cukup layak tampil tanpa perlu desain custom dari nol
- Mengganti primary color saja sudah cukup memberi kesan "branded" tanpa investasi waktu desain besar
- Konfigurasi dilakukan cukup di `app.config.ts` (semantic color aliases: primary, secondary, neutral, dst), tidak perlu bongkar komponen satu per satu

**Keputusan warna:**
- **Primary**: Biru navy/royal blue — warna identitas paling konsisten dari jersey home Persib dari musim ke musim (referensi kasar: kisaran `#1E3A8A`–`#263f93`; disarankan sample ulang dari aset logo resmi untuk presisi hex final)
- **Secondary/Background**: Putih — mendampingi biru sebagai identitas jersey away & elemen "Kami putih, kami biru"
- **Neutral**: Abu-abu/zinc standar Nuxt UI (tidak perlu kustomisasi, cukup sebagai penyeimbang)
- Warna-warna musiman (kuning, hitam pada jersey alternate/third) **tidak** dijadikan bagian dari identitas warna tetap web, karena berubah tiap musim dan bisa mengaburkan konsistensi jangka panjang

Keputusan ini dianggap final untuk MVP kecuali ada kebutuhan revisi setelah melihat hasil implementasi visual.

### 7.3 Risiko & Hal yang Perlu Divalidasi Saat Development
- **Supabase free tier auto-pause** setelah idle ~1 minggu — perlu strategi hosting Directus yang juga tidak sleep, atau mekanisme ping berkala
- **Batasan storage** free tier (±500MB DB, 1GB file storage) — perlu keputusan apakah foto/media disimpan di Supabase Storage atau layanan lain (misal Cloudflare R2/Cloudinary) jika volume foto besar
- **Hosting Directus & Nuxt**: perlu ditentukan (opsi gratis: Railway, Render, Fly.io — masing-masing punya keterbatasan free tier yang perlu dicek saat implementasi)
- Directus akan membuat tabel sistem sendiri (`directus_*`) di database yang sama — pastikan tidak konflik dengan skema data yang dirancang di atas

### 7.4 Non-Fungsional
- **SEO**: struktur URL & metadata harus dioptimasi untuk pencarian nama Persib (penting untuk discoverability, sudah dibahas terpisah soal penamaan)
- **Mobile-first**: mayoritas pengunjung kemungkinan besar akses via mobile
- **Kecepatan**: hindari load data berat sekaligus (gunakan pagination/lazy load terutama untuk directory pemain & pertandingan)
- **Aksesibilitas sumber**: setiap data/cerita idealnya menampilkan sumber referensi (transparansi & kredibilitas)

---

## 8. Data Governance & Legal

- Semua entri data penting menyertakan field sumber (`sources`) untuk verifikasi silang
- Disclaimer jelas di footer/about: *"Situs ini dibuat oleh penggemar (fan-made), tidak berafiliasi dan tidak mewakili PT Persib Bandung Bermartabat atau manajemen klub."*
- Hindari penggunaan logo resmi klub sebagai elemen branding utama; gunakan desain visual orisinal terinspirasi identitas klub (warna, maskot, dsb)
- Untuk foto arsip: prioritaskan sumber dengan lisensi jelas atau cantumkan kredit; hindari scraping otomatis dari Transfermarkt (gunakan input manual dengan kredit sumber)

---

## 9. Roadmap Fase 1 (MVP)

**Milestone 1 — Setup & Skema**
- Setup Directus + koneksi Supabase Postgres
- Definisikan skema data final (kolaborasi lanjutan dari section 6)
- Setup Nuxt project + koneksi ke Directus API

**Milestone 2 — Konten Inti**
- Input data kronologi seluruh era
- Input data pelatih & gelar klub
- Input data pemain & statistik untuk era modern (2011/12+, berbasis Transfermarkt)

**Milestone 3 — Halaman & UI**
- Halaman kronologi/timeline
- Halaman direktori pemain (sortable, filter by era)
- Halaman gelar & prestasi
- Halaman pertandingan bersejarah (kurasi)
- Halaman fun facts/cerita

**Milestone 4 — Polish & Launch**
- SEO optimization
- Review konten & verifikasi sumber
- Testing mobile responsiveness
- Soft launch

---

## 10. Open Questions (perlu diputuskan sebelum/selama development)

1. Hosting final untuk Directus & Nuxt — layanan apa yang dipakai?
2. Strategi penyimpanan media/foto (Supabase Storage vs alternatif lain)?
3. Apakah butuh multi-bahasa (ID/EN) di fase 1, atau ID saja dulu?
4. Bagaimana proses input data pra-2011 — riset manual bertahap, atau prioritas era tertentu dulu?
5. Apakah perlu sistem draft/review sebelum konten publish (mengingat isu akurasi data sejarah)?

---

## 11. Success Metrics (Fase 1)

- Jumlah entri era/kronologi terisi lengkap dengan sumber
- Jumlah pemain terdata (minimal untuk era 2011/12+)
- Traffic organik dari pencarian terkait "sejarah Persib"
- Waktu load halaman (mobile) dalam batas wajar (<3 detik idealnya)

---

*Dokumen ini adalah draft awal dan akan berkembang seiring proses development. Disarankan untuk direview ulang setelah Milestone 1 selesai.*
