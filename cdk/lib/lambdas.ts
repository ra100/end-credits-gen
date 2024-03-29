import path from 'node:path'
import {execSync} from 'node:child_process'
import {stdout} from 'node:process'

import {Construct} from 'constructs'
import {DockerImageCode, DockerImageFunction, Runtime} from 'aws-cdk-lib/aws-lambda'
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs'
import {RetentionDays} from 'aws-cdk-lib/aws-logs'
import {Duration} from 'aws-cdk-lib'
import {Queue} from 'aws-cdk-lib/aws-sqs'
import {Bucket} from 'aws-cdk-lib/aws-s3'
import {DockerImageAsset} from 'aws-cdk-lib/aws-ecr-assets'

export const getQueueRenderLambda = (scope: Construct, queue: Queue, bucket: Bucket): NodejsFunction =>
  new NodejsFunction(scope, 'CreditsQueueHandler', {
    entry: path.resolve(__dirname, '../../', 'svg/src/queueHandler.ts'),
    handler: 'createQueue',
    runtime: Runtime.NODEJS_18_X,
    environment: {
      QUEUE_NAME: queue.queueName,
      QUEUE_URL: queue.queueUrl,
      BUCKET: bucket.bucketName,
    },
    logRetention: RetentionDays.TWO_WEEKS,
    timeout: Duration.minutes(5),
    memorySize: 128,
  })

export const getJsonToSvgLambda = (scope: Construct, lambda: NodejsFunction): NodejsFunction =>
  new NodejsFunction(scope, 'CreditsHandler', {
    entry: path.resolve(__dirname, '../../', 'svg/src/creditsHandler.ts'),
    handler: 'postCredits',
    runtime: Runtime.NODEJS_18_X,
    bundling: {
      externalModules: ['aws-sdk'],
      sourceMap: true, // include source map, defaults to false
      target: 'es2020', // target environment for the generated JavaScript code
      keepNames: true, // defaults to false
    },
    environment: {
      QUEUE_LAMBDA_ARN: lambda.functionArn,
    },
    logRetention: RetentionDays.TWO_WEEKS,
    timeout: Duration.seconds(20),
    memorySize: 128,
  })

export const getRenderLambda = (scope: Construct, bucket: Bucket): DockerImageFunction => {
  // build ts -> js before building docker image
  stdout.write('Build PNG package START\n')
  execSync('npm run build', {cwd: path.join(__dirname, '../../', 'png')})
  stdout.write('Build PNG package COMPLETE\n')
  // build docker image with inkscape and lambda interface baked in
  const asset = new DockerImageAsset(scope, 'CreditsRenderImage', {
    directory: path.join(__dirname, '../../'),
    file: './png/Dockerfile',
  })

  return new DockerImageFunction(scope, 'CreditsPngRenderHandler', {
    functionName: 'renderCredits',
    code: DockerImageCode.fromEcr(asset.repository, {tagOrDigest: asset.assetHash}),
    environment: {
      BUCKET: bucket.bucketName,
    },
    logRetention: RetentionDays.TWO_WEEKS,
    timeout: Duration.minutes(5),
    memorySize: 256,
  })
}

export const getStatusLambda = (scope: Construct, bucket: Bucket, lambda: NodejsFunction): NodejsFunction =>
  new NodejsFunction(scope, 'CreditsStatusHandler', {
    entry: path.resolve(__dirname, '../../', 'result/src/handler.ts'),
    handler: 'getStatus',
    runtime: Runtime.NODEJS_18_X,
    environment: {
      BUCKET: bucket.bucketName,
      COMPRESS_LAMBDA_ARN: lambda.functionArn,
    },
    logRetention: RetentionDays.TWO_WEEKS,
    timeout: Duration.minutes(5),
    memorySize: 128,
  })

export const getCompressLambda = (scope: Construct, bucket: Bucket): NodejsFunction =>
  new NodejsFunction(scope, 'CompressHandler', {
    entry: path.resolve(__dirname, '../../', 'result/src/compressHandler.ts'),
    handler: 'compressHandler',
    runtime: Runtime.NODEJS_18_X,
    environment: {
      BUCKET: bucket.bucketName,
    },
    logRetention: RetentionDays.TWO_WEEKS,
    timeout: Duration.minutes(15),
    memorySize: 256,
  })
