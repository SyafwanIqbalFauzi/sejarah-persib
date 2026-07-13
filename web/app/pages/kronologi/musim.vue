<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: eras } = await useAsyncData('eras-for-musim', () => directus.request(
  readItems('eras', {
    fields: ['id', { translations: ['languages_code', 'nama_era'] }],
    filter: { status: { _eq: 'published' } },
    sort: ['tahun_mulai']
  })
))

const { data: seasons } = await useAsyncData('seasons', () => directus.request(
  readItems('seasons', {
    fields: ['id', 'tahun_mulai', 'tahun_selesai', 'nama_kompetisi', 'hasil_akhir', 'posisi_klasemen', 'keterangan', 'era'],
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

function isPersibChampion(hasilAkhir: string) {
  return hasilAkhir.toLowerCase().includes('persib bandung')
}

const selectedEra = ref<number | 'all'>('all')

const eraOptions = computed(() => [
  { label: 'Semua Era', value: 'all' as const },
  ...(eras.value ?? []).map((era) => ({ label: eraLabel(era.id), value: era.id }))
])

const filteredSeasons = computed(() => {
  if (selectedEra.value === 'all') return seasons.value ?? []
  return (seasons.value ?? []).filter((s) => s.era === selectedEra.value)
})

const columns = [
  { accessorKey: 'periode', header: 'Musim' },
  { accessorKey: 'era', header: 'Era' },
  { accessorKey: 'nama_kompetisi', header: 'Nama Kompetisi' },
  { accessorKey: 'hasil_akhir', header: 'Tim Juara' },
  { accessorKey: 'keterangan', header: 'Keterangan' }
]

const rows = computed(() => filteredSeasons.value.map((s) => ({
  id: s.id,
  periode: periode(s),
  era: eraLabel(s.era),
  nama_kompetisi: s.nama_kompetisi ?? '—',
  hasil_akhir: s.hasil_akhir ?? '—',
  posisi_klasemen: s.posisi_klasemen ?? '—',
  keterangan: s.keterangan ?? '—'
})))

useSeoMeta({
  title: 'Semua Musim — Sejarah Persib Bandung',
  description: 'Rekap musim demi musim Persib Bandung, dari era Perserikatan hingga Liga 1.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Semua Musim"
        description="Rekap musim demi musim, dari Perserikatan hingga Liga 1 / Super League."
        :links="[{ label: 'Cerita per Era', icon: 'i-lucide-arrow-left', color: 'neutral', variant: 'subtle', to: '/kronologi' }]"
      />

      <UPageBody>
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <UButton
            v-for="opt in eraOptions"
            :key="String(opt.value)"
            :label="opt.label"
            size="sm"
            :color="selectedEra === opt.value ? 'primary' : 'neutral'"
            :variant="selectedEra === opt.value ? 'solid' : 'subtle'"
            @click="selectedEra = opt.value"
          />
        </div>

        <UTable
          :data="rows"
          :columns="columns"
          :meta="{ class: { tr: (row) => isPersibChampion(row.original.hasil_akhir) ? 'bg-primary/10 dark:bg-primary/15' : '' } }"
          class="w-full"
        >
          <template #hasil_akhir-cell="{ row }">
            <span
              class="inline-flex items-center gap-1.5"
              :class="isPersibChampion(row.original.hasil_akhir) ? 'font-semibold text-primary' : ''"
            >
              <UIcon v-if="isPersibChampion(row.original.hasil_akhir)" name="i-lucide-trophy" class="size-4" />
              {{ row.original.hasil_akhir }}
            </span>
          </template>

          <template #keterangan-cell="{ row }">
            <span class="block min-w-48 whitespace-normal text-muted">{{ row.original.keterangan }}</span>
          </template>
        </UTable>

        <p v-if="!filteredSeasons.length" class="py-8 text-center text-sm text-muted">
          Belum ada data musim untuk era ini.
        </p>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
