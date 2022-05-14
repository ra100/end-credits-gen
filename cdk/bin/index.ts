import {App} from 'aws-cdk-lib'

import {EcgStack} from '../lib/stack'

const app = new App()
new EcgStack(app, 'EcgStack')
