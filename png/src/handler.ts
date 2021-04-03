import {stderr, stdout} from 'process'
import type {SQSHandler, SQSMessageAttributes} from 'aws-lambda'

import type {RenderOptions} from '@ra100-ecg/svg/src/queue'

import {renderPng} from './render'
import {upload} from './storage'

export const svgToPngHandler: SQSHandler = async ({Records}) => {
  try {
    const bucketName = process.env.BUCKET

    if (!bucketName) {
      throw new Error('Missing BUCKET environment variable')
    }

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

      await upload(bucketName, pngFile, `${jobId}/credits_${renderOptions.frame}.png`)
    }
  } catch (error) {
    stderr.write(`ERROR: ${error}`)
  }
}
