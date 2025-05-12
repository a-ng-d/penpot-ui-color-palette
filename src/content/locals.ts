import { Language } from '../types/app'
import en_US from './translations/en-US.json'

export const translations = {
  'en-US': en_US,
} as Record<Language, any>

let currentLocal = translations['en-US']

export const locals = {
  get: () => currentLocal,
  set: (lang: Language) => {
    currentLocal = translations[lang]
    return translations[lang]
  },
}
