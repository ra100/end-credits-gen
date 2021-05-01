import {stderr} from 'process'
import type {APIGatewayProxyEvent, APIGatewayProxyResult, Handler} from 'aws-lambda'

import {checkCompleted} from './storage'
import {compress} from './compress'

const headers = {'Content-Type': 'application/json'}

export const getStatus = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const bucketName = process.env.BUCKET

    if (!bucketName) {
      throw new Error('Missing BUCKET environment variable')
    }

    const {jobId} = event.pathParameters || {}

    if (!jobId) {
      throw new Error('JobId is required')
    }

    const meta = await checkCompleted(bucketName, jobId)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(meta),
    }
  } catch (error) {
    stderr.write(`ERROR ${error}\n`)

    if (error.message === 'NoSuchKey') {
      return {
        statusCode: 404,
        headers,
        body: '',
      }
    }
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({error}),
    }
  }
}

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
    return {
      statusCode: 500,
      message: JSON.stringify({error}),
    }
  }
}
