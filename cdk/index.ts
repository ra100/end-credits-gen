import * as cdk from '@aws-cdk/core'

import {EcgStack} from './stack'

const app = new cdk.App()
new EcgStack(app, 'EcgStack')
