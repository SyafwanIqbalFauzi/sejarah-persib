<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: asiaSeasons } = await useAsyncData('asia-seasons', () => directus.request(
  readItems('asia_seasons', {
    fields: ['id', 'nama_kompetisi', 'tahun_mulai', 'tahun_selesai', 'juara', 'hasil_akhir', 'keterangan'],
    filter: { status: { _eq: 'published' } },
    sort: ['-tahun_mulai']
  })
))

function periode(row: any) {
  return row.tahun_selesai && row.tahun_selesai !== row.tahun_mulai
    ? `${row.tahun_mulai}/${String(row.tahun_selesai).slice(-2)}`
    : `${row.tahun_mulai}`
}

const selectedKompetisi = ref<string | 'all'>('all')
const showFilter = ref(true)
// Urutan kolom Musim: 'desc' = terbaru dulu (default), 'asc' = terlama dulu.
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort() {
  sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
}

const kompetisiOptions = computed(() => [
  { label: 'Semua Kompetisi', value: 'all' as const },
  ...[...new Set((asiaSeasons.value ?? []).map((r) => r.nama_kompetisi).filter(Boolean))].map((k) => ({ label: k as string, value: k as string }))
])

const filteredRows = computed(() => {
  const result = selectedKompetisi.value === 'all'
    ? (asiaSeasons.value ?? [])
    : (asiaSeasons.value ?? []).filter((r) => r.nama_kompetisi === selectedKompetisi.value)
  return [...result].sort((a, b) => {
    const diff = (a.tahun_mulai ?? 0) - (b.tahun_mulai ?? 0)
    return sortDir.value === 'asc' ? diff : -diff
  })
})

const columns = [
  { accessorKey: 'periode', header: 'Musim' },
  { accessorKey: 'nama_kompetisi', header: 'Kompetisi' },
  { accessorKey: 'hasil_akhir', header: 'Hasil Persib' },
  { accessorKey: 'juara', header: 'Juara' },
  { accessorKey: 'keterangan', header: 'Keterangan' }
]

const rows = computed(() => filteredRows.value.map((r) => ({
  id: r.id,
  periode: periode(r),
  nama_kompetisi: r.nama_kompetisi ?? '—',
  hasil_akhir: r.hasil_akhir ?? 'Belum diverifikasi',
  juara: r.juara ?? '—',
  keterangan: r.keterangan ?? '—'
})))

useSeoMeta({
  title: 'Kompetisi — Piala Asia — Sejarah Persib Bandung',
  description: 'Jejak Persib Bandung di kompetisi antarklub Asia: Asian Club Championship, Piala AFC, dan AFC Champions League Two.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Kompetisi"
        title="Piala Asia"
        description="Jejak Persib Bandung di kompetisi antarklub Asia: Asian Club Championship, Piala AFC, dan AFC Champions League Two."
      />

      <UPageBody>
        <!-- ===================== FILTER ===================== -->
        <UCollapsible v-model:open="showFilter" class="rounded-2xl border border-default bg-elevated/30">
          <template #default="{ open }">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-2 p-4 sm:px-5"
            >
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-list-filter" class="size-4 text-muted" />
                <span class="text-sm font-semibold">Filter berdasarkan kompetisi</span>
              </span>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 text-muted transition-transform"
                :class="open ? 'rotate-180' : ''"
              />
            </button>
          </template>

          <template #content>
            <div class="flex flex-wrap items-center gap-2 px-4 pb-4 sm:px-5 sm:pb-5">
              <UButton
                v-for="opt in kompetisiOptions"
                :key="String(opt.value)"
                :label="opt.label"
                size="sm"
                :color="selectedKompetisi === opt.value ? 'primary' : 'neutral'"
                :variant="selectedKompetisi === opt.value ? 'solid' : 'subtle'"
                @click="() => { selectedKompetisi = opt.value }"
              />
            </div>
          </template>
        </UCollapsible>

        <!-- ===================== TABEL ===================== -->
        <div class="mt-6 overflow-hidden rounded-2xl border border-default">
          <UTable
            :data="rows"
            :columns="columns"
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

            <template #nama_kompetisi-cell="{ row }">
              <UBadge color="neutral" variant="subtle" size="sm" class="whitespace-nowrap">
                {{ row.original.nama_kompetisi }}
              </UBadge>
            </template>

            <template #hasil_akhir-cell="{ row }">
              <span class="font-medium">{{ row.original.hasil_akhir }}</span>
            </template>

            <template #juara-cell="{ row }">
              <span class="text-muted">{{ row.original.juara }}</span>
            </template>

            <template #keterangan-cell="{ row }">
              <span class="block min-w-56 whitespace-normal text-muted">{{ row.original.keterangan }}</span>
            </template>
          </UTable>

          <div v-if="!filteredRows.length" class="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <UIcon name="i-lucide-search-x" class="size-8 text-dimmed" />
            <p class="text-sm text-muted">
              Belum ada data edisi untuk kompetisi ini.
            </p>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
