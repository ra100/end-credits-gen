import {Construct, Duration} from '@aws-cdk/core'
import {Bucket, BucketEncryption} from '@aws-cdk/aws-s3'
import {Queue} from '@aws-cdk/aws-sqs'
import {SqsEventSource} from '@aws-cdk/aws-lambda-event-sources'

import {getJsonToSvgLambda, getQueueRenderLambda, getRenderLambda} from './lambdas'
import {getApiGateway} from './apiGateway'

export class CreditsService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const bucket = new Bucket(this, 'CreditsStore', {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: false,
    })

    const queue = new Queue(this, 'CreditsSvgToPngQueue', {
      visibilityTimeout: Duration.minutes(6), // default,
      receiveMessageWaitTime: Duration.seconds(20), // default
    })

    const queueRenderLambda = getQueueRenderLambda(this, queue)
    const jsonToSvgLambda = getJsonToSvgLambda(this, queueRenderLambda)
    const renderLambda = getRenderLambda(this, bucket)

    bucket.grantReadWrite(renderLambda)
    queue.grantSendMessages(queueRenderLambda)
    queue.grantConsumeMessages(renderLambda)
    queueRenderLambda.grantInvoke(jsonToSvgLambda)

    renderLambda.addEventSource(new SqsEventSource(queue, {batchSize: 5}))

    getApiGateway(this, jsonToSvgLambda)
  }
}
