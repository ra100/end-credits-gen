import {stderr} from 'process'
import type {Handler} from 'aws-lambda'

import {compress} from './compress'

export const compressHandler: Handler<{jobId: string}, {statusCode: number; message?: string}> = async ({jobId}) => {
  try {
    const bucketName = process.env.BUCKET

    if (!bucketName) {
      throw new Error('Missing BUCKET_NAME environment variable')
    }

    await compress(bucketName, jobId)

    return {
      statusCode: 200,
    }
  } catch (error) {
    stderr.write(`Compression error: ${JSON.stringify({error})}\n`)
    return {
      statusCode: 500,
      message: JSON.stringify({error}),
    }
  }
}
