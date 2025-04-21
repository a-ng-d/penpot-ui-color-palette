import { atom } from 'nanostores'

export const $isWCAGDisplayed = atom<boolean>(true)
export const $isAPCADisplayed = atom<boolean>(true)
export const $canPaletteDeepSync = atom<boolean>(false)
export const $canStylesDeepSync = atom<boolean>(false)
export const $isVsCodeMessageDisplayed = atom<boolean>(true)
export const $pluginWindowWidth = atom<number>(640)
export const $pluginWindowHeight = atom<number>(400)
