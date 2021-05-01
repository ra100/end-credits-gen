import {stderr} from 'process'
import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'

import {checkCompleted, getFileUrl} from './storage'

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

    if (meta.status === 'finished' && meta.zipKey) {
      const url = await getFileUrl(bucketName, meta.zipKey)

      return {
        statusCode: 302,
        headers: {Location: url},
        body: '',
      }
    }

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
