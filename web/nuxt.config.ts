// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/fonts'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true },
    '/panel': { redirect: '/panel/admin' },
    '/panel/**': { proxy: `${process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'}/**` },
    '/kronologi': { redirect: '/era-ke-era' },
    '/kronologi/musim': { redirect: '/kompetisi' },
    '/gelar': { redirect: '/prestasi' }
  },

  runtimeConfig: {
    public: {
      directusUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055'
    }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
