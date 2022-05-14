import {stderr} from 'node:process'

import {Handler} from 'aws-lambda'
import {Config, createSvg} from './createSvg'
import {queueRender} from './queue'

export const createQueue: Handler<{config: Config; id: string}, {statusCode: number; message?: string}> = async ({
  config,
  id,
}) => {
  try {
    const {content, height} = createSvg(config)

    await queueRender({content, height, config, id})

    return {
      statusCode: 200,
    }
  } catch (error) {
    stderr.write(JSON.stringify(error))
    return {
      statusCode: 500,
      message: JSON.stringify({error}),
    }
  }
}
