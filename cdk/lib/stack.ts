import {Stack, StackProps} from 'aws-cdk-lib'
import {Construct} from 'constructs'
import {CreditsService} from './creditsService'

export class EcgStack extends Stack {
  constructor(scope: Construct, id: string, properties?: StackProps) {
    super(scope, id, properties)

    new CreditsService(this, 'Credits')
  }
}
