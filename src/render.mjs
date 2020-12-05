import fs from 'fs'
import path from 'path'
import {promisify} from 'util'
import {exec} from 'child_process'

const execPromise = promisify(exec)

export const renderClip = async (
  {width, height, ppf},
  pngImagePath,
  pngHeight,
  outputDir
) => {
  const frameCount = Math.floor(pngHeight / ppf)

  console.info('Rendering', frameCount, 'frames')

  await execPromise(`mkdir -p ${outputDir}`)

  for (let frameNumber = 0; frameNumber < frameCount; frameNumber++) {
    const offset = frameNumber * ppf
    const filenameNumber = `000000${frameNumber}`.slice(-5)
    console.info('Writing frame', filenameNumber)
    await execPromise(
      `magick convert ${pngImagePath} -crop ${width}x${height}+0+${offset} ${path.join(
        outputDir,
        `credits_${filenameNumber}.png`
      )}`
    )
  }
}
