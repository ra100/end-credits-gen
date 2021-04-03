import {stdout} from 'process'

import {S3Client} from '@aws-sdk/client-s3'
import {Upload} from '@aws-sdk/lib-storage'

export const upload = async (bucketName: string, file: Buffer, path: string): Promise<void> => {
  stdout.write(`Uploading frame ${path}\n`)

  const multipartUpload = new Upload({
    client: new S3Client({}),
    params: {Bucket: bucketName, Key: path, Body: file},
  })

  await multipartUpload.done()
  stdout.write(`Uploading frame ${path} done\n`)
}
