import {Construct, Stack, StackProps} from '@aws-cdk/core'
import {CreditsService} from './creditsService'

export class EcgStack extends Stack {
  constructor(scope: Construct, id: string, properties?: StackProps) {
    super(scope, id, properties)

    new CreditsService(this, 'Credits')
  }
}
