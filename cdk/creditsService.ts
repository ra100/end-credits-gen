import path from 'path'

import {Construct} from '@aws-cdk/core'
import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway'
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs'
import {Bucket, BucketEncryption} from '@aws-cdk/aws-s3'

export class CreditsService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id)

    const bucket = new Bucket(this, 'CreditsStore', {
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: false,
    })

    const handler = new NodejsFunction(this, 'CreditsHandler', {
      entry: path.resolve(__dirname, '../', 'src/creditsHandler.ts'),
      handler: 'postCredits',
      bundling: {
        externalModules: ['aws-sdk'],
        sourceMap: true, // include source map, defaults to false
        target: 'es2020', // target environment for the generated JavaScript code
        keepNames: true, // defaults to false
      },
      environment: {
        BUCKET: bucket.bucketName,
      },
    })

    bucket.grantReadWrite(handler) // was: handler.role);

    const api = new RestApi(this, 'credits-api', {
      restApiName: 'Credits Service',
      description: 'This service serves widgets.',
    })

    const postCredits = new LambdaIntegration(handler, {
      requestTemplates: {'application/json': '{ "statusCode": "200" }'},
    })

    const creditsRoute = api.root.addResource('credits')

    creditsRoute.addMethod('POST', postCredits) // GET /
  }
}
