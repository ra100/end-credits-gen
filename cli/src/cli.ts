import {stderr, stdout} from 'node:process'
import assert from 'node:assert'
import fs from 'node:fs/promises'
import {load} from 'js-yaml'

import {Config} from '@ra100-ecg/svg'

import {createPng, renderClip} from './svgToPng'
import {createSvgFile} from './saveSvgFile'

const importFile = (path: string): Promise<string> => fs.readFile(path, 'utf8')

const svg = async (config: Config, output: string) => {
  stdout.write('Assembling svg\n')
  await createSvgFile(config, output)
}

const png = async (config: Config, output: string) => {
  stdout.write('Assembling svg\n')
  const {filename, height} = await createSvgFile(config)

  stdout.write('Creating PNG\n')
  try {
    await createPng(filename, output)
    return {height}
  } finally {
    await fs.unlink(filename).catch((error) => stderr.write(`Error deleting file ${filename}: ${error}`))
  }
}

const render = async (config: Config, output: string, cpuLimit?: number) => {
  stdout.write('Rendering clip\n')
  await renderClip(config, output, cpuLimit)
}

const main = async () => {
  const [_node, _script, input, output, cpuLimit] = process.argv

  assert(!!input, 'input file needs to be specified')
  assert(!!output, 'output file or folder needs to be specified')

  stdout.write(`Import config ${input}\n`)
  const yamlFile = await importFile(input)
  const config = load(yamlFile) as Config

  if (output.slice(-4) === '.png') {
    return png(config, output)
  }

  if (output.slice(-4) === '.svg') {
    return svg(config, output)
  }

  return render(config, output, cpuLimit ? Number(cpuLimit) : undefined)
}

main()
  .then(() => {
    stdout.write('Done\n')
  })
  // eslint-disable-next-line unicorn/prefer-top-level-await
  .catch(stderr.write)
