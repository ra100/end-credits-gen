import {S3Client} from '@aws-sdk/client-s3'
import {Upload} from '@aws-sdk/lib-storage'

export const upload = async (file: Buffer, path: string): Promise<void> => {
  const multipartUpload = new Upload({
    client: new S3Client({}),
    params: {Bucket: process.env.BUCKET, Key: path, Body: file},
  })

  await multipartUpload.done()

  return Promise.resolve()
}
