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
  { label: 'Pemain', to: '/pemain' },
  { label: 'Gelar', to: '/gelar' },
  { label: 'Pelatih', to: '/pelatih' }
]
</script>

<template>
  <UApp>
    <UHeader :ui="{ center: 'flex-1' }">
      <template #left>
        <NuxtLink to="/">
          <AppLogo />
        </NuxtLink>
      </template>

      <UNavigationMenu :items="links" />

      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>

    <UMain>
      <NuxtPage />
    </UMain>

    <USeparator />

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          © {{ new Date().getFullYear() }} Sejarah PERSIB.
        </p>
      </template>

      <template #right>
        <UButton
          to="https://instagram.com/sejarah.persib"
          target="_blank"
          icon="i-simple-icons-instagram"
          color="neutral"
          variant="ghost"
          aria-label="Instagram sejarah.persib"
        />
        <UButton
          to="https://x.com/sejarah.persib"
          target="_blank"
          icon="i-simple-icons-x"
          color="neutral"
          variant="ghost"
          aria-label="X sejarah.persib"
        />
      </template>
    </UFooter>
  </UApp>
</template>
