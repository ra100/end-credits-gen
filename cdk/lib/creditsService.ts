import {Construct} from '@aws-cdk/core'
import {SqsEventSource} from '@aws-cdk/aws-lambda-event-sources'

import {getJsonToSvgLambda, getQueueRenderLambda, getRenderLambda} from './lambdas'
import {getApiGateway} from './apiGateway'
import {getBucket} from './bucket'
import {getRenderQueue} from './queue'

export class CreditsService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const bucket = getBucket(this)
    const rederQueue = getRenderQueue(this)
    const queueRenderLambda = getQueueRenderLambda(this, rederQueue)
    const jsonToSvgLambda = getJsonToSvgLambda(this, queueRenderLambda)
    const renderLambda = getRenderLambda(this, bucket)

    bucket.grantReadWrite(renderLambda)
    rederQueue.grantSendMessages(queueRenderLambda)
    rederQueue.grantConsumeMessages(renderLambda)
    queueRenderLambda.grantInvoke(jsonToSvgLambda)

    renderLambda.addEventSource(new SqsEventSource(rederQueue, {batchSize: 5}))

    getApiGateway(this, jsonToSvgLambda)
  }
}
