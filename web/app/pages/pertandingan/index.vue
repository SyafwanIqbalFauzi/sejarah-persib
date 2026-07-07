<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: matches } = await useAsyncData('matches', () => directus.request(
  readItems('matches', {
    fields: ['id', 'tanggal', 'lawan', 'skor', 'kategori', { translations: ['languages_code', 'deskripsi_naratif'] }],
    filter: { status: { _eq: 'published' } },
    sort: ['-tanggal']
  })
))

function tr(match: any) {
  return match.translations.find((t: any) => t.languages_code === 'id-ID') ?? match.translations[0]
}

useSeoMeta({
  title: 'Pertandingan Bersejarah — Sejarah Persib Bandung',
  description: 'Kurasi pertandingan ikonik Persib Bandung.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Pertandingan Bersejarah"
        description="Kurasi pertandingan ikonik — bukan database lengkap semua laga."
      />

      <UPageBody>
        <div class="flex flex-col gap-4">
          <UPageCard
            v-for="match in matches"
            :key="match.id"
            icon="i-lucide-swords"
            :title="`Persib vs ${match.lawan}`"
            :description="tr(match)?.deskripsi_naratif"
            spotlight
          >
            <template #footer>
              <div class="flex items-center gap-2 text-sm text-muted">
                <UBadge
                  color="primary"
                  variant="subtle"
                >
                  {{ match.skor }}
                </UBadge>
                <span>{{ match.tanggal }}</span>
              </div>
            </template>
          </UPageCard>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
