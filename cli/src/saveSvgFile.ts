import fs from 'node:fs'
import path from 'node:path'

import {Config, createSvg} from '@ra100-ecg/svg'

export const createSvgFile = (config: Config, output?: string): {filename: string; height: number} => {
  const outputFile = output || path.join('.', `tmp-path-svg${Date.now()}.svg`)

  const {content, height} = createSvg(config)

  fs.writeFileSync(outputFile, content)

  return {filename: outputFile, height}
}
