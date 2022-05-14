import {execSync} from 'node:child_process'

import type {RenderOptions} from '@ra100-ecg/svg'

export const renderPng = (svg: string, {area, width, height}: RenderOptions): Buffer => {
  const inscapeArgsuments = [
    'inkscape',
    '--pipe',
    `--export-area=${area.join(':')}`,
    `--export-width=${width}`,
    `--export-height=${height}`,
    '--export-filename=-',
    '--export-type=png',
  ].join(' ')

  return execSync(inscapeArgsuments, {input: svg})
}
