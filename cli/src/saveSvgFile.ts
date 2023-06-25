import fs from 'node:fs/promises'
import path from 'node:path'

import {Config, createSvg} from '@ra100-ecg/svg'

export const createSvgFile = async (config: Config, output?: string): Promise<{filename: string; height: number}> => {
  const outputFile = output || path.join('.', `tmp-path-svg${Date.now()}.svg`)

  const {content, height} = createSvg(config)

  await fs.writeFile(outputFile, content)

  return {filename: outputFile, height}
}
