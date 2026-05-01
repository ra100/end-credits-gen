import assert from 'node:assert'
import {ChildProcess, exec, spawn} from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import {stderr, stdout} from 'node:process'
import {promisify} from 'node:util'

import {Config} from '@ra100-ecg/svg/src/createSvg'

import {createSvgFile} from './saveSvgFile'

const inkscapeExecutable = process.env.INKSCAPE || 'inkscape'

const execPromise = promisify(exec)

const inkscapeEnv = {
  ...process.env,
  NO_AT_BRIDGE: '1',
  GTK_A11Y: 'none',
  GTK_USE_PORTAL: '0',
}

const textToPath = async (input: string, output?: string) => {
  const outputFileName = output || path.join(process.env.TMP || os.tmpdir(), 'ecg', `tmp-path-svg${Date.now()}.svg`)
  const absoluteFilePath = path.resolve(input)

  const command = `env NO_AT_BRIDGE=1 GTK_A11Y=none GTK_USE_PORTAL=0 ${inkscapeExecutable} "${absoluteFilePath}" --export-text-to-path --export-filename="${outputFileName}"`

  stdout.write(`${command}\n`)
  await execPromise(command)

  return outputFileName
}

const svgToPng = async (input: string, output: string) => {
  if (output) {
    assert(output.slice(-4) === '.png', 'Output file must have ".png" extension')
  }

  const outputFileName = output || path.join(process.env.TMP || os.tmpdir(), 'ecg', `tmp-path-svg${Date.now()}.png`)

  await execPromise(`env NO_AT_BRIDGE=1 GTK_A11Y=none GTK_USE_PORTAL=0 ${inkscapeExecutable} "${input}" --export-filename="${outputFileName}"`)

  return outputFileName
}

export const createPng = async (input: string, output: string): Promise<string> => {
  const pathToSvg = await textToPath(input)
  const pngPath = await svgToPng(pathToSvg, output)
  await fs.unlink(pathToSvg).catch((error) => stderr.write(`Error deleting file ${pathToSvg}: ${error}`))

  return pngPath
}

class InkscapeWorker {
  private proc: ChildProcess
  private buffer = ''
  private queue: Promise<void>

  constructor(svgPath: string) {
    this.proc = spawn('dbus-run-session', ['--', inkscapeExecutable, '--shell'], {env: inkscapeEnv})
    this.proc.stderr!.on('data', (chunk: Buffer) => stderr.write(chunk))
    this.queue = this.waitForPrompts(1).then(() => this.sendCommands([`file-open:${svgPath}`]))
  }

  private waitForPrompts(count: number): Promise<void> {
    return new Promise((resolve) => {
      const check = () => {
        if ((this.buffer.match(/> /g) ?? []).length >= count) {
          this.buffer = ''
          resolve()
          return true
        }
        return false
      }

      if (check()) return

      const onData = (chunk: Buffer) => {
        this.buffer += chunk.toString()
        if (check()) this.proc.stdout!.off('data', onData)
      }
      this.proc.stdout!.on('data', onData)
    })
  }

  private sendCommands(cmds: string[]): Promise<void> {
    this.proc.stdin!.write(cmds.join('\n') + '\n')
    return this.waitForPrompts(cmds.length)
  }

  exportFrame({
    exportArea,
    outputWidth,
    outputHeight,
    width,
    height,
    outputPath,
    frameLabel,
  }: {
    exportArea: string
    outputWidth: number
    outputHeight: number
    width: number
    height: number
    outputPath: string
    frameLabel: string
  }): Promise<void> {
    stdout.write(`Rendering frame ${frameLabel}\n`)
    const cmds = [
      `export-area:${exportArea}`,
      `export-width:${outputWidth || width}`,
      `export-height:${outputHeight || height}`,
      `export-filename:${outputPath}`,
      'export-do',
    ]
    this.queue = this.queue.then(() => this.sendCommands(cmds))
    return this.queue
  }

  destroy(): Promise<void> {
    this.queue = this.queue.then(
      () =>
        new Promise<void>((resolve) => {
          this.proc.on('close', resolve)
          this.proc.stdin!.end()
        })
    )
    return this.queue
  }
}

export const renderClip = async (config: Config, outputDirectory: string, cpuLimit?: number): Promise<void> => {
  const {filename, height: creditsHeight} = await createSvgFile(config)
  const svgImagePath = await textToPath(filename)
  const sizeFactor = config.outputHeight ? config.outputHeight / config.height : 1
  const frameCount = Math.floor(((creditsHeight - config.height) * sizeFactor) / config.ppf)
  const workerCount = cpuLimit ?? os.cpus().length

  stdout.write(`Rendering ${frameCount} frames with ${workerCount} workers\n`)

  await execPromise(`mkdir -p "${outputDirectory}"`)

  const workers = Array.from({length: workerCount}, () => new InkscapeWorker(svgImagePath))

  try {
    const frameTasks: Promise<void>[] = []

    for (let frameNumber = 0; frameNumber < frameCount; frameNumber++) {
      const speedFactor = config.outputHeight ? config.height / config.outputHeight : 1
      const offset = Math.round(frameNumber * (config.ppf * speedFactor))
      const frameLabel = `000000${frameNumber + 1}`.slice(-5)
      const exportArea = [0, offset, config.width, offset + config.height].join(':').replaceAll('.', ',')
      const outputPath = path.join(outputDirectory, `credits_${frameLabel}.png`)

      const worker = workers[frameNumber % workerCount]
      frameTasks.push(
        worker.exportFrame({
          exportArea,
          outputWidth: config.outputWidth || config.width,
          outputHeight: config.outputHeight || config.height,
          width: config.width,
          height: config.height,
          outputPath,
          frameLabel,
        })
      )
    }

    await Promise.all(frameTasks)
  } finally {
    await Promise.all(workers.map((w) => w.destroy()))
    await fs.unlink(filename).catch((error) => stderr.write(`Error deleting file ${filename}: ${error}`))
    await fs.unlink(svgImagePath).catch((error) => stderr.write(`Error deleting file ${svgImagePath}: ${error}`))
  }
}
