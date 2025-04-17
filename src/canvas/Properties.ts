import { HexModel } from '@a_ng_d/figmug-ui'
import chroma from 'chroma-js'

import { Board } from '@penpot/plugin-types'
import { lang, locals } from '../content/locals'
import {
  ColorSpaceConfiguration,
  VisionSimulationModeConfiguration,
} from '../types/configurations'
import { TextColorsThemeHexModel } from '../types/models'
import Color from '../utils/Color'
import Contrast from '../utils/Contrast'
import Tag from './Tag'

export default class Properties {
  private name: string
  private rgb: [number, number, number]
  private colorSpace: ColorSpaceConfiguration
  private visionSimulationMode: VisionSimulationModeConfiguration
  private textColorsTheme: TextColorsThemeHexModel
  private hex: HexModel
  private lch: Array<number>
  private oklch: Array<number>
  private lab: Array<number>
  private oklab: Array<number>
  private hsl: Array<number>
  private hsluv: Array<number>
  private nodeTopProps: Board | null
  private nodeBottomProps: Board | null
  private nodeBaseProps: Board | null
  private nodeContrastScoresProps: Board | null
  private nodeDetailedBaseProps: Board | null
  private nodeDetailedWCAGScoresProps: Board | null
  private nodeDetailedAPCAScoresProps: Board | null
  private nodeColumns: Board | null
  private nodeLeftColumn: Board | null
  private nodeRightColumn: Board | null
  private node: Board | null
  private lightTextColor: [number, number, number]
  private darkTextColor: [number, number, number]
  private lightTextColorContrast: Contrast
  private darkTextColorContrast: Contrast

  constructor(
    name: string,
    rgb: [number, number, number],
    colorSpace: ColorSpaceConfiguration,
    visionSimulationMode: VisionSimulationModeConfiguration,
    textColorsTheme: TextColorsThemeHexModel
  ) {
    this.name = name
    this.rgb = rgb
    this.colorSpace = colorSpace
    this.visionSimulationMode = visionSimulationMode
    this.textColorsTheme = textColorsTheme
    this.hex = chroma(rgb).hex()
    this.lch = chroma(rgb).lch()
    this.oklch = chroma(rgb).oklch()
    this.lab = chroma(rgb).lab()
    this.oklab = chroma(rgb).oklab()
    this.hsl = chroma(rgb).hsl()
    this.hsluv = new Color({
      sourceColor: rgb,
      visionSimulationMode: this.visionSimulationMode,
    }).getHsluv()
    this.nodeTopProps = null
    this.nodeBottomProps = null
    this.nodeBaseProps = null
    this.nodeContrastScoresProps = null
    this.nodeDetailedBaseProps = null
    this.nodeDetailedWCAGScoresProps = null
    this.nodeDetailedAPCAScoresProps = null
    this.nodeColumns = null
    this.nodeLeftColumn = null
    this.nodeRightColumn = null
    this.node = null
    this.lightTextColor = new Color({
      visionSimulationMode: this.visionSimulationMode,
    }).simulateColorBlindRgb(chroma(this.textColorsTheme.lightColor).rgb())
    this.darkTextColor = new Color({
      visionSimulationMode: this.visionSimulationMode,
    }).simulateColorBlindRgb(chroma(this.textColorsTheme.darkColor).rgb())
    this.lightTextColorContrast = new Contrast({
      backgroundColor: this.rgb,
      textColor: chroma(this.lightTextColor).hex(),
    })
    this.darkTextColorContrast = new Contrast({
      backgroundColor: this.rgb,
      textColor: chroma(this.darkTextColor).hex(),
    })
  }

  makeNodeTopProps = () => {
    // Base
    this.nodeTopProps = penpot.createBoard()
    this.nodeTopProps.name = '_top'
    this.nodeTopProps.fills = []

    // Layout
    const flex = this.nodeTopProps.addFlexLayout()
    flex.dir = 'row'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'

    return this.nodeTopProps
  }

  makeNodeBottomProps = () => {
    // Base
    this.nodeBottomProps = penpot.createBoard()
    this.nodeBottomProps.name = '_bottom'
    this.nodeBottomProps.fills = []
    this.nodeBottomProps.horizontalSizing = 'auto'
    this.nodeBottomProps.verticalSizing = 'auto'

    // Layout
    const flex = this.nodeBottomProps.addFlexLayout()
    flex.dir = 'column'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'

    // Insert
    const nodeContrastScoresProps = this.makeNodeContrastScoresProps()

    this.nodeBottomProps.appendChild(nodeContrastScoresProps)

    if (nodeContrastScoresProps.layoutChild)
      nodeContrastScoresProps.layoutChild.horizontalSizing = 'fill'

    return this.nodeBottomProps
  }

  makeNodeBaseProps = () => {
    // Base
    this.nodeBaseProps = penpot.createBoard()
    this.nodeBaseProps.name = '_base'
    this.nodeBaseProps.fills = []
    this.nodeBaseProps.horizontalSizing = 'auto'
    this.nodeBaseProps.verticalSizing = 'auto'

    // Layout
    const flex = this.nodeBaseProps.addFlexLayout()
    flex.dir = 'column'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'
    flex.rowGap = 4
    flex.alignItems = 'end'

    let basePropViaColorSpace

    if (this.colorSpace === 'LCH')
      basePropViaColorSpace = new Tag({
        name: '_lch',
        content: `L ${Math.floor(this.lch[0])} • C ${Math.floor(
          this.lch[1]
        )} • H ${Math.floor(this.lch[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'OKLCH')
      basePropViaColorSpace = new Tag({
        name: '_oklch',
        content: `L ${parseFloat(this.oklch[0].toFixed(2))} • C ${parseFloat(
          this.oklch[1].toFixed(2)
        )} • H ${Math.floor(this.oklch[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'LAB')
      basePropViaColorSpace = new Tag({
        name: '_lab',
        content: `L ${Math.floor(this.lab[0])} • A ${Math.floor(
          this.lab[1]
        )} • B ${Math.floor(this.lab[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'OKLAB')
      basePropViaColorSpace = new Tag({
        name: '_oklab',
        content: `L ${parseFloat(this.oklab[0].toFixed(2))} • A ${parseFloat(
          this.oklab[1].toFixed(2)
        )} • B ${parseFloat(this.oklab[2].toFixed(2))}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'HSL')
      basePropViaColorSpace = new Tag({
        name: '_hsl',
        content: `H ${Math.floor(this.hsl[0])} • S ${Math.floor(
          this.hsl[1] * 100
        )} • L ${Math.floor(this.hsl[2] * 100)}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'HSLUV')
      basePropViaColorSpace = new Tag({
        name: '_hsluv',
        content: `H ${Math.floor(this.hsluv[0])} • S ${Math.floor(
          this.hsluv[1]
        )} • L ${Math.floor(this.hsluv[2])}`,
      }).makeNodeTag()

    // Insert
    this.nodeBaseProps.appendChild(
      new Tag({
        name: '_hex',
        content: this.hex.toUpperCase(),
      }).makeNodeTag()
    )
    this.nodeBaseProps.appendChild(basePropViaColorSpace as Board)

    return this.nodeBaseProps
  }

  makeNodeContrastScoresProps = () => {
    // Base
    this.nodeContrastScoresProps = penpot.createBoard()
    this.nodeContrastScoresProps.name = '_contrast-scores'
    this.nodeContrastScoresProps.fills = []
    this.nodeContrastScoresProps.horizontalSizing = 'auto'
    this.nodeContrastScoresProps.verticalSizing = 'auto'

    // Layout
    const flex = this.nodeContrastScoresProps.addFlexLayout()
    flex.dir = 'column'
    flex.rowGap = 4
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'

    // Insert
    // WCAG
    const wcagLightContrast = this.lightTextColorContrast
        .getWCAGContrast()
        .toFixed(2),
      wcagDarkContrast = this.darkTextColorContrast
        .getWCAGContrast()
        .toFixed(2),
      wcagLightScore = this.lightTextColorContrast.getWCAGScore(),
      wcagDarkScore = this.darkTextColorContrast.getWCAGScore()

    const nodeWCAGLightProp = new Tag({
        name: '_wcag21-light',
        content: wcagLightContrast,
        isCompact: true,
      }).makeNodeTagwithIndicator(chroma(this.lightTextColor).gl()),
      nodeWCAGLightScore = new Tag({
        name: '_wcag21-light-score',
        content: wcagLightScore,
        backgroundColor: {
          rgb: this.lightTextColorContrast.getWCAGScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeWCAGDarkProp = new Tag({
        name: '_wcag21-dark',
        content: wcagDarkContrast,
        isCompact: true,
      }).makeNodeTagwithIndicator(chroma(this.darkTextColor).gl()),
      nodeWCAGDarkScore = new Tag({
        name: '_wcag21-dark-score',
        content: wcagDarkScore,
        backgroundColor: {
          rgb: this.darkTextColorContrast.getWCAGScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeWCAGLightProp.appendChild(nodeWCAGLightScore)
    nodeWCAGDarkProp.appendChild(nodeWCAGDarkScore)

    // APCA
    const apcaLightContrast = this.lightTextColorContrast
        .getAPCAContrast()
        .toFixed(1),
      apcaLightRecommendation =
        this.lightTextColorContrast.getRecommendedUsage(),
      apcaDarkContrast = this.darkTextColorContrast
        .getAPCAContrast()
        .toFixed(1),
      apcaDarkRecommendation = this.darkTextColorContrast.getRecommendedUsage()

    const nodeAPCALightProp = new Tag({
        name: '_apca-light',
        content: `Lc ${apcaLightContrast}`,
        isCompact: true,
      }).makeNodeTagwithIndicator(chroma(this.lightTextColor).gl()),
      nodeAPCALightScore = new Tag({
        name: '_apca-light-score',
        content: apcaLightRecommendation,
        backgroundColor: {
          rgb: this.lightTextColorContrast.getAPCAScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeAPCADarkProp = new Tag({
        name: '_apca-dark',
        content: `Lc ${apcaDarkContrast}`,
        isCompact: true,
      }).makeNodeTagwithIndicator(chroma(this.darkTextColor).gl()),
      nodeAPCADarkScore = new Tag({
        name: '_apca-dark-score',
        content: apcaDarkRecommendation,
        backgroundColor: {
          rgb: this.darkTextColorContrast.getAPCAScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeAPCALightProp.appendChild(nodeAPCALightScore)
    nodeAPCADarkProp.appendChild(nodeAPCADarkScore)

    this.nodeContrastScoresProps.appendChild(nodeWCAGLightProp)
    this.nodeContrastScoresProps.appendChild(nodeAPCALightProp)
    this.nodeContrastScoresProps.appendChild(nodeWCAGDarkProp)
    this.nodeContrastScoresProps.appendChild(nodeAPCADarkProp)

    return this.nodeContrastScoresProps
  }

  makeNodeDetailedBaseProps = () => {
    this.nodeDetailedBaseProps = penpot.createBoard()
    this.nodeDetailedBaseProps.name = '_base'
    this.nodeDetailedBaseProps.fills = []

    // Layout
    const flex = this.nodeDetailedBaseProps.addFlexLayout()
    flex.dir = 'column'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'
    flex.columnGap = 4

    let basePropViaColorSpace

    if (this.colorSpace === 'LCH')
      basePropViaColorSpace = new Tag({
        name: '_lch',
        content: `L ${Math.floor(this.lch[0])} • C ${Math.floor(
          this.lch[1]
        )} • H ${Math.floor(this.lch[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'OKLCH')
      basePropViaColorSpace = new Tag({
        name: '_oklch',
        content: `L ${parseFloat(this.oklch[0].toFixed(2))} • C ${parseFloat(
          this.oklch[1].toFixed(2)
        )} • H ${Math.floor(this.oklch[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'LAB')
      basePropViaColorSpace = new Tag({
        name: '_lab',
        content: `L ${Math.floor(this.lab[0])} • A ${Math.floor(
          this.lab[1]
        )} • B ${Math.floor(this.lab[2])}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'OKLAB')
      basePropViaColorSpace = new Tag({
        name: '_oklab',
        content: `L ${parseFloat(this.oklab[0].toFixed(2))} • A ${parseFloat(
          this.oklab[1].toFixed(2)
        )} • B ${parseFloat(this.oklab[2].toFixed(2))}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'HSL')
      basePropViaColorSpace = new Tag({
        name: '_lab',
        content: `H ${Math.floor(this.hsl[0])} • S ${Math.floor(
          this.hsl[1] * 100
        )} • L ${Math.floor(this.hsl[2] * 100)}`,
      }).makeNodeTag()
    else if (this.colorSpace === 'HSLUV')
      basePropViaColorSpace = new Tag({
        name: '_hsluv',
        content: `H ${Math.floor(this.hsluv[0])} • S ${Math.floor(
          this.hsluv[1]
        )} • L ${Math.floor(this.hsluv[2])}`,
      }).makeNodeTag()

    // Insert
    this.nodeDetailedBaseProps.appendChild(
      new Tag({
        name: '_title',
        content: locals[lang].paletteProperties.base,
        fontSize: 10,
      }).makeNodeTag()
    )
    this.nodeDetailedBaseProps.appendChild(
      new Tag({
        name: '_hex',
        content: this.hex.toUpperCase(),
      }).makeNodeTag()
    )
    this.nodeDetailedBaseProps.appendChild(basePropViaColorSpace as Board)

    return this.nodeDetailedBaseProps
  }

  makeDetailedWCAGScoresProps = () => {
    this.nodeDetailedWCAGScoresProps = penpot.createBoard()
    this.nodeDetailedWCAGScoresProps.name = '_wcag-scores'
    this.nodeDetailedWCAGScoresProps.fills = []

    // Layout
    const flex = this.nodeDetailedWCAGScoresProps.addFlexLayout()
    flex.dir = 'column'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'
    flex.columnGap = 4

    // Insert
    const wcagLightContrast = this.lightTextColorContrast
        .getWCAGContrast()
        .toFixed(2),
      wcagDarkContrast = this.darkTextColorContrast
        .getWCAGContrast()
        .toFixed(2),
      wcagLightScore = this.lightTextColorContrast.getWCAGScore(),
      wcagDarkScore = this.darkTextColorContrast.getWCAGScore()

    const nodeWCAGLightProp = new Tag({
        name: '_wcag21-light',
        content: wcagLightContrast,
        isCompact: true,
      }).makeNodeTagwithIndicator(chroma(this.lightTextColor).gl()),
      nodeWCAGLightScore = new Tag({
        name: '_wcag21-light-score',
        content: wcagLightScore,
        backgroundColor: {
          rgb: this.lightTextColorContrast.getWCAGScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeWCAGDarkProp = new Tag({
        name: '_wcag21-dark',
        content: wcagDarkContrast,
        isCompact: true,
      }).makeNodeTagwithIndicator(chroma(this.darkTextColor).gl()),
      nodeWCAGDarkScore = new Tag({
        name: '_wcag21-dark-score',
        content: wcagDarkScore,
        backgroundColor: {
          rgb: this.darkTextColorContrast.getWCAGScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeWCAGLightProp.appendChild(nodeWCAGLightScore)
    nodeWCAGDarkProp.appendChild(nodeWCAGDarkScore)

    this.nodeDetailedWCAGScoresProps.appendChild(
      new Tag({
        name: '_title',
        content: locals[lang].paletteProperties.wcag,
        fontSize: 10,
      }).makeNodeTag()
    )
    this.nodeDetailedWCAGScoresProps.appendChild(nodeWCAGLightProp)
    this.nodeDetailedWCAGScoresProps.appendChild(nodeWCAGDarkProp)

    return this.nodeDetailedWCAGScoresProps
  }

  makeNodeDetailedAPCAScoresProps = () => {
    this.nodeDetailedAPCAScoresProps = penpot.createBoard()
    this.nodeDetailedAPCAScoresProps.name = '_apca-scores'
    this.nodeDetailedAPCAScoresProps.fills = []
    const minimumDarkFontSize: Array<string | number> =
        this.darkTextColorContrast.getMinFontSizes(),
      minimumLightFontSize: Array<string | number> =
        this.lightTextColorContrast.getMinFontSizes()

    // Layout
    const flex = this.nodeDetailedAPCAScoresProps.addFlexLayout()
    flex.dir = 'column'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'
    flex.columnGap = 4

    // Insert
    const apcaLightContrast = this.lightTextColorContrast
        .getAPCAContrast()
        .toFixed(1),
      apcaLightRecommendation =
        this.lightTextColorContrast.getRecommendedUsage(),
      apcaDarkContrast = this.darkTextColorContrast
        .getAPCAContrast()
        .toFixed(1),
      apcaDarkRecommendation = this.darkTextColorContrast.getRecommendedUsage()

    const nodeAPCALightProp = new Tag({
        name: '_apca-light',
        content: `Lc ${apcaLightContrast}`,
        isCompact: true,
      }).makeNodeTagwithIndicator(chroma(this.lightTextColor).gl()),
      nodeAPCALightScore = new Tag({
        name: '_apca-light-score',
        content: apcaLightRecommendation,
        backgroundColor: {
          rgb: this.lightTextColorContrast.getAPCAScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag(),
      nodeAPCADarkProp = new Tag({
        name: '_apca-dark',
        content: `Lc ${apcaDarkContrast}`,
        isCompact: true,
      }).makeNodeTagwithIndicator(chroma(this.darkTextColor).gl()),
      nodeAPCADarkScore = new Tag({
        name: '_apca-dark-score',
        content: apcaDarkRecommendation,
        backgroundColor: {
          rgb: this.darkTextColorContrast.getAPCAScoreColor(),
          alpha: 1,
        },
      }).makeNodeTag()

    nodeAPCALightProp.appendChild(nodeAPCALightScore)
    nodeAPCADarkProp.appendChild(nodeAPCADarkScore)

    this.nodeDetailedAPCAScoresProps.appendChild(
      new Tag({
        name: '_title',
        content: locals[lang].paletteProperties.apca,
        fontSize: 10,
      }).makeNodeTag()
    )
    this.nodeDetailedAPCAScoresProps.appendChild(
      this.makeNodeColumns(
        [
          nodeAPCALightProp,
          new Tag({
            name: '_minimum-font-sizes',
            content: locals[lang].paletteProperties.fontSize,
          }).makeNodeTag(),
          new Tag({
            name: '_200-light',
            content: `${minimumLightFontSize[2]}pt (Extra-Light 200)`,
          }).makeNodeTag(),
          new Tag({
            name: '_300-light',
            content: `${minimumLightFontSize[3]}pt (Light 300)`,
          }).makeNodeTag(),
          new Tag({
            name: '_400-light',
            content: `${minimumLightFontSize[4]}pt (Regular 400)`,
          }).makeNodeTag(),
          new Tag({
            name: '_500-light',
            content: `${minimumLightFontSize[5]}pt (Medium 500)`,
          }).makeNodeTag(),
          new Tag({
            name: '_500-light',
            content: `${minimumLightFontSize[6]}pt (Semi-Bold 600)`,
          }).makeNodeTag(),
          new Tag({
            name: '_700-light',
            content: `${minimumLightFontSize[7]}pt (Bold 700)`,
          }).makeNodeTag(),
        ],
        [
          nodeAPCADarkProp,
          new Tag({
            name: '_minimum-font-sizes',
            content: locals[lang].paletteProperties.fontSize,
          }).makeNodeTag(),
          new Tag({
            name: '_200-dark',
            content: `${minimumDarkFontSize[2]}pt (Extra-Light 200)`,
          }).makeNodeTag(),
          new Tag({
            name: '_300-dark',
            content: `${minimumDarkFontSize[3]}pt (Light 300)`,
          }).makeNodeTag(),
          new Tag({
            name: '_400-dark',
            content: `${minimumDarkFontSize[4]}pt (Regular 400)`,
          }).makeNodeTag(),
          new Tag({
            name: '_500-dark',
            content: `${minimumDarkFontSize[5]}pt (Medium 500)`,
          }).makeNodeTag(),
          new Tag({
            name: '_600-dark',
            content: `${minimumDarkFontSize[6]}pt (Semi-Bold 600)`,
          }).makeNodeTag(),
          new Tag({
            name: '_700-dark',
            content: `${minimumDarkFontSize[7]}pt (Bold 700)`,
          }).makeNodeTag(),
        ]
      )
    )

    return this.nodeDetailedAPCAScoresProps
  }

  makeNodeColumns(leftNodes: Array<Board>, rightNodes: Array<Board>) {
    this.nodeColumns = penpot.createBoard()
    this.nodeLeftColumn = penpot.createBoard()
    this.nodeRightColumn = penpot.createBoard()
    this.nodeColumns.name = '_columns'
    this.nodeLeftColumn.name = '_left-column'
    this.nodeRightColumn.name = '_right-column'
    this.nodeColumns.fills =
      this.nodeLeftColumn.fills =
      this.nodeRightColumn.fills =
        []

    // Layout
    const flex = this.nodeColumns.addFlexLayout()
    flex.dir = 'row'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'
    flex.rowGap = 8

    const flexLeft = this.nodeRightColumn.addFlexLayout()
    flexLeft.dir = 'column'
    flexLeft.horizontalSizing = 'fill'
    flexLeft.verticalSizing = 'fit-content'
    flexLeft.columnGap = 4

    const flexRight = this.nodeLeftColumn.addFlexLayout()
    flexRight.dir = 'column'
    flexRight.horizontalSizing = 'fill'
    flexRight.verticalSizing = 'fit-content'
    flexRight.columnGap = 4

    // Insert
    leftNodes.forEach((node) => this.nodeLeftColumn?.appendChild(node))
    rightNodes.forEach((node) => this.nodeRightColumn?.appendChild(node))
    this.nodeColumns.appendChild(this.nodeLeftColumn)
    this.nodeColumns.appendChild(this.nodeRightColumn)

    return this.nodeColumns
  }

  makeNodeDetailed = () => {
    // Base
    this.node = penpot.createBoard()
    this.node.name = '_properties'
    this.node.fills = []

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'column'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fit-content'
    flex.columnGap = 16

    // Insert
    this.node.appendChild(
      this.makeNodeColumns(
        [this.makeNodeDetailedBaseProps()],
        [this.makeDetailedWCAGScoresProps()]
      )
    )
    this.node.appendChild(this.makeNodeDetailedAPCAScoresProps())

    return this.node
  }

  makeNode = () => {
    // Base
    this.node = penpot.createBoard()
    this.node.name = '_properties'
    this.node.fills = []

    // Layout
    const flex = this.node.addFlexLayout()
    flex.dir = 'column'
    flex.alignItems = 'stretch'
    flex.justifyContent = 'stretch'
    flex.horizontalSizing = 'fill'
    flex.verticalSizing = 'fill'
    flex.justifyContent = 'space-between'

    // Insert
    const nodeTopPropsNode = this.makeNodeTopProps()
    const nodeBasePropsNode = this.makeNodeBaseProps()
    const nodeBottomPropsNode = this.makeNodeBottomProps()

    this.node.appendChild(nodeTopPropsNode)
    this.nodeTopProps?.appendChild(
      new Tag({
        name: '_scale',
        content: this.name,
        fontSize: 10,
      }).makeNodeTag()
    )
    this.nodeTopProps?.appendChild(nodeBasePropsNode)
    this.node.appendChild(nodeBottomPropsNode)

    if (nodeTopPropsNode.layoutChild)
      nodeTopPropsNode.layoutChild.horizontalSizing = 'fill'
    if (nodeBasePropsNode.layoutChild)
      nodeBasePropsNode.layoutChild.horizontalSizing = 'fill'
    if (nodeBottomPropsNode.layoutChild)
      nodeBottomPropsNode.layoutChild.horizontalSizing = 'fill'

    return this.node
  }
}
