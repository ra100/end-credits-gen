import fs from 'fs'
import {promisify} from 'util'
import path from 'path'
import {exec} from 'child_process'
import assert from 'assert'

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
