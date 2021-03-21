import path from 'path'

import {Construct, Duration} from '@aws-cdk/core'
import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway'
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs'
import {Bucket, BucketEncryption} from '@aws-cdk/aws-s3'
import {Runtime} from '@aws-cdk/aws-lambda'
import {Queue} from '@aws-cdk/aws-sqs'
import {RetentionDays} from '@aws-cdk/aws-logs'

export class CreditsService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const bucket = new Bucket(this, 'CreditsStore', {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: false,
    })

    const queue = new Queue(this, 'CreditsSvgToPngQueue', {
      visibilityTimeout: Duration.seconds(60), // default,
      receiveMessageWaitTime: Duration.seconds(20), // default
    })

    const jsonToSvgLambda = new NodejsFunction(this, 'CreditsHandler', {
      entry: path.resolve(__dirname, '../../', 'svg/src/creditsHandler.ts'),
      handler: 'postCredits',
      runtime: Runtime.NODEJS_14_X,
      bundling: {
        externalModules: ['aws-sdk'],
        sourceMap: true, // include source map, defaults to false
        target: 'es2020', // target environment for the generated JavaScript code
        keepNames: true, // defaults to false
      },
      environment: {
        BUCKET: bucket.bucketName,
        QUEUE_NAME: queue.queueName,
        QUEUE_URL: queue.queueUrl,
      },
      logRetention: RetentionDays.TWO_WEEKS,
    })

    bucket.grantReadWrite(jsonToSvgLambda) // was: handler.role);
    queue.grantSendMessages(jsonToSvgLambda)

    const api = new RestApi(this, 'credits-api', {
      restApiName: 'Credits Service',
      description: 'This service serves widgets.',
    })

    const postCredits = new LambdaIntegration(jsonToSvgLambda, {
      requestTemplates: {'application/json': '{ "statusCode": "200" }'},
    })

    const creditsRoute = api.root.addResource('credits')

    creditsRoute.addMethod('POST', postCredits) // GET /
  }
}
