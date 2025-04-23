import {
  Bar,
  Button,
  ConsentConfiguration,
  HexModel,
  layouts,
  Tabs,
} from '@a_ng_d/figmug-ui'
import chroma from 'chroma-js'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { uid } from 'uid'

import { FeatureStatus } from '@a_ng_d/figmug-utils'
import features from '../../config'
import { $palette } from '../../stores/palette'
import {
  Context,
  ContextItem,
  Easing,
  Language,
  NamingConvention,
  PlanStatus,
  PriorityContext,
  ThirdParty,
} from '../../types/app'
import {
  AlgorithmVersionConfiguration,
  ColorSpaceConfiguration,
  ExtractOfBaseConfiguration,
  LockedSourceColorsConfiguration,
  PresetConfiguration,
  ScaleConfiguration,
  ShiftConfiguration,
  SourceColorConfiguration,
  UserConfiguration,
  ViewConfiguration,
  VisionSimulationModeConfiguration,
} from '../../types/configurations'
import { ActionsList, TextColorsThemeHexModel } from '../../types/models'
import { UserSession } from '../../types/user'
import { trackActionEvent } from '../../utils/eventsTracker'
import { setContexts } from '../../utils/setContexts'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import Scale from '../contexts/Scale'
import Settings from '../contexts/Settings'
import Source from '../contexts/Source'
import Actions from '../modules/Actions'
import Preview from '../modules/Preview'

interface CreatePaletteProps {
  sourceColors: Array<SourceColorConfiguration> | []
  id: string
  name: string
  description: string
  preset: PresetConfiguration
  namingConvention: NamingConvention
  distributionEasing: Easing
  scale: ScaleConfiguration
  shift: ShiftConfiguration
  areSourceColorsLocked: LockedSourceColorsConfiguration
  colorSpace: ColorSpaceConfiguration
  visionSimulationMode: VisionSimulationModeConfiguration
  view: ViewConfiguration
  algorithmVersion: AlgorithmVersionConfiguration
  textColorsTheme: TextColorsThemeHexModel
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  palettesList: Array<ExtractOfBaseConfiguration>
  planStatus: PlanStatus
  lang: Language
  onChangeColorsFromImport: React.Dispatch<Partial<AppStates>>
  onChangeScale: React.Dispatch<Partial<AppStates>>
  onChangePreset: React.Dispatch<Partial<AppStates>>
  onChangeShift: React.Dispatch<Partial<AppStates>>
  onCustomPreset: React.Dispatch<Partial<AppStates>>
  onChangeSettings: React.Dispatch<Partial<AppStates>>
  onConfigureExternalSourceColors: React.Dispatch<Partial<AppStates>>
  onResetSourceColors: React.Dispatch<Partial<AppStates>>
  onLockSourceColors: React.Dispatch<Partial<AppStates>>
  onGetProPlan: (context: { priorityContainerContext: PriorityContext }) => void
  onCancelPalette: () => void
  onSavedPalette: React.Dispatch<Partial<AppStates>>
}

interface CreatePaletteStates {
  context: Context | ''
  isPrimaryLoading: boolean
  isSecondaryLoading: boolean
}

export default class CreatePalette extends PureComponent<
  CreatePaletteProps,
  CreatePaletteStates
> {
  private contexts: Array<ContextItem>
  private palette: typeof $palette

  static features = (planStatus: PlanStatus) => ({
    ACTIONS: new FeatureStatus({
      features: features,
      featureName: 'ACTIONS',
      planStatus: planStatus,
    }),
    PREVIEW: new FeatureStatus({
      features: features,
      featureName: 'PREVIEW',
      planStatus: planStatus,
    }),
  })

  constructor(props: CreatePaletteProps) {
    super(props)
    this.palette = $palette
    this.contexts = setContexts(
      ['SOURCE', 'SCALE', 'SETTINGS'],
      props.planStatus
    )
    this.state = {
      context:
        this.contexts[0] !== undefined
          ? this.contexts[this.props.sourceColors.length === 0 ? 0 : 1].id
          : '',
      isPrimaryLoading: false,
      isSecondaryLoading: false,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    window.addEventListener('message', this.handleMessage)
  }

  componentWillUnmount = () => {
    window.removeEventListener('message', this.handleMessage)
  }

  // Handlers
  handleMessage = (e: MessageEvent) => {
    const actions: ActionsList = {
      STOP_LOADER: () => {
        this.setState({
          isPrimaryLoading: false,
          isSecondaryLoading: false,
        })
      },
      DEFAULT: () => null,
    }

    return actions[e.data.type ?? 'DEFAULT']?.()
  }

  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  colorsFromImportHandler = (
    sourceColorsFromImport: Array<SourceColorConfiguration>,
    source: ThirdParty
  ) => {
    this.props.onChangeColorsFromImport({
      sourceColors: this.props.sourceColors
        .filter(
          (sourceColors: SourceColorConfiguration) =>
            sourceColors.source !== source
        )
        .concat(sourceColorsFromImport),
    })
  }

  resetSourceColorsHandler = () => {
    this.props.onResetSourceColors({
      sourceColors: this.props.sourceColors.filter(
        (sourceColors: SourceColorConfiguration) =>
          sourceColors.source === 'CANVAS'
      ),
    })
  }

  slideHandler = () =>
    this.props.onChangeScale({
      scale: this.palette.get().scale,
      onGoingStep: 'scale changed',
    })

  shiftHandler = () =>
    this.props.onChangeShift({
      shift: this.palette.get().shift,
      onGoingStep: 'shift changed',
    })

  // Direct Actions
  onCreatePalette = () => {
    this.setState({
      isPrimaryLoading: true,
    })

    parent.postMessage(
      {
        pluginMessage: {
          type: 'CREATE_PALETTE',
          data: {
            sourceColors: this.props.sourceColors,
            palette: {
              ...this.palette.value,
            },
          },
        },
      },
      '*'
    )

    trackActionEvent(
      this.props.userIdentity.id,
      this.props.userConsent.find((consent) => consent.id === 'mixpanel')
        ?.isConsented ?? false,
      {
        feature: 'CREATE_PALETTE',
        colors: this.props.sourceColors.length,
        stops: this.props.preset.scale.length,
      }
    )
  }

  onConfigureExternalSourceColors = (name: string, colors: Array<HexModel>) => {
    this.palette.setKey('name', name)
    this.setState({
      context: 'SOURCE',
    })
    this.props.onConfigureExternalSourceColors({
      name: name,
      sourceColors: colors.map((color, index) => {
        const gl = chroma(color).gl()
        return {
          name: `Color ${index + 1}`,
          description: '',
          rgb: {
            r: gl[0],
            g: gl[1],
            b: gl[2],
          },
          source: 'REMOTE',
          hue: {
            shift: 0,
            isLocked: false,
          },
          chroma: {
            shift: 100,
            isLocked: false,
          },
          id: uid(),
          isRemovable: false,
        }
      }),
    })
  }

  onCancelPalette = () => {
    this.props.onCancelPalette()
  }

  // Renders
  render() {
    let fragment

    switch (this.state.context) {
      case 'SOURCE': {
        fragment = (
          <Source
            {...this.props}
            onChangeColorsFromImport={this.colorsFromImportHandler}
          />
        )
        break
      }
      case 'SCALE': {
        fragment = (
          <Scale
            {...this.props}
            service="CREATE"
            onAddStop={this.props.onCustomPreset}
            onRemoveStop={this.props.onCustomPreset}
            onChangeNamingConvention={this.props.onCustomPreset}
            onChangeDistributionEasing={this.props.onCustomPreset}
            onChangeScale={this.slideHandler}
            onChangeShift={this.shiftHandler}
          />
        )
        break
      }
      case 'SETTINGS': {
        fragment = (
          <Settings
            {...this.props}
            service="CREATE"
          />
        )
        break
      }
    }

    return (
      <>
        <Bar
          leftPartSlot={
            <div className={layouts['snackbar--tight']}>
              <Button
                type="icon"
                icon="back"
                action={this.onCancelPalette}
              />
              <Tabs
                tabs={this.contexts}
                active={this.state.context ?? ''}
                action={this.navHandler}
              />
            </div>
          }
          border={[]}
        />
        <section className="context">{fragment}</section>
        <Feature
          isActive={CreatePalette.features(
            this.props.planStatus
          ).PREVIEW.isActive()}
        >
          <Preview
            {...this.props}
            service="CREATE"
            colors={this.props.sourceColors}
            onResetSourceColors={this.resetSourceColorsHandler}
          />
        </Feature>
        <Feature
          isActive={CreatePalette.features(
            this.props.planStatus
          ).ACTIONS.isActive()}
        >
          <Actions
            {...this.props}
            {...this.state}
            service="CREATE"
            scale={this.props.scale}
            onCreatePalette={this.onCreatePalette}
          />
        </Feature>
      </>
    )
  }
}
