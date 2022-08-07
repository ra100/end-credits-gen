import {stdout} from 'node:process'
import assert from 'node:assert'
import fs from 'node:fs'
import {load} from 'js-yaml'

import {Config} from '@ra100-ecg/svg'

import {createPng, renderClip} from './svgToPng'
import {createSvgFile} from './saveSvgFile'

const importFile = (path: string) => fs.readFileSync(path, 'utf8')

const svg = (config: Config, output: string) => {
  stdout.write('Assembling svg\n')
  createSvgFile(config, output)
  return Promise.resolve()
}

const png = async (config: Config, output: string) => {
  stdout.write('Assembling svg\n')
  const {filename, height} = createSvgFile(config)

  stdout.write('Creating PNG\n')
  try {
    await createPng(filename, output)
    return {height}
  } finally {
    fs.unlinkSync(filename)
  }
}

const render = async (config: Config, output: string) => {
  stdout.write('Rendering clip\n')
  await renderClip(config, output)
}

const main = () => {
  const [_node, _script, input, output] = process.argv

  assert(!!input, 'input file needs to be specified')
  assert(!!output, 'output file or folder needs to be specified')

  stdout.write(`Import config ${input}\n`)
  const yamlFile = importFile(input)
  const config = load(yamlFile) as Config

  if (output.slice(-4) === '.png') {
    return png(config, output)
  }

  if (output.slice(-4) === '.svg') {
    return svg(config, output)
  }

  return render(config, output)
}

;async () => {
  await main()
  stdout.write('Done\n')
}
