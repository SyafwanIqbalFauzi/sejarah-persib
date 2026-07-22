<script setup lang="ts">
import { readItems } from '@directus/sdk'

const directus = useDirectus()
const { public: { directusUrl } } = useRuntimeConfig()

const { data: coaches } = await useAsyncData('coaches', () => directus.request(
  readItems('coaches', {
    fields: ['id', 'nama', 'foto', 'negara', { periods: ['periode_mulai', 'periode_selesai'] }, { translations: ['languages_code', 'pencapaian'] }],
    filter: { status: { _eq: 'published' } },
    limit: -1
  })
))

function tr(coach: any) {
  return coach.translations.find((t: any) => t.languages_code === 'id-ID') ?? coach.translations[0]
}

function photoUrl(coach: any) {
  return coach.foto ? `${directusUrl}/assets/${coach.foto}?width=420&height=560&fit=cover` : undefined
}

function initials(nama: string) {
  return (nama ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('')
}

// Beberapa pelatih sempat menangani Persib lebih dari satu periode.
function periode(coach: any) {
  const periods = [...(coach.periods ?? [])].sort((a: any, b: any) => (a.periode_mulai ?? '').localeCompare(b.periode_mulai ?? ''))
  if (!periods.length) return '—'
  return periods
    .map((p: any) => {
      const start = p.periode_mulai?.slice(0, 4) ?? '—'
      const end = p.periode_selesai?.slice(0, 4)
      return end ? `${start}–${end}` : `${start}–sekarang`
    })
    .join(', ')
}

const search = ref('')
const page = ref(1)
const itemsPerPage = 10

const tahunDari = ref<number | null>(null)
const tahunSampai = ref<number | null>(null)
const selectedNegara = ref<string[]>([])

const negaraOptions = computed(() => {
  const all = (coaches.value ?? []).flatMap((c) => c.negara ?? [])
  return [...new Set(all)].sort((a, b) => a.localeCompare(b))
})

const hasFilter = computed(() =>
  search.value.trim() !== '' || tahunDari.value != null || tahunSampai.value != null || selectedNegara.value.length > 0
)
const showFilter = ref(true)

function resetFilter() {
  search.value = ''
  tahunDari.value = null
  tahunSampai.value = null
  selectedNegara.value = []
}

// Pelatih dianggap aktif di tahun tsb jika ada periode yang beririsan dengan rentang filter.
// periode_selesai kosong berarti masih menjabat hingga sekarang.
function aktifDiRentang(coach: any, dari: number | null, sampai: number | null) {
  const periods = coach.periods ?? []
  if (!periods.length) return false
  return periods.some((p: any) => {
    const mulai = p.periode_mulai ? Number(p.periode_mulai.slice(0, 4)) : -Infinity
    const selesai = p.periode_selesai ? Number(p.periode_selesai.slice(0, 4)) : Infinity
    const batasDari = dari ?? -Infinity
    const batasSampai = sampai ?? Infinity
    return mulai <= batasSampai && selesai >= batasDari
  })
}

const filteredCoaches = computed(() => {
  let list = coaches.value ?? []

  const q = search.value.trim().toLowerCase()
  if (q) list = list.filter((c) => c.nama?.toLowerCase().includes(q))

  if (tahunDari.value != null || tahunSampai.value != null) {
    list = list.filter((c) => aktifDiRentang(c, tahunDari.value, tahunSampai.value))
  }
  if (selectedNegara.value.length) {
    list = list.filter((c) => c.negara?.some((n: string) => selectedNegara.value.includes(n)))
  }

  return list
})

watch([search, tahunDari, tahunSampai, selectedNegara], () => {
  page.value = 1
})

const total = computed(() => filteredCoaches.value.length)

const pagedCoaches = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  return filteredCoaches.value.slice(start, start + itemsPerPage)
})

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
            <div class="grid gap-5 border-t border-default/60 p-4 sm:grid-cols-3 sm:p-5">
              <!-- Nama -->
              <div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-search" class="size-4 text-muted" />
                  <span class="text-sm font-medium">Nama pelatih</span>
                </div>
                <p class="mt-1 text-xs text-dimmed">
                  Cari berdasarkan nama pelatih.
                </p>
                <UInput
                  v-model="search"
                  icon="i-lucide-search"
                  placeholder="Cari nama pelatih..."
                  class="mt-3 w-full"
                />
              </div>

              <!-- Rentang tahun -->
              <div>
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-calendar-range" class="size-4 text-muted" />
                  <span class="text-sm font-medium">Rentang tahun aktif</span>
                </div>
                <p class="mt-1 text-xs text-dimmed">
                  Cari pelatih yang menangani Persib pada rentang tahun tertentu.
                </p>
                <div class="mt-3 flex items-center gap-2">
                  <UInputNumber
                    v-model="tahunDari"
                    placeholder="Dari"
                    :min="1900"
                    :max="2100"
                    :increment="false"
                    :decrement="false"
                    :format-options="{ useGrouping: false }"
                    class="w-full"
                  />
                  <UIcon name="i-lucide-arrow-right" class="size-4 shrink-0 text-dimmed" />
                  <UInputNumber
                    v-model="tahunSampai"
                    placeholder="Sampai"
                    :min="1900"
                    :max="2100"
                    :increment="false"
                    :decrement="false"
                    :format-options="{ useGrouping: false }"
                    class="w-full"
                  />
                </div>
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
                  Pilih satu atau lebih negara asal pelatih.
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
            </div>
          </template>
        </UCollapsible>

        <div class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="coach in pagedCoaches"
            :key="coach.id"
            class="group relative aspect-3/4 overflow-hidden rounded-2xl bg-persib-blue-900 shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <!-- Foto pelatih (mengisi seluruh kartu) -->
            <img
              v-if="photoUrl(coach)"
              :src="photoUrl(coach)"
              :alt="coach.nama"
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
              <span class="absolute text-5xl font-extrabold tracking-tight text-white/25">{{ initials(coach.nama) }}</span>
            </div>

            <!-- Gradient supaya teks terbaca -->
            <div class="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

            <!-- Nama, negara & periode -->
            <div class="absolute inset-x-0 bottom-0 p-4">
              <h3 class="text-lg leading-tight font-bold text-white">{{ coach.nama }}</h3>
              <p
                v-if="coach.negara?.length"
                class="mt-0.5 text-xs font-medium text-white/60"
              >
                {{ coach.negara.join(' / ') }}
              </p>
              <p class="mt-0.5 text-sm font-medium text-white/75 tabular-nums">{{ periode(coach) }}</p>
            </div>
          </div>
        </div>

        <p
          v-if="!pagedCoaches.length"
          class="text-center text-muted py-8"
        >
          Tidak ada pelatih ditemukan.
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
