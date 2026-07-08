<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  htmlAttrs: {
    lang: 'id'
  }
})

const title = 'Sejarah Persib Bandung'
const description = 'Arsip & sejarah Persib Bandung — kronologi era, pemain, gelar, dan pertandingan bersejarah. Fan project, tidak berafiliasi dengan manajemen klub resmi.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  twitterCard: 'summary_large_image'
})

const links = [
  { label: 'Beranda', to: '/' },
  { label: 'Kronologi', to: '/kronologi' },
  { label: 'Gelar', to: '/gelar' },
  { label: 'Pemain', to: '/pemain' },
  { label: 'Pelatih', to: '/pelatih' }
]

const route = useRoute()
</script>

<template>
  <UApp>
    <header class="flex h-[76px] items-center justify-between bg-persib-blue-700 px-6 sm:px-12">
      <NuxtLink to="/">
        <AppLogo />
      </NuxtLink>

      <div class="hidden items-center gap-9 sm:flex">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-sm font-semibold transition-colors"
          :class="route.path === link.to ? 'text-white' : 'text-white/75 hover:text-white'"
        >
          {{ link.label }}
        </NuxtLink>
      </div>

      <div class="dark">
        <UColorModeButton />
      </div>
    </header>

    <UMain>
      <NuxtPage />
    </UMain>

    <footer class="bg-persib-blue-900 px-6 pt-12 pb-7 sm:px-12">
      <div class="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-6 border-b border-white/12 pb-7">
        <div class="max-w-[420px]">
          <div class="mb-2.5 text-lg font-extrabold text-white">
            SEJARAH PERSIB
          </div>
          <p class="text-[13px] leading-relaxed text-slate-400">
            Fan-made / tidak berafiliasi dan tidak mewakili PT Persib Bandung Bermartabat atau manajemen klub.
          </p>
        </div>

        <div class="flex items-center gap-4">
          <span class="mr-1 text-[12.5px] text-slate-400">Ikuti di</span>
          <UButton
            to="https://instagram.com/sejarah.persib"
            target="_blank"
            aria-label="Instagram sejarah.persib"
            class="gap-2 rounded-full bg-white/6 py-2 pr-4 pl-2 hover:bg-persib-blue-500/25"
          >
            <span class="flex size-6 items-center justify-center rounded-full bg-persib-blue-500 text-[10px] font-bold text-white">IG</span>
            <span class="text-[13px] text-slate-200">@sejarah.persib</span>
          </UButton>
          <UButton
            to="https://x.com/sejarah.persib"
            target="_blank"
            aria-label="X sejarah.persib"
            class="gap-2 rounded-full bg-white/6 py-2 pr-4 pl-2 hover:bg-persib-blue-500/25"
          >
            <span class="flex size-6 items-center justify-center rounded-full bg-persib-blue-500 text-[10px] font-bold text-white">X</span>
            <span class="text-[13px] text-slate-200">@sejarah.persib</span>
          </UButton>
        </div>
      </div>

      <p class="pt-5 text-center text-xs text-slate-500">
        © {{ new Date().getFullYear() }} Sejarah Persib — Proyek fan-made.
      </p>
    </footer>
  </UApp>
</template>
