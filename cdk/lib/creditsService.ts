import {Construct} from 'constructs'
import {SqsEventSource} from 'aws-cdk-lib/aws-lambda-event-sources'

import {getCompressLambda, getJsonToSvgLambda, getQueueRenderLambda, getRenderLambda, getStatusLambda} from './lambdas'
import {getApiGateway} from './apiGateway'
import {getBucket} from './bucket'
import {getRenderQueue} from './queue'

export class CreditsService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const bucket = getBucket(this)
    const renderQueue = getRenderQueue(this)
    const queueRenderLambda = getQueueRenderLambda(this, renderQueue, bucket)
    const jsonToSvgLambda = getJsonToSvgLambda(this, queueRenderLambda)
    const renderLambda = getRenderLambda(this, bucket)
    const compressLambda = getCompressLambda(this, bucket)
    const statusLambda = getStatusLambda(this, bucket, compressLambda)

    bucket.grantReadWrite(renderLambda)
    bucket.grantReadWrite(queueRenderLambda)
    bucket.grantReadWrite(statusLambda)
    bucket.grantReadWrite(compressLambda)
    renderQueue.grantSendMessages(queueRenderLambda)
    renderQueue.grantConsumeMessages(renderLambda)
    queueRenderLambda.grantInvoke(jsonToSvgLambda)
    compressLambda.grantInvoke(statusLambda)

    renderLambda.addEventSource(new SqsEventSource(renderQueue, {batchSize: 5}))

    getApiGateway(this, jsonToSvgLambda, statusLambda)
  }
}
