<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: eras } = await useAsyncData('eras', () => directus.request(
  readItems('eras', {
    fields: ['id', 'slug', 'tahun_mulai', 'tahun_selesai', { translations: ['languages_code', 'nama_era', 'deskripsi'] }],
    filter: { status: { _eq: 'published' } },
    sort: ['tahun_mulai']
  })
))

function tr(era: any) {
  return era.translations.find((t: any) => t.languages_code === 'id-ID') ?? era.translations[0]
}

function periode(era: any) {
  return era.tahun_selesai ? `${era.tahun_mulai}–${era.tahun_selesai}` : `${era.tahun_mulai}–Sekarang`
}

const tabItems = computed(() => (eras.value ?? []).map((era) => ({
  label: tr(era).nama_era,
  periode: periode(era),
  description: tr(era).deskripsi
})))

useSeoMeta({
  title: 'Era ke Era — Sejarah Persib Bandung',
  description: 'Perjalanan era Persib Bandung dari BIVB hingga Liga 1 modern.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Cerita di Setiap Era"
        description="Perjalanan Persib dari setiap era Liga Indonesia, sejak Perserikatan hingga Liga 1 / Super League."
      />

      <UPageBody>
        <UTabs
          :items="tabItems"
          class="w-full"
        >
          <template #default="{ item }">
            <div class="flex flex-col items-start py-0.5 text-left">
              <span class="font-medium">{{ item.label }}</span>
            </div>
          </template>

          <template #content="{ item }">
            <div
              class="prose prose-neutral dark:prose-invert max-w-none py-4 prose-a:text-primary"
              v-html="item.description"
            />
          </template>
        </UTabs>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
