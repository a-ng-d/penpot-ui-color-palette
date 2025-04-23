import { Bar, Button, ConsentConfiguration, Tabs } from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'

import { FeatureStatus } from '@a_ng_d/figmug-utils'
import features from '../../config'
import { $palette } from '../../stores/palette'
import { Context, ContextItem, Language, PlanStatus } from '../../types/app'
import {
  ExtractOfBaseConfiguration,
  UserConfiguration,
} from '../../types/configurations'
import { UserSession } from '../../types/user'
import { setContexts } from '../../utils/setContexts'
import { AppStates } from '../App'
import InternalPalettes from '../contexts/InternalPalettes'

interface BrowsePalettesProps {
  userIdentity: UserConfiguration
  userSession: UserSession
  userConsent: Array<ConsentConfiguration>
  palettesList: Array<ExtractOfBaseConfiguration>
  planStatus: PlanStatus
  lang: Language
  onCreatePalette: React.Dispatch<Partial<AppStates>>
}

interface BrowsePalettesStates {
  context: Context | ''
  isPrimaryLoading: boolean
}

export default class BrowsePalettes extends PureComponent<
  BrowsePalettesProps,
  BrowsePalettesStates
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

  constructor(props: BrowsePalettesProps) {
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
