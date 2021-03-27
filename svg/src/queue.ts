import {SendMessageBatchRequestEntry, SQS} from '@aws-sdk/client-sqs'
import {nanoid} from 'nanoid'

import {Config} from './createSvg'

export type RenderOptions = {area: number[]; width: number; height: number; frame: string}

const cropDimensions = (
  {ppf, width, height, outputWidth, outputHeight}: Config,
  frameNumber: number
): RenderOptions => {
  const speedFactor = outputHeight ? height / outputHeight : 1
  const offset = Math.round(frameNumber * (ppf * speedFactor))

  return {
    area: [0, offset, width, offset + height],
    width: outputWidth || width,
    height: outputHeight || height,
    frame: `${frameNumber}`.padStart(5, '0'),
  }
}

const createFrameBatch = (config: Config, creditsHeight: number): RenderOptions[] => {
  const sizeFactor = config.outputHeight ? config.outputHeight / config.height : 1
  const frameCount = Math.floor(((creditsHeight - config.height) * sizeFactor) / config.ppf)

  const batch: RenderOptions[] = []
  for (let frameNumber = 0; frameNumber < frameCount; frameNumber++) {
    batch.push(cropDimensions(config, frameNumber))
  }

  return batch
}

const createMesageBody = (jobId: string, svg: string) => (batchData: RenderOptions): SendMessageBatchRequestEntry => ({
  MessageBody: JSON.stringify(batchData),
  MessageAttributes: {jobId: {DataType: 'String', StringValue: jobId}, svg: {DataType: 'String', StringValue: svg}},
  Id: jobId + nanoid(),
})

export const queueRender = async ({
  content,
  height,
  config,
  id,
}: {
  content: string
  height: number
  config: Config
  id: string
}): Promise<void> => {
  const queueUrl = process.env.QUEUE_URL

  if (!queueUrl) {
    throw new Error('Missing QUEUE_URL environment variable')
  }

  const queue = new SQS({})

  const batch = createFrameBatch(config, height)

  const entries = new Set<SendMessageBatchRequestEntry>()

  for (const frame of batch) {
    entries.add(createMesageBody(id, content)(frame))

    if (entries.size >= 9) {
      console.log('Sending to Queue')
      await queue.sendMessageBatch({QueueUrl: queueUrl, Entries: [...entries]})
      // await Promise.all([...entries].map((message) => queue.sendMessage(message)))
      entries.clear()
    }
  }

  if (entries.size > 0) {
    entries.clear()
  }
}
