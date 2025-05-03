import { $palette } from '../../stores/palette'
import {
  PresetConfiguration,
  ScaleConfiguration,
} from '../../types/configurations'

const deleteStop = (
  scale: ScaleConfiguration,
  selectedKnob: HTMLElement,
  presetName: string,
  presetMin: number,
  presetMax: number
) => {
  const newScale: Array<number> = [],
    newLightnessScale: { [key: string]: number } = {},
    factor = Math.min(...Object.keys(scale).map((stop) => parseFloat(stop))),
    palette = $palette

  Object.values(scale).forEach((scale) => {
    scale === parseFloat(selectedKnob.style.left) ? null : newScale.push(scale)
  })
  newScale.forEach(
    (scale, index) => (newLightnessScale[(index + 1) * factor] = scale)
  )

  return {
    scale: newLightnessScale,
    preset: {
      name: presetName,
      scale: Object.keys(palette.get().scale).map((key) => parseFloat(key)),
      min: presetMin,
      max: presetMax,
      easing: 'NONE',
      id: 'CUSTOM',
    } as PresetConfiguration,
  }
}

export default deleteStop
