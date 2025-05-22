import {
  Button,
  Card,
  Dialog,
  FormItem,
  Input,
  List,
  texts,
} from '@a_ng_d/figmug-ui'
import * as Sentry from '@sentry/browser'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { FeatureStatus } from '@a_ng_d/figmug-utils'
import features, { isbUrl } from '../../config'
import cp from '../../content/images/choose_plan.webp'
import isb from '../../content/images/isb_product_thumbnail.webp'
import pp from '../../content/images/pro_plan.webp'
import t from '../../content/images/trial.webp'
import {
  BaseProps,
  HighlightDigest,
  PlanStatus,
  PriorityContext,
  TrialStatus,
} from '../../types/app'
import type { AppStates } from '../App'
import Feature from '../components/Feature'
import About from './About'
import Highlight from './Highlight'
import Onboarding from './Onboarding'
import SyncPreferences from './SyncPreferences'

interface PriorityContainerProps extends BaseProps {
  context: PriorityContext
  rawData: AppStates
  planStatus: PlanStatus
  trialStatus: TrialStatus
  highlight: HighlightDigest
  onChangePublication: React.Dispatch<Partial<AppStates>>
  onClose: React.ChangeEventHandler<HTMLInputElement> & (() => void)
}

interface PriorityContainerStates {
  isPrimaryActionLoading: boolean
  isSecondaryActionLoading: boolean
  userFullName: string
  userEmail: string
  userMessage: string
}

export default class PriorityContainer extends PureComponent<
  PriorityContainerProps,
  PriorityContainerStates
> {
  static features = (planStatus: PlanStatus) => ({
    GET_PRO_PLAN: new FeatureStatus({
      features: features,
      featureName: 'GET_PRO_PLAN',
      planStatus: planStatus,
    }),
    SHORTCUTS_HIGHLIGHT: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_HIGHLIGHT',
      planStatus: planStatus,
    }),
    SHORTCUTS_ONBOARDING: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_ONBOARDING',
      planStatus: planStatus,
    }),
    PUBLICATION: new FeatureStatus({
      features: features,
      featureName: 'PUBLICATION',
      planStatus: planStatus,
    }),
    REPORT: new FeatureStatus({
      features: features,
      featureName: 'REPORT',
      planStatus: planStatus,
    }),
    SHORTCUTS_ABOUT: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_ABOUT',
      planStatus: planStatus,
    }),
    SHORTCUTS_STORE: new FeatureStatus({
      features: features,
      featureName: 'SHORTCUTS_STORE',
      planStatus: planStatus,
    }),
  })

  constructor(props: PriorityContainerProps) {
    super(props)
    this.state = {
      isPrimaryActionLoading: false,
      isSecondaryActionLoading: false,
      userFullName: '',
      userEmail: '',
      userMessage: '',
    }
  }

  // Handlers
  reportHandler = () => {
    this.setState({ isPrimaryActionLoading: true })
    Sentry.sendFeedback(
      {
        name: this.state.userFullName,
        email: this.state.userEmail,
        message: this.state.userMessage,
      },
      {
        includeReplay: true,
      }
    )
      .then(() => {
        this.setState({
          userFullName: '',
          userEmail: '',
          userMessage: '',
        })
        parent.postMessage(
          {
            pluginMessage: {
              type: 'SEND_MESSAGE',
              message: this.props.locals.success.report,
            },
          },
          '*'
        )
      })
      .finally(() => this.setState({ isPrimaryActionLoading: false }))
      .catch(() => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'SEND_MESSAGE',
              message: this.props.locals.error.generic,
            },
          },
          '*'
        )
      })
  }

  // Templates
  Highlight = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus
        ).SHORTCUTS_HIGHLIGHT.isActive()}
      >
        <Highlight
          {...this.props}
          onCloseHighlight={() => {
            if (
              this.props.highlight.version !== undefined ||
              this.props.highlight.version !== ''
            )
              parent.postMessage(
                {
                  pluginMessage: {
                    type: 'SET_ITEMS',
                    items: [
                      {
                        key: 'highlight_version',
                        value: this.props.highlight.version,
                      },
                    ],
                  },
                },
                '*'
              )
            this.props.onClose()
          }}
        />
      </Feature>
    )
  }

  OnBoarding = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus
        ).SHORTCUTS_ONBOARDING.isActive()}
      >
        <Onboarding
          {...this.props}
          onCloseOnboarding={() => {
            parent.postMessage(
              {
                pluginMessage: {
                  type: 'SET_ITEMS',
                  items: [
                    {
                      key: 'is_onboarding_read',
                      value: 'true',
                    },
                  ],
                },
              },
              '*'
            )
            this.props.onClose()
          }}
        />
      </Feature>
    )
  }

  TryPro = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus
        ).GET_PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.locals.proPlan.trial.title}
          actions={{
            primary: {
              label: this.props.locals.proPlan.trial.cta,
              action: () =>
                parent.postMessage(
                  { pluginMessage: { type: 'ENABLE_TRIAL' } },
                  '*'
                ),
            },
            secondary: {
              label: this.props.locals.proPlan.trial.option,
              action: () =>
                parent.postMessage(
                  { pluginMessage: { type: 'GET_PRO_PLAN' } },
                  '*'
                ),
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__cover">
            <img
              src={cp}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={texts.type}>
              {this.props.locals.proPlan.trial.message}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }

  WelcomeToTrial = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus
        ).GET_PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.locals.proPlan.welcome.title}
          actions={{
            primary: {
              label: this.props.locals.proPlan.welcome.cta,
              action: this.props.onClose,
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__cover">
            <img
              src={t}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={texts.type}>
              {this.props.locals.proPlan.welcome.trial}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }

  WelcomeToPro = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus
        ).GET_PRO_PLAN.isActive()}
      >
        <Dialog
          title={this.props.locals.proPlan.welcome.title}
          actions={{
            primary: {
              label: this.props.locals.proPlan.welcome.cta,
              action: this.props.onClose,
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__cover">
            <img
              src={pp}
              style={{
                width: '100%',
              }}
            />
          </div>
          <div className="dialog__text">
            <p className={texts.type}>
              {this.props.locals.proPlan.welcome.message}
            </p>
          </div>
        </Dialog>
      </Feature>
    )
  }

  Report = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus
        ).REPORT.isActive()}
      >
        <Dialog
          title={this.props.locals.report.title}
          actions={{
            primary: {
              label: this.props.locals.report.cta,
              state: (() => {
                if (this.state.userMessage === '') return 'DISABLED'
                if (this.state.isPrimaryActionLoading) return 'LOADING'

                return 'DEFAULT'
              })(),
              action: this.reportHandler,
            },
          }}
          onClose={this.props.onClose}
        >
          <div className="dialog__form">
            <div className="dialog__form__item">
              <FormItem
                label={this.props.locals.report.fullName.label}
                id="type-fullname"
                shouldFill
              >
                <Input
                  type="TEXT"
                  id="type-fullname"
                  value={this.state.userFullName}
                  isAutoFocus
                  placeholder={this.props.locals.report.fullName.placeholder}
                  onChange={(e) =>
                    this.setState({
                      userFullName: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </FormItem>
            </div>
            <div className="dialog__form__item">
              <FormItem
                label={this.props.locals.report.email.label}
                id="type-email"
                shouldFill
              >
                <Input
                  type="TEXT"
                  id="type-email"
                  value={this.state.userEmail}
                  placeholder={this.props.locals.report.email.placeholder}
                  onChange={(e) =>
                    this.setState({
                      userEmail: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </FormItem>
            </div>
            <div className="dialog__form__item">
              <FormItem
                label={this.props.locals.report.message.label}
                id="type-message"
                shouldFill
              >
                <Input
                  type="LONG_TEXT"
                  id="type-message"
                  placeholder={this.props.locals.report.message.placeholder}
                  value={this.state.userMessage}
                  isGrowing
                  onChange={(e) =>
                    this.setState({
                      userMessage: (e.target as HTMLInputElement).value,
                    })
                  }
                />
              </FormItem>
            </div>
          </div>
        </Dialog>
      </Feature>
    )
  }

  Store = () => {
    const theme = document.documentElement.getAttribute('data-theme')
    let padding

    switch (theme) {
      case 'penpot':
        padding = 'var(--size-xxsmall) var(--size-small)'
        break
      case 'figma-ui2':
        padding = 'var(--size-xxsmall)'
        break
      case 'figma-ui3':
        padding = 'var(--size-xxsmall)'
        break
      default:
        padding = 'var(--size-xxsmall)'
    }

    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus
        ).SHORTCUTS_STORE.isActive()}
      >
        <Dialog
          title={this.props.locals.store.title}
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <List
            padding={padding}
            isFullWidth
          >
            <Card
              src={isb}
              label={this.props.locals.store.isb.label}
              shouldFill
            >
              <Button
                type="primary"
                label={this.props.locals.store.isb.cta}
                action={() => {
                  window.open(isbUrl, '_blank')?.focus()
                }}
              />
            </Card>
          </List>
        </Dialog>
      </Feature>
    )
  }

  About = () => {
    return (
      <Feature
        isActive={PriorityContainer.features(
          this.props.planStatus
        ).SHORTCUTS_ABOUT.isActive()}
      >
        <Dialog
          title={this.props.locals.about.title}
          onClose={this.props.onClose}
        >
          <About {...this.props} />
        </Dialog>
      </Feature>
    )
  }

  Preference = () => {
    return (
      <Feature isActive={true}>
        <Dialog
          title="Preferences"
          pin="RIGHT"
          onClose={this.props.onClose}
        >
          <List padding="var(--size-xsmall)">
            <SyncPreferences {...this.props} />
          </List>
        </Dialog>
      </Feature>
    )
  }

  // Render
  render() {
    return (
      <>
        {this.props.context === 'HIGHLIGHT' && <this.Highlight />}
        {this.props.context === 'ONBOARDING' && <this.OnBoarding />}
        {this.props.context === 'TRY' && <this.TryPro />}
        {this.props.context === 'WELCOME_TO_TRIAL' && <this.WelcomeToTrial />}
        {this.props.context === 'WELCOME_TO_PRO' && <this.WelcomeToPro />}
        {this.props.context === 'REPORT' && <this.Report />}
        {this.props.context === 'STORE' && <this.Store />}
        {this.props.context === 'ABOUT' && <this.About />}
        {this.props.context === 'PREFERENCES' && <this.Preference />}
      </>
    )
  }
}
