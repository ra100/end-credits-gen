import assert from 'assert'
import fs from 'fs'
import {load} from 'js-yaml'

import {Config, createSvgFile} from './svg'
import {createPng, renderClip} from './svgToPng'

const importFile = (path: string) => fs.readFileSync(path, 'utf8')

const svg = (config: Config, output: string) => {
  console.info('Assembling svg')
  createSvgFile(config, output)
  return Promise.resolve()
}

const png = async (config: Config, output: string) => {
  console.info('Assembling svg')
  const {filename, height} = createSvgFile(config)

  console.info('Creating PNG')
  try {
    await createPng(filename, output)
    return {height}
  } finally {
    fs.unlinkSync(filename)
  }
}

const render = async (config: Config, output: string) => {
  console.info('Rendering clip')
  await renderClip(config, output)
}

const main = () => {
  const [_node, _script, input, output] = process.argv

  assert(!!input, 'input file needs to be specified')
  assert(!!output, 'output file or folder needs to be specified')

  console.info('Import config', input)
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

main()
  .then(() => {
    console.info('Done')
  })
  .catch(console.error)
