import type {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {Config, createSvg} from './createSvg'
import {queueRender} from './queue'

export const postCredits = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {body} = event

  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: 'Empty body'}),
    }
  }

  const config = JSON.parse(body) as Config

  const {content, height} = createSvg(config)

  const id = await queueRender({content, height, config})

  return {
    statusCode: 200,
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({content, height, id}, undefined, 2),
  }
}
