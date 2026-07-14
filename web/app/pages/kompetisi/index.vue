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

// Kategori kompetisi dipilih lewat dropdown di navbar (query ?kategori=...).
// "Liga" ditopang data musim yang sudah ada; sisanya menyusul setelah
// skema/data untuk kategori tersebut tersedia di Directus.
const kategoriLabels: Record<string, string> = {
  liga: 'Liga',
  piala_liga: 'Piala Liga',
  kompetisi_pramusim: 'Kompetisi Pramusim',
  kompetisi_tidak_resmi: 'Kompetisi Tidak Resmi'
}

const route = useRoute()
const selectedKategori = computed(() => {
  const kategori = route.query.kategori
  return typeof kategori === 'string' && kategori in kategoriLabels ? kategori : 'liga'
})

useSeoMeta({
  title: 'Kompetisi — Sejarah Persib Bandung',
  description: 'Rekap kompetisi yang pernah diikuti Persib Bandung: liga, piala liga, pramusim, dan kompetisi tidak resmi.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Kompetisi"
        description="Rekap kompetisi yang pernah diikuti Persib Bandung, dari liga hingga turnamen tidak resmi."
      />

      <UPageBody>
        <!-- ===================== LIGA ===================== -->
        <div v-if="selectedKategori === 'liga'">
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
        </div>

        <!-- ===================== KATEGORI LAIN (PLACEHOLDER) ===================== -->
        <div v-else class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-default py-16 text-center">
          <UIcon name="i-lucide-hard-hat" class="size-10 text-muted" />
          <p class="text-sm text-muted">
            Data {{ kategoriLabels[selectedKategori] }} sedang disiapkan.
          </p>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
