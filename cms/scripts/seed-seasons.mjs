// Seeds seasons — mirrors the live 'seasons' collection content as of 2026-07-21.
// Depends on eras already being seeded (matches era by slug via seed-eras.mjs).
// Idempotent: matches existing rows by (nama_kompetisi, tahun_mulai, tahun_selesai).
// Run with: node cms/scripts/seed-seasons.mjs

import { api, login } from './lib/directus-client.mjs'

const seasons = [
  {
    "nama_kompetisi": "Inlandsche Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "VIJ Batavia",
    "posisi_klasemen": null,
    "tahun_mulai": 1930,
    "tahun_selesai": 1930,
    "keterangan": "Kompetisi tidak resmi",
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "VIJ Batavia",
    "posisi_klasemen": null,
    "tahun_mulai": 1931,
    "tahun_selesai": 1931,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "PSIM Djokjakarta",
    "posisi_klasemen": null,
    "tahun_mulai": 1932,
    "tahun_selesai": 1932,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "VIJ Batavia",
    "posisi_klasemen": null,
    "tahun_mulai": 1932,
    "tahun_selesai": 1933,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "VIJ Batavia",
    "posisi_klasemen": null,
    "tahun_mulai": 1933,
    "tahun_selesai": 1934,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "Persis Solo",
    "posisi_klasemen": null,
    "tahun_mulai": 1934,
    "tahun_selesai": 1935,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "Persis Solo",
    "posisi_klasemen": null,
    "tahun_mulai": 1935,
    "tahun_selesai": 1936,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": null,
    "tahun_mulai": 1936,
    "tahun_selesai": 1937,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "VIJ Batavia",
    "posisi_klasemen": null,
    "tahun_mulai": 1937,
    "tahun_selesai": 1938,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "Persis Solo",
    "posisi_klasemen": null,
    "tahun_mulai": 1938,
    "tahun_selesai": 1939,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "Persis Solo",
    "posisi_klasemen": null,
    "tahun_mulai": 1939,
    "tahun_selesai": 1940,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "Persis Solo",
    "posisi_klasemen": null,
    "tahun_mulai": 1941,
    "tahun_selesai": 1941,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "Persis Solo",
    "posisi_klasemen": null,
    "tahun_mulai": 1942,
    "tahun_selesai": 1942,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "PSSI Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "Persis Solo",
    "posisi_klasemen": null,
    "tahun_mulai": 1943,
    "tahun_selesai": 1943,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Inlandsche Stedenwedstrijden",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": null,
    "tahun_mulai": 1950,
    "tahun_selesai": 1950,
    "keterangan": "Kompetisi tidak resmi",
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "Persibaja Surabaja",
    "posisi_klasemen": null,
    "tahun_mulai": 1951,
    "tahun_selesai": 1951,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "Persibaja Surabaja",
    "posisi_klasemen": null,
    "tahun_mulai": 1952,
    "tahun_selesai": 1952,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "Persidja Djakarta",
    "posisi_klasemen": null,
    "tahun_mulai": 1953,
    "tahun_selesai": 1954,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "PSM Makassar",
    "posisi_klasemen": null,
    "tahun_mulai": 1955,
    "tahun_selesai": 1957,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "PSM Makassar",
    "posisi_klasemen": null,
    "tahun_mulai": 1957,
    "tahun_selesai": 1959,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": null,
    "tahun_mulai": 1959,
    "tahun_selesai": 1961,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "Persidja Djakarta",
    "posisi_klasemen": null,
    "tahun_mulai": 1962,
    "tahun_selesai": 1964,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "PSM Makassar",
    "posisi_klasemen": null,
    "tahun_mulai": 1964,
    "tahun_selesai": 1965,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "PSM Makassar",
    "posisi_klasemen": null,
    "tahun_mulai": 1965,
    "tahun_selesai": 1966,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "PSMS Medan",
    "posisi_klasemen": null,
    "tahun_mulai": 1966,
    "tahun_selesai": 1966,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "PSMS Medan",
    "posisi_klasemen": null,
    "tahun_mulai": 1967,
    "tahun_selesai": 1967,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "PSMS Medan",
    "posisi_klasemen": null,
    "tahun_mulai": 1969,
    "tahun_selesai": 1969,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "Persija Jakarta",
    "posisi_klasemen": null,
    "tahun_mulai": 1971,
    "tahun_selesai": 1971,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "Persija Jakarta & PSMS Medan",
    "posisi_klasemen": null,
    "tahun_mulai": 1973,
    "tahun_selesai": 1973,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional PSSI",
    "hasil_akhir": null,
    "juara": "Persebaya Surabaya",
    "posisi_klasemen": null,
    "tahun_mulai": 1975,
    "tahun_selesai": 1978,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Kejuaraan Nasional Utama PSSI",
    "hasil_akhir": null,
    "juara": "Persija Jakarta",
    "posisi_klasemen": null,
    "tahun_mulai": 1978,
    "tahun_selesai": 1979,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Divisi Utama PSSI",
    "hasil_akhir": null,
    "juara": "Persiraja Banda Aceh",
    "posisi_klasemen": null,
    "tahun_mulai": 1980,
    "tahun_selesai": 1980,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Divisi Utama PSSI",
    "hasil_akhir": null,
    "juara": "PSMS Medan",
    "posisi_klasemen": null,
    "tahun_mulai": 1983,
    "tahun_selesai": 1983,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Divisi Utama PSSI",
    "hasil_akhir": null,
    "juara": "PSMS Medan",
    "posisi_klasemen": null,
    "tahun_mulai": 1985,
    "tahun_selesai": 1985,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Divisi Utama PSSI",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": null,
    "tahun_mulai": 1986,
    "tahun_selesai": 1986,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Divisi Utama PSSI",
    "hasil_akhir": null,
    "juara": "PSIS Semarang",
    "posisi_klasemen": null,
    "tahun_mulai": 1986,
    "tahun_selesai": 1987,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Divisi Utama PSSI",
    "hasil_akhir": null,
    "juara": "Persebaya Surabaya",
    "posisi_klasemen": null,
    "tahun_mulai": 1987,
    "tahun_selesai": 1988,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Divisi Utama PSSI",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": null,
    "tahun_mulai": 1989,
    "tahun_selesai": 1990,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Divisi Utama PSSI",
    "hasil_akhir": null,
    "juara": "PSM Ujung Pandang",
    "posisi_klasemen": null,
    "tahun_mulai": 1991,
    "tahun_selesai": 1992,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Divisi Utama PSSI",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": null,
    "tahun_mulai": 1993,
    "tahun_selesai": 1994,
    "keterangan": null,
    "status": "published",
    "era_slug": "perserikatan-1931-1994"
  },
  {
    "nama_kompetisi": "Liga Dunhill",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": null,
    "tahun_mulai": 1994,
    "tahun_selesai": 1995,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Dunhill",
    "hasil_akhir": null,
    "juara": "Mastrans Bandung Raya",
    "posisi_klasemen": null,
    "tahun_mulai": 1995,
    "tahun_selesai": 1996,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Kansas",
    "hasil_akhir": null,
    "juara": "Persebaya Surabaya",
    "posisi_klasemen": null,
    "tahun_mulai": 1996,
    "tahun_selesai": 1997,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Kansas",
    "hasil_akhir": null,
    "juara": null,
    "posisi_klasemen": null,
    "tahun_mulai": 1997,
    "tahun_selesai": 1998,
    "keterangan": "Kompetisi tidak selesai (krisis politik)",
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Indonesia",
    "hasil_akhir": null,
    "juara": "PSIS Semarang",
    "posisi_klasemen": null,
    "tahun_mulai": 1998,
    "tahun_selesai": 1999,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Bank Mandiri",
    "hasil_akhir": null,
    "juara": "PSM Makassar",
    "posisi_klasemen": null,
    "tahun_mulai": 1999,
    "tahun_selesai": 2000,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Bank Mandiri",
    "hasil_akhir": null,
    "juara": "Persija Jakarta",
    "posisi_klasemen": null,
    "tahun_mulai": 2001,
    "tahun_selesai": 2001,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Bank Mandiri",
    "hasil_akhir": null,
    "juara": "Petrokimia Putra",
    "posisi_klasemen": null,
    "tahun_mulai": 2002,
    "tahun_selesai": 2002,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Bank Mandiri",
    "hasil_akhir": null,
    "juara": "Persik Kediri",
    "posisi_klasemen": null,
    "tahun_mulai": 2003,
    "tahun_selesai": 2003,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Bank Mandiri",
    "hasil_akhir": null,
    "juara": "Persebaya Surabaya",
    "posisi_klasemen": null,
    "tahun_mulai": 2004,
    "tahun_selesai": 2004,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Djarum",
    "hasil_akhir": null,
    "juara": "Persipura Jayapura",
    "posisi_klasemen": null,
    "tahun_mulai": 2005,
    "tahun_selesai": 2005,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Djarum",
    "hasil_akhir": null,
    "juara": "Persik Kediri",
    "posisi_klasemen": null,
    "tahun_mulai": 2006,
    "tahun_selesai": 2006,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Liga Djarum",
    "hasil_akhir": null,
    "juara": "Sriwijaya",
    "posisi_klasemen": null,
    "tahun_mulai": 2007,
    "tahun_selesai": 2008,
    "keterangan": null,
    "status": "published",
    "era_slug": "divisi-utama"
  },
  {
    "nama_kompetisi": "Indonesia Super League (Djarum ISL)",
    "hasil_akhir": null,
    "juara": "Persipura Jayapura",
    "posisi_klasemen": null,
    "tahun_mulai": 2008,
    "tahun_selesai": 2009,
    "keterangan": null,
    "status": "published",
    "era_slug": "indonesia-super-league"
  },
  {
    "nama_kompetisi": "Indonesia Super League (Djarum ISL)",
    "hasil_akhir": null,
    "juara": "Arema Indonesia",
    "posisi_klasemen": null,
    "tahun_mulai": 2009,
    "tahun_selesai": 2010,
    "keterangan": null,
    "status": "published",
    "era_slug": "indonesia-super-league"
  },
  {
    "nama_kompetisi": "Indonesia Super League (Djarum ISL)",
    "hasil_akhir": null,
    "juara": "Persipura Jayapura",
    "posisi_klasemen": null,
    "tahun_mulai": 2010,
    "tahun_selesai": 2011,
    "keterangan": null,
    "status": "published",
    "era_slug": "indonesia-super-league"
  },
  {
    "nama_kompetisi": "Indonesia Premier League (IPL)",
    "hasil_akhir": null,
    "juara": "Semen Padang",
    "posisi_klasemen": null,
    "tahun_mulai": 2011,
    "tahun_selesai": 2012,
    "keterangan": null,
    "status": "published",
    "era_slug": "indonesia-super-league"
  },
  {
    "nama_kompetisi": "Indonesia Super League",
    "hasil_akhir": null,
    "juara": "Sriwijaya",
    "posisi_klasemen": 8,
    "tahun_mulai": 2011,
    "tahun_selesai": 2012,
    "keterangan": null,
    "status": "published",
    "era_slug": "indonesia-super-league"
  },
  {
    "nama_kompetisi": "Indonesia Super League",
    "hasil_akhir": null,
    "juara": "Persipura Jayapura",
    "posisi_klasemen": 4,
    "tahun_mulai": 2013,
    "tahun_selesai": 2014,
    "keterangan": null,
    "status": "published",
    "era_slug": "indonesia-super-league"
  },
  {
    "nama_kompetisi": "Indonesia Super League",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": 2,
    "tahun_mulai": 2014,
    "tahun_selesai": 2015,
    "keterangan": null,
    "status": "published",
    "era_slug": "indonesia-super-league"
  },
  {
    "nama_kompetisi": "QNB League",
    "hasil_akhir": null,
    "juara": null,
    "posisi_klasemen": null,
    "tahun_mulai": 2015,
    "tahun_selesai": 2016,
    "keterangan": "Kompetisi tidak selesai (dibekukan pemerintah/FIFA)",
    "status": "published",
    "era_slug": "indonesia-super-league"
  },
  {
    "nama_kompetisi": "Indonesia Soccer Championship A (Torabika Soccer Championship)",
    "hasil_akhir": null,
    "juara": "Persipura Jayapura",
    "posisi_klasemen": null,
    "tahun_mulai": 2016,
    "tahun_selesai": 2017,
    "keterangan": "Kompetisi tidak resmi. Kompetisi tidak berafiliasi dengan PSSI, AFC & FIFA.",
    "status": "published",
    "era_slug": "indonesia-super-league"
  },
  {
    "nama_kompetisi": "GoJek Traveloka Liga 1",
    "hasil_akhir": null,
    "juara": "Bhayangkara",
    "posisi_klasemen": 13,
    "tahun_mulai": 2017,
    "tahun_selesai": 2018,
    "keterangan": null,
    "status": "published",
    "era_slug": "super-league"
  },
  {
    "nama_kompetisi": "GoJek Liga 1",
    "hasil_akhir": null,
    "juara": "Persija Jakarta",
    "posisi_klasemen": 4,
    "tahun_mulai": 2018,
    "tahun_selesai": 2019,
    "keterangan": null,
    "status": "published",
    "era_slug": "super-league"
  },
  {
    "nama_kompetisi": "Shopee Liga 1",
    "hasil_akhir": null,
    "juara": "Bali United",
    "posisi_klasemen": 6,
    "tahun_mulai": 2019,
    "tahun_selesai": 2020,
    "keterangan": null,
    "status": "published",
    "era_slug": "super-league"
  },
  {
    "nama_kompetisi": "Shopee Liga 1",
    "hasil_akhir": null,
    "juara": null,
    "posisi_klasemen": null,
    "tahun_mulai": 2020,
    "tahun_selesai": 2021,
    "keterangan": "Kompetisi dibatalkan (pandemi COVID19)",
    "status": "published",
    "era_slug": "super-league"
  },
  {
    "nama_kompetisi": "BRI Liga 1",
    "hasil_akhir": null,
    "juara": "Bali United",
    "posisi_klasemen": 2,
    "tahun_mulai": 2021,
    "tahun_selesai": 2022,
    "keterangan": null,
    "status": "published",
    "era_slug": "super-league"
  },
  {
    "nama_kompetisi": "BRI Liga 1",
    "hasil_akhir": null,
    "juara": "PSM Makassar",
    "posisi_klasemen": 3,
    "tahun_mulai": 2022,
    "tahun_selesai": 2023,
    "keterangan": null,
    "status": "published",
    "era_slug": "super-league"
  },
  {
    "nama_kompetisi": "BRI Liga 1",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": 2,
    "tahun_mulai": 2023,
    "tahun_selesai": 2024,
    "keterangan": null,
    "status": "published",
    "era_slug": "super-league"
  },
  {
    "nama_kompetisi": "BRI Liga 1",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": 1,
    "tahun_mulai": 2024,
    "tahun_selesai": 2025,
    "keterangan": null,
    "status": "published",
    "era_slug": "super-league"
  },
  {
    "nama_kompetisi": "BRI Super League",
    "hasil_akhir": null,
    "juara": "PERSIB Bandung",
    "posisi_klasemen": 1,
    "tahun_mulai": 2025,
    "tahun_selesai": 2026,
    "keterangan": null,
    "status": "published",
    "era_slug": "super-league"
  }
]

async function main() {
  await login()

  const eras = await api('/items/eras?limit=-1&fields=id,slug')
  const eraIdBySlug = Object.fromEntries(eras.data.map((e) => [e.slug, e.id]))

  for (const season of seasons) {
    const { era_slug, ...fields } = season
    const filter = `filter[nama_kompetisi][_eq]=${encodeURIComponent(fields.nama_kompetisi ?? '')}&filter[tahun_mulai][_eq]=${fields.tahun_mulai}&filter[tahun_selesai][_eq]=${fields.tahun_selesai}`
    const existing = await api(`/items/seasons?${filter}`)
    if (existing.data.length > 0) {
      console.log(`= season "${fields.nama_kompetisi} ${fields.tahun_mulai}" already exists, skipping`)
      continue
    }
    await api('/items/seasons', {
      method: 'POST',
      body: JSON.stringify({ ...fields, era: era_slug ? eraIdBySlug[era_slug] : null })
    })
    console.log(`+ created season "${fields.nama_kompetisi} ${fields.tahun_mulai}"`)
  }
  console.log('\nDone seeding seasons.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
