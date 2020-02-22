import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import AppsyncStarter = require('../lib/appsync-starter-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new AppsyncStarter.AppsyncStarterStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
