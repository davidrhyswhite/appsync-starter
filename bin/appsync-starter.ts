#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { AppsyncStarterStack } from '../stacks/appsync-starter-stack';

const app = new App();
new AppsyncStarterStack(app, 'AppsyncStarterStack');
