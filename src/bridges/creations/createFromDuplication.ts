import { uid } from 'uid'
import { locals } from '../../content/locals'
import { FullConfiguration } from '../../types/configurations'

const createPaletteFromDuplication = async (id: string) => {
  const rawPalette = penpot.currentPage?.getPluginData(`palette_${id}`)
  const now = new Date().toISOString()

  if (rawPalette === undefined || rawPalette === null)
    throw new Error('No palette found')

  const palette = JSON.parse(rawPalette) as FullConfiguration

  palette.base.name = locals
    .get()
    .browse.copy.replace('{$1}', palette.base.name)
  palette.meta.id = uid()
  palette.meta.publicationStatus.isPublished = false
  palette.meta.publicationStatus.isShared = false
  palette.meta.dates.updatedAt = now
  palette.meta.dates.createdAt = now
  palette.meta.dates.publishedAt = ''
  palette.meta.creatorIdentity.creatorId = ''
  palette.meta.creatorIdentity.creatorFullName = ''
  palette.meta.creatorIdentity.creatorAvatar = ''

  penpot.currentPage?.setPluginData(
    `palette_${palette.meta.id}`,
    JSON.stringify(palette)
  )

  return true
}

export default createPaletteFromDuplication
