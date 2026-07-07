<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()
const { public: { directusUrl } } = useRuntimeConfig()

const { data: players } = await useAsyncData('players', () => directus.request(
  readItems('players', {
    fields: ['id', 'slug', 'nama', 'posisi', 'foto', 'tahun_aktif_mulai', 'tahun_aktif_selesai', { translations: ['languages_code', 'biodata'] }],
    filter: { status: { _eq: 'published' } },
    sort: ['nama'],
    limit: -1
  })
))

function tr(player: any) {
  return player.translations.find((t: any) => t.languages_code === 'id-ID') ?? player.translations[0]
}

function photoUrl(player: any) {
  return player.foto ? `${directusUrl}/assets/${player.foto}?width=200&height=200&fit=cover` : undefined
}

const tabItems = [
  { label: 'Squad', value: 'squad' },
  { label: 'Semua', value: 'semua' },
  { label: 'A–Z', value: 'az' }
]
const activeTab = ref('squad')

const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
const activeLetter = ref('A')

const search = ref('')
const page = ref(1)
const itemsPerPage = 12

const filteredPlayers = computed(() => {
  let list = players.value ?? []

  if (activeTab.value === 'squad') list = list.filter((p) => !p.tahun_aktif_selesai)
  if (activeTab.value === 'az') list = list.filter((p) => p.nama?.[0]?.toUpperCase() === activeLetter.value)

  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((p) => p.nama?.toLowerCase().includes(q))

  return list
})

watch([activeTab, activeLetter, search], () => {
  page.value = 1
})

const total = computed(() => filteredPlayers.value.length)

const pagedPlayers = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredPlayers.value.slice(start, start + itemsPerPage)
})

useSeoMeta({
  title: 'Direktori Pemain — Sejarah Persib Bandung',
  description: 'Direktori pemain Persib Bandung dari berbagai era.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Direktori Pemain"
        description="Pemain-pemain yang membela Persib Bandung dari masa ke masa."
      />

      <UPageBody>
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <UTabs
            v-model="activeTab"
            :items="tabItems"
          />
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Cari nama pemain..."
            class="sm:w-64"
          />
        </div>

        <div
          v-if="activeTab === 'az'"
          class="flex flex-wrap gap-1 mt-4"
        >
          <UButton
            v-for="letter in alphabet"
            :key="letter"
            :variant="activeLetter === letter ? 'solid' : 'ghost'"
            color="primary"
            size="xs"
            @click="() => { activeLetter = letter }"
          >
            {{ letter }}
          </UButton>
        </div>

        <UPageGrid class="mt-6">
          <UPageCard
            v-for="player in pagedPlayers"
            :key="player.id"
            :title="player.nama"
            :description="tr(player)?.biodata"
            spotlight
          >
            <template #leading>
              <img
                v-if="photoUrl(player)"
                :src="photoUrl(player)"
                :alt="player.nama"
                class="size-12 rounded-full object-cover"
              >
              <UIcon
                v-else
                name="i-lucide-user"
                class="size-6"
              />
            </template>

            <template #footer>
              <div class="flex items-center gap-2 flex-wrap text-sm text-muted">
                <UBadge
                  v-for="pos in player.posisi"
                  :key="pos"
                  color="primary"
                  variant="subtle"
                >
                  {{ pos }}
                </UBadge>
                <span>{{ player.tahun_aktif_mulai }}–{{ player.tahun_aktif_selesai ?? 'sekarang' }}</span>
              </div>
            </template>
          </UPageCard>
        </UPageGrid>

        <p
          v-if="!pagedPlayers.length"
          class="text-center text-muted py-8"
        >
          Tidak ada pemain ditemukan.
        </p>

        <div
          v-if="total > itemsPerPage"
          class="flex justify-center mt-8"
        >
          <UPagination
            v-model:page="page"
            :total="total"
            :items-per-page="itemsPerPage"
          />
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
