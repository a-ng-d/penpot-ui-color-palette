import { Layout, layouts, texts } from '@a_ng_d/figmug-ui'
import { doClassnames, FeatureStatus } from '@a_ng_d/figmug-utils'
import { PureComponent } from 'preact/compat'
import React from 'react'
import features, {
  authorUrl,
  isDev,
  isProEnabled,
  licenseUrl,
  repositoryUrl,
} from '../../config'
import { BaseProps, PlanStatus, TrialStatus } from '../../types/app'
import Feature from '../components/Feature'
import package_json from './../../../package.json'
import Icon from './Icon'

interface AboutProps extends BaseProps {
  trialStatus: TrialStatus
}

export default class About extends PureComponent<AboutProps> {
  static features = (planStatus: PlanStatus) => ({
    GET_PRO_PLAN: new FeatureStatus({
      features: features,
      featureName: 'GET_PRO_PLAN',
      planStatus: planStatus,
    }),
  })

  render() {
    return (
      <Layout
        id="about"
        column={[
          {
            node: (
              <div className={layouts['stackbar--medium']}>
                <div className={layouts['snackbar--large']}>
                  <Icon size={32} />
                  <div>
                    <span
                      className={doClassnames([
                        texts.type,
                        texts['type--xlarge'],
                      ])}
                    >
                      {this.props.locals.name}
                    </span>
                    <div className={layouts.snackbar}>
                      <span
                        className={texts.type}
                      >{`Version ${package_json.version}`}</span>
                      <Feature
                        isActive={
                          About.features(
                            this.props.planStatus
                          ).GET_PRO_PLAN.isActive() && isProEnabled
                        }
                      >
                        <span className={texts.type}>
                          {this.props.locals.separator}
                        </span>
                        {isDev ? (
                          <span className={texts.type}>
                            {this.props.locals.plan.dev}
                          </span>
                        ) : (
                          <span className={texts.type}>
                            {this.props.planStatus === 'UNPAID'
                              ? this.props.locals.plan.free
                              : this.props.planStatus === 'PAID' &&
                                  this.props.trialStatus === 'PENDING'
                                ? this.props.locals.plan.trial
                                : this.props.locals.plan.pro}
                          </span>
                        )}
                      </Feature>
                    </div>
                  </div>
                </div>
                <div className={layouts.stackbar}>
                  <span className={texts.type}>
                    {this.props.locals.about.createdBy}
                    <a
                      href={authorUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {this.props.locals.about.author}
                    </a>
                  </span>
                  <span className={texts.type}>
                    <a
                      href={repositoryUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {this.props.locals.about.sourceCode}
                    </a>
                    {this.props.locals.about.isLicensed}
                    <a
                      href={licenseUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {this.props.locals.about.license}
                    </a>
                  </span>
                </div>
              </div>
            ),
            typeModifier: 'CENTERED',
          },
        ]}
        isFullWidth
      />
    )
  }
}
