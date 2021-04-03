import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway'
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs'
import {Construct} from '@aws-cdk/core'

export const getApiGateway = (scope: Construct, startLambda: NodejsFunction, statusLambda: NodejsFunction): RestApi => {
  const api = new RestApi(scope, 'credits-api', {
    restApiName: 'Credits Service',
    description: 'This service renders end credits crawl.',
  })

  const postCredits = new LambdaIntegration(startLambda, {
    requestTemplates: {'application/json': '{ "statusCode": "200" }'},
  })

  const getStatus = new LambdaIntegration(statusLambda)

  const creditsRoute = api.root.addResource('credits')
  const statusRoute = creditsRoute.addResource('{jobId}')

  creditsRoute.addMethod('POST', postCredits)
  creditsRoute.addMethod('GET')
  statusRoute.addMethod('GET', getStatus)

  return api
}
