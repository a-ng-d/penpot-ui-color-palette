import { Case } from '@unoff/utils'
import { Data, FullConfiguration } from '@a_ng_d/utils-ui-color-palette'
import { getJsonSize } from '../../utils/getSize'
import { tolgee } from '../..'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TokenCatalog = any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TokenSet = any

const createLocalVariables = async (id: string): Promise<string> => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)

  if (rawPalette === undefined || rawPalette === null)
    throw new Error(tolgee.t('error.unfoundPalette'))

  const palette = JSON.parse(rawPalette) as FullConfiguration

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id', 'theme_id', 'set_id', 'token_id', 'hex', 'description'],
    palette.libraryData
  )

  const name: string =
    palette.base.name === '' ? tolgee.t('name') : palette.base.name

  const hasThemes = palette.libraryData.some(
    (item) => !item.id.includes('00000000000')
  )

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const catalog: TokenCatalog = (penpot as any).library.local.tokens

  let i = 0,
    j = 0
  const messages: Array<string> = []

  if (!hasThemes) {
    const firstBaseItem = palette.libraryData.find((item) =>
      item.id.includes('00000000000')
    )

    const existingSet = catalog.getSetById(firstBaseItem?.setId ?? '')

    let baseSet: TokenSet
    if (!existingSet) baseSet = catalog.addSet({ name })
    else baseSet = catalog.getSetById(existingSet.id)

    palette.libraryData
      .filter((item) => item.id.includes('00000000000'))
      .forEach((item) => {
        item.setId = baseSet.id

        const tokenName = [
          item.colorName === ''
            ? new Case(tolgee.t('colors.defaultName')).doPascalCase()
            : new Case(item.colorName).doPascalCase(),
          item.shadeName,
        ]
          .filter((n) => n !== '' && n !== 'None')
          .map((n) => n.replace(/\s+/g, '-'))
          .join('.')

        const existingToken = baseSet.getTokenById(item.tokenId)
        if (!existingToken) {
          const token = baseSet.addToken({
            type: 'color',
            name: tokenName,
            value: item.hex ?? '#000000',
            description: item.description,
          })
          item.tokenId = token.id
          i++
        }
      })
  } else {
    const uniqueThemes = palette.libraryData
      .filter((item) => !item.id.includes('00000000000'))
      .reduce((acc: typeof palette.libraryData, current) => {
        const x = acc.find(
          (item) =>
            item.themeName === current.themeName &&
            item.paletteName === current.paletteName
        )
        if (!x) return acc.concat([current])
        return acc
      }, [])

    uniqueThemes.forEach((uniqueThemeItem) => {
      const [themeId] = uniqueThemeItem.id.split(':')
      const themeName =
        uniqueThemeItem.themeName === ''
          ? tolgee.t('themes.defaultName')
          : uniqueThemeItem.themeName
      const setName = `${name}/${themeName}`

      const existingSet = uniqueThemeItem.setId
        ? catalog.getSetById(uniqueThemeItem.setId)
        : undefined

      let themeSet: TokenSet
      if (!existingSet) themeSet = catalog.addSet({ name: setName })
      else themeSet = catalog.getSetById(existingSet.id)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingTheme = catalog.getThemeById(uniqueThemeItem.themeId)
      if (!existingTheme) {
        const theme = catalog.addTheme({ group: name, name: themeName })
        // theme.addSet(themeSet)
        uniqueThemeItem.themeId = theme.id
        j++
      }

      palette.libraryData
        .filter(
          (d) => d.id.split(':')[0] === themeId && !d.id.includes('00000000000')
        )
        .forEach((themeItem) => {
          themeItem.setId = themeSet.id

          const tokenName = [
            themeItem.colorName === ''
              ? new Case(tolgee.t('colors.defaultName')).doPascalCase()
              : new Case(themeItem.colorName).doPascalCase(),
            themeItem.shadeName,
          ]
            .filter((n) => n !== '' && n !== 'None')
            .map((n) => n.replace(/\s+/g, '-'))
            .join('.')

          const existingToken = themeSet.getTokenById(themeItem.tokenId)
          if (!existingToken) {
            const token = themeSet.addToken({
              type: 'color',
              name: tokenName,
              value: themeItem.hex ?? '#000000',
              description: themeItem.description,
            })
            themeItem.tokenId = token.id
            i++
          }
        })
    })
  }

  palette.libraryData = new Data(palette).makeLibraryData(
    ['style_id', 'theme_id', 'set_id', 'token_id'],
    palette.libraryData
  )

  if (getJsonSize(palette) < 100)
    penpot.currentPage?.setPluginData(`palette_${id}`, JSON.stringify(palette))
  else throw new Error(tolgee.t('error.paletteSizeExceeded'))

  if (i > 0)
    messages.push(
      tolgee.t('info.createdLocalVariables', {
        count: i,
      })
    )
  if (j > 0)
    messages.push(
      tolgee.t('info.createdLocalModes', {
        count: j,
      })
    )

  if (i + j === 0) messages.push(tolgee.t('info.noChange'))

  return messages.join(tolgee.t('separator'))
}

export default createLocalVariables
