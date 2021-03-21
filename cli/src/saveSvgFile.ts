import fs from 'fs'
import path from 'path'

import {Config, createSvg} from '@ra100/ecg-svg/src/createSvg'

export const createSvgFile = (config: Config, output?: string): {filename: string; height: number} => {
  const outputFile = output || path.join('.', `tmp-path-svg${Date.now()}.svg`)

  const {content, height} = createSvg(config)

  fs.writeFileSync(outputFile, content)

  return {filename: outputFile, height}
}
