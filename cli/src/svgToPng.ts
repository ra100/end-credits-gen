import assert from 'node:assert'
import {exec} from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {stderr, stdout} from 'node:process'
import {promisify} from 'node:util'

import {Config} from '@ra100-ecg/svg/src/createSvg'

import {createSvgFile} from './saveSvgFile'

const inkscapeExecutable = process.env.INKSCAPE || 'inkscape'

const execPromise = promisify(exec)

const textToPath = async (input: string, output?: string) => {
  const outputFileName = output || path.join(process.env.TMP || os.tmpdir(), 'ecg', `tmp-path-svg${Date.now()}.svg`)
  const absoluteFilePath = path.resolve(input)

  const command = `${inkscapeExecutable} "${absoluteFilePath}" --export-text-to-path --export-filename="${outputFileName}"`

  stdout.write(`${command}\n`)
  await execPromise(command)

  return outputFileName
}

const svgToPng = async (input: string, output: string) => {
  if (output) {
    assert(output.slice(-4) === '.png', 'Output file must have ".png" extension')
  }

  const outputFileName = output || path.join(process.env.TMP || os.tmpdir(), 'ecg', `tmp-path-svg${Date.now()}.png`)

  await execPromise(`${inkscapeExecutable} "${input}" --export-filename="${outputFileName}"`)

  return outputFileName
}

export const createPng = async (input: string, output: string): Promise<string> => {
  const pathToSvg = await textToPath(input)
  const pngPath = await svgToPng(pathToSvg, output)
  await fs.unlink(pathToSvg).catch((error) => stderr.write(`Error deleting file ${pathToSvg}: ${error}`))

  return pngPath
}

const cropFrameToFile = async (
  {ppf, width, height, outputWidth, outputHeight}: Config,
  {frameNumber, svgImagePath, outputDir}: {frameNumber: number; svgImagePath: string; outputDir: string}
) => {
  const speedFactor = outputHeight ? height / outputHeight : 1
  const offset = Math.round(frameNumber * (ppf * speedFactor))
  const filenameNumber = `000000${frameNumber + 1}`.slice(-5)

  const exportArea = [0, offset, width, offset + height].join(':').replaceAll('.', ',')

  const inscapeArguments = [
    `"${svgImagePath}"`,
    `--export-area=${exportArea}`,
    `--export-width=${outputWidth || width}`,
    `--export-height=${outputHeight || height}`,
    `--export-filename="${path.join(outputDir, `credits_${filenameNumber}.png`)}"`,
  ].join(' ')

  const command = `${inkscapeExecutable} ${inscapeArguments}`

  stdout.write(`Rendering frame ${filenameNumber}\n`)
  stdout.write(`${command}\n`)

  try {
    const consoleOutput = await execPromise(command)
    stdout.write(consoleOutput.stdout)
    stderr.write(consoleOutput.stderr)
  } catch (error) {
    stdout.write(`Frame ${filenameNumber} error: ${error}\n`)
    throw error
  }
}

export const renderClip = async (config: Config, outputDirectory: string, cpuLimit?: number): Promise<void> => {
  const {filename, height: creditsHeight} = await createSvgFile(config)
  const svgImagePath = await textToPath(filename)
  const sizeFactor = config.outputHeight ? config.outputHeight / config.height : 1
  const frameCount = Math.floor(((creditsHeight - config.height) * sizeFactor) / config.ppf)
  const cpus = cpuLimit ?? os.cpus().length

  stdout.write(`Rendering ${frameCount} frames`)
  try {
    await execPromise(`mkdir -p "${outputDirectory}"`)

    for (let frameNumber = 0; frameNumber < frameCount; ) {
      const batch = []
      for (let index = 0; index < cpus && frameNumber + index < frameCount; index++) {
        batch.push(
          cropFrameToFile(config, {
            frameNumber,
            svgImagePath,
            outputDir: outputDirectory,
          })
        )
        frameNumber++
      }
      await Promise.all(batch)
    }
  } finally {
    await fs.unlink(filename).catch((error) => stderr.write(`Error deleting file ${filename}: ${error}`))
    await fs.unlink(svgImagePath).catch((error) => stderr.write(`Error deleting file ${svgImagePath}: ${error}`))
  }
}
