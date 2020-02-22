#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AppsyncStarterStack } from '../stacks/appsync-starter-stack';

const app = new cdk.App();
new AppsyncStarterStack(app, 'AppsyncStarterStack');
