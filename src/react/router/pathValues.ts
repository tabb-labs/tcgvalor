import { getCatalogReturnUrl } from './catalogReturnUrl'

const catalog = (slug?: string) => {
  const base = '/catalog'
  if (slug) {
    return `${base}/${slug}`
  } else {
    const returnSlug = getCatalogReturnUrl()
    if (returnSlug) return `${base}/${returnSlug}`
    return base
  }
}

const collection = (shareToken?: string) => {
  if (!shareToken) return '/collection'
  else return `/collection/${shareToken}`
}

export const PATH_VALUES = {
  home: '/',
  catalog,
  collection,
  series: '/series',
  developerNotes: '/developer-notes',
  privacyPolicy: '/privacy-policy',
  termsOfUse: '/terms',
}
