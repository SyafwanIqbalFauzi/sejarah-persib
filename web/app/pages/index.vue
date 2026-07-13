<script setup lang="ts">
import { createItem } from '@directus/sdk'

const directus = useDirectus()

const cards = [
  {
    to: '/kronologi',
    title: 'Kronologi',
    description: 'Jejak era demi era, dari Perserikatan hingga Superleague.',
    icon: '<svg width="24" height="24" viewBox="0 0 34 34"><line x1="3" y1="17" x2="31" y2="17" stroke="#fff" stroke-width="2.5"/><circle cx="7" cy="17" r="3.5" fill="#fff"/><circle cx="17" cy="17" r="3.5" fill="#fff"/><circle cx="27" cy="17" r="3.5" fill="#fff"/></svg>'
  },
  {
    to: '/gelar',
    title: 'Gelar & Prestasi',
    description: 'Catatan juara dan penghargaan sepanjang perjalanan klub.',
    icon: '<svg width="24" height="24" viewBox="0 0 34 34"><circle cx="17" cy="13" r="9" fill="none" stroke="#fff" stroke-width="2.5"/><path d="M12 21 L9 31 L17 27 L25 31 L22 21" fill="#fff"/></svg>'
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
  },
  
  {
    to: '/pertandingan',
    title: 'Pertandingan Bersejarah',
    description: 'Laga-laga ikonik yang layak dikenang dan diceritakan ulang.',
    icon: '<svg width="24" height="24" viewBox="0 0 34 34"><rect x="9" y="9" width="16" height="16" fill="none" stroke="#fff" stroke-width="2.5" transform="rotate(45 17 17)"/></svg>'
  },
  {
    to: '/cerita',
    title: 'Cerita & Fun Fact',
    description: 'Kisah ringan dan detail unik seputar sejarah klub.',
    icon: '<svg width="24" height="24" viewBox="0 0 34 34"><rect x="6" y="5" width="22" height="24" rx="1.5" fill="none" stroke="#fff" stroke-width="2.5"/><line x1="11" y1="12" x2="23" y2="12" stroke="#fff" stroke-width="2"/><line x1="11" y1="18" x2="23" y2="18" stroke="#fff" stroke-width="2"/><line x1="11" y1="24" x2="19" y2="24" stroke="#fff" stroke-width="2"/></svg>'
  }
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
const description = 'Arsip & sejarah Persib Bandung — kronologi era, pemain, gelar, dan pertandingan bersejarah. Fan project, tidak berafiliasi dengan manajemen klub resmi.'

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
              to="/kronologi"
              class="rounded-lg bg-persib-blue-500 px-[30px] py-4 text-[15px] font-bold hover:bg-persib-blue-400"
            >
              Jelajahi Kronologi
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

        <div class="hero-anim-d1 relative min-h-[340px] w-full flex-1 self-stretch">
          <div class="absolute inset-0 overflow-hidden border border-white/12 bg-gradient-to-br from-persib-blue-700 to-persib-blue-900 [clip-path:polygon(12%_0%,100%_0%,100%_100%,0%_100%)]">
            <div class="pr-stripes absolute inset-0 opacity-20" />
            <svg
              class="absolute top-1/2 left-[56%] -translate-x-1/2 -translate-y-1/2"
              width="240"
              height="240"
              viewBox="0 0 240 240"
            >
              <circle
                cx="120"
                cy="120"
                r="82"
                fill="none"
                stroke="#fff"
                stroke-width="2"
                opacity="0.18"
              />
              <circle
                cx="120"
                cy="120"
                r="4"
                fill="#fff"
                opacity="0.25"
              />
            </svg>
            <div class="absolute top-1/2 right-0 left-[20%] h-0.5 bg-white/14" />
            <div class="pr-ball absolute size-8 -mt-4 -ml-4">
              <div class="pr-ball-shadow absolute top-[29px] left-1/2 h-[7px] w-[26px] -translate-x-1/2 rounded-full bg-black/35 blur-[2px]" />
              <svg
                class="pr-ball-spin relative"
                width="32"
                height="32"
                viewBox="0 0 34 34"
              >
                <circle
                  cx="17"
                  cy="17"
                  r="16"
                  fill="#fff"
                />
                <path
                  d="M17 5 L24.5 10.5 L21.7 19.5 L12.3 19.5 L9.5 10.5 Z"
                  fill="#0F1F4D"
                />
                <path
                  d="M17 5 L17 0.5 M24.5 10.5 L29 7.5 M21.7 19.5 L24.5 24.5 M12.3 19.5 L9.5 24.5 M9.5 10.5 L5 7.5"
                  stroke="#0F1F4D"
                  stroke-width="1.3"
                />
              </svg>
            </div>
            <div class="absolute right-0 bottom-[22px] left-0 text-center">
              <span class="font-mono text-[11px] tracking-[2px] text-white/40 uppercase">Semangat Maung Bandung</span>
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
          class="group rounded-[14px] border border-slate-200 bg-white px-7 py-8 transition-all hover:-translate-y-[3px] hover:shadow-[0_12px_28px_rgba(15,23,42,0.09)] dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            class="mb-[18px] flex size-12 items-center justify-center rounded-xl bg-persib-blue-700"
            v-html="card.icon"
          />
          <h3 class="mb-2 text-[19px] font-bold text-slate-900 dark:text-white">
            {{ card.title }}
          </h3>
          <p class="mb-[18px] text-[14.5px] leading-[1.55] text-slate-500">
            {{ card.description }}
          </p>
          <span class="text-sm font-bold text-persib-blue-500 group-hover:underline">Selengkapnya →</span>
        </NuxtLink>
      </div>
    </section>

    <!-- DISCLAIMER -->
    <section class="bg-slate-100 px-6 py-20 sm:px-12 dark:bg-slate-900">
      <div class="mx-auto flex max-w-[820px] items-start gap-6 rounded-2xl border border-slate-200 bg-white p-10 sm:p-12 dark:border-slate-800 dark:bg-slate-950">
        <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#FEE7E4] dark:bg-red-500/15">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
          >
            <circle
              cx="10"
              cy="10"
              r="8"
              fill="none"
              stroke="#B23A2E"
              stroke-width="2"
            />
            <line
              x1="10"
              y1="6"
              x2="10"
              y2="11"
              stroke="#B23A2E"
              stroke-width="2"
              stroke-linecap="round"
            />
            <circle
              cx="10"
              cy="14"
              r="1.1"
              fill="#B23A2E"
            />
          </svg>
        </div>
        <div>
          <h3 class="mb-3 text-[22px] font-extrabold text-slate-900 dark:text-white">
            Situs Fan-Made, Bukan Kanal Resmi
          </h3>
          <p class="text-[15.5px] leading-[1.7] text-slate-600 dark:text-slate-400">
            Sejarah Persib adalah proyek arsip yang dibuat dan dikelola oleh penggemar (bobotoh). Situs ini <strong>tidak berafiliasi dan tidak mewakili</strong> PT Persib Bandung Bermartabat atau manajemen klub secara resmi. Seluruh data disusun dari berbagai sumber terbuka dan akan terus diperbarui seiring proses verifikasi.
          </p>
        </div>
      </div>
    </section>

    <!-- FORM KRITIK & SARAN -->
    <section class="bg-slate-50 px-6 py-[88px] sm:px-12 dark:bg-slate-950">
      <div class="mx-auto max-w-[640px] rounded-2xl border border-slate-200 bg-white p-11 dark:border-slate-800 dark:bg-slate-900">
        <div class="mb-4 inline-block rounded-[20px] bg-persib-blue-100 px-[14px] py-[5px] text-[11px] font-bold tracking-[1.5px] text-persib-blue-700 uppercase dark:bg-persib-blue-500/15 dark:text-persib-blue-300">
          Masukan
        </div>
        <h3 class="mb-2 text-[27px] font-extrabold text-slate-900 dark:text-white">
          Kritik & Saran
        </h3>
        <p class="mb-8 text-[14.5px] text-slate-500">
          Temukan data yang keliru, atau punya ide fitur? Kabari kami.
        </p>

        <form
          class="flex flex-col gap-[18px]"
          @submit.prevent="submitFeedback"
        >
          <div class="grid gap-4 sm:grid-cols-2">
            <UFormField label="Nama (opsional)">
              <UInput
                v-model="form.nama"
                placeholder="Nama Anda"
                class="w-full"
              />
            </UFormField>
            <UFormField label="Email (opsional)">
              <UInput
                v-model="form.email"
                type="email"
                placeholder="nama@email.com"
                class="w-full"
              />
            </UFormField>
          </div>

          <UFormField label="Kategori">
            <USelect
              v-model="form.kategori"
              :items="kategoriOptions"
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

          <p
            v-if="submitError"
            class="text-sm text-error"
          >
            {{ submitError }}
          </p>
          <p
            v-if="submitted"
            class="text-sm text-primary"
          >
            Terima kasih, masukan Anda sudah kami terima.
          </p>

          <div>
            <UButton
              type="submit"
              :loading="submitting"
              class="rounded-[10px] bg-persib-blue-500 px-8 py-[15px] text-[15px] font-bold hover:bg-persib-blue-400"
            >
              Kirim Masukan
            </UButton>
          </div>
        </form>
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
