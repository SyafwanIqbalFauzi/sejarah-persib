<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: tidakResmiSeasons } = await useAsyncData('tidak-resmi-seasons', () => directus.request(
  readItems('tidak_resmi_seasons', {
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

function isPersibJuara(hasilAkhir: string | null) {
  return (hasilAkhir ?? '').toLowerCase() === 'juara'
}

const onlyJuara = ref(false)
const showFilter = ref(true)
// Urutan kolom Musim: 'desc' = terbaru dulu (default), 'asc' = terlama dulu.
const sortDir = ref<'asc' | 'desc'>('desc')

function toggleSort() {
  sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
}

const filteredRows = computed(() => {
  const base = tidakResmiSeasons.value ?? []
  const result = onlyJuara.value ? base.filter((r) => isPersibJuara(r.hasil_akhir)) : base
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
  title: 'Kompetisi — Tidak Resmi — Sejarah Persib Bandung',
  description: 'Jejak Persib Bandung di kompetisi tidak resmi yang tidak berafiliasi dengan PSSI/AFC/FIFA.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Kompetisi"
        title="Tidak Resmi"
        description="Jejak Persib Bandung di kompetisi tidak resmi — turnamen yang tidak berafiliasi dengan PSSI, AFC, atau FIFA."
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
                <span class="text-sm font-semibold">Filter</span>
              </span>
              <UIcon
                name="i-lucide-chevron-down"
                class="size-4 text-muted transition-transform"
                :class="open ? 'rotate-180' : ''"
              />
            </button>
          </template>

          <template #content>
            <div class="flex flex-wrap items-center justify-between gap-3 px-4 pb-4 sm:px-5 sm:pb-5">
              <UButton
                :label="onlyJuara ? 'Menampilkan edisi juara saja' : 'Hanya edisi Persib juara'"
                icon="i-lucide-trophy"
                size="sm"
                :color="onlyJuara ? 'primary' : 'neutral'"
                :variant="onlyJuara ? 'solid' : 'subtle'"
                @click="() => { onlyJuara = !onlyJuara }"
              />
              <span class="text-xs text-dimmed tabular-nums">
                {{ filteredRows.length }} edisi ditampilkan
              </span>
            </div>
          </template>
        </UCollapsible>

        <!-- ===================== TABEL ===================== -->
        <div class="mt-6 overflow-hidden rounded-2xl border border-default">
          <UTable
            :data="rows"
            :columns="columns"
            :meta="{ class: { tr: (row) => isPersibJuara(row.original.hasil_akhir) ? 'bg-primary/10 dark:bg-primary/15' : '' } }"
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
              <span
                class="inline-flex items-center gap-1.5"
                :class="isPersibJuara(row.original.hasil_akhir) ? 'font-semibold text-primary' : 'text-muted'"
              >
                <UIcon v-if="isPersibJuara(row.original.hasil_akhir)" name="i-lucide-trophy" class="size-4" />
                {{ row.original.juara }}
              </span>
            </template>

            <template #keterangan-cell="{ row }">
              <span class="block min-w-56 whitespace-normal text-muted">{{ row.original.keterangan }}</span>
            </template>
          </UTable>

          <div v-if="!filteredRows.length" class="flex flex-col items-center justify-center gap-2 py-14 text-center">
            <UIcon name="i-lucide-search-x" class="size-8 text-dimmed" />
            <p class="text-sm text-muted">
              {{ onlyJuara ? 'Tidak ada edisi juara pada filter ini.' : 'Belum ada data edisi untuk kompetisi ini.' }}
            </p>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
