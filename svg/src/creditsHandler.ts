import {InvocationType, Lambda} from '@aws-sdk/client-lambda'
import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {nanoid} from 'nanoid'
import {TextEncoder} from 'util'

export const postCredits = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const {body} = event

    if (!body) {
      return {
        statusCode: 400,
        body: JSON.stringify({error: 'Empty body'}),
      }
    }

    const id = nanoid()

    const lambdaArn = process.env.QUEUE_LAMBDA_ARN

    const client = new Lambda({})

    await client.invoke({
      FunctionName: lambdaArn,
      InvocationType: InvocationType.Event,
      Payload: new TextEncoder().encode(JSON.stringify({config: JSON.parse(body), id})),
    })

    return {
      statusCode: 200,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({message: 'Render queued', id}),
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({error}),
    }
  }
}
