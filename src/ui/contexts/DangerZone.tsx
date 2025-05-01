import {
  Button,
  Dialog,
  Section,
  SectionTitle,
  SimpleItem,
  texts,
} from '@a_ng_d/figmug-ui'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import { createPortal, PureComponent } from 'preact/compat'
import React from 'react'
import features from '../../config'
import { BaseProps, PlanStatus } from '../../types/app'
import Feature from '../components/Feature'

interface DangerZoneProps extends BaseProps {
  id: string
  name: string
  isLast?: boolean
  onDeletePalette: () => void
}

interface DangerZoneState {
  isDeleteDialogOpen: boolean
}

export default class DangerZone extends PureComponent<
  DangerZoneProps,
  DangerZoneState
> {
  static features = (planStatus: PlanStatus) => ({
    SETTINGS_TEXT_COLORS_THEME: new FeatureStatus({
      features: features,
      featureName: 'SETTINGS_TEXT_COLORS_THEME',
      planStatus: planStatus,
    }),
  })

  static defaultProps = {
    isLast: false,
  }

  constructor(props: DangerZoneProps) {
    super(props)
    this.state = {
      isDeleteDialogOpen: false,
    }
  }

  // Direct Actions
  onDeletePalette = () => {
    this.setState({
      isDeleteDialogOpen: false,
    })

    this.props.onDeletePalette()

    parent.postMessage(
      {
        pluginMessage: {
          type: 'DELETE_PALETTE',
          id: this.props.id,
        },
      },
      '*'
    )
  }

  // Templates
  Modals = () => {
    return (
      <>
        <Feature isActive={this.state.isDeleteDialogOpen}>
          {document.getElementById('modal') &&
            createPortal(
              <Dialog
                title={this.props.locals.browse.deletePaletteDialog.title}
                actions={{
                  destructive: {
                    label: this.props.locals.browse.deletePaletteDialog.delete,
                    feature: 'DELETE_PALETTE',
                    action: this.onDeletePalette,
                  },
                  secondary: {
                    label: this.props.locals.browse.deletePaletteDialog.cancel,
                    action: () =>
                      this.setState({
                        isDeleteDialogOpen: false,
                      }),
                  },
                }}
                onClose={() =>
                  this.setState({
                    isDeleteDialogOpen: false,
                  })
                }
              >
                <div className="dialog__text">
                  <p className={texts.type}>
                    {this.props.locals.browse.deletePaletteDialog.message.replace(
                      '$1',
                      this.props.name
                    )}
                  </p>
                </div>
              </Dialog>,
              document.getElementById('modal') ?? document.createElement('app')
            )}
        </Feature>
      </>
    )
  }

  // Render
  render() {
    return (
      <>
        <Section
          title={
            <SimpleItem
              leftPartSlot={<SectionTitle label={'Danger zone'} />}
              isListItem={false}
              alignment="CENTER"
            />
          }
          body={[
            {
              node: (
                <Button
                  type="destructive"
                  label="Delete palette"
                  action={() => this.setState({ isDeleteDialogOpen: true })}
                />
              ),
            },
          ]}
          border={!this.props.isLast ? ['BOTTOM'] : undefined}
        />
        <this.Modals />
      </>
    )
  }
}
