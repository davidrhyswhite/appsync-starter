import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { CfnGraphQLApi, CfnApiKey, CfnGraphQLSchema, CfnDataSource, CfnResolver } from '@aws-cdk/aws-appsync';
import { Role, ServicePrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';
import { Function, AssetCode, Runtime } from '@aws-cdk/aws-lambda';
import { APP_NAME } from '../constants';
import { expiresInDays } from '../utils';

const NODE_ENV = process.env.NODE_ENV || 'development';

export class AppsyncStarterStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const graphQLApi = new CfnGraphQLApi(this, `${APP_NAME}Api`, {
      name: `${APP_NAME}Api`,
      authenticationType: "API_KEY",
      xrayEnabled: true
    });

    new CfnApiKey(this, `${APP_NAME}ApiKey`, {
      apiId: graphQLApi.attrApiId,
      description: "Default Api Key for AppSync authorisation",
      expires: expiresInDays(365),
    });

    const apiSchema = new CfnGraphQLSchema(this, 'Schema', {
      apiId: graphQLApi.attrApiId,
      definition: `
        type Hello {
          say: String!
        }
        type Query {
          none: Hello!
          lambda: Hello!
        }
        type Schema {
          query: Query
        }`
    });

    const noneDataSource = new CfnDataSource(this, 'NoneDataSource', {
      apiId: graphQLApi.attrApiId,
      name: 'NoneDataSource',
      type: 'NONE'
    });

    new CfnResolver(this, 'NoneQueryResolver', {
      apiId: graphQLApi.attrApiId,
      typeName: 'Query',
      fieldName: 'none',
      dataSourceName: noneDataSource.attrName,
      requestMappingTemplate: `{
        "version" : "2018-05-29",
        "payload": {
          "greeting": "Hello world!"
        }
      }`,
      responseMappingTemplate: `{
        "say": "$ctx.result.greeting"
      }`
    }).addDependsOn(apiSchema);

    const lambdaRole = new Role(this, 'LambdaAccessRole', {
      assumedBy: new ServicePrincipal('appsync.amazonaws.com')
    });

    lambdaRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AWSLambdaFullAccess'));

    const customLambda = new Function(this, 'CustomHandlerResolver', {
      code: new AssetCode('built/handlers'),
      handler: 'hello.handler',
      runtime: Runtime.NODEJS_12_X,
      environment: {
        NODE_ENV
      }
    });

    const lambdaDataSource = new CfnDataSource(
      this,
      'LambdaDataSource',
      {
        apiId: graphQLApi.attrApiId,
        name: 'LambdaDataSource',
        type: 'AWS_LAMBDA',
        lambdaConfig: {
          lambdaFunctionArn: customLambda.functionArn
        },
        serviceRoleArn: lambdaRole.roleArn
      }
    );

    new CfnResolver(this, 'LambdaQueryResolver', {
      apiId: graphQLApi.attrApiId,
      typeName: 'Query',
      fieldName: 'lambda',
      dataSourceName: lambdaDataSource.attrName,
      requestMappingTemplate: `{
        "version" : "2018-05-29",
        "operation": "Invoke",
        "payload": {
          "attributes": $util.toJson($context.args),
          "headers": $util.toJson($context.request.headers)
        }
      }`,
      responseMappingTemplate: `$util.toJson($context.result)`
    }).addDependsOn(apiSchema);

  }
}
