import { Dialog, Icon, SemanticMessage, texts } from '@a_ng_d/figmug-ui'
import { PureComponent } from 'preact/compat'
import React from 'react'
import { announcementsWorkerUrl } from '../../config'
import { BaseProps } from '../../types/app'

interface OnboardingProps extends BaseProps {
  onCloseOnboarding: (e: MouseEvent) => void
}

interface OnboardingStates {
  position: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  announcements: Array<any>
  status: 'LOADING' | 'LOADED' | 'ERROR'
  isImageLoaded: boolean
}

export default class Onboarding extends PureComponent<
  OnboardingProps,
  OnboardingStates
> {
  constructor(props: OnboardingProps) {
    super(props)
    this.state = {
      position: 0,
      announcements: [],
      status: 'LOADING',
      isImageLoaded: false,
    }
  }

  // Lifecycle
  componentDidMount = () => {
    fetch(
      `${announcementsWorkerUrl}/?action=get_announcements&database_id=${import.meta.env.VITE_NOTION_ONBOARDING_ID}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.message !== 'The database could not be queried') {
          interface AnnouncementProperties {
            Rôle: {
              multi_select: Array<{
                name: string
              }>
            }
          }

          interface Announcement {
            properties: AnnouncementProperties
          }

          const forDev: Announcement[] = data.announcements.filter(
            (announcement: Announcement) =>
              announcement.properties['Rôle'].multi_select.some(
                (role: { name: string }) => role.name === 'Dev'
              )
          )
          const forDesigner: Announcement[] = data.announcements.filter(
            (announcement: Announcement) =>
              announcement.properties['Rôle'].multi_select.some(
                (role: { name: string }) => role.name === 'Design'
              )
          )

          this.setState({
            announcements: forDev,
            status: 'LOADED',
          })
        } else this.setState({ status: 'ERROR' })
      })
      .catch(() => {
        this.setState({ status: 'ERROR' })
      })
  }

  // Direct Actions
  goNextSlide = (e: MouseEvent) => {
    if (this.state.position + 1 < this.state.announcements.length)
      this.setState({ position: this.state.position + 1, isImageLoaded: false })
    else {
      this.props.onCloseOnboarding(e as MouseEvent)
      this.setState({ position: 0 })
    }
  }

  // Render
  render() {
    if (this.state.status === 'LOADING')
      return (
        <Dialog
          title={this.props.locals.pending.onboarding}
          isLoading
          onClose={this.props.onCloseOnboarding}
        />
      )
    else if (this.state.status === 'ERROR')
      return (
        <Dialog
          title={this.props.locals.error.generic}
          isMessage
          onClose={this.props.onCloseOnboarding}
        >
          <SemanticMessage
            type="WARNING"
            message={this.props.locals.error.onboarding}
          />
        </Dialog>
      )
    else
      return (
        <Dialog
          title={
            this.state.announcements[this.state.position].properties.Titre
              .title[0].plain_text
          }
          tag={
            this.state.announcements[this.state.position].properties.Type.select
              .name
          }
          actions={{
            primary: {
              label:
                this.state.position + 1 < this.state.announcements.length
                  ? this.props.locals.onboarding.cta.next
                  : this.props.locals.onboarding.cta.gotIt,
              action: (e: MouseEvent) => this.goNextSlide(e),
            },
            secondary: (() => {
              if (
                this.state.announcements[this.state.position].properties.URL
                  .url !== null
              )
                return {
                  label: this.props.locals.onboarding.cta.learnMore,
                  action: () =>
                    window
                      .open(
                        this.state.announcements[this.state.position].properties
                          .URL.url,
                        '_blank'
                      )
                      ?.focus(),
                }
              else return undefined
            })(),
          }}
          indicator={
            this.state.announcements.length > 1
              ? `${this.state.position + 1} of ${this.state.announcements.length}`
              : undefined
          }
          onClose={(e: MouseEvent) => this.props.onCloseOnboarding(e)}
        >
          <div
            className="dialog__cover"
            style={{
              position: 'relative',
            }}
          >
            {!this.state.isImageLoaded && (
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  inset: '0 0 0 0',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Icon
                  type="PICTO"
                  iconName="spinner"
                />
              </div>
            )}
            <img
              src={
                this.state.announcements[this.state.position].properties.Image
                  .files[0].file.url
              }
              style={{
                width: '100%',
                visibility: this.state.isImageLoaded ? 'visible' : 'hidden',
                aspectRatio: '8 / 5',
              }}
              loading="lazy"
              onLoad={() => this.setState({ isImageLoaded: true })}
            />
          </div>
          <div className="dialog__text">
            <p className={texts.type}>
              {
                this.state.announcements[this.state.position].properties
                  .Description.rich_text[0].plain_text
              }
            </p>
          </div>
        </Dialog>
      )
  }
}
