<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: trophies } = await useAsyncData('trophies', () => directus.request(
  readItems('trophies', {
    fields: ['id', 'nama_gelar', 'jenis', 'kategori_turunan', { season: ['tahun_mulai', 'tahun_selesai', 'nama_kompetisi'] }],
    filter: { status: { _eq: 'published' } },
    sort: ['-season.tahun_mulai']
  })
))

function tahun(trophy: any) {
  if (!trophy.season) return '—'
  return trophy.season.tahun_selesai ? `${trophy.season.tahun_mulai}/${String(trophy.season.tahun_selesai).slice(-2)}` : `${trophy.season.tahun_mulai}`
}

useSeoMeta({
  title: 'Gelar & Prestasi — Sejarah Persib Bandung',
  description: 'Daftar gelar dan prestasi yang diraih Persib Bandung.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Gelar & Prestasi"
        description="Pencapaian Persib Bandung di berbagai kompetisi."
      />

      <UPageBody>
        <div class="flex flex-col gap-4">
          <UPageCard
            v-for="trophy in trophies"
            :key="trophy.id"
            :title="trophy.nama_gelar"
            :description="trophy.season?.nama_kompetisi"
            orientation="horizontal"
            spotlight
          >
            <template #leading>
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide-trophy"
                  class="size-6 text-primary"
                />
                <UBadge
                  color="primary"
                  variant="subtle"
                  size="lg"
                >
                  {{ tahun(trophy) }}
                </UBadge>
              </div>
            </template>
          </UPageCard>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
