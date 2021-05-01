import {stdout} from 'process'
import {TextEncoder} from 'util'

import {GetObjectCommand, ListObjectsCommand, ListObjectsOutput, S3Client} from '@aws-sdk/client-s3'
import {Upload} from '@aws-sdk/lib-storage'
import {InvocationType, Lambda} from '@aws-sdk/client-lambda'
import {getSignedUrl} from '@aws-sdk/s3-request-presigner'

import type {Meta} from '@ra100-ecg/svg'

export const getFileUrl = (bucketName: string, key: string): Promise<string> => {
  const client = new S3Client({})
  const command = new GetObjectCommand({Bucket: bucketName, Key: key})
  return getSignedUrl(client, command, {expiresIn: 3600})
}

export const upload = async (bucketName: string, file: Buffer, path: string): Promise<void> => {
  stdout.write(`Uploading file ${path}\n`)

  const multipartUpload = new Upload({
    client: new S3Client({}),
    params: {Bucket: bucketName, Key: path, Body: file},
  })

  await multipartUpload.done()
  stdout.write(`Uploading file ${path} done\n`)
}

const getObject = async (bucketName: string, key: string): Promise<Buffer> => {
  const client = new S3Client({})
  const command = new GetObjectCommand({Bucket: bucketName, Key: key})
  const response = await client.send(command)
  const readable = response.Body

  return new Promise((resolve, reject) => {
    const data: Buffer[] = []
    readable.on('data', (chunk: Buffer) => data.push(chunk))
    readable.on('error', (error: unknown) => reject(error))
    readable.on('end', () => resolve(Buffer.concat(data)))
  })
}

export const getMeta = async (bucketName: string, jobId: string): Promise<Meta> => {
  const metaBuffer = await getObject(bucketName, `${jobId}/meta.json`)
  return JSON.parse(metaBuffer.toString('utf8'))
}

const getNumberOfRenderedFrames = async (bucketName: string, jobId: string): Promise<number> => {
  const client = new S3Client({})
  let count = 0
  let isTrucated = true
  let marker: ListObjectsOutput['NextMarker']
  while (isTrucated) {
    const {NextMarker, IsTruncated, Contents} = await client.send(
      new ListObjectsCommand({
        Bucket: bucketName,
        Prefix: `${jobId}/credits_`,
        Marker: marker,
      })
    )
    isTrucated = IsTruncated ?? false
    count += Contents?.length ?? 0
    marker = NextMarker ?? Contents?.pop()?.Key
  }

  return count
}

export const getFrameKeys = async (bucketName: string, jobId: string): Promise<string[]> => {
  const client = new S3Client({})
  const keys: string[] = []
  let isTrucated = true
  let marker: ListObjectsOutput['NextMarker']
  while (isTrucated) {
    const {NextMarker, IsTruncated, Contents} = await client.send(
      new ListObjectsCommand({
        Bucket: bucketName,
        Prefix: `${jobId}/credits_`,
        Marker: marker,
      })
    )
    isTrucated = IsTruncated ?? false
    marker = NextMarker ?? Contents?.pop()?.Key
    const currentKeys = (Contents || []).map(({Key}) => Key || '').filter((k) => !!k)
    keys.push(...currentKeys)
  }

  return keys
}

const compress = async (jobId: string) => {
  const lambdaArn = process.env.COMPRESS_LAMBDA_ARN

  const client = new Lambda({})

  await client.invoke({
    FunctionName: lambdaArn,
    InvocationType: InvocationType.Event,
    Payload: new TextEncoder().encode(jobId),
  })
}

export const checkCompleted = async (bucketName: string, jobId: string): Promise<Meta> => {
  const meta = await getMeta(bucketName, jobId)
  const renderedFrames = await getNumberOfRenderedFrames(bucketName, jobId)

  stdout.write(`Frames rendered ${renderedFrames}/${meta.targetFrames}`)

  if (meta.status === 'compressing' || meta.status === 'finished') {
    return meta
  }

  if (renderedFrames === meta.targetFrames) {
    await compress(jobId)

    const newMeta: Meta = {
      targetFrames: meta.targetFrames,
      currentFrames: renderedFrames,
      status: 'compressing',
    }
    const content = Buffer.from(JSON.stringify(newMeta), 'utf8')

    await upload(bucketName, content, `${jobId}/meta.json`)

    return newMeta
  }

  return meta
}
