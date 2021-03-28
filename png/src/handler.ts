import {stderr, stdout} from 'process'
import type {SQSHandler, SQSMessageAttributes} from 'aws-lambda'

import type {RenderOptions} from '@ra100-ecg/svg/src/queue'

import {renderPng} from './render'
import {upload} from './upload'

export const svgToPngHandler: SQSHandler = async ({Records}) => {
  try {
    for (const record of Records) {
      const messageAttributes: SQSMessageAttributes = record.messageAttributes
      const renderOptions = JSON.parse(record.body) as RenderOptions
      const jobId = messageAttributes.jobId?.stringValue
      const svg = messageAttributes.svg?.stringValue

      if (!svg) {
        throw new Error('SVG content is empty')
      }

      if (!jobId) {
        throw new Error('JobId is empty')
      }
      stdout.write(`Rendering frame ${renderOptions.frame}`)
      const pngFile = renderPng(svg, renderOptions)
      stdout.write(`Rendering frame ${renderOptions.frame} done`)

      stdout.write(`Uploading frame ${renderOptions.frame}`)
      await upload(pngFile, `${jobId}/credits_${renderOptions.frame}.png`)
      stdout.write(`Uploading frame ${renderOptions.frame} done`)
    }
  } catch (error) {
    stderr.write(`ERROR: ${error}`)
  }
}
