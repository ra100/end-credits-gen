import fs from 'fs'
import os from 'os'
import {promisify} from 'util'
import path from 'path'
import {exec} from 'child_process'
import assert from 'assert'

import {createSvgFile} from './svg.mjs'

const execPromise = promisify(exec)

const textToPath = async (input, output) => {
  const outputFileName =
    output || path.join('.', `tmp-path-svg${Date.now()}.svg`)

  await execPromise(
    `inkscape ${input} --export-text-to-path --export-filename=${outputFileName}`
  )

  return outputFileName
}

const svgToPng = async (input, output) => {
  if (output) {
    assert(
      output.slice(-4) === '.png',
      'Output file must have ".png" extension'
    )
  }

  const outputFileName =
    output || path.join('.', `tmp-path-svg${Date.now()}.png`)

  await execPromise(`inkscape ${input} --export-filename=${outputFileName}`)

  return outputFileName
}

export const createPng = async (input, output) => {
  const pathedSvg = await textToPath(input)
  const pngPath = await svgToPng(pathedSvg, output)

  fs.unlinkSync(pathedSvg)

  return pngPath
}

const cropFrameToFile = (
  {ppf, width, height},
  {frameNumber, svgImagePath, outputDir}
) => {
  const offset = frameNumber * ppf
  const filenameNumber = `000000${frameNumber}`.slice(-5)
  console.info('Rendering frame', filenameNumber)
  return execPromise(
    `inkscape ${svgImagePath} --export-area=0:${offset}:${width}:${
      offset + height
    } --export-filename=${path.join(
      outputDir,
      `credits_${filenameNumber}.png`
    )}`
  )
}

export const renderClip = async (config, outputDir) => {
  const {filename, height: creditsHeight} = createSvgFile(config)
  const svgImagePath = await textToPath(filename)

  const frameCount = Math.floor(creditsHeight / config.ppf)
  const cpus = os.cpus().length

  console.info('Rendering', frameCount, 'frames')
  try {
    await execPromise(`mkdir -p ${outputDir}`)

    for (let frameNumber = 0; frameNumber < frameCount; frameNumber++) {
      const batch = []
      for (let i = 0; i < cpus && frameNumber + i < frameCount; i++) {
        batch.push(
          cropFrameToFile(config, {
            frameNumber,
            svgImagePath,
            outputDir,
          })
        )
        frameNumber++
      }
      await Promise.all(batch)
    }
  } finally {
    fs.unlinkSync(filename)
    fs.unlinkSync(pathedSvg)
  }
}
