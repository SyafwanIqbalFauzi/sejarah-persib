<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: coaches } = await useAsyncData('coaches', () => directus.request(
  readItems('coaches', {
    fields: ['id', 'nama', 'periode_mulai', 'periode_selesai', { translations: ['languages_code', 'pencapaian'] }],
    filter: { status: { _eq: 'published' } },
    sort: ['-periode_mulai']
  })
))

function tr(coach: any) {
  return coach.translations.find((t: any) => t.languages_code === 'id-ID') ?? coach.translations[0]
}

function periode(coach: any) {
  const start = coach.periode_mulai?.slice(0, 4)
  const end = coach.periode_selesai?.slice(0, 4)
  return end ? `${start}–${end}` : `${start}–sekarang`
}

useSeoMeta({
  title: 'Pelatih — Sejarah Persib Bandung',
  description: 'Daftar pelatih yang pernah menangani Persib Bandung.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Pelatih"
        description="Pelatih-pelatih yang pernah menangani Persib Bandung."
      />

      <UPageBody>
        <div class="flex flex-col gap-4">
          <UPageCard
            v-for="coach in coaches"
            :key="coach.id"
            :title="coach.nama"
            :description="tr(coach)?.pencapaian"
            orientation="horizontal"
            spotlight
          >
            <template #leading>
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide-clipboard-list"
                  class="size-6 text-primary"
                />
                <UBadge
                  color="primary"
                  variant="subtle"
                  size="lg"
                >
                  {{ periode(coach) }}
                </UBadge>
              </div>
            </template>
          </UPageCard>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
