<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: stories } = await useAsyncData('stories', () => directus.request(
  readItems('stories', {
    fields: ['id', 'tipe', { translations: ['languages_code', 'judul', 'isi'] }],
    filter: { status: { _eq: 'published' } }
  })
))

function tr(story: any) {
  return story.translations.find((t: any) => t.languages_code === 'id-ID') ?? story.translations[0]
}

useSeoMeta({
  title: 'Fun Facts & Cerita — Sejarah Persib Bandung',
  description: 'Cerita ringan dan fun facts seputar Persib Bandung.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Fun Facts & Cerita"
        description="Cerita ringan seputar Persib Bandung."
      />

      <UPageBody>
        <UPageGrid>
          <UPageCard
            v-for="story in stories"
            :key="story.id"
            icon="i-lucide-sparkles"
            :title="tr(story)?.judul"
            :description="tr(story)?.isi"
            spotlight
          >
            <template #footer>
              <UBadge
                color="primary"
                variant="subtle"
              >
                {{ story.tipe === 'fun_fact' ? 'Fun Fact' : 'Cerita Panjang' }}
              </UBadge>
            </template>
          </UPageCard>
        </UPageGrid>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
