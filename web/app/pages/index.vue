<script setup lang="ts">
const sections = [
  { to: '/kronologi', icon: 'i-lucide-flag', title: 'Kronologi', description: 'Perjalanan Persib dari era ke era, sejak Perserikatan hingga Superleague.' },
  { to: '/pemain', icon: 'i-lucide-user', title: 'Pemain', description: 'Direktori pemain yang membela Persib dari masa ke masa.' },
  { to: '/gelar', icon: 'i-lucide-trophy', title: 'Gelar & Prestasi', description: 'Daftar gelar dan pencapaian Persib di berbagai kompetisi.' },
  { to: '/pertandingan', icon: 'i-lucide-swords', title: 'Pertandingan Bersejarah', description: 'Kurasi laga-laga ikonik, bukan database skor lengkap.' },
  { to: '/pelatih', icon: 'i-lucide-clipboard-list', title: 'Pelatih', description: 'Sosok-sosok yang pernah menangani Persib Bandung.' },
  { to: '/cerita', icon: 'i-lucide-sparkles', title: 'Fun Facts & Cerita', description: 'Cerita ringan dan trivia seputar identitas Maung Bandung.' }
]

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
    <UPageHero
      headline="Fan Archive · Bukan situs resmi klub"
      title="Sejarah PERSIB"
      description="Rumah arsip Maung Bandung — era, pemain, pelatih, gelar, sejarah lainnya2. Dibangun oleh &amp; untuk Bobotoh."

    />

    <UPageSection class="!pt-0">
      <UPageGrid>
        <UPageCard
          v-for="section in sections"
          :key="section.to"
          :to="section.to"
          :icon="section.icon"
          :title="section.title"
          :description="section.description"
          spotlight
        />
      </UPageGrid>
    </UPageSection>
  </div>
</template>
