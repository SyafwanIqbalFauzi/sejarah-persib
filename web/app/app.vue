<script setup lang="ts">
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
  {
    label: 'Kronologi',
    to: '/kronologi',
    children: [
      { label: 'Cerita per Era', to: '/kronologi', description: 'Narasi dari setiap era yang dilalui PERSIB' },
      { label: 'Semua Musim', to: '/kronologi/musim', description: 'Tabel semua musim yang dilalui PERSIB' }
    ]
  },
  { label: 'Gelar', to: '/gelar' },
  { label: 'Pemain', to: '/pemain' },
  { label: 'Pelatih', to: '/pelatih' }
]

const route = useRoute()

function isActive(link: (typeof links)[number]) {
  if (link.children) return link.children.some((c) => route.path === c.to)
  return route.path === link.to
}

const mobileOpen = ref(false)
const kronologiOpen = ref(false)
</script>

<template>
  <UApp>
    <header class="relative z-50 flex h-[76px] items-center justify-between bg-persib-blue-700 px-6 sm:px-12">
      <NuxtLink to="/">
        <AppLogo />
      </NuxtLink>

      <div class="hidden items-center gap-9 sm:flex">
        <template v-for="link in links" :key="link.to">
          <div
            v-if="link.children"
            class="relative"
            @mouseenter="kronologiOpen = true"
            @mouseleave="kronologiOpen = false"
          >
            <NuxtLink
              :to="link.to"
              class="inline-flex items-center gap-1 text-sm font-semibold transition-colors"
              :class="isActive(link) ? 'text-white' : 'text-white/75 hover:text-white'"
            >
              {{ link.label }}
              <UIcon name="i-lucide-chevron-down" class="size-3 opacity-60 transition-transform" :class="kronologiOpen ? 'rotate-180' : ''" />
            </NuxtLink>

            <!-- Invisible bridge closes the gap between trigger and panel so the hover zone stays continuous -->
            <div v-show="kronologiOpen" class="absolute left-0 top-full z-50 h-3 w-64" />

            <div v-show="kronologiOpen" class="absolute left-0 top-[calc(100%+0.75rem)] z-50 w-64">
              <div class="rounded-lg border border-white/10 bg-persib-blue-800 p-1.5 shadow-xl">
                <NuxtLink
                  v-for="child in link.children"
                  :key="child.to"
                  :to="child.to"
                  class="block rounded-md px-3 py-2 transition-colors hover:bg-white/10"
                  @click="kronologiOpen = false"
                >
                  <div class="text-sm font-medium text-white">{{ child.label }}</div>
                  <div class="text-xs text-white/50">{{ child.description }}</div>
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
          <UColorModeButton />
        </div>
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          class="text-white hover:bg-white/10 sm:hidden"
          aria-label="Buka menu navigasi"
          @click="mobileOpen = true"
        />
      </div>
    </header>

    <USlideover v-model:open="mobileOpen" side="right" title="Menu">
      <template #body>
        <nav class="flex flex-col gap-1">
          <template v-for="link in links" :key="link.to">
            <div v-if="link.children">
              <div class="px-2 py-2 text-sm font-semibold text-muted">{{ link.label }}</div>
              <NuxtLink
                v-for="child in link.children"
                :key="child.to"
                :to="child.to"
                class="block rounded-md px-4 py-2.5 text-sm"
                :class="route.path === child.to ? 'bg-primary/10 text-primary font-medium' : 'text-default hover:bg-elevated'"
                @click="mobileOpen = false"
              >
                {{ child.label }}
              </NuxtLink>
            </div>
            <NuxtLink
              v-else
              :to="link.to"
              class="rounded-md px-2 py-2.5 text-sm font-semibold"
              :class="isActive(link) ? 'text-primary' : 'text-default hover:bg-elevated'"
              @click="mobileOpen = false"
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
