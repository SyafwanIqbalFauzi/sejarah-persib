<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()
const { public: { directusUrl } } = useRuntimeConfig()

const { data: players } = await useAsyncData('players', () => directus.request(
  readItems('players', {
    fields: ['id', 'slug', 'nama', 'posisi', 'foto', 'negara', { periods: ['tahun_mulai', 'tahun_selesai'] }],
    filter: { status: { _eq: 'published' } },
    sort: ['nama'],
    limit: -1
  })
))

const { data: seasons } = await useAsyncData('seasons-for-squad', () => directus.request(
  readItems('seasons', {
    fields: ['id', 'nama_kompetisi', 'tahun_mulai', 'tahun_selesai'],
    filter: { status: { _eq: 'published' } },
    sort: ['-tahun_mulai', '-tahun_selesai'],
    limit: -1
  })
))

// Seasons cut short or invalidated for reasons not evident from the data itself.
const seasonNotes: Record<number, string> = {
  58: 'Mengundurkan Diri',
  59: 'Tidak Diakui FIFA',
  62: 'Liga Batal - Sanksi FIFA',
  66: 'Liga Batal - Covid19'
}

function seasonLabel(season: any) {
  const rentang = season.tahun_selesai && season.tahun_selesai !== season.tahun_mulai
    ? `${season.tahun_mulai}/${season.tahun_selesai}`
    : `${season.tahun_mulai}`
  const label = `${season.nama_kompetisi ?? 'Liga'} ${rentang}`
  const note = seasonNotes[season.id]
  return note ? `${label} (${note})` : label
}

const seasonOptions = computed(() => (seasons.value ?? []).map((s) => ({ label: seasonLabel(s), value: s.id })))

// Terbaru = urutan pertama, karena seasons sudah di-sort desc dari server.
const defaultSeasonId = computed(() => seasons.value?.[0]?.id ?? null)
const selectedSeason = ref<number | null>(null)
watch(seasons, (val) => {
  if (selectedSeason.value == null && val?.[0]) selectedSeason.value = val[0].id
}, { immediate: true })

const { data: squadStats } = await useAsyncData(
  'squad-stats',
  () => selectedSeason.value
    ? directus.request(readItems('player_season_stats', {
      fields: ['player', 'nomor_punggung', 'jumlah_laga', 'gol', 'assist'],
      filter: { season: { _eq: selectedSeason.value } },
      limit: -1
    }))
    : Promise.resolve([]),
  { watch: [selectedSeason] }
)

const squadByPlayerId = computed(() => {
  const map = new Map<number, any>()
  for (const s of squadStats.value ?? []) map.set(s.player, s)
  return map
})

function photoUrl(player: any) {
  return player.foto ? `${directusUrl}/assets/${player.foto}?width=420&height=560&fit=cover` : undefined
}

function initials(nama: string) {
  return (nama ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

// Beberapa pemain sempat pindah lalu kembali ke Persib (lebih dari satu periode aktif).
function periodeAktif(player: any) {
  const periods = [...(player.periods ?? [])].sort((a: any, b: any) => (a.tahun_mulai ?? 0) - (b.tahun_mulai ?? 0))
  if (!periods.length) return '—'
  return periods
    .map((p: any) => `${p.tahun_mulai ?? '—'}–${p.tahun_selesai ?? 'sekarang'}`)
    .join(', ')
}

const tabItems = [
  { label: 'Squad', value: 'squad' },
  { label: 'Semua', value: 'semua' },
  { label: 'A–Z', value: 'az' }
]
const activeTab = ref('semua')

const alphabet = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))
const activeLetter = ref('A')

const search = ref('')
const page = ref(1)
const itemsPerPage = 12

const tahunDari = ref<number | null>(null)
const tahunSampai = ref<number | null>(null)
const selectedNegara = ref<string[]>([])
const selectedPosisi = ref<string[]>([])

const negaraOptions = computed(() => {
  const all = (players.value ?? []).flatMap((p) => p.negara ?? [])
  return [...new Set(all)].sort((a, b) => a.localeCompare(b))
})

const posisiOptions = computed(() => {
  const all = (players.value ?? []).flatMap((p) => p.posisi ?? [])
  return [...new Set(all)].sort((a, b) => a.localeCompare(b))
})

const hasFilter = computed(() =>
  search.value.trim() !== ''
  || tahunDari.value != null
  || tahunSampai.value != null
  || selectedNegara.value.length > 0
  || selectedPosisi.value.length > 0
  || (activeTab.value === 'squad' && selectedSeason.value !== defaultSeasonId.value)
)
const showFilter = ref(true)

function resetFilter() {
  search.value = ''
  tahunDari.value = null
  tahunSampai.value = null
  selectedNegara.value = []
  selectedPosisi.value = []
  selectedSeason.value = defaultSeasonId.value
}

// Pemain dianggap aktif di tahun tsb jika ada periode yang beririsan dengan rentang filter.
// tahun_selesai kosong berarti masih aktif hingga sekarang.
function aktifDiRentang(player: any, dari: number | null, sampai: number | null) {
  const periods = player.periods ?? []
  if (!periods.length) return false
  return periods.some((p: any) => {
    const mulai = p.tahun_mulai ?? -Infinity
    const selesai = p.tahun_selesai ?? Infinity
    const batasDari = dari ?? -Infinity
    const batasSampai = sampai ?? Infinity
    return mulai <= batasSampai && selesai >= batasDari
  })
}

const filteredPlayers = computed(() => {
  let list = players.value ?? []

  if (activeTab.value === 'squad') list = list.filter((p) => squadByPlayerId.value.has(p.id))
  if (activeTab.value === 'az') list = list.filter((p) => p.nama?.[0]?.toUpperCase() === activeLetter.value)

  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((p) => p.nama?.toLowerCase().includes(q))

  if (selectedNegara.value.length) {
    list = list.filter((p) => p.negara?.some((n: string) => selectedNegara.value.includes(n)))
  }

  if (activeTab.value !== 'squad') {
    if (tahunDari.value != null || tahunSampai.value != null) {
      list = list.filter((p) => aktifDiRentang(p, tahunDari.value, tahunSampai.value))
    }
    if (selectedPosisi.value.length) {
      list = list.filter((p) => p.posisi?.some((pos: string) => selectedPosisi.value.includes(pos)))
    }
  }

  // Squad: pemain dengan jumlah laga terbanyak tampil lebih dulu.
  if (activeTab.value === 'squad') {
    list = [...list].sort((a, b) => (squadByPlayerId.value.get(b.id)?.jumlah_laga ?? 0) - (squadByPlayerId.value.get(a.id)?.jumlah_laga ?? 0))
  }

  return list
})

watch([activeTab, activeLetter, search, tahunDari, tahunSampai, selectedNegara, selectedPosisi], () => {
  page.value = 1
})

const total = computed(() => filteredPlayers.value.length)

const pagedPlayers = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredPlayers.value.slice(start, start + itemsPerPage)
})

useSeoMeta({
  title: 'Daftar Pemain — Sejarah Persib Bandung',
  description: 'Daftar pemain Persib Bandung dari berbagai era.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Daftar Pemain"
        description="Pemain-pemain yang membela Persib Bandung dari masa ke masa."
      />

      <UPageBody>
        <UTabs
          v-model="activeTab"
          :items="tabItems"
        />

        <!-- ===================== FILTER ===================== -->
        <UCollapsible
          v-model:open="showFilter"
          class="mt-4 overflow-hidden rounded-2xl border border-default bg-elevated/30"
        >
          <template #default="{ open }">
            <button
              type="button"
              class="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-5"
            >
              <span class="flex items-center gap-2">
                <UIcon name="i-lucide-sliders-horizontal" class="size-4 text-primary" />
                <span class="text-sm font-semibold">Filter Pencarian</span>
                <UBadge
                  v-if="hasFilter"
                  color="primary"
                  variant="subtle"
                  size="sm"
                >
                  Aktif
                </UBadge>
              </span>
              <span class="flex items-center gap-2">
                <UButton
                  v-if="hasFilter"
                  label="Reset semua"
                  icon="i-lucide-rotate-ccw"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  @click.stop="resetFilter"
                />
                <UIcon
                  name="i-lucide-chevron-down"
                  class="size-4 text-muted transition-transform"
                  :class="open ? 'rotate-180' : ''"
                />
              </span>
            </button>
          </template>

          <template #content>
            <div
              class="grid gap-5 border-t border-default/60 p-4 sm:p-5"
              :class="activeTab === 'squad' ? 'sm:grid-cols-3' : 'sm:grid-cols-4'"
            >
              <!-- Musim (khusus tab Squad) -->
              <div v-if="activeTab === 'squad'">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-calendar" class="size-4 text-muted" />
                  <span class="text-sm font-medium">Musim</span>
                </div>
                <p class="mt-1 text-xs text-dimmed">
                  Skuad pemain pada musim yang dipilih.
                </p>
                <USelectMenu
                  v-model="selectedSeason"
                  :items="seasonOptions"
                  value-key="value"
                  :disabled="!seasonOptions.length"
                  :placeholder="seasonOptions.length ? 'Pilih musim...' : 'Belum ada data musim'"
                  class="mt-3 w-full"
                  :ui="{ itemLabel: 'overflow-hidden whitespace-nowrap [container-type:inline-size]' }"
                >
                  <template #item-label="{ item }">
                    <span
                      class="inline-block whitespace-nowrap transition-transform duration-[1.6s] ease-linear group-hover:translate-x-[min(0px,calc(100cqw-100%))]"
                    >
                      {{ item.label }}
                    </span>
                  </template>
                </USelectMenu>
              </div>

              <!-- Nama -->
              <div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-search" class="size-4 text-muted" />
                  <span class="text-sm font-medium">Nama pemain</span>
                </div>
                <p class="mt-1 text-xs text-dimmed">
                  Cari berdasarkan nama pemain.
                </p>
                <UInput
                  v-model="search"
                  icon="i-lucide-search"
                  placeholder="Cari nama pemain..."
                  class="mt-3 w-full"
                />
              </div>

              <!-- Negara -->
              <div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-flag" class="size-4 text-muted" />
                  <span class="text-sm font-medium">Kewarganegaraan</span>
                  <UBadge
                    v-if="selectedNegara.length"
                    color="primary"
                    variant="subtle"
                    size="sm"
                  >
                    {{ selectedNegara.length }}
                  </UBadge>
                </div>
                <p class="mt-1 text-xs text-dimmed">
                  Pilih satu atau lebih negara asal pemain.
                </p>
                <USelectMenu
                  v-model="selectedNegara"
                  :items="negaraOptions"
                  multiple
                  :disabled="!negaraOptions.length"
                  :placeholder="negaraOptions.length ? 'Pilih negara...' : 'Belum ada data negara'"
                  class="mt-3 w-full"
                >
                  <template #item="{ item }">
                    <UCheckbox
                      :model-value="selectedNegara.includes(item)"
                      :label="item"
                      size="sm"
                      tabindex="-1"
                      class="pointer-events-none"
                    />
                  </template>
                </USelectMenu>
              </div>

              <template v-if="activeTab !== 'squad'">
              <!-- Rentang tahun -->
              <div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-calendar-range" class="size-4 text-muted" />
                  <span class="text-sm font-medium">Rentang tahun aktif</span>
                </div>
                <p class="mt-1 text-xs text-dimmed">
                  Rentang tahun aktif di Persib.
                </p>
                <div class="mt-3 flex items-center gap-2">
                  <UInput
                    :model-value="tahunDari != null ? String(tahunDari) : ''"
                    type="number"
                    placeholder="Dari"
                    :min="1900"
                    :max="2100"
                    class="w-full"
                    :ui="{ base: '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none' }"
                    @update:model-value="(v: string) => { const n = Number(v); tahunDari = v === '' || Number.isNaN(n) ? null : n }"
                  />
                  <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0 text-dimmed" />
                  <UInput
                    :model-value="tahunSampai != null ? String(tahunSampai) : ''"
                    type="number"
                    placeholder="Sampai"
                    :min="1900"
                    :max="2100"
                    class="w-full"
                    :ui="{ base: '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none' }"
                    @update:model-value="(v: string) => { const n = Number(v); tahunSampai = v === '' || Number.isNaN(n) ? null : n }"
                  />
                </div>
              </div>

              <!-- Posisi -->
              <div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-shirt" class="size-4 text-muted" />
                  <span class="text-sm font-medium">Posisi</span>
                  <UBadge
                    v-if="selectedPosisi.length"
                    color="primary"
                    variant="subtle"
                    size="sm"
                  >
                    {{ selectedPosisi.length }}
                  </UBadge>
                </div>
                <p class="mt-1 text-xs text-dimmed">
                  Pilih satu atau lebih posisi bermain.
                </p>
                <USelectMenu
                  v-model="selectedPosisi"
                  :items="posisiOptions"
                  multiple
                  :disabled="!posisiOptions.length"
                  :placeholder="posisiOptions.length ? 'Pilih posisi...' : 'Belum ada data posisi'"
                  class="mt-3 w-full"
                >
                  <template #item="{ item }">
                    <UCheckbox
                      :model-value="selectedPosisi.includes(item)"
                      :label="item"
                      size="sm"
                      tabindex="-1"
                      class="pointer-events-none"
                    />
                  </template>
                </USelectMenu>
              </div>
              </template>
            </div>
          </template>
        </UCollapsible>

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

        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="player in pagedPlayers"
            :key="player.id"
            class="group relative aspect-3/4 overflow-hidden rounded-2xl bg-persib-blue-900 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <!-- Foto pemain (mengisi seluruh kartu) -->
            <img
              v-if="photoUrl(player)"
              :src="photoUrl(player)"
              :alt="player.nama"
              class="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
            >
            <!-- Placeholder saat belum ada foto -->
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-persib-blue-700 to-persib-blue-950"
            >
              <img
                src="/logo/sejarah-persib-badge-mono.svg"
                alt=""
                aria-hidden="true"
                class="w-2/3 opacity-10"
              >
              <span class="absolute text-5xl font-extrabold tracking-tight text-white/25">{{ initials(player.nama) }}</span>
            </div>

            <!-- Gradient supaya teks terbaca -->
            <div class="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

            <!-- Nomor punggung (khusus tab Squad, pojok atas kanan) -->
            <div
              v-if="activeTab === 'squad' && squadByPlayerId.get(player.id)?.nomor_punggung != null"
              class="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/40 text-sm font-bold text-white backdrop-blur-sm"
            >
              {{ squadByPlayerId.get(player.id)?.nomor_punggung }}
            </div>

            <!-- Posisi (pojok atas) -->
            <div
              v-if="player.posisi?.length"
              class="absolute inset-x-3 top-3 flex flex-wrap gap-1 pr-10"
            >
              <span
                v-for="pos in player.posisi"
                :key="pos"
                class="rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm"
              >
                {{ pos }}
              </span>
            </div>

            <!-- Nama, negara & periode aktif -->
            <div class="absolute inset-x-0 bottom-0 p-4">
              <h3 class="text-lg leading-tight font-bold text-white">{{ player.nama }}</h3>
              <p
                v-if="player.negara?.length"
                class="mt-0.5 text-xs font-medium text-white/60"
              >
                {{ player.negara.join(' / ') }}
              </p>
              <p class="mt-0.5 text-sm font-medium text-white/75 tabular-nums">{{ periodeAktif(player) }}</p>
            </div>
          </div>
        </div>

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
