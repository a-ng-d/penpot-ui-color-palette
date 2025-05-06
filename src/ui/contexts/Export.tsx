import type { DropdownOption } from '@a_ng_d/figmug-ui'
import {
  Dropdown,
  Input,
  Layout,
  layouts,
  Menu,
  SectionTitle,
  SemanticMessage,
  SimpleItem,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import features from '../../config'
import { BaseProps, PlanStatus } from '../../types/app'
import { ColorSpaceConfiguration } from '../../types/configurations'
import { ActionsList } from '../../types/models'
import Actions from '../modules/Actions'

interface ExportProps extends BaseProps {
  id: string
  exportPreview: string
  exportType: string
  onExportPalette: () => void
}

interface ExportStates {
  format:
    | 'EXPORT_TOKENS_DTCG'
    | 'EXPORT_TOKENS_GLOBAL'
    | 'EXPORT_TOKENS_AMZN_STYLE_DICTIONARY'
    | 'EXPORT_TOKENS_TOKENS_STUDIO'
    | 'EXPORT_CSS'
    | 'EXPORT_TAILWIND'
    | 'EXPORT_APPLE_SWIFTUI'
    | 'EXPORT_APPLE_UIKIT'
    | 'EXPORT_ANDROID_COMPOSE'
    | 'EXPORT_ANDROID_XML'
    | 'EXPORT_CSV'
  colorSpace: {
    selected: ColorSpaceConfiguration
    options: Array<DropdownOption>
  }
}

export default class Export extends PureComponent<ExportProps, ExportStates> {
  private counter: number

  static defaultProps = {
    exportPreview: '',
  }

  static features = (planStatus: PlanStatus) => ({
    EXPORT_CSS_RGB: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_CSS_RGB',
      planStatus: planStatus,
    }),
    EXPORT_CSS_HEX: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_CSS_HEX',
      planStatus: planStatus,
    }),
    EXPORT_CSS_HSL: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_CSS_HSL',
      planStatus: planStatus,
    }),
    EXPORT_CSS_LCH: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_CSS_LCH',
      planStatus: planStatus,
    }),
    EXPORT_CSS_P3: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_CSS_P3',
      planStatus: planStatus,
    }),
    EXPORT_TOKENS: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_TOKENS',
      planStatus: planStatus,
    }),
    EXPORT_TOKENS_JSON: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_TOKENS_JSON',
      planStatus: planStatus,
    }),
    EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY',
      planStatus: planStatus,
    }),
    EXPORT_TOKENS_JSON_TOKENS_STUDIO: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_TOKENS_JSON_TOKENS_STUDIO',
      planStatus: planStatus,
    }),
    EXPORT_TOKENS_JSON_DTCG: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_TOKENS_JSON_DTCG',
      planStatus: planStatus,
    }),
    EXPORT_TOKENS_JSON_DTCG_RGB: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_TOKENS_JSON_DTCG_RGB',
      planStatus: planStatus,
    }),
    EXPORT_TOKENS_JSON_DTCG_OKLCH: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_TOKENS_JSON_DTCG_OKLCH',
      planStatus: planStatus,
    }),
    EXPORT_CSS: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_CSS',
      planStatus: planStatus,
    }),
    EXPORT_TAILWIND: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_TAILWIND',
      planStatus: planStatus,
    }),
    EXPORT_APPLE: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_APPLE',
      planStatus: planStatus,
    }),
    EXPORT_APPLE_SWIFTUI: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_APPLE_SWIFTUI',
      planStatus: planStatus,
    }),
    EXPORT_APPLE_UIKIT: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_APPLE_UIKIT',
      planStatus: planStatus,
    }),
    EXPORT_ANDROID: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_ANDROID',
      planStatus: planStatus,
    }),
    EXPORT_ANDROID_COMPOSE: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_ANDROID_COMPOSE',
      planStatus: planStatus,
    }),
    EXPORT_ANDROID_XML: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_ANDROID_XML',
      planStatus: planStatus,
    }),
    EXPORT_CSV: new FeatureStatus({
      features: features,
      featureName: 'EXPORT_CSV',
      planStatus: planStatus,
    }),
  })

  constructor(props: ExportProps) {
    super(props)
    this.counter = 0
    this.state = {
      format: 'EXPORT_TOKENS_TOKENS_STUDIO',
      colorSpace: {
        selected: 'RGB',
        options: [],
      },
    }
  }

  // Handlers
  exportHandler = (e: Event) => {
    const actions: ActionsList = {
      EXPORT_TOKENS_TOKENS_STUDIO: () => {
        this.setState({
          format: 'EXPORT_TOKENS_TOKENS_STUDIO',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_TOKENS_STUDIO',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_DTCG: () => {
        this.setState({
          format: 'EXPORT_TOKENS_DTCG',
          colorSpace: {
            selected: 'RGB',
            options: [
              {
                label: this.props.locals.export.colorSpace.label,
                type: 'TITLE',
              },
              {
                label: this.props.locals.export.colorSpace.rgb,
                value: 'EXPORT_TOKENS_DTCG_RGB',
                feature: 'SELECT_COLOR_SPACE',
                type: 'OPTION',
                isActive: Export.features(
                  this.props.planStatus
                ).EXPORT_TOKENS_JSON_DTCG_RGB.isActive(),
                isBlocked: Export.features(
                  this.props.planStatus
                ).EXPORT_TOKENS_JSON_DTCG_RGB.isBlocked(),
                isNew: Export.features(
                  this.props.planStatus
                ).EXPORT_TOKENS_JSON_DTCG_RGB.isNew(),
                action: this.exportHandler,
              },
              {
                label: this.props.locals.export.colorSpace.lch,
                value: 'EXPORT_TOKENS_DTCG_OKLCH',
                feature: 'SELECT_COLOR_SPACE',
                type: 'OPTION',
                isActive: Export.features(
                  this.props.planStatus
                ).EXPORT_TOKENS_JSON_DTCG_OKLCH.isActive(),
                isBlocked: Export.features(
                  this.props.planStatus
                ).EXPORT_TOKENS_JSON_DTCG_OKLCH.isBlocked(),
                isNew: Export.features(
                  this.props.planStatus
                ).EXPORT_TOKENS_JSON_DTCG_OKLCH.isNew(),
                action: this.exportHandler,
              },
            ],
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_DTCG',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_DTCG_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_DTCG',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_DTCG_OKLCH: () => {
        this.setState({
          colorSpace: {
            selected: 'OKLCH',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_DTCG',
              colorSpace: 'OKLCH',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_AMZN_STYLE_DICTIONARY: () => {
        this.setState({
          format: 'EXPORT_TOKENS_AMZN_STYLE_DICTIONARY',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_AMZN_STYLE_DICTIONARY',
            },
          },
          '*'
        )
      },
      EXPORT_TOKENS_GLOBAL: () => {
        this.setState({
          format: 'EXPORT_TOKENS_GLOBAL',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TOKENS_GLOBAL',
            },
          },
          '*'
        )
      },
      EXPORT_CSS: () => {
        this.setState({
          format: 'EXPORT_CSS',
          colorSpace: {
            selected: 'RGB',
            options: [
              {
                label: this.props.locals.export.colorSpace.label,
                type: 'TITLE',
              },
              {
                label: this.props.locals.export.colorSpace.rgb,
                value: 'EXPORT_CSS_RGB',
                feature: 'SELECT_COLOR_SPACE',
                type: 'OPTION',
                isActive: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_RGB.isActive(),
                isBlocked: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_RGB.isBlocked(),
                isNew: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_RGB.isNew(),
                action: this.exportHandler,
              },
              {
                label: this.props.locals.export.colorSpace.hex,
                value: 'EXPORT_CSS_HEX',
                feature: 'SELECT_COLOR_SPACE',
                type: 'OPTION',
                isActive: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_HEX.isActive(),
                isBlocked: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_HEX.isBlocked(),
                isNew: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_HEX.isNew(),
                action: this.exportHandler,
              },
              {
                label: this.props.locals.export.colorSpace.hsl,
                value: 'EXPORT_CSS_HSL',
                feature: 'SELECT_COLOR_SPACE',
                type: 'OPTION',
                isActive: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_HSL.isActive(),
                isBlocked: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_HSL.isBlocked(),
                isNew: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_HSL.isNew(),
                action: this.exportHandler,
              },
              {
                label: this.props.locals.export.colorSpace.lch,
                value: 'EXPORT_CSS_LCH',
                feature: 'SELECT_COLOR_SPACE',
                type: 'OPTION',
                isActive: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_LCH.isActive(),
                isBlocked: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_LCH.isBlocked(),
                isNew: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_LCH.isNew(),
                action: this.exportHandler,
              },
              {
                label: this.props.locals.export.colorSpace.p3,
                value: 'EXPORT_CSS_P3',
                feature: 'SELECT_COLOR_SPACE',
                type: 'OPTION',
                isActive: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_P3.isActive(),
                isBlocked: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_P3.isBlocked(),
                isNew: Export.features(
                  this.props.planStatus
                ).EXPORT_CSS_P3.isNew(),
                action: this.exportHandler,
              },
            ],
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_CSS_RGB: () => {
        this.setState({
          colorSpace: {
            selected: 'RGB',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'RGB',
            },
          },
          '*'
        )
      },
      EXPORT_CSS_HEX: () => {
        this.setState({
          colorSpace: {
            selected: 'HEX',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'HEX',
            },
          },
          '*'
        )
      },
      EXPORT_CSS_HSL: () => {
        this.setState({
          colorSpace: {
            selected: 'HSL',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'HSL',
            },
          },
          '*'
        )
      },
      EXPORT_CSS_LCH: () => {
        this.setState({
          colorSpace: {
            selected: 'LCH',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'LCH',
            },
          },
          '*'
        )
      },
      EXPORT_CSS_P3: () => {
        this.setState({
          colorSpace: {
            selected: 'P3',
            options: this.state.colorSpace.options,
          },
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSS',
              colorSpace: 'P3',
            },
          },
          '*'
        )
      },
      EXPORT_TAILWIND: () => {
        this.setState({
          format: 'EXPORT_TAILWIND',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'TAILWIND',
            },
          },
          '*'
        )
      },
      EXPORT_APPLE_SWIFTUI: () => {
        this.setState({
          format: 'EXPORT_APPLE_SWIFTUI',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'APPLE_SWIFTUI',
            },
          },
          '*'
        )
      },
      EXPORT_APPLE_UIKIT: () => {
        this.setState({
          format: 'EXPORT_APPLE_UIKIT',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'APPLE_UIKIT',
            },
          },
          '*'
        )
      },
      EXPORT_ANDROID_COMPOSE: () => {
        this.setState({
          format: 'EXPORT_ANDROID_COMPOSE',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'ANDROID_COMPOSE',
            },
          },
          '*'
        )
      },
      EXPORT_ANDROID_XML: () => {
        this.setState({
          format: 'EXPORT_ANDROID_XML',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'ANDROID_XML',
            },
          },
          '*'
        )
      },
      EXPORT_CSV: () => {
        this.setState({
          format: 'EXPORT_CSV',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'EXPORT_PALETTE',
              id: this.props.id,
              export: 'CSV',
            },
          },
          '*'
        )
      },
      DEFAULT: () => null,
    }

    return actions[(e.target as HTMLElement).dataset.value ?? 'DEFAULT']?.()
  }

  // Direct Actions
  setFirstPreview = () => {
    this.counter === 0 &&
      parent.postMessage(
        {
          pluginMessage: {
            type: 'EXPORT_PALETTE',
            id: this.props.id,
            export: this.state.format.replace('EXPORT_', ''),
          },
        },
        '*'
      )
    this.counter = 1
  }

  selectPreview = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => (e.target as HTMLInputElement).select()

  deSelectPreview = () => window.getSelection()?.removeAllRanges()

  // Render
  render() {
    this.setFirstPreview()
    return (
      <>
        <Layout
          id="export"
          column={[
            {
              node: (
                <>
                  <SimpleItem
                    id="export-palette"
                    leftPartSlot={
                      <SectionTitle
                        label={this.props.locals.export.format}
                        indicator="10"
                      />
                    }
                    rightPartSlot={
                      <div className={layouts['snackbar--medium']}>
                        <Dropdown
                          id="select-format"
                          options={[
                            {
                              label: this.props.locals.export.tokens.label,
                              value: 'TOKENS_GROUP',
                              feature: 'SELECT_EXPORT_FILE',
                              type: 'OPTION',
                              isActive: Export.features(
                                this.props.planStatus
                              ).EXPORT_TOKENS.isActive(),
                              isBlocked: Export.features(
                                this.props.planStatus
                              ).EXPORT_TOKENS.isBlocked(),
                              isNew: Export.features(
                                this.props.planStatus
                              ).EXPORT_TOKENS.isNew(),
                              children: [
                                {
                                  label:
                                    this.props.locals.export.tokens
                                      .tokensStudio,
                                  value: 'EXPORT_TOKENS_TOKENS_STUDIO',
                                  type: 'OPTION',
                                  isActive: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON_TOKENS_STUDIO.isActive(),
                                  isBlocked: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON_TOKENS_STUDIO.isBlocked(),
                                  isNew: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON_TOKENS_STUDIO.isNew(),
                                  action: this.exportHandler,
                                },
                                {
                                  label: 'DTCG (JSON)',
                                  value: 'EXPORT_TOKENS_DTCG',
                                  type: 'OPTION',
                                  isActive: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON_DTCG.isActive(),
                                  isBlocked: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON_DTCG.isBlocked(),
                                  isNew: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON_DTCG.isNew(),
                                  action: this.exportHandler,
                                },
                                {
                                  label:
                                    this.props.locals.export.tokens
                                      .amznStyleDictionary,
                                  value: 'EXPORT_TOKENS_AMZN_STYLE_DICTIONARY',
                                  type: 'OPTION',
                                  isActive: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY.isActive(),
                                  isBlocked: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY.isBlocked(),
                                  isNew: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON_AMZN_STYLE_DICTIONARY.isNew(),
                                  action: this.exportHandler,
                                },
                                {
                                  label: this.props.locals.export.tokens.global,
                                  value: 'EXPORT_TOKENS_GLOBAL',
                                  type: 'OPTION',
                                  isActive: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON.isActive(),
                                  isBlocked: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON.isBlocked(),
                                  isNew: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_TOKENS_JSON.isNew(),
                                  action: this.exportHandler,
                                },
                              ],
                            },
                            {
                              label:
                                this.props.locals.export.css.customProperties,
                              value: 'EXPORT_CSS',
                              type: 'OPTION',
                              isActive: Export.features(
                                this.props.planStatus
                              ).EXPORT_CSS.isActive(),
                              isBlocked: Export.features(
                                this.props.planStatus
                              ).EXPORT_CSS.isBlocked(),
                              isNew: Export.features(
                                this.props.planStatus
                              ).EXPORT_CSS.isNew(),
                              action: this.exportHandler,
                            },
                            {
                              label: this.props.locals.export.tailwind.config,
                              value: 'EXPORT_TAILWIND',
                              type: 'OPTION',
                              isActive: Export.features(
                                this.props.planStatus
                              ).EXPORT_TAILWIND.isActive(),
                              isBlocked: Export.features(
                                this.props.planStatus
                              ).EXPORT_TAILWIND.isBlocked(),
                              isNew: Export.features(
                                this.props.planStatus
                              ).EXPORT_TAILWIND.isNew(),
                              action: this.exportHandler,
                            },
                            {
                              label: this.props.locals.export.apple.label,
                              value: 'APPLE_GROUP',
                              type: 'OPTION',
                              isActive: Export.features(
                                this.props.planStatus
                              ).EXPORT_APPLE.isActive(),
                              isBlocked: Export.features(
                                this.props.planStatus
                              ).EXPORT_APPLE.isBlocked(),
                              isNew: Export.features(
                                this.props.planStatus
                              ).EXPORT_APPLE.isNew(),
                              children: [
                                {
                                  label: this.props.locals.export.apple.swiftui,
                                  value: 'EXPORT_APPLE_SWIFTUI',
                                  type: 'OPTION',
                                  isActive: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_APPLE_SWIFTUI.isActive(),
                                  isBlocked: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_APPLE_SWIFTUI.isBlocked(),
                                  isNew: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_APPLE_SWIFTUI.isNew(),
                                  action: this.exportHandler,
                                },
                                {
                                  label: this.props.locals.export.apple.uikit,
                                  value: 'EXPORT_APPLE_UIKIT',
                                  type: 'OPTION',
                                  isActive: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_APPLE_UIKIT.isActive(),
                                  isBlocked: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_APPLE_UIKIT.isBlocked(),
                                  isNew: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_APPLE_UIKIT.isNew(),
                                  action: this.exportHandler,
                                },
                              ],
                              action: this.exportHandler,
                            },
                            {
                              label: this.props.locals.export.android.label,
                              value: 'ANDROID_GROUP',
                              type: 'OPTION',
                              isActive: Export.features(
                                this.props.planStatus
                              ).EXPORT_ANDROID.isActive(),
                              isBlocked: Export.features(
                                this.props.planStatus
                              ).EXPORT_ANDROID.isBlocked(),
                              isNew: Export.features(
                                this.props.planStatus
                              ).EXPORT_ANDROID.isNew(),
                              children: [
                                {
                                  label:
                                    this.props.locals.export.android.compose,
                                  value: 'EXPORT_ANDROID_COMPOSE',
                                  type: 'OPTION',
                                  isActive: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_ANDROID_COMPOSE.isActive(),
                                  isBlocked: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_ANDROID_COMPOSE.isBlocked(),
                                  isNew: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_ANDROID_COMPOSE.isNew(),
                                  action: this.exportHandler,
                                },
                                {
                                  label:
                                    this.props.locals.export.android.resources,
                                  value: 'EXPORT_ANDROID_XML',
                                  type: 'OPTION',
                                  isActive: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_ANDROID_XML.isActive(),
                                  isBlocked: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_ANDROID_XML.isBlocked(),
                                  isNew: Export.features(
                                    this.props.planStatus
                                  ).EXPORT_ANDROID_XML.isNew(),
                                  action: this.exportHandler,
                                },
                              ],
                              action: this.exportHandler,
                            },
                            {
                              label: this.props.locals.export.csv.spreadsheet,
                              value: 'EXPORT_CSV',
                              type: 'OPTION',
                              isActive: Export.features(
                                this.props.planStatus
                              ).EXPORT_CSV.isActive(),
                              isBlocked: Export.features(
                                this.props.planStatus
                              ).EXPORT_CSV.isBlocked(),
                              isNew: Export.features(
                                this.props.planStatus
                              ).EXPORT_CSV.isNew(),
                              action: this.exportHandler,
                            },
                          ]}
                          selected={this.state.format ?? ''}
                          alignment="RIGHT"
                          pin="TOP"
                        />
                        {this.state.format === 'EXPORT_CSS' && (
                          <Menu
                            icon="adjust"
                            id="select-color-space"
                            options={this.state.colorSpace.options}
                            selected={`${this.state.format}_${this.state.colorSpace.selected}`}
                            alignment="BOTTOM_RIGHT"
                            helper={{
                              label:
                                this.props.locals.export.css.selectColorSpace,
                            }}
                          />
                        )}
                        {this.state.format === 'EXPORT_TOKENS_DTCG' && (
                          <Menu
                            icon="adjust"
                            id="select-color-space"
                            options={this.state.colorSpace.options}
                            selected={`${this.state.format}_${this.state.colorSpace.selected}`}
                            alignment="BOTTOM_RIGHT"
                            helper={{
                              label:
                                this.props.locals.export.css.selectColorSpace,
                            }}
                          />
                        )}
                      </div>
                    }
                    alignment="BASELINE"
                  />
                  {this.state.format === 'EXPORT_TOKENS_DTCG' && (
                    <div className="export-palette__info">
                      <SemanticMessage
                        type="INFO"
                        message="DTCG tokens format is an ongoing work in progress led by a W3C group and can be changed in the future"
                      />
                    </div>
                  )}
                  <div className="export-palette__preview">
                    <Input
                      id="code-snippet-dragging"
                      type="CODE"
                      value={this.props.exportPreview}
                    />
                  </div>
                </>
              ),
            },
          ]}
          isFullHeight
        />
        <Actions
          {...this.props}
          service="TRANSFER"
        />
      </>
    )
  }
}
