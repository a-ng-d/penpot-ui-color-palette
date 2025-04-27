export const loadTranslations = async (locale: string) => {
  const response = await fetch(`/translations/${locale}.json`)
  if (!response.ok)
    throw new Error(`Failed to fetch translations for ${locale}`)
  return response.json()
}
