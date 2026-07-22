<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: eras } = await useAsyncData('eras-for-kompetisi', () => directus.request(
  readItems('eras', {
    fields: ['id', { translations: ['languages_code', 'nama_era'] }],
    filter: { status: { _eq: 'published' } },
    sort: ['tahun_mulai']
  })
))

const { data: seasons } = await useAsyncData('seasons', () => directus.request(
  readItems('seasons', {
    fields: ['id', 'tahun_mulai', 'tahun_selesai', 'nama_kompetisi', 'juara', 'hasil_akhir', 'posisi_klasemen', 'keterangan', 'era'],
    filter: { status: { _eq: 'published' } },
    sort: ['-tahun_mulai']
  })
))

function eraLabel(eraId: number | string | null) {
  const era = (eras.value ?? []).find((e) => e.id === eraId)
  if (!era) return '—'
  const tr = era.translations.find((t: any) => t.languages_code === 'id-ID') ?? era.translations[0]
  return tr?.nama_era ?? '—'
}

function periode(season: any) {
  return season.tahun_selesai ? `${season.tahun_mulai}/${String(season.tahun_selesai).slice(-2)}` : `${season.tahun_mulai}`
}

function isPersibChampion(juara: string) {
  return juara.toLowerCase().includes('persib bandung')
}

const selectedEra = ref<number | 'all'>('all')
const onlyJuara = ref(false)
const showFilter = ref(true)
// Urutan kolom Musim: 'desc' = musim terbaru dulu (default), 'asc' = terlama dulu.
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort() {
  sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
}

const eraOptions = computed(() => [
  { label: 'Semua Era', value: 'all' as const },
  ...(eras.value ?? []).map((era) => ({ label: eraLabel(era.id), value: era.id }))
])

const filteredSeasons = computed(() => {
  let result = seasons.value ?? []
  if (selectedEra.value !== 'all') result = result.filter((s) => s.era === selectedEra.value)
  if (onlyJuara.value) result = result.filter((s) => isPersibChampion(s.juara ?? ''))
  return [...result].sort((a, b) => {
    const diff = (a.tahun_mulai ?? 0) - (b.tahun_mulai ?? 0)
    return sortDir.value === 'asc' ? diff : -diff
  })
})

// Ringkasan: dihitung dari data terfilter era (bukan filter "hanya juara"),
// supaya stat tetap merepresentasikan cakupan era yang sedang dilihat.
const scopeSeasons = computed(() => {
  if (selectedEra.value === 'all') return seasons.value ?? []
  return (seasons.value ?? []).filter((s) => s.era === selectedEra.value)
})

const totalMusim = computed(() => scopeSeasons.value.length)
const totalJuara = computed(() => scopeSeasons.value.filter((s) => isPersibChampion(s.juara ?? '')).length)
const rentangTahun = computed(() => {
  const years = scopeSeasons.value.flatMap((s) => [s.tahun_mulai, s.tahun_selesai].filter((y): y is number => y != null))
  if (!years.length) return '—'
  return `${Math.min(...years)}–${Math.max(...years)}`
})

const stats = computed(() => [
  { label: 'Musim tercatat', value: String(totalMusim.value), icon: 'i-lucide-calendar-days' },
  { label: 'Gelar juara Persib', value: String(totalJuara.value), icon: 'i-lucide-trophy' },
  { label: 'Rentang tahun', value: rentangTahun.value, icon: 'i-lucide-history' }
])

// Hasil Persib di musim itu: pakai teks hasil_akhir bila ada, jika tidak
// turunkan dari posisi klasemen (mis. "Peringkat 2").
function hasilPersib(s: any) {
  if (s.hasil_akhir) return s.hasil_akhir
  if (s.posisi_klasemen != null) return `Peringkat ${s.posisi_klasemen}`
  return '—'
}

const columns = [
  { accessorKey: 'periode', header: 'Musim' },
  { accessorKey: 'era', header: 'Era' },
  { accessorKey: 'nama_kompetisi', header: 'Nama Kompetisi' },
  { accessorKey: 'hasil_akhir', header: 'Klasemen Persib' },
  { accessorKey: 'juara', header: 'Juara' },
  { accessorKey: 'keterangan', header: 'Keterangan' }
]

const rows = computed(() => filteredSeasons.value.map((s) => ({
  id: s.id,
  periode: periode(s),
  era: eraLabel(s.era),
  nama_kompetisi: s.nama_kompetisi ?? '—',
  hasil_akhir: hasilPersib(s),
  juara: s.juara ?? '—',
  posisi_klasemen: s.posisi_klasemen ?? '—',
  keterangan: s.keterangan ?? '—'
})))

useSeoMeta({
  title: 'Kompetisi — Liga — Sejarah Persib Bandung',
  description: 'Rekap musim Persib Bandung di kompetisi liga, dari Perserikatan hingga Liga 1.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Kompetisi"
        title="Liga"
        description="Rekap musim Persib Bandung di kompetisi liga, dari Perserikatan hingga Liga 1."
      />

      <UPageBody>
        <!-- ===================== RINGKASAN ===================== -->
        <div class="grid gap-3 sm:grid-cols-3">
          <div
            v-for="stat in stats"
            :key="stat.label"
            class="flex items-center gap-4 rounded-xl border border-default bg-elevated/40 p-4"
          >
            <div class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <UIcon :name="stat.icon" class="size-6 text-primary" />
            </div>
            <div class="min-w-0">
              <div class="text-2xl font-bold leading-none tabular-nums">{{ stat.value }}</div>
              <div class="mt-1 truncate text-sm text-muted">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- ===================== FILTER ===================== -->
        <UCollapsible v-model:open="showFilter" class="mt-6 rounded-2xl border border-default bg-elevated/30">
          <template #default="{ open }">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-2 p-4 sm:px-5"
            >
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-list-filter" class="size-4 text-muted" />
                <span class="text-sm font-semibold">Filter berdasarkan era</span>
              </span>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 text-muted transition-transform"
                :class="open ? 'rotate-180' : ''"
              />
            </button>
          </template>

          <template #content>
            <div class="px-4 pb-4 sm:px-5 sm:pb-5">
              <div class="flex flex-wrap items-center gap-2">
                <UButton
                  v-for="opt in eraOptions"
                  :key="String(opt.value)"
                  :label="opt.label"
                  size="sm"
                  :color="selectedEra === opt.value ? 'primary' : 'neutral'"
                  :variant="selectedEra === opt.value ? 'solid' : 'subtle'"
                  @click="() => { selectedEra = opt.value }"
                />
              </div>

              <USeparator class="my-4" />

              <div class="flex flex-wrap items-center justify-between gap-3">
                <UButton
                  :label="onlyJuara ? 'Menampilkan musim juara saja' : 'Hanya musim Persib juara'"
                  icon="i-lucide-trophy"
                  size="sm"
                  :color="onlyJuara ? 'primary' : 'neutral'"
                  :variant="onlyJuara ? 'solid' : 'subtle'"
                  @click="() => { onlyJuara = !onlyJuara }"
                />
                <span class="text-xs text-dimmed tabular-nums">
                  {{ filteredSeasons.length }} musim ditampilkan
                </span>
              </div>
            </div>
          </template>
        </UCollapsible>

        <!-- ===================== TABEL ===================== -->
        <div class="mt-6 overflow-hidden rounded-2xl border border-default">
          <UTable
            :data="rows"
            :columns="columns"
            :meta="{ class: { tr: (row) => isPersibChampion(row.original.juara) ? 'bg-primary/10 dark:bg-primary/15' : '' } }"
            class="w-full"
          >
            <template #periode-header>
              <button
                type="button"
                class="-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 font-semibold transition-colors hover:text-primary"
                @click="toggleSort"
              >
                Musim
                <UIcon
                  :name="sortDir === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow'"
                  class="size-3.5 text-muted"
                />
              </button>
            </template>

            <template #periode-cell="{ row }">
              <span class="font-medium tabular-nums">{{ row.original.periode }}</span>
            </template>

            <template #era-cell="{ row }">
              <UBadge color="neutral" variant="subtle" size="sm" class="whitespace-nowrap">
                {{ row.original.era }}
              </UBadge>
            </template>

            <template #hasil_akhir-cell="{ row }">
              <span class="font-medium whitespace-nowrap">{{ row.original.hasil_akhir }}</span>
            </template>

            <template #juara-cell="{ row }">
              <span
                class="inline-flex items-center gap-1.5"
                :class="isPersibChampion(row.original.juara) ? 'font-semibold text-primary' : ''"
              >
                <UIcon v-if="isPersibChampion(row.original.juara)" name="i-lucide-trophy" class="size-4" />
                {{ row.original.juara }}
              </span>
            </template>

            <template #keterangan-cell="{ row }">
              <span class="block min-w-48 whitespace-normal text-muted">{{ row.original.keterangan }}</span>
            </template>
          </UTable>

          <div v-if="!filteredSeasons.length" class="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <UIcon name="i-lucide-search-x" class="size-8 text-dimmed" />
            <p class="text-sm text-muted">
              {{ onlyJuara ? 'Tidak ada musim juara pada filter ini.' : 'Belum ada data musim untuk era ini.' }}
            </p>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
