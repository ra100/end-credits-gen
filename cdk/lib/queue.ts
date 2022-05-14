import {Queue} from 'aws-cdk-lib/aws-sqs'
import {Duration} from 'aws-cdk-lib'
import {Construct} from 'constructs'

export const getRenderQueue = (scope: Construct): Queue =>
  new Queue(scope, 'CreditsSvgToPngQueue', {
    visibilityTimeout: Duration.minutes(6), // default,
    receiveMessageWaitTime: Duration.seconds(20), // default
  })
