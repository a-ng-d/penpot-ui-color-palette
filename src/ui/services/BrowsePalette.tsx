import { Bar, Button, ConsentConfiguration, Tabs } from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { FeatureStatus } from '@a_ng_d/figmug-utils'
import features from '../../config'
import { $palette } from '../../stores/palette'
import { Context, ContextItem, Language, PlanStatus } from '../../types/app'
import {
  ExtractOfPaletteConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import { UserSession } from '../../types/user'
import { setContexts } from '../../utils/setContexts'
import InternalPalettes from '../contexts/InternalPalettes'
import { AppStates } from '../App'

interface BrowsePaletteProps {
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  palettesList: Array<ExtractOfPaletteConfiguration>
  planStatus: PlanStatus
  lang: Language
  onCreatePalette: React.Dispatch<Partial<AppStates>>
}

interface BrowsePaletteStates {
  context: Context | ''
  isPrimaryLoading: boolean
}

export default class BrowsePalette extends PureComponent<
  BrowsePaletteProps,
  BrowsePaletteStates
> {
  private contexts: Array<ContextItem>
  private palette: typeof $palette

  static features = (planStatus: PlanStatus) => ({
    LIBRARY_FILE: new FeatureStatus({
      features: features,
      featureName: 'LIBRARY_FILE',
      planStatus: planStatus,
    }),
    LIBRARY_PAGE: new FeatureStatus({
      features: features,
      featureName: 'LIBRARY_PAGE',
      planStatus: planStatus,
    }),
  })

  constructor(props: BrowsePaletteProps) {
    super(props)
    this.palette = $palette
    this.contexts = setContexts(
      ['LIBRARY_PAGE', 'LIBRARY_FILE'],
      props.planStatus
    )
    this.state = {
      context: this.contexts[0].id,
      isPrimaryLoading: false,
    }
  }

  // Handlers
  navHandler = (e: Event) =>
    this.setState({
      context: (e.target as HTMLElement).dataset.feature as Context,
    })

  // Direct Actions
  onCreatePalette = () => {
    this.props.onCreatePalette({
      service: 'CREATE',
    })
  }

  // Renders
  render() {
    let fragment

    switch (this.state.context) {
      case 'LIBRARY_PAGE': {
        fragment = <InternalPalettes {...this.props} />
        break
      }
    }

    return (
      <>
        <Bar
          leftPartSlot={
            <Tabs
              tabs={this.contexts}
              active={this.state.context ?? ''}
              action={this.navHandler}
            />
          }
          rightPartSlot={
            <Button
              type="primary"
              icon="plus"
              label="New UI Color Palette"
              action={this.onCreatePalette}
            />
          }
        />
        <section className="context">{fragment}</section>
      </>
    )
  }
}
