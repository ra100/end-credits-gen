import {stderr, stdout} from 'process'
import {Stream} from 'stream'

import archiver from 'archiver'
import {S3} from 'aws-sdk'

import type {Meta} from '@ra100-ecg/svg'

import {getFrameKeys, getMeta, upload} from './storage'

const uploadZip = async (fileNames: string[], bucketName: string, jobId: string) => {
  const s3 = new S3({})
  const s3UploadStream = new Stream.PassThrough()

  const s3Upload = s3.upload(
    {Bucket: bucketName, Key: `${jobId}/credits.tar`, ContentType: 'application/zip', Body: s3UploadStream},
    (error: Error): void => {
      if (error) {
        stderr.write(`Got error creating stream to s3 ${error.name} ${error.message} ${error.stack}`)
        throw error
      }
    }
  )

  s3Upload.on('httpUploadProgress', (progress): void => {
    stdout.write(`Uploaded data chunk: [{${JSON.stringify(progress)}}\n`)
  })

  const archive = archiver('tar')
  archive.pipe(s3UploadStream)

  for (const fileName of fileNames) {
    const fileStream = s3.getObject({Bucket: bucketName, Key: fileName}).createReadStream()
    archive.append(fileStream, {name: fileName.replace(`${jobId}/`, '')})
    await new Promise((resolveS3, rejectS3) => {
      fileStream.on('end', resolveS3)
      fileStream.on('error', rejectS3)
    })
  }

  archive.finalize()

  await new Promise<void>((resolve, reject) => {
    s3UploadStream.on('close', () => {
      stderr.write('IUpload Stream closed')
      resolve()
    })
    s3UploadStream.on('error', (error) => {
      stderr.write(JSON.stringify(error))
      reject(new Error(JSON.stringify(error)))
    })
    archive.on('error', (error) => {
      stderr.write(JSON.stringify(error) + '\n')
      reject(new Error(JSON.stringify(error)))
    })
    archive.on('warning', (warning) => {
      stdout.write(`Archive WARNING ${JSON.stringify(warning)}\n`)
    })
  })
  await s3Upload.promise()
}

export const compress = async (bucketName: string, jobId: string): Promise<void> => {
  const filesNames = await getFrameKeys(bucketName, jobId)

  await uploadZip(filesNames, bucketName, jobId)

  const meta = await getMeta(bucketName, jobId)

  const newMeta: Meta = {
    ...meta,
    zipKey: `${jobId}/credits.tar`,
    status: 'finished',
  }
  const content = Buffer.from(JSON.stringify(newMeta), 'utf8')

  await upload(bucketName, content, `${jobId}/meta.json`)
}
