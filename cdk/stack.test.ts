/* eslint-disable radar/no-duplicate-string */
import {expect as expectCDK, matchTemplate, MatchStyle} from '@aws-cdk/assert'
import * as cdk from '@aws-cdk/core'
import * as Stack from './stack'

test('Stack', () => {
  const app = new cdk.App()
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
                  Ref:
                    'AssetParameters9704878e591d681350c6665d77273756114686d48539dfda39ec8eb05ddb874aS3Bucket34740715',
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
                                Ref:
                                  'AssetParameters9704878e591d681350c6665d77273756114686d48539dfda39ec8eb05ddb874aS3VersionKey81B504FF',
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
                                Ref:
                                  'AssetParameters9704878e591d681350c6665d77273756114686d48539dfda39ec8eb05ddb874aS3VersionKey81B504FF',
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
                  BUCKET: {
                    Ref: 'CreditsCreditsStoreDC9BDB5C',
                  },
                  AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
                },
              },
              Handler: 'index.postCredits',
              Runtime: 'nodejs12.x',
            },
            DependsOn: [
              'CreditsCreditsHandlerServiceRoleDefaultPolicyF2B38D20',
              'CreditsCreditsHandlerServiceRole96F860B7',
            ],
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
          AssetParameters9704878e591d681350c6665d77273756114686d48539dfda39ec8eb05ddb874aS3Bucket34740715: {
            Type: 'String',
            Description: 'S3 bucket for asset "9704878e591d681350c6665d77273756114686d48539dfda39ec8eb05ddb874a"',
          },
          AssetParameters9704878e591d681350c6665d77273756114686d48539dfda39ec8eb05ddb874aS3VersionKey81B504FF: {
            Type: 'String',
            Description: 'S3 key for asset version "9704878e591d681350c6665d77273756114686d48539dfda39ec8eb05ddb874a"',
          },
          AssetParameters9704878e591d681350c6665d77273756114686d48539dfda39ec8eb05ddb874aArtifactHashC8DA205E: {
            Type: 'String',
            Description: 'Artifact hash for asset "9704878e591d681350c6665d77273756114686d48539dfda39ec8eb05ddb874a"',
          },
        },
      },
      MatchStyle.EXACT
    )
  )
})
