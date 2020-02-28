import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import { App } from '@aws-cdk/core';
import { AppsyncStarterStack } from './appsync-starter-stack';
import { expiresInDays  } from '../utils';

jest.mock("../utils", () => ({
  expiresInDays: jest.fn(() => 123456789)
}));

test('Stack creates AppSync API resources', () => {
  const app = new App();
  const stack = new AppsyncStarterStack(app, 'MyTestStack');

  expectCDK(stack).to(
    matchTemplate(
      require('./__templates__/appsync-starter-stack.json'),
      MatchStyle.EXACT
    )
  );
  expect(expiresInDays).toBeCalledTimes(1);
});
