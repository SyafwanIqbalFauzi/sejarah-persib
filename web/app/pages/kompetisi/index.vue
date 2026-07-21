<script setup lang="ts">
// Kategori kompetisi dipilih lewat dropdown di navbar (query ?kategori=...).
// "Liga" dan "Piala Liga" sudah punya halaman turunan sendiri; sisanya
// menyusul setelah skema/data untuk kategori tersebut tersedia di Directus.
const kategoriLabels: Record<string, string> = {
  liga: 'Liga',
  piala_liga: 'Piala Liga',
  kompetisi_pramusim: 'Kompetisi Pramusim',
  kompetisi_tidak_resmi: 'Kompetisi Tidak Resmi'
}

const kategoriRoutes: Record<string, string> = {
  liga: '/kompetisi/liga',
  piala_liga: '/kompetisi/piala-liga'
}

const route = useRoute()
const selectedKategori = computed(() => {
  const kategori = route.query.kategori
  return typeof kategori === 'string' && kategori in kategoriLabels ? kategori : 'liga'
})

if (selectedKategori.value in kategoriRoutes) {
  await navigateTo(kategoriRoutes[selectedKategori.value])
}

useSeoMeta({
  title: 'Kompetisi — Sejarah Persib Bandung',
  description: 'Rekap kompetisi yang pernah diikuti Persib Bandung: liga, piala liga, pramusim, dan kompetisi tidak resmi.'
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        headline="Arsip Sejarah"
        title="Kompetisi"
        description="Rekap kompetisi yang pernah diikuti Persib Bandung, dari liga hingga turnamen tidak resmi."
      />

      <UPageBody>
        <div class="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-default py-16 text-center">
          <UIcon name="i-lucide-hard-hat" class="size-10 text-muted" />
          <p class="text-sm text-muted">
            Data {{ kategoriLabels[selectedKategori] }} sedang disiapkan.
          </p>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
