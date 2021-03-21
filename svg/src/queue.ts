import {nanoid} from 'nanoid'
import {SQS} from '@aws-sdk/client-sqs'
import {Config} from './createSvg'

export const queueRender = async ({
  content,
  height,
}: {
  content: string
  height: number
  config: Config
}): Promise<string> => {
  const queueUrl = process.env.QUEUE_URL

  if (!queueUrl) {
    throw new Error('Missing QUEUE_URL environment variable')
  }

  const id = nanoid()

  const queue = new SQS({})

  await queue.sendMessage({QueueUrl: queueUrl, MessageBody: JSON.stringify({content, height, id})})

  return id
}
