# Sejarah Persib Bandung

Fan-made archive & history website for Persib Bandung. See [PRD-Sejarah-Persib-Bandung.md](PRD-Sejarah-Persib-Bandung.md) for full scope.

## Struktur repo

- `cms/` — Directus data volumes (uploads, extensions, snapshots) + schema/seed scripts. Directus itself runs from Docker; database-nya adalah **Supabase Postgres** (bukan container lokal).
- `web/` — Nuxt 4 + Nuxt UI v4 frontend.
- `docker-compose.yml` — Directus for local dev, connected to Supabase Postgres via session pooler.

## Setup lokal (pertama kali)

**Prasyarat: Docker Desktop + WSL2** (sudah diinstall via winget; setelah instalasi WSL2 kamu perlu **restart Windows** sekali agar aktif).

1. Restart Windows (jika belum, untuk mengaktifkan WSL2).
2. Buka Docker Desktop, tunggu sampai statusnya "Running" (ikon paus di system tray hijau).
3. Copy `.env.example` ke `.env` di root jika belum ada, lalu isi `SUPABASE_DB_*` dengan connection string dari Supabase Dashboard → Project Settings → Database → Connection string → **Session pooler** (bukan direct connection — direct connection Supabase IPv6-only dan tidak reachable dari Docker Desktop).
4. Jalankan CMS:
   ```
   docker compose up -d
   ```
5. Cek Directus di http://localhost:8055 — login pakai `DIRECTUS_ADMIN_EMAIL` / `DIRECTUS_ADMIN_PASSWORD` dari `.env`.
6. Kalau ini setup Supabase project baru (schema belum ada), jalankan sekali:
   ```
   node cms/scripts/setup-schema.mjs
   node cms/scripts/seed-sources.mjs
   node cms/scripts/seed-eras.mjs
   node cms/scripts/seed-coaches.mjs
   node cms/scripts/seed-players.mjs
   node cms/scripts/seed-matches.mjs
   node cms/scripts/seed-trophies.mjs
   node cms/scripts/seed-stories.mjs
   ```
7. Jalankan frontend:
   ```
   cd web
   pnpm install   # kalau belum
   pnpm dev
   ```
8. Buka http://localhost:3000

## Menghentikan

```
docker compose down        # stop Directus (data tetap ada di Supabase)
```

## Catatan

- Warna primary Nuxt UI sudah di-set ke navy blue Persib (`persib-blue`, lihat `web/app/app.config.ts` dan `web/app/assets/css/main.css`) sesuai keputusan PRD §7.2. Hex final masih bisa disesuaikan setelah sampling ulang dari aset logo resmi.
- Skema data Directus (`eras`, `players`, `matches`, dst — lihat PRD §6) sudah dibuat via `cms/scripts/setup-schema.mjs` dan diseed dengan data contoh.
- Database Directus adalah Supabase Postgres, diakses lewat session pooler (port 5432) dengan `DB_SSL__REJECT_UNAUTHORIZED=false` karena chain sertifikat pooler Supabase. Directus connect via koneksi Postgres langsung (bukan lewat REST API Supabase), jadi tidak butuh `SUPABASE_KEY`/anon key sama sekali.
- **Row Level Security (RLS) belum diaktifkan** di tabel-tabel Supabase (baik `directus_*` maupun tabel konten seperti `eras`, `players`). Saat ini aman karena semua akses lewat Directus (role `postgres`, bukan lewat PostgREST/anon key) — tapi kalau nanti ada kode yang connect ke Supabase pakai `@supabase/supabase-js` + publishable key, key itu bisa baca/tulis semua tabel tanpa filter. Aktifkan RLS dulu sebelum expose Supabase langsung ke browser.
