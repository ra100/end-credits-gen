#!/usr/bin/env node

import fs from 'fs'
import assert from 'assert'
import yaml from 'js-yaml'

import {createSvgFile} from './src/svg.mjs'
import {createPng} from './src/svgToPng.mjs'

const importFile = path => fs.readFileSync(path, 'utf-8')

const svg = (input, output) => {
  console.info('Import file', input)
  const yamlFile = importFile(input)
  const json = yaml.safeLoad(yamlFile)

  console.info('Assembling svg')
  const svg = createSvgFile(json, output)
}

const png = async (input, output) => {
  console.info('Import file', input)
  const yamlFile = importFile(input)
  const json = yaml.safeLoad(yamlFile)

  console.info('Assembling svg')
  const tmpSvgFile = createSvgFile(json)

  console.info('Creating PNG')
  await createPng(tmpSvgFile, output)

  fs.unlinkSync(tmpSvgFile)
}

const main = () => {
  const [_node, _script, input, output] = process.argv

  assert(!!input, 'input file path needs to be specified')
  assert(!!output, 'output file path needs to be specified')

  if (output.includes('.png')) {
    return png(input, output)
  }

  if (output.includes('.svg')) {
    return svg(input, output)
  }
}

main()
  .then(() => {
    console.info('Done')
  })
  .catch(console.error)
