import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import { AppsyncStarterStack } from './appsync-starter-stack';

global.Date.now = jest.fn(() => 1582390399302);

test('Stack creates AppSync API resources', () => {
  const app = new cdk.App();
  const stack = new AppsyncStarterStack(app, 'MyTestStack');

  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {
          AppSyncStarterApi: {
            Type: 'AWS::AppSync::GraphQLApi',
            Properties: {
              AuthenticationType: 'API_KEY',
              Name: 'AppSyncStarterApi'
            }
          },
          AppSyncStarterApiKey: {
            Type: 'AWS::AppSync::ApiKey',
            Properties: {
              ApiId: {
                'Fn::GetAtt': ['AppSyncStarterApi', 'ApiId']
              },
              Description: 'Default Api Key for AppSync authorisation',
              Expires: 1613926399
            }
          },
          Schema: {
            Type: 'AWS::AppSync::GraphQLSchema',
            Properties: {
              ApiId: {
                'Fn::GetAtt': ['AppSyncStarterApi', 'ApiId']
              },
              Definition:
                '\n        type Query {\n          hello: String!\n        }\n        type Schema {\n          query: Query\n        }'
            }
          },
          NoneDataSource: {
            Type: 'AWS::AppSync::DataSource',
            Properties: {
              ApiId: {
                'Fn::GetAtt': ['AppSyncStarterApi', 'ApiId']
              },
              Name: 'NoneDataSource',
              Type: 'NONE'
            }
          },
          HelloQueryResolver: {
            Type: 'AWS::AppSync::Resolver',
            Properties: {
              ApiId: {
                'Fn::GetAtt': ['AppSyncStarterApi', 'ApiId']
              },
              FieldName: 'hello',
              TypeName: 'Query',
              DataSourceName: {
                'Fn::GetAtt': ['NoneDataSource', 'Name']
              },
              RequestMappingTemplate:
                '{\n        "version" : "2018-05-29",\n        "payload": {\n          "hello": "Hello world!"\n        }\n      }',
              ResponseMappingTemplate: '"$ctx.result.hello"'
            },
            DependsOn: ['Schema']
          }
        }
      },
      MatchStyle.EXACT
    )
  );
});
