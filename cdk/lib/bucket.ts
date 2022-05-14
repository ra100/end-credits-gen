import {Construct} from 'constructs'
import {Bucket, BucketEncryption} from 'aws-cdk-lib/aws-s3'
import {Duration} from 'aws-cdk-lib'

export const getBucket = (scope: Construct): Bucket => {
  const bucket = new Bucket(scope, 'CreditsStore', {
    encryption: BucketEncryption.S3_MANAGED,
    enforceSSL: true,
    versioned: true,
  })

  bucket.addLifecycleRule({expiration: Duration.days(1), noncurrentVersionExpiration: Duration.days(1)})

  return bucket
}
