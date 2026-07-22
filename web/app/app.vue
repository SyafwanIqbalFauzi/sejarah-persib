<script setup lang="ts">
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  htmlAttrs: {
    lang: 'id'
  },
  link: [
    { rel: 'icon', type: 'image/svg+xml', href: '/logo/sejarah-persib-badge.svg' }
  ]
})

const title = 'Sejarah Persib Bandung'
const description = 'Arsip & sejarah Persib Bandung — kronologi era, pemain, gelar, dan pertandingan bersejarah. Fan project, tidak berafiliasi dengan manajemen klub resmi.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/logo/sejarah-persib-logo-2400.png',
  twitterCard: 'summary_large_image'
})

const links = [
  { label: 'Beranda', to: '/' },
  { label: 'Era ke Era', to: '/era-ke-era' },
  { label: 'Prestasi', to: '/prestasi' },
  {
    label: 'Kompetisi',
    to: '/kompetisi',
    children: [
      { label: 'Liga', to: '/kompetisi/liga' },
      { label: 'Piala Liga', to: '/kompetisi/piala-liga' },
      { label: 'Piala Asia', to: '/kompetisi/piala-asia' },
      { label: 'Pramusim', to: '/kompetisi/pramusim' },
      { label: 'Tidak Resmi', to: '/kompetisi/tidak-resmi' }
    ]
  },
  { label: 'Pemain', to: '/pemain' },
  { label: 'Pelatih', to: '/pelatih' }
]

const route = useRoute()

function isActive(link: (typeof links)[number]) {
  return route.path === link.to
}

const mobileOpen = ref(false)
const kompetisiOpen = ref(false)
const colorMode = useColorMode()

const showBackToTop = ref(false)

function onScroll() {
  showBackToTop.value = window.scrollY > 480
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <UApp>
    <header class="sticky top-0 z-50 flex h-[76px] items-center justify-between bg-persib-blue-700 px-6 sm:px-12">
      <NuxtLink to="/">
        <AppLogo />
      </NuxtLink>

      <div class="hidden items-center gap-9 sm:flex">
        <template v-for="link in links" :key="link.to">
          <div
            v-if="'children' in link"
            class="relative"
            @mouseenter="kompetisiOpen = true"
            @mouseleave="kompetisiOpen = false"
          >
            <NuxtLink
              :to="link.to"
              class="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
              :class="isActive(link) ? 'text-white' : 'text-white/75 hover:text-white'"
            >
              {{ link.label }}
              <UIcon name="i-lucide-chevron-down" class="size-3 opacity-60 transition-transform" :class="kompetisiOpen ? 'rotate-180' : ''" />
            </NuxtLink>

            <!-- Invisible bridge closes the gap between trigger and panel so the hover zone stays continuous -->
            <div v-show="kompetisiOpen" class="absolute left-0 top-full z-50 h-3 w-56" />

            <div v-show="kompetisiOpen" class="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-56">
              <div class="rounded-lg border border-white/10 bg-persib-blue-800 p-1.5 shadow-xl">
                <NuxtLink
                  v-for="child in link.children"
                  :key="child.to"
                  :to="child.to"
                  class="block rounded-md px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  @click="() => { kompetisiOpen = false }"
                >
                  {{ child.label }}
                </NuxtLink>
              </div>
            </div>
          </div>

          <NuxtLink
            v-else
            :to="link.to"
            class="text-sm font-semibold transition-colors"
            :class="isActive(link) ? 'text-white' : 'text-white/75 hover:text-white'"
          >
            {{ link.label }}
          </NuxtLink>
        </template>
      </div>

      <div class="flex items-center gap-2">
        <div class="dark">
          <UButton
            :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
            color="neutral"
            variant="ghost"
            :aria-label="colorMode.value === 'dark' ? 'Pindah ke mode terang' : 'Pindah ke mode gelap'"
            @click="() => { colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark' }"
          />
        </div>
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          class="text-white hover:bg-white/10 sm:hidden"
          aria-label="Buka menu navigasi"
          @click="() => { mobileOpen = true }"
        />
      </div>
    </header>

    <USlideover v-model:open="mobileOpen" side="right" title="Menu">
      <template #body>
        <nav class="flex flex-col gap-1">
          <template v-for="link in links" :key="link.to">
            <div v-if="'children' in link">
              <div class="px-2 py-2 text-sm font-semibold text-muted">{{ link.label }}</div>
              <NuxtLink
                v-for="child in link.children"
                :key="child.to"
                :to="child.to"
                class="block rounded-md px-4 py-2.5 text-sm text-default hover:bg-elevated"
                @click="() => { mobileOpen = false }"
              >
                {{ child.label }}
              </NuxtLink>
            </div>
            <NuxtLink
              v-else
              :to="link.to"
              class="rounded-md px-2 py-2.5 text-sm font-semibold"
              :class="isActive(link) ? 'text-primary' : 'text-default hover:bg-elevated'"
              @click="() => { mobileOpen = false }"
            >
              {{ link.label }}
            </NuxtLink>
          </template>
        </nav>
      </template>
    </USlideover>

    <UMain>
      <NuxtPage />
    </UMain>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-2"
    >
      <UButton
        v-if="showBackToTop"
        icon="i-lucide-arrow-up"
        color="primary"
        size="lg"
        square
        class="fixed right-6 bottom-6 z-50 rounded-full shadow-lg sm:right-10 sm:bottom-10"
        aria-label="Kembali ke atas"
        @click="scrollToTop"
      />
    </Transition>

    <footer class="bg-persib-blue-900 px-6 pt-12 pb-7 sm:px-12">
      <div class="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-6 border-b border-white/12 pb-7">
        <div class="max-w-[420px]">
          <div class="mb-2.5 flex items-center gap-2.5">
            <img src="/logo/sejarah-persib-badge.svg" alt="Lambang Sejarah Persib" class="size-8">
            <span class="text-lg font-extrabold text-white">SEJARAH PERSIB</span>
          </div>
          <p class="text-[13px] leading-relaxed text-slate-400">
            Bobotoh-made / tidak berafiliasi dan tidak mewakili PT Persib Bandung Bermartabat atau manajemen klub.
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
        © {{ new Date().getFullYear() }} Sejarah Persib — Proyek Bobotoh-made.
      </p>
    </footer>
  </UApp>
</template>
