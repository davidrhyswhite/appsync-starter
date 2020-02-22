import * as cdk from '@aws-cdk/core';
import { CfnGraphQLApi, CfnApiKey, CfnGraphQLSchema, CfnDataSource, CfnResolver } from '@aws-cdk/aws-appsync';
import { APP_NAME } from '../constants';

export class AppsyncStarterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const graphQLApi = new CfnGraphQLApi(this, `${APP_NAME}Api`, {
      name: `${APP_NAME}Api`,
      authenticationType: "API_KEY"
    });

    new CfnApiKey(this, `${APP_NAME}ApiKey`, {
      apiId: graphQLApi.attrApiId,
      description: "Default Api Key for AppSync authorisation",
      expires: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60,
    });

    const apiSchema = new CfnGraphQLSchema(this, 'Schema', {
      apiId: graphQLApi.attrApiId,
      definition: `
        type Query {
          hello: String!
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

    new CfnResolver(this, 'HelloQueryResolver', {
      apiId: graphQLApi.attrApiId,
      typeName: 'Query',
      fieldName: 'hello',
      dataSourceName: noneDataSource.attrName,
      requestMappingTemplate: `{
        "version" : "2018-05-29",
        "payload": {
          "hello": "Hello world!"
        }
      }`,
      responseMappingTemplate: `"$ctx.result.hello"`
    }).addDependsOn(apiSchema);
  }
}
