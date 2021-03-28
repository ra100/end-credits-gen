import {Queue} from '@aws-cdk/aws-sqs'
import {Construct, Duration} from '@aws-cdk/core'

export const getRenderQueue = (scope: Construct): Queue =>
  new Queue(scope, 'CreditsSvgToPngQueue', {
    visibilityTimeout: Duration.minutes(6), // default,
    receiveMessageWaitTime: Duration.seconds(20), // default
  })
