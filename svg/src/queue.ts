import {stdout} from 'process'

import {nanoid} from 'nanoid'
import {SendMessageBatchRequestEntry, SQS} from '@aws-sdk/client-sqs'
import {S3Client} from '@aws-sdk/client-s3'
import {Upload} from '@aws-sdk/lib-storage'

import {Config} from './createSvg'

export type RenderOptions = {area: number[]; width: number; height: number; frame: string}
export type Meta = {frameCount: number; status: 'started' | 'finished'}

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
    // start counting from 1 insteat of 0
    frame: `${frameNumber + 1}`.padStart(5, '0'),
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

const createMesageBody = (jobId: string, svg: string, length: number) => (
  batchData: RenderOptions
): SendMessageBatchRequestEntry => ({
  MessageBody: JSON.stringify(batchData),
  MessageAttributes: {
    jobId: {DataType: 'String', StringValue: jobId},
    svg: {DataType: 'String', StringValue: svg},
    length: {DataType: 'Number', StringValue: `${length}`},
  },
  Id: jobId + nanoid(),
})

const sender = (queue: SQS, queueUrl: string) => async (entries: SendMessageBatchRequestEntry[]) => {
  stdout.write('Sending to Queue\n')
  await queue.sendMessageBatch({QueueUrl: queueUrl, Entries: [...entries]})
}

const uploadMeta = async (bucketName: string, id: string, meta: Meta) => {
  const multipartUpload = new Upload({
    client: new S3Client({}),
    params: {Bucket: bucketName, Key: `${id}/meta.json`, Body: JSON.stringify(meta)},
  })

  await multipartUpload.done()
}

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
  const bucketName = process.env.BUCKET

  if (!queueUrl) {
    throw new Error('Missing QUEUE_URL environment variable')
  }

  if (!bucketName) {
    throw new Error('Missing BUCKET environment variable')
  }

  const queue = new SQS({})
  const addToQueue = sender(queue, queueUrl)

  const batch = createFrameBatch(config, height)
  const frameCount = batch.length

  const entries = new Set<SendMessageBatchRequestEntry>()

  for (const frame of batch) {
    entries.add(createMesageBody(id, content, frameCount)(frame))

    if (entries.size >= 9) {
      addToQueue([...entries])
      entries.clear()
    }
  }

  if (entries.size > 0) {
    addToQueue([...entries])
    entries.clear()
  }

  await uploadMeta(bucketName, id, {frameCount, status: 'started'})
}
