import {stderr, stdout} from 'process'

import {GetObjectCommand, ListObjectsCommand, ListObjectsOutput, S3Client} from '@aws-sdk/client-s3'
import {Upload} from '@aws-sdk/lib-storage'

import type {Meta} from '@ra100-ecg/svg'

export const upload = async (bucketName: string, file: Buffer, path: string): Promise<void> => {
  stdout.write(`Uploading frame ${path}\n`)

  const multipartUpload = new Upload({
    client: new S3Client({}),
    params: {Bucket: bucketName, Key: path, Body: file},
  })

  await multipartUpload.done()
  stdout.write(`Uploading frame ${path} done\n`)
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

const getFrameCount = async (bucketName: string, jobId: string): Promise<number> => {
  const metaBuffer = await getObject(bucketName, `${jobId}/meta.json`)
  const meta: Meta = JSON.parse(metaBuffer.toString('utf8'))

  return meta.frameCount
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

export const checkCompleted = async (bucketName: string, jobId: string): Promise<void> => {
  try {
    const frameCount = await getFrameCount(bucketName, jobId)
    const renderedFrames = await getNumberOfRenderedFrames(bucketName, jobId)

    stdout.write(`Frames rendered ${renderedFrames}/${frameCount}`)

    if (renderedFrames === frameCount) {
      const meta: Meta = {frameCount: frameCount, status: 'finished'}
      const content = Buffer.from(JSON.stringify(meta), 'utf8')

      await upload(bucketName, content, `${jobId}/meta.json`)
    }
  } catch (error) {
    stderr.write(`ERROR ${error}\n`)
  }
}
