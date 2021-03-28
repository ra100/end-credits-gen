import {Bucket, BucketEncryption} from '@aws-cdk/aws-s3'
import {Construct, Duration} from '@aws-cdk/core'

export const getBucket = (scope: Construct): Bucket => {
  const bucket = new Bucket(scope, 'CreditsStore', {
    encryption: BucketEncryption.S3_MANAGED,
    enforceSSL: true,
    versioned: true,
  })

  bucket.addLifecycleRule({expiration: Duration.days(10), noncurrentVersionExpiration: Duration.days(1)})

  return bucket
}
