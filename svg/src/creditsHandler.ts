import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda'
import {Config, createSvg} from './createSvg'

export const postCredits = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const {body} = event

  if (!body) {
    return {
      statusCode: 400,
      body: JSON.stringify({error: 'Empty body'}),
    }
  }

  const {content} = createSvg(JSON.parse(body) as Config)

  return {
    statusCode: 200,
    headers: {'Content-Type': 'application/json'},
    body: content,
  }
}
