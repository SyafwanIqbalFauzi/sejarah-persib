<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: trophies } = await useAsyncData('trophies', () => directus.request(
  readItems('trophies', {
    fields: [
      'id', 'nama_gelar', 'jenis', 'kategori_turunan',
      { season: ['tahun_mulai', 'tahun_selesai', 'nama_kompetisi'] },
      { cup_season: ['tahun_mulai', 'tahun_selesai', 'nama_kompetisi'] },
      { asia_season: ['tahun_mulai', 'tahun_selesai', 'nama_kompetisi'] },
      { pramusim_season: ['tahun_mulai', 'tahun_selesai', 'nama_kompetisi'] }
    ],
    filter: { status: { _eq: 'published' } },
    sort: ['-season.tahun_mulai'],
    limit: -1
  })
))

// Sebuah gelar terhubung ke salah satu koleksi season (Liga/Piala/Asia/Pramusim).
// Tahun diraih = tahun_selesai season terkait (fallback tahun_mulai).
function trophySeason(trophy: any) {
  return trophy.season ?? trophy.cup_season ?? trophy.asia_season ?? trophy.pramusim_season ?? null
}
function achievedYear(trophy: any): number | null {
  const s = trophySeason(trophy)
  if (!s) return null
  return s.tahun_selesai ?? s.tahun_mulai ?? null
}

// Urutan tetap kategori gelar klub beserta label & ikonnya.
const kategoriOrder = [
  { key: 'liga_profesional', label: 'Liga Profesional', icon: 'i-lucide-trophy', to: '/kompetisi/liga' },
  { key: 'liga_amatir', label: 'Liga Perserikatan', icon: 'i-lucide-shield', to: '/kompetisi/liga' },
  { key: 'piala_liga', label: 'Piala Liga', icon: 'i-lucide-medal', to: '/kompetisi/piala-liga' },
  { key: 'piala_asia', label: 'Piala Asia', icon: 'i-lucide-globe', to: '/kompetisi/piala-asia' },
  { key: 'kompetisi_pramusim', label: 'Kompetisi Pramusim', icon: 'i-lucide-swords', to: '/kompetisi?kategori=kompetisi_pramusim' },
  { key: 'kompetisi_tidak_resmi', label: 'Kompetisi Tidak Resmi', icon: 'i-lucide-star', to: '/kompetisi?kategori=kompetisi_tidak_resmi' }
]

const clubTrophies = computed(() =>
  (trophies.value ?? []).filter((t: any) => t.jenis === 'klub' && achievedYear(t) !== null)
)

// Rentang tahun slider tetap: dari berdirinya Persib (1933) hingga tahun berjalan.
const minYear = 1933
const maxYear = new Date().getFullYear()

const selectedYear = ref<number>(maxYear)

// Hitung kumulatif: semua gelar yang diraih s/d tahun terpilih, dikelompokkan per kategori.
// Selalu tampilkan semua kategori dalam urutan tetap (0 jika belum ada).
const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const t of clubTrophies.value) {
    if ((achievedYear(t) as number) <= selectedYear.value) {
      const key = t.kategori_turunan ?? 'lainnya'
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return kategoriOrder.map((cat) => ({ ...cat, count: counts[cat.key] ?? 0 }))
})

const tab = ref('klub')
const tabItems = [
  { label: 'Prestasi Klub', value: 'klub', icon: 'i-lucide-trophy' },
  { label: 'Prestasi Individual', value: 'individu', icon: 'i-lucide-user-round' }
]

useSeoMeta({
  title: 'Prestasi — Sejarah Persib Bandung',
  description: 'Daftar gelar dan prestasi yang diraih Persib Bandung.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Prestasi"
        description="Rekam jejak juara Persib Bandung di berbagai kompetisi."
      />

      <UPageBody>
        <UTabs
          v-model="tab"
          :items="tabItems"
          color="primary"
          class="w-full"
        />

        <!-- ===================== TAB: GELAR KLUB ===================== -->
        <div v-if="tab === 'klub'" class="mt-8">
          <div class="grid gap-8 lg:grid-cols-2 lg:items-start">
            <!-- Kiri: area gambar (placeholder, mudah diganti dengan foto rak piala) -->
            <div class="relative aspect-4/3 overflow-hidden rounded-2xl bg-persib-blue-900 ring-1 ring-white/10">
              <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
                <img
                  src="/logo/sejarah-persib-badge-mono.svg"
                  alt="Lambang Persib"
                  class="size-24 opacity-20"
                >
                <span class="text-xs font-medium tracking-wide text-white/40 uppercase">
                  Foto koleksi piala menyusul
                </span>
              </div>
            </div>

            <!-- Kanan: jumlah gelar per kategori + slider tahun -->
            <div>
              <div class="grid gap-3 sm:grid-cols-2">
                <NuxtLink
                  v-for="cat in categoryCounts"
                  :key="cat.key"
                  :to="cat.to"
                  class="group flex items-center gap-4 rounded-xl border border-default bg-elevated/40 p-4 transition-colors hover:border-primary/50 hover:bg-elevated"
                  :class="cat.count === 0 ? 'opacity-50' : ''"
                >
                  <UIcon :name="cat.icon" class="size-7 shrink-0 text-primary" />
                  <div class="min-w-0 flex-1">
                    <div class="text-2xl font-bold leading-none tabular-nums">{{ cat.count }}</div>
                    <div class="mt-1 truncate text-sm text-muted">{{ cat.label }}</div>
                  </div>
                  <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </NuxtLink>
              </div>

              <div class="mt-6">
                <div class="mb-3 flex items-center justify-between">
                  <span class="text-sm font-medium text-muted">Geser untuk melihat perkembangan gelar per tahun</span>
                  <UBadge color="primary" variant="subtle" size="lg" class="tabular-nums">{{ selectedYear }}</UBadge>
                </div>
                <USlider
                  v-model="selectedYear"
                  :min="minYear"
                  :max="maxYear"
                  :step="1"
                  size="lg"
                />
                <div class="mt-2 flex justify-between text-xs text-dimmed tabular-nums">
                  <span>{{ minYear }}</span>
                  <span>{{ maxYear }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===================== TAB: INDIVIDUAL ===================== -->
        <div v-else class="mt-8">
          <div class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-default py-16 text-center">
            <UIcon name="i-lucide-hard-hat" class="size-10 text-muted" />
            <p class="text-sm text-muted">Prestasi individual sedang disiapkan.</p>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
