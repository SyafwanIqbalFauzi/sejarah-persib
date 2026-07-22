<script setup lang="ts">
import { createItem, readItems } from '@directus/sdk'

const directus = useDirectus()

const { data: trophies } = await useAsyncData('home-trophies', () => directus.request(
  readItems('trophies', {
    fields: [
      'id', 'jenis', 'kategori_turunan',
      { season: ['tahun_mulai', 'tahun_selesai'] },
      { cup_season: ['tahun_mulai', 'tahun_selesai'] },
      { asia_season: ['tahun_mulai', 'tahun_selesai'] },
      { pramusim_season: ['tahun_mulai', 'tahun_selesai'] },
      { tidak_resmi_season: ['tahun_mulai', 'tahun_selesai'] }
    ],
    filter: { status: { _eq: 'published' } },
    limit: -1
  })
))

// Sebuah gelar terhubung ke salah satu koleksi season (Liga/Piala/Asia/Pramusim).
// Tahun diraih = tahun_selesai season terkait (fallback tahun_mulai).
function achievedYear(trophy: any): number | null {
  const s = trophy.season ?? trophy.cup_season ?? trophy.asia_season ?? trophy.pramusim_season ?? trophy.tidak_resmi_season ?? null
  if (!s) return null
  return s.tahun_selesai ?? s.tahun_mulai ?? null
}

// Urutan tetap kategori gelar klub beserta label & ikonnya.
const kategoriOrder = [
  { key: 'liga_profesional', label: 'Liga Profesional', icon: 'i-lucide-trophy' },
  { key: 'liga_amatir', label: 'Liga Perserikatan', icon: 'i-lucide-shield' },
  { key: 'piala_liga', label: 'Piala Liga', icon: 'i-lucide-medal' },
  { key: 'kompetisi_pramusim', label: 'Pramusim', icon: 'i-lucide-swords' },
  { key: 'kompetisi_tidak_resmi', label: 'Tidak Resmi', icon: 'i-lucide-star' }
]

const clubTrophies = computed(() =>
  (trophies.value ?? []).filter((t: any) => t.jenis === 'klub' && achievedYear(t) !== null)
)

// Rentang tahun slider tetap: dari berdirinya Persib (1933) hingga tahun berjalan.
const heroMinYear = 1933
const heroMaxYear = new Date().getFullYear()
const heroYear = ref<number>(heroMaxYear)

// Kategori yang Persib pernah juarai (total sepanjang masa > 0). Kategori tanpa
// gelar sama sekali disembunyikan di hero — slide lengkapnya tetap di halaman Gelar.
const categoriesWithTitles = computed(() => {
  const total: Record<string, number> = {}
  for (const t of clubTrophies.value) {
    const key = t.kategori_turunan ?? 'lainnya'
    total[key] = (total[key] ?? 0) + 1
  }
  return kategoriOrder.filter((cat) => (total[cat.key] ?? 0) > 0)
})

// Hitung kumulatif: semua gelar yang diraih s/d tahun terpilih, dikelompokkan per kategori.
const heroCategoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const t of clubTrophies.value) {
    if ((achievedYear(t) as number) <= heroYear.value) {
      const key = t.kategori_turunan ?? 'lainnya'
      counts[key] = (counts[key] ?? 0) + 1
    }
  }
  return categoriesWithTitles.value.map((cat) => ({ ...cat, count: counts[cat.key] ?? 0 }))
})

const cards = [
  {
    to: '/era-ke-era',
    title: 'Era ke Era',
    description: 'Jejak era demi era, dari Perserikatan hingga Superleague.',
    icon: '<svg width="24" height="24" viewBox="0 0 34 34"><line x1="3" y1="17" x2="31" y2="17" stroke="#fff" stroke-width="2.5"/><circle cx="7" cy="17" r="3.5" fill="#fff"/><circle cx="17" cy="17" r="3.5" fill="#fff"/><circle cx="27" cy="17" r="3.5" fill="#fff"/></svg>'
  },
  {
    to: '/prestasi',
    title: 'Prestasi',
    description: 'Catatan juara dan penghargaan sepanjang perjalanan klub.',
    icon: '<svg width="24" height="24" viewBox="0 0 34 34"><circle cx="17" cy="13" r="9" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M12 21 L9 31 L17 27 L25 31 L22 21" fill="#fff"/></svg>'
  },
  {
    to: '/kompetisi',
    title: 'Kompetisi',
    description: 'Rekap kompetisi yang pernah diikuti, dari liga hingga turnamen tidak resmi.',
    icon: '<svg width="24" height="24" viewBox="0 0 34 34"><rect x="9" y="9" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.5" transform="rotate(45 17 17)"/></svg>'
  },
  
  {
    to: '/pemain',
    title: 'Pemain',
    description: 'Wajah-wajah yang pernah mengenakan seragam Maung Bandung.',
    icon: '<svg width="24" height="24" viewBox="0 0 34 34"><circle cx="17" cy="10" r="6" fill="#fff"/><path d="M4 31 Q4 19 17 19 Q30 19 30 31" fill="#fff"/></svg>'
  },
  {
    to: '/pelatih',
    title: 'Pelatih',
    description: 'Tangan dingin di balik taktik dan pencapaian tim.',
    icon: '<svg width="24" height="24" viewBox="0 0 34 34"><circle cx="14" cy="9" r="5" fill="#fff"/><rect x="4" y="17" width="26" height="15" rx="2" fill="none" stroke="#fff" stroke-width="2.5"/><line x1="9" y1="24" x2="25" y2="24" stroke="#fff" stroke-width="2"/></svg>'
  }
  // ,
  // {
  //   to: '/pertandingan',
  //   title: 'Pertandingan Bersejarah',
  //   description: 'Laga-laga ikonik yang layak dikenang dan diceritakan ulang.',
  //   icon: '<svg width="24" height="24" viewBox="0 0 34 34"><rect x="9" y="9" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.5" transform="rotate(45 17 17)"/></svg>'
  // },
  // {
  //   to: '/cerita',
  //   title: 'Cerita & Fun Fact',
  //   description: 'Kisah ringan dan detail unik seputar sejarah klub.',
  //   icon: '<svg width="24" height="24" viewBox="0 0 34 34"><rect x="6" y="5" width="22" height="24" rx="1.5" fill="none" stroke="#fff" stroke-width="2.5"/><line x1="11" y1="12" x2="23" y2="12" stroke="#fff" stroke-width="2"/><line x1="11" y1="18" x2="23" y2="18" stroke="#fff" stroke-width="2"/><line x1="11" y1="24" x2="19" y2="24" stroke="#fff" stroke-width="2"/></svg>'
  // }
]

const kategoriOptions = ['Koreksi data sejarah', 'Saran fitur', 'Lainnya']

const form = reactive({
  nama: '',
  email: '',
  kategori: kategoriOptions[0],
  pesan: ''
})
const submitting = ref(false)
const submitted = ref(false)
const submitError = ref('')

async function submitFeedback() {
  if (!form.pesan.trim()) return
  submitting.value = true
  submitError.value = ''
  try {
    await directus.request(createItem('feedback', { ...form }))
    submitted.value = true
    form.nama = ''
    form.email = ''
    form.kategori = kategoriOptions[0]
    form.pesan = ''
  } catch {
    submitError.value = 'Gagal mengirim masukan. Silakan coba lagi.'
  } finally {
    submitting.value = false
  }
}

const title = 'Sejarah PERSIB'
const description = 'Arsip & sejarah PERSIB Bandung — kronologi era, pemain, gelar, dan pertandingan bersejarah. Fan project, tidak berafiliasi dengan manajemen klub resmi.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="relative overflow-hidden bg-gradient-to-br from-persib-blue-800 to-persib-blue-900">
      <div class="absolute -top-[120px] -right-20 h-[520px] w-[520px] bg-gradient-to-br from-persib-blue-500 to-persib-blue-700 opacity-35 [clip-path:polygon(30%_0%,100%_0%,100%_100%,0%_70%)]" />

      <!-- Tekstur titik halus untuk memberi kedalaman -->
      <div class="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:26px_26px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />

      <!-- Watermark lambang klub -->
      <img
        src="/logo/sejarah-persib-badge-mono.svg"
        alt=""
        aria-hidden="true"
        class="pointer-events-none absolute -bottom-24 -left-24 size-[420px] opacity-20 select-none"
      >

      <div class="relative mx-auto flex max-w-6xl flex-col items-center gap-14 px-6 pt-[104px] pb-24 sm:px-12 lg:flex-row">
        <div class="min-w-0 flex-[1.15]">
          <div class="hero-anim mb-7 inline-block rounded-[20px] border border-persib-blue-500/50 bg-persib-blue-500/18 px-4 py-[7px] text-xs font-bold tracking-[1.5px] text-persib-blue-300 uppercase">
            Arsip Sejarah
          </div>
          <h1 class="hero-anim-d1 mb-6 text-5xl leading-[1.02] font-extrabold tracking-[-1.5px] text-white uppercase sm:text-[60px]">
            Sejarah PERSIB<br>Bandung
          </h1>
          <p class="hero-anim-d2 mb-10 max-w-[520px] text-lg leading-[1.65] text-slate-300">
            Era, pemain, dan prestasi Maung Bandung dari masa ke masa.
          </p>
          <div class="hero-anim-d2 flex flex-wrap gap-[14px]">
            <UButton
              to="/era-ke-era"
              class="rounded-lg bg-persib-blue-500 px-[30px] py-4 text-[15px] font-bold hover:bg-persib-blue-400"
            >
              Jelajahi Era ke Era
            </UButton>
            <UButton
              to="#arsip"
              variant="outline"
              class="rounded-lg border-[1.5px] border-white/30 px-7 py-[14.5px] text-[15px] font-bold text-white hover:border-persib-blue-500 hover:bg-white/6"
            >
              Lihat Semua
            </UButton>
          </div>
        </div>

        <div class="hero-anim-d1 w-full flex-1">
          <div class="rounded-2xl border border-white/12 bg-white/[0.04] p-6 backdrop-blur-sm sm:p-8">
            <div class="mb-5 text-sm text-slate-300">
              Gelar klub hingga <span class="font-semibold text-white">{{ heroYear }}</span>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div
                v-for="cat in heroCategoryCounts"
                :key="cat.key"
                class="flex items-center gap-3 rounded-xl border px-4 py-4"
                :class="cat.key === 'liga_profesional'
                  ? 'border-persib-blue-400/60 bg-gradient-to-br from-persib-blue-500/25 to-persib-blue-600/10 ring-1 ring-persib-blue-400/40'
                  : 'border-white/10 bg-white/[0.03]'"
                :style="cat.count === 0 && cat.key !== 'liga_profesional' ? 'opacity:0.45' : ''"
              >
                <UIcon
                  :name="cat.icon"
                  class="size-6 shrink-0"
                  :class="cat.key === 'liga_profesional' ? 'text-persib-blue-200' : 'text-persib-blue-300'"
                />
                <div class="min-w-0">
                  <div class="text-2xl leading-none font-bold text-white tabular-nums">{{ cat.count }}</div>
                  <div class="mt-1 truncate text-xs text-slate-300">{{ cat.label }}</div>
                </div>
              </div>
            </div>

            <div class="mt-6">
              <div class="mb-3 flex items-center justify-between">
                <span class="text-xs font-medium text-slate-400">Geser untuk lihat perkembangan gelar</span>
                <UBadge color="primary" variant="subtle" size="lg" class="tabular-nums">{{ heroYear }}</UBadge>
              </div>
              <USlider
                v-model="heroYear"
                :min="heroMinYear"
                :max="heroMaxYear"
                :step="1"
                size="lg"
              />
              <div class="mt-2 flex justify-between text-[11px] text-slate-500 tabular-nums">
                <span>{{ heroMinYear }}</span>
                <span>{{ heroMaxYear }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- GRID 6 KARTU -->
    <section
      id="arsip"
      class="bg-slate-50 px-6 py-24 text-center sm:px-12 dark:bg-slate-950"
    >
      <div class="mb-5 inline-block rounded-[20px] bg-persib-blue-100 px-4 py-[6px] text-xs font-bold tracking-[1.5px] text-persib-blue-700 uppercase dark:bg-persib-blue-500/15 dark:text-persib-blue-300">
        Jelajahi Arsip
      </div>
      <h2 class="mb-[14px] text-[34px] font-extrabold tracking-[-0.5px] text-slate-900 dark:text-white">
        Ruang Arsip
      </h2>
      <p class="mx-auto mb-14 max-w-[520px] text-base text-slate-500">
        Setiap ruang menyimpan bagian dari perjalanan panjang Maung Bandung.
      </p>

      <div class="mx-auto grid max-w-[1180px] gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
        <NuxtLink
          v-for="card in cards"
          :key="card.to"
          :to="card.to"
          class="group relative overflow-hidden rounded-[14px] border border-slate-200 bg-white px-7 py-8 transition-all duration-300 hover:-translate-y-[3px] hover:border-persib-blue-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-persib-blue-500/50"
        >
          <!-- Aksen atas muncul saat hover -->
          <span class="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-gradient-to-r from-persib-blue-500 to-persib-blue-700 transition-transform duration-300 group-hover:scale-x-100" />

          <div
            class="mb-[18px] flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-persib-blue-600 to-persib-blue-800 shadow-sm ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105"
            v-html="card.icon"
          />
          <h3 class="mb-2 text-[19px] font-bold text-slate-900 dark:text-white">
            {{ card.title }}
          </h3>
          <p class="mb-[18px] text-[14.5px] leading-[1.55] text-slate-500">
            {{ card.description }}
          </p>
          <span class="inline-flex items-center gap-1.5 text-sm font-bold text-persib-blue-500">
            Selengkapnya
            <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </NuxtLink>
      </div>
    </section>

    <!-- FORM KRITIK & SARAN -->
    <section class="bg-slate-50 px-6 py-[88px] sm:px-12 dark:bg-slate-950">
      <div class="mx-auto grid max-w-[960px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)] lg:grid-cols-[0.85fr_1.15fr] dark:border-slate-800 dark:bg-slate-900">
        <!-- Kiri: konteks & pitch -->
        <div class="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-persib-blue-700 to-persib-blue-900 p-10 sm:p-11">
          <div
            class="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:radial-gradient(rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
          />
          <div class="relative">
            <div class="mb-4 inline-block rounded-[20px] border border-white/20 bg-white/10 px-[14px] py-[5px] text-[11px] font-bold tracking-[1.5px] text-persib-blue-200 uppercase">
              Masukan
            </div>
            <h3 class="mb-3 text-[27px] font-extrabold text-white">
              Kritik & Saran
            </h3>
            <p class="text-[14.5px] leading-relaxed text-slate-300">
              Temukan data yang keliru, atau punya ide fitur? Kabari kami — setiap masukan bobotoh membantu arsip ini makin akurat.
            </p>
          </div>

          <ul class="relative mt-10 flex flex-col gap-4">
            <li class="flex items-start gap-3">
              <div class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <UIcon name="i-lucide-file-search" class="size-4 text-white" />
              </div>
              <span class="text-[13.5px] leading-snug text-slate-300">Koreksi data sejarah yang kurang tepat</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <UIcon name="i-lucide-lightbulb" class="size-4 text-white" />
              </div>
              <span class="text-[13.5px] leading-snug text-slate-300">Saran fitur atau ruang arsip baru</span>
            </li>
            <li class="flex items-start gap-3">
              <div class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <UIcon name="i-lucide-message-circle" class="size-4 text-white" />
              </div>
              <span class="text-[13.5px] leading-snug text-slate-300">Catatan atau pertanyaan lainnya</span>
            </li>
          </ul>
        </div>

        <!-- Kanan: form -->
        <div class="p-10 sm:p-11">
          <form
            class="flex flex-col gap-[18px]"
            @submit.prevent="submitFeedback"
          >
            <div class="grid gap-4 sm:grid-cols-2">
              <UFormField label="Nama (opsional)">
                <UInput
                  v-model="form.nama"
                  icon="i-lucide-user"
                  placeholder="Nama Anda"
                  class="w-full"
                />
              </UFormField>
              <UFormField label="Email (opsional)">
                <UInput
                  v-model="form.email"
                  type="email"
                  icon="i-lucide-mail"
                  placeholder="nama@email.com"
                  class="w-full"
                />
              </UFormField>
            </div>

            <UFormField label="Kategori">
              <USelect
                v-model="form.kategori"
                :items="kategoriOptions"
                icon="i-lucide-tag"
                class="w-full"
              />
            </UFormField>

            <UFormField label="Pesan">
              <UTextarea
                v-model="form.pesan"
                required
                placeholder="Tuliskan koreksi, saran, atau catatan Anda..."
                :rows="4"
                class="w-full"
              />
            </UFormField>

            <UAlert
              v-if="submitError"
              color="error"
              variant="subtle"
              icon="i-lucide-circle-alert"
              :title="submitError"
            />
            <UAlert
              v-if="submitted"
              color="primary"
              variant="subtle"
              icon="i-lucide-circle-check"
              title="Terima kasih, masukan Anda sudah kami terima."
            />

            <div>
              <UButton
                type="submit"
                :loading="submitting"
                icon="i-lucide-send"
                class="rounded-[10px] bg-persib-blue-500 px-8 py-[15px] text-[15px] font-bold hover:bg-persib-blue-400"
              >
                Kirim Masukan
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- DISCLAIMER (ringkas, tepat di atas footer) -->
    <section class="border-t border-slate-200 bg-slate-100 px-6 py-8 sm:px-12 dark:border-slate-800 dark:bg-slate-900">
      <div class="mx-auto flex max-w-[820px] items-center gap-4 text-center sm:text-left">
        <div class="hidden size-9 shrink-0 items-center justify-center rounded-full bg-[#FEE7E4] sm:flex dark:bg-red-500/15">
          <svg width="18" height="18" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="8" fill="none" stroke="#B23A2E" stroke-width="2" />
            <line x1="10" y1="6" x2="10" y2="11" stroke="#B23A2E" stroke-width="2" stroke-linecap="round" />
            <circle cx="10" cy="14" r="1.1" fill="#B23A2E" />
          </svg>
        </div>
        <p class="text-[13px] leading-[1.6] text-slate-600 dark:text-slate-400">
          <strong class="text-slate-800 dark:text-slate-200">Situs Bobotoh-made, bukan kanal resmi.</strong>
          Sejarah Persib adalah proyek arsip yang dibuat dan dikelola bobotoh, <strong>tidak berafiliasi dan tidak mewakili</strong> PT Persib Bandung Bermartabat atau manajemen klub. Data disusun dari sumber terbuka dan terus diperbarui seiring verifikasi.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
@keyframes heroRise {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
.hero-anim { animation: heroRise 0.7s cubic-bezier(.22,.9,.32,1) both; }
.hero-anim-d1 { animation: heroRise 0.7s cubic-bezier(.22,.9,.32,1) 0.08s both; }
.hero-anim-d2 { animation: heroRise 0.7s cubic-bezier(.22,.9,.32,1) 0.16s both; }

@keyframes prStripeMove {
  from { background-position: 0 0; }
  to { background-position: 132px 0; }
}
.pr-stripes {
  animation: prStripeMove 5s linear infinite;
  background-image: repeating-linear-gradient(115deg, rgba(255,255,255,0.09) 0px, rgba(255,255,255,0.09) 2px, transparent 2px, transparent 22px);
}

@keyframes prBallMove {
  0% { left: 8%; top: 66%; }
  25% { left: 33%; top: 20%; }
  50% { left: 59%; top: 62%; }
  75% { left: 81%; top: 24%; }
  100% { left: 8%; top: 66%; }
}
@keyframes prBallSpin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes prShadowPulse {
  0%, 100% { transform: scaleX(1); opacity: 0.28; }
  50% { transform: scaleX(0.7); opacity: 0.16; }
}
.pr-ball { animation: prBallMove 5.5s ease-in-out infinite; }
.pr-ball-spin { animation: prBallSpin 1.6s linear infinite; }
.pr-ball-shadow { animation: prShadowPulse 5.5s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .hero-anim, .hero-anim-d1, .hero-anim-d2, .pr-stripes, .pr-ball, .pr-ball-spin, .pr-ball-shadow {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
