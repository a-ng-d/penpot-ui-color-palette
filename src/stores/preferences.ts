import { atom } from 'nanostores'

export const $isWCAGDisplayed = atom<boolean>(true)
export const $isAPCADisplayed = atom<boolean>(true)
export const $canStylesDeepSync = atom<boolean>(false)
export const $isVsCodeMessageDisplayed = atom<boolean>(true)
export const $pluginWindowWidth = atom<number>(640)
export const $pluginWindowHeight = atom<number>(400)
export const $userLanguage = atom<'en-US'>('en-US')
