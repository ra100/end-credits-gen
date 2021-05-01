import {stderr, stdout} from 'process'
import {Stream} from 'stream'

import Archiver from 'archiver'
import {S3} from 'aws-sdk'

import type {Meta} from '@ra100-ecg/svg'

import {getFrameKeys, getMeta, upload} from './storage'

const uploadZip = (fileNames: string[], bucketName: string, jobId: string) => {
  const s3 = new S3({})
  const archive = Archiver('zip')
  const s3UploadStream = new Stream.PassThrough()

  const s3Upload = s3.upload(
    {Bucket: bucketName, Key: `${jobId}/credits.zip`, ContentType: 'application/zip', Body: s3UploadStream},
    (error: Error): void => {
      if (error) {
        stderr.write(`Got error creating stream to s3 ${error.name} ${error.message} ${error.stack}`)
        throw error
      }
    }
  )

  s3Upload.on('httpUploadProgress', (): void => {
    stdout.write('Uploaded data chunk')
  })

  return new Promise((resolve, reject) => {
    archive.pipe(s3UploadStream)
    for (const fileName of fileNames) {
      const fileStream = s3.getObject({Bucket: bucketName, Key: fileName}).createReadStream()
      archive.append(fileStream, {name: fileName.replace(`${jobId}/`, '')})
    }
    archive.finalize()

    s3UploadStream.on('end', resolve)
    s3UploadStream.on('close', resolve)
    s3UploadStream.on('error', reject)
  })
}

export const compress = async (bucketName: string, jobId: string): Promise<void> => {
  const filesNames = await getFrameKeys(bucketName, jobId)

  await uploadZip(filesNames, bucketName, jobId)

  const meta = await getMeta(bucketName, jobId)

  const newMeta: Meta = {
    ...meta,
    zipKey: `${jobId}/credits.zip`,
    status: 'finished',
  }
  const content = Buffer.from(JSON.stringify(newMeta), 'utf8')

  await upload(bucketName, content, `${jobId}/meta.json`)
}
