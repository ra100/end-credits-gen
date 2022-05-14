import {expect as expectCDK, matchTemplate, MatchStyle} from '@aws-cdk/assert'
import {App} from 'aws-cdk-lib'
import * as Stack from './stack'

test('Stack', () => {
  const app = new App()
  // WHEN
  const stack = new Stack.EcgStack(app, 'MyTestStack')
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {
          CreditsCreditsStoreDC9BDB5C: {
            Type: 'AWS::S3::Bucket',
            Properties: {
              BucketEncryption: {
                ServerSideEncryptionConfiguration: [
                  {
                    ServerSideEncryptionByDefault: {
                      SSEAlgorithm: 'AES256',
                    },
                  },
                ],
              },
              LifecycleConfiguration: {
                Rules: [
                  {
                    ExpirationInDays: 10,
                    NoncurrentVersionExpirationInDays: 1,
                    Status: 'Enabled',
                  },
                ],
              },
              VersioningConfiguration: {
                Status: 'Enabled',
              },
            },
            UpdateReplacePolicy: 'Retain',
            DeletionPolicy: 'Retain',
          },
          CreditsCreditsStorePolicy1E105647: {
            Type: 'AWS::S3::BucketPolicy',
            Properties: {
              Bucket: {
                Ref: 'CreditsCreditsStoreDC9BDB5C',
              },
              PolicyDocument: {
                Statement: [
                  {
                    Action: 's3:*',
                    Condition: {
                      Bool: {
                        'aws:SecureTransport': 'false',
                      },
                    },
                    Effect: 'Deny',
                    Principal: '*',
                    Resource: {
                      'Fn::Join': [
                        '',
                        [
                          {
                            'Fn::GetAtt': ['CreditsCreditsStoreDC9BDB5C', 'Arn'],
                          },
                          '/*',
                        ],
                      ],
                    },
                  },
                ],
                Version: '2012-10-17',
              },
            },
          },
          CreditsCreditsSvgToPngQueue430F2A4D: {
            Type: 'AWS::SQS::Queue',
            Properties: {
              ReceiveMessageWaitTimeSeconds: 20,
              VisibilityTimeout: 360,
            },
            UpdateReplacePolicy: 'Delete',
            DeletionPolicy: 'Delete',
          },
          CreditsCreditsQueueHandlerServiceRole29FB1766: {
            Type: 'AWS::IAM::Role',
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: 'sts:AssumeRole',
                    Effect: 'Allow',
                    Principal: {
                      Service: 'lambda.amazonaws.com',
                    },
                  },
                ],
                Version: '2012-10-17',
              },
              ManagedPolicyArns: [
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
                    ],
                  ],
                },
              ],
            },
          },
          CreditsCreditsQueueHandlerServiceRoleDefaultPolicy48617A9E: {
            Type: 'AWS::IAM::Policy',
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: ['sqs:SendMessage', 'sqs:GetQueueAttributes', 'sqs:GetQueueUrl'],
                    Effect: 'Allow',
                    Resource: {
                      'Fn::GetAtt': ['CreditsCreditsSvgToPngQueue430F2A4D', 'Arn'],
                    },
                  },
                ],
                Version: '2012-10-17',
              },
              PolicyName: 'CreditsCreditsQueueHandlerServiceRoleDefaultPolicy48617A9E',
              Roles: [
                {
                  Ref: 'CreditsCreditsQueueHandlerServiceRole29FB1766',
                },
              ],
            },
          },
          CreditsCreditsQueueHandler7299656C: {
            Type: 'AWS::Lambda::Function',
            Properties: {
              Code: {
                S3Bucket: {
                  Ref: 'AssetParametersf608ae696d7d0e7abdcd6b0b144f8b3444e434d20a08e3e460d2ace3af46ef57S3Bucket30908983',
                },
                S3Key: {
                  'Fn::Join': [
                    '',
                    [
                      {
                        'Fn::Select': [
                          0,
                          {
                            'Fn::Split': [
                              '||',
                              {
                                Ref: 'AssetParametersf608ae696d7d0e7abdcd6b0b144f8b3444e434d20a08e3e460d2ace3af46ef57S3VersionKey0C95FDFA',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        'Fn::Select': [
                          1,
                          {
                            'Fn::Split': [
                              '||',
                              {
                                Ref: 'AssetParametersf608ae696d7d0e7abdcd6b0b144f8b3444e434d20a08e3e460d2ace3af46ef57S3VersionKey0C95FDFA',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
              Role: {
                'Fn::GetAtt': ['CreditsCreditsQueueHandlerServiceRole29FB1766', 'Arn'],
              },
              Environment: {
                Variables: {
                  QUEUE_NAME: {
                    'Fn::GetAtt': ['CreditsCreditsSvgToPngQueue430F2A4D', 'QueueName'],
                  },
                  QUEUE_URL: {
                    Ref: 'CreditsCreditsSvgToPngQueue430F2A4D',
                  },
                  AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
                },
              },
              Handler: 'index.createQueue',
              MemorySize: 128,
              Runtime: 'nodejs14.x',
              Timeout: 300,
            },
            DependsOn: [
              'CreditsCreditsQueueHandlerServiceRoleDefaultPolicy48617A9E',
              'CreditsCreditsQueueHandlerServiceRole29FB1766',
            ],
          },
          CreditsCreditsQueueHandlerLogRetentionC87B1F3F: {
            Type: 'Custom::LogRetention',
            Properties: {
              ServiceToken: {
                'Fn::GetAtt': ['LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A', 'Arn'],
              },
              LogGroupName: {
                'Fn::Join': [
                  '',
                  [
                    '/aws/lambda/',
                    {
                      Ref: 'CreditsCreditsQueueHandler7299656C',
                    },
                  ],
                ],
              },
              RetentionInDays: 14,
            },
          },
          CreditsCreditsHandlerServiceRole96F860B7: {
            Type: 'AWS::IAM::Role',
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: 'sts:AssumeRole',
                    Effect: 'Allow',
                    Principal: {
                      Service: 'lambda.amazonaws.com',
                    },
                  },
                ],
                Version: '2012-10-17',
              },
              ManagedPolicyArns: [
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
                    ],
                  ],
                },
              ],
            },
          },
          CreditsCreditsHandlerServiceRoleDefaultPolicyF2B38D20: {
            Type: 'AWS::IAM::Policy',
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: 'lambda:InvokeFunction',
                    Effect: 'Allow',
                    Resource: {
                      'Fn::GetAtt': ['CreditsCreditsQueueHandler7299656C', 'Arn'],
                    },
                  },
                ],
                Version: '2012-10-17',
              },
              PolicyName: 'CreditsCreditsHandlerServiceRoleDefaultPolicyF2B38D20',
              Roles: [
                {
                  Ref: 'CreditsCreditsHandlerServiceRole96F860B7',
                },
              ],
            },
          },
          CreditsCreditsHandler3E4C260D: {
            Type: 'AWS::Lambda::Function',
            Properties: {
              Code: {
                S3Bucket: {
                  Ref: 'AssetParameters4986e65e4068c14ad56ff1fc6e3bbea82aa7ebeb32a8144668398e9e5d8e81d0S3Bucket694E06B3',
                },
                S3Key: {
                  'Fn::Join': [
                    '',
                    [
                      {
                        'Fn::Select': [
                          0,
                          {
                            'Fn::Split': [
                              '||',
                              {
                                Ref: 'AssetParameters4986e65e4068c14ad56ff1fc6e3bbea82aa7ebeb32a8144668398e9e5d8e81d0S3VersionKeyCECCAEF5',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        'Fn::Select': [
                          1,
                          {
                            'Fn::Split': [
                              '||',
                              {
                                Ref: 'AssetParameters4986e65e4068c14ad56ff1fc6e3bbea82aa7ebeb32a8144668398e9e5d8e81d0S3VersionKeyCECCAEF5',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
              Role: {
                'Fn::GetAtt': ['CreditsCreditsHandlerServiceRole96F860B7', 'Arn'],
              },
              Environment: {
                Variables: {
                  QUEUE_LAMBDA_ARN: {
                    'Fn::GetAtt': ['CreditsCreditsQueueHandler7299656C', 'Arn'],
                  },
                  AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
                },
              },
              Handler: 'index.postCredits',
              MemorySize: 128,
              Runtime: 'nodejs14.x',
              Timeout: 20,
            },
            DependsOn: [
              'CreditsCreditsHandlerServiceRoleDefaultPolicyF2B38D20',
              'CreditsCreditsHandlerServiceRole96F860B7',
            ],
          },
          CreditsCreditsHandlerLogRetentionB172AD91: {
            Type: 'Custom::LogRetention',
            Properties: {
              ServiceToken: {
                'Fn::GetAtt': ['LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A', 'Arn'],
              },
              LogGroupName: {
                'Fn::Join': [
                  '',
                  [
                    '/aws/lambda/',
                    {
                      Ref: 'CreditsCreditsHandler3E4C260D',
                    },
                  ],
                ],
              },
              RetentionInDays: 14,
            },
          },
          CreditsCreditsPngRenderHandlerServiceRoleDF2DD6B9: {
            Type: 'AWS::IAM::Role',
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: 'sts:AssumeRole',
                    Effect: 'Allow',
                    Principal: {
                      Service: 'lambda.amazonaws.com',
                    },
                  },
                ],
                Version: '2012-10-17',
              },
              ManagedPolicyArns: [
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
                    ],
                  ],
                },
              ],
            },
          },
          CreditsCreditsPngRenderHandlerServiceRoleDefaultPolicy678394A4: {
            Type: 'AWS::IAM::Policy',
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: [
                      's3:GetObject*',
                      's3:GetBucket*',
                      's3:List*',
                      's3:DeleteObject*',
                      's3:PutObject*',
                      's3:Abort*',
                    ],
                    Effect: 'Allow',
                    Resource: [
                      {
                        'Fn::GetAtt': ['CreditsCreditsStoreDC9BDB5C', 'Arn'],
                      },
                      {
                        'Fn::Join': [
                          '',
                          [
                            {
                              'Fn::GetAtt': ['CreditsCreditsStoreDC9BDB5C', 'Arn'],
                            },
                            '/*',
                          ],
                        ],
                      },
                    ],
                  },
                  {
                    Action: [
                      'sqs:ReceiveMessage',
                      'sqs:ChangeMessageVisibility',
                      'sqs:GetQueueUrl',
                      'sqs:DeleteMessage',
                      'sqs:GetQueueAttributes',
                    ],
                    Effect: 'Allow',
                    Resource: {
                      'Fn::GetAtt': ['CreditsCreditsSvgToPngQueue430F2A4D', 'Arn'],
                    },
                  },
                ],
                Version: '2012-10-17',
              },
              PolicyName: 'CreditsCreditsPngRenderHandlerServiceRoleDefaultPolicy678394A4',
              Roles: [
                {
                  Ref: 'CreditsCreditsPngRenderHandlerServiceRoleDF2DD6B9',
                },
              ],
            },
          },
          CreditsCreditsPngRenderHandlerD36CE69C: {
            Type: 'AWS::Lambda::Function',
            Properties: {
              Code: {
                ImageUri: {
                  'Fn::Join': [
                    '',
                    [
                      {
                        Ref: 'AWS::AccountId',
                      },
                      '.dkr.ecr.',
                      {
                        Ref: 'AWS::Region',
                      },
                      '.',
                      {
                        Ref: 'AWS::URLSuffix',
                      },
                      '/aws-cdk/assets:f2caf3cdcb6b6efa93b0b29b1a0bbfda638d24faaa478f3520661d0e7fc5a536',
                    ],
                  ],
                },
              },
              Role: {
                'Fn::GetAtt': ['CreditsCreditsPngRenderHandlerServiceRoleDF2DD6B9', 'Arn'],
              },
              Environment: {
                Variables: {
                  BUCKET: {
                    Ref: 'CreditsCreditsStoreDC9BDB5C',
                  },
                },
              },
              FunctionName: 'renderCredits',
              MemorySize: 256,
              PackageType: 'Image',
              Timeout: 300,
            },
            DependsOn: [
              'CreditsCreditsPngRenderHandlerServiceRoleDefaultPolicy678394A4',
              'CreditsCreditsPngRenderHandlerServiceRoleDF2DD6B9',
            ],
          },
          CreditsCreditsPngRenderHandlerSqsEventSourceMyTestStackCreditsCreditsSvgToPngQueue8373D13DE9A60204: {
            Type: 'AWS::Lambda::EventSourceMapping',
            Properties: {
              FunctionName: {
                Ref: 'CreditsCreditsPngRenderHandlerD36CE69C',
              },
              BatchSize: 5,
              EventSourceArn: {
                'Fn::GetAtt': ['CreditsCreditsSvgToPngQueue430F2A4D', 'Arn'],
              },
            },
          },
          Creditscreditsapi548AF886: {
            Type: 'AWS::ApiGateway::RestApi',
            Properties: {
              Description: 'This service serves widgets.',
              Name: 'Credits Service',
            },
          },
          CreditscreditsapiCloudWatchRoleF4FE0D51: {
            Type: 'AWS::IAM::Role',
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: 'sts:AssumeRole',
                    Effect: 'Allow',
                    Principal: {
                      Service: 'apigateway.amazonaws.com',
                    },
                  },
                ],
                Version: '2012-10-17',
              },
              ManagedPolicyArns: [
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':iam::aws:policy/service-role/AmazonAPIGatewayPushToCloudWatchLogs',
                    ],
                  ],
                },
              ],
            },
          },
          CreditscreditsapiAccountF9FC1F5A: {
            Type: 'AWS::ApiGateway::Account',
            Properties: {
              CloudWatchRoleArn: {
                'Fn::GetAtt': ['CreditscreditsapiCloudWatchRoleF4FE0D51', 'Arn'],
              },
            },
            DependsOn: ['Creditscreditsapi548AF886'],
          },
          CreditscreditsapiDeploymentA812BC13001ec5eb4f1e8bd3f32d05c84701a724: {
            Type: 'AWS::ApiGateway::Deployment',
            Properties: {
              RestApiId: {
                Ref: 'Creditscreditsapi548AF886',
              },
              Description: 'Automatically created by the RestApi construct',
            },
            DependsOn: ['CreditscreditsapicreditsPOSTB1F6BEFA', 'Creditscreditsapicredits3B160783'],
          },
          CreditscreditsapiDeploymentStageprodB9C9EA14: {
            Type: 'AWS::ApiGateway::Stage',
            Properties: {
              RestApiId: {
                Ref: 'Creditscreditsapi548AF886',
              },
              DeploymentId: {
                Ref: 'CreditscreditsapiDeploymentA812BC13001ec5eb4f1e8bd3f32d05c84701a724',
              },
              StageName: 'prod',
            },
          },
          Creditscreditsapicredits3B160783: {
            Type: 'AWS::ApiGateway::Resource',
            Properties: {
              ParentId: {
                'Fn::GetAtt': ['Creditscreditsapi548AF886', 'RootResourceId'],
              },
              PathPart: 'credits',
              RestApiId: {
                Ref: 'Creditscreditsapi548AF886',
              },
            },
          },
          CreditscreditsapicreditsPOSTApiPermissionMyTestStackCreditscreditsapi698EF42APOSTcredits4BDEBE39: {
            Type: 'AWS::Lambda::Permission',
            Properties: {
              Action: 'lambda:InvokeFunction',
              FunctionName: {
                'Fn::GetAtt': ['CreditsCreditsHandler3E4C260D', 'Arn'],
              },
              Principal: 'apigateway.amazonaws.com',
              SourceArn: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      Ref: 'AWS::Partition',
                    },
                    ':execute-api:',
                    {
                      Ref: 'AWS::Region',
                    },
                    ':',
                    {
                      Ref: 'AWS::AccountId',
                    },
                    ':',
                    {
                      Ref: 'Creditscreditsapi548AF886',
                    },
                    '/',
                    {
                      Ref: 'CreditscreditsapiDeploymentStageprodB9C9EA14',
                    },
                    '/POST/credits',
                  ],
                ],
              },
            },
          },
          CreditscreditsapicreditsPOSTApiPermissionTestMyTestStackCreditscreditsapi698EF42APOSTcredits74263586: {
            Type: 'AWS::Lambda::Permission',
            Properties: {
              Action: 'lambda:InvokeFunction',
              FunctionName: {
                'Fn::GetAtt': ['CreditsCreditsHandler3E4C260D', 'Arn'],
              },
              Principal: 'apigateway.amazonaws.com',
              SourceArn: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      Ref: 'AWS::Partition',
                    },
                    ':execute-api:',
                    {
                      Ref: 'AWS::Region',
                    },
                    ':',
                    {
                      Ref: 'AWS::AccountId',
                    },
                    ':',
                    {
                      Ref: 'Creditscreditsapi548AF886',
                    },
                    '/test-invoke-stage/POST/credits',
                  ],
                ],
              },
            },
          },
          CreditscreditsapicreditsPOSTB1F6BEFA: {
            Type: 'AWS::ApiGateway::Method',
            Properties: {
              HttpMethod: 'POST',
              ResourceId: {
                Ref: 'Creditscreditsapicredits3B160783',
              },
              RestApiId: {
                Ref: 'Creditscreditsapi548AF886',
              },
              AuthorizationType: 'NONE',
              Integration: {
                IntegrationHttpMethod: 'POST',
                RequestTemplates: {
                  'application/json': '{ "statusCode": "200" }',
                },
                Type: 'AWS_PROXY',
                Uri: {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':apigateway:',
                      {
                        Ref: 'AWS::Region',
                      },
                      ':lambda:path/2015-03-31/functions/',
                      {
                        'Fn::GetAtt': ['CreditsCreditsHandler3E4C260D', 'Arn'],
                      },
                      '/invocations',
                    ],
                  ],
                },
              },
            },
          },
          LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB: {
            Type: 'AWS::IAM::Role',
            Properties: {
              AssumeRolePolicyDocument: {
                Statement: [
                  {
                    Action: 'sts:AssumeRole',
                    Effect: 'Allow',
                    Principal: {
                      Service: 'lambda.amazonaws.com',
                    },
                  },
                ],
                Version: '2012-10-17',
              },
              ManagedPolicyArns: [
                {
                  'Fn::Join': [
                    '',
                    [
                      'arn:',
                      {
                        Ref: 'AWS::Partition',
                      },
                      ':iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
                    ],
                  ],
                },
              ],
            },
          },
          LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB: {
            Type: 'AWS::IAM::Policy',
            Properties: {
              PolicyDocument: {
                Statement: [
                  {
                    Action: ['logs:PutRetentionPolicy', 'logs:DeleteRetentionPolicy'],
                    Effect: 'Allow',
                    Resource: '*',
                  },
                ],
                Version: '2012-10-17',
              },
              PolicyName: 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB',
              Roles: [
                {
                  Ref: 'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB',
                },
              ],
            },
          },
          LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aFD4BFC8A: {
            Type: 'AWS::Lambda::Function',
            Properties: {
              Handler: 'index.handler',
              Runtime: 'nodejs12.x',
              Code: {
                S3Bucket: {
                  Ref: 'AssetParameters67b7823b74bc135986aa72f889d6a8da058d0c4a20cbc2dfc6f78995fdd2fc24S3Bucket4D46ABB5',
                },
                S3Key: {
                  'Fn::Join': [
                    '',
                    [
                      {
                        'Fn::Select': [
                          0,
                          {
                            'Fn::Split': [
                              '||',
                              {
                                Ref: 'AssetParameters67b7823b74bc135986aa72f889d6a8da058d0c4a20cbc2dfc6f78995fdd2fc24S3VersionKeyB0F28861',
                              },
                            ],
                          },
                        ],
                      },
                      {
                        'Fn::Select': [
                          1,
                          {
                            'Fn::Split': [
                              '||',
                              {
                                Ref: 'AssetParameters67b7823b74bc135986aa72f889d6a8da058d0c4a20cbc2dfc6f78995fdd2fc24S3VersionKeyB0F28861',
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  ],
                },
              },
              Role: {
                'Fn::GetAtt': ['LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB', 'Arn'],
              },
            },
            DependsOn: [
              'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRoleDefaultPolicyADDA7DEB',
              'LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8aServiceRole9741ECFB',
            ],
          },
        },
        Outputs: {
          CreditscreditsapiEndpoint96E3758D: {
            Value: {
              'Fn::Join': [
                '',
                [
                  'https://',
                  {
                    Ref: 'Creditscreditsapi548AF886',
                  },
                  '.execute-api.',
                  {
                    Ref: 'AWS::Region',
                  },
                  '.',
                  {
                    Ref: 'AWS::URLSuffix',
                  },
                  '/',
                  {
                    Ref: 'CreditscreditsapiDeploymentStageprodB9C9EA14',
                  },
                  '/',
                ],
              ],
            },
          },
        },
        Parameters: {
          AssetParametersf608ae696d7d0e7abdcd6b0b144f8b3444e434d20a08e3e460d2ace3af46ef57S3Bucket30908983: {
            Type: 'String',
            Description: 'S3 bucket for asset "f608ae696d7d0e7abdcd6b0b144f8b3444e434d20a08e3e460d2ace3af46ef57"',
          },
          AssetParametersf608ae696d7d0e7abdcd6b0b144f8b3444e434d20a08e3e460d2ace3af46ef57S3VersionKey0C95FDFA: {
            Type: 'String',
            Description: 'S3 key for asset version "f608ae696d7d0e7abdcd6b0b144f8b3444e434d20a08e3e460d2ace3af46ef57"',
          },
          AssetParametersf608ae696d7d0e7abdcd6b0b144f8b3444e434d20a08e3e460d2ace3af46ef57ArtifactHashEB312C37: {
            Type: 'String',
            Description: 'Artifact hash for asset "f608ae696d7d0e7abdcd6b0b144f8b3444e434d20a08e3e460d2ace3af46ef57"',
          },
          AssetParameters67b7823b74bc135986aa72f889d6a8da058d0c4a20cbc2dfc6f78995fdd2fc24S3Bucket4D46ABB5: {
            Type: 'String',
            Description: 'S3 bucket for asset "67b7823b74bc135986aa72f889d6a8da058d0c4a20cbc2dfc6f78995fdd2fc24"',
          },
          AssetParameters67b7823b74bc135986aa72f889d6a8da058d0c4a20cbc2dfc6f78995fdd2fc24S3VersionKeyB0F28861: {
            Type: 'String',
            Description: 'S3 key for asset version "67b7823b74bc135986aa72f889d6a8da058d0c4a20cbc2dfc6f78995fdd2fc24"',
          },
          AssetParameters67b7823b74bc135986aa72f889d6a8da058d0c4a20cbc2dfc6f78995fdd2fc24ArtifactHashBA91B77F: {
            Type: 'String',
            Description: 'Artifact hash for asset "67b7823b74bc135986aa72f889d6a8da058d0c4a20cbc2dfc6f78995fdd2fc24"',
          },
          AssetParameters4986e65e4068c14ad56ff1fc6e3bbea82aa7ebeb32a8144668398e9e5d8e81d0S3Bucket694E06B3: {
            Type: 'String',
            Description: 'S3 bucket for asset "4986e65e4068c14ad56ff1fc6e3bbea82aa7ebeb32a8144668398e9e5d8e81d0"',
          },
          AssetParameters4986e65e4068c14ad56ff1fc6e3bbea82aa7ebeb32a8144668398e9e5d8e81d0S3VersionKeyCECCAEF5: {
            Type: 'String',
            Description: 'S3 key for asset version "4986e65e4068c14ad56ff1fc6e3bbea82aa7ebeb32a8144668398e9e5d8e81d0"',
          },
          AssetParameters4986e65e4068c14ad56ff1fc6e3bbea82aa7ebeb32a8144668398e9e5d8e81d0ArtifactHash9CB6EBB1: {
            Type: 'String',
            Description: 'Artifact hash for asset "4986e65e4068c14ad56ff1fc6e3bbea82aa7ebeb32a8144668398e9e5d8e81d0"',
          },
        },
      },
      MatchStyle.NO_REPLACES
    )
  )
})
