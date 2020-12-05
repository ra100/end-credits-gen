#!/usr/bin/env node

import assert from 'assert'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

import {createSvgFile} from './src/svg.mjs'
import {createPng} from './src/svgToPng.mjs'
import {renderClip} from './src/render.mjs'

const importFile = path => fs.readFileSync(path, 'utf-8')

const svg = (config, output) => {
  console.info('Assembling svg')
  createSvgFile(config, output)
  return Promise.resolve()
}

const png = async (config, output) => {
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

const render = async (config, output) => {
  const tmpOutputFile = path.join('.', `tmp-png-out${Date.now()}.png`)
  const {height} = await png(config, tmpOutputFile)

  console.info('Rendering clip')
  try {
    await renderClip(config, tmpOutputFile, height, output)
  } finally {
    fs.unlinkSync(tmpOutputFile)
  }
}

const main = () => {
  const [_node, _script, input, output] = process.argv

  assert(!!input, 'input file needs to be specified')
  assert(!!output, 'output file or folder needs to be specified')

  console.info('Import config', input)
  const yamlFile = importFile(input)
  const config = yaml.safeLoad(yamlFile)

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
