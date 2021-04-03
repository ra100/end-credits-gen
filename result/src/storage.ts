import {stdout} from 'process'

import {GetObjectCommand, ListObjectsCommand, ListObjectsOutput, S3Client} from '@aws-sdk/client-s3'
import {Upload} from '@aws-sdk/lib-storage'

import type {Meta} from '@ra100-ecg/svg'

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

const getMeta = async (bucketName: string, jobId: string): Promise<Meta> => {
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

export const checkCompleted = async (bucketName: string, jobId: string): Promise<Meta> => {
  const meta = await getMeta(bucketName, jobId)
  const renderedFrames = await getNumberOfRenderedFrames(bucketName, jobId)

  stdout.write(`Frames rendered ${renderedFrames}/${meta.targetFrames}`)

  if (meta.status === 'finished') {
    return meta
  }

  if (renderedFrames === meta.targetFrames) {
    const newMeta: Meta = {
      targetFrames: meta.targetFrames,
      currentFrames: renderedFrames,
      status: 'finished',
    }
    const content = Buffer.from(JSON.stringify(newMeta), 'utf8')

    await upload(bucketName, content, `${jobId}/meta.json`)

    return newMeta
  }

  return meta
}
