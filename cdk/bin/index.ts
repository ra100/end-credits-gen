import * as cdk from '@aws-cdk/core'

import {EcgStack} from '../lib/stack'

const app = new cdk.App()
new EcgStack(app, 'EcgStack')
