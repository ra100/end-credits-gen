import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway'
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs'
import {Construct} from '@aws-cdk/core'

export const getApiGateway = (scope: Construct, lambda: NodejsFunction): RestApi => {
  const api = new RestApi(scope, 'credits-api', {
    restApiName: 'Credits Service',
    description: 'This service serves widgets.',
  })

  const postCredits = new LambdaIntegration(lambda, {
    requestTemplates: {'application/json': '{ "statusCode": "200" }'},
  })

  const creditsRoute = api.root.addResource('credits')

  creditsRoute.addMethod('POST', postCredits) // GET /

  return api
}
