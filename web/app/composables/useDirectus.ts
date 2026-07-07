import { createDirectus, rest } from '@directus/sdk'

export function useDirectus() {
  const { public: { directusUrl } } = useRuntimeConfig()
  return createDirectus(directusUrl).with(rest())
}
