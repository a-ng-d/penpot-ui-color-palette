import { PureComponent } from 'preact/compat'
import React from 'react'
import { Chip, RgbModel } from '@a_ng_d/figmug-ui'
import chroma from 'chroma-js'
import { BaseProps } from '../../types/app'

interface SourceProps extends BaseProps {
  name: string
  color: RgbModel
  isTransparent: boolean
}

export default class Source extends PureComponent<SourceProps> {
  static defaultProps: Partial<SourceProps> = {
    isTransparent: false,
  }

  // Render
  render() {
    return (
      <div
        className="preview__cell"
        style={{
          backgroundColor: chroma([
            this.props.color.r * 255,
            this.props.color.g * 255,
            this.props.color.b * 255,
          ]).hex(),
        }}
      >
        <Chip state="ON_BACKGROUND">{this.props.name}</Chip>
        {this.props.isTransparent && (
          <Chip state="ON_BACKGROUND">Transparent</Chip>
        )}
      </div>
    )
  }
}
