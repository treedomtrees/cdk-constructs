import test from "node:test";

import { Annotations } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

import { LambdaMaxScalingAspect } from "../src/scaling-aspect.js";

test("should set error annotation when maxConcurrency is over threshold", () => {
  const app = new cdk.App();

  const testStack = new cdk.Stack(app, "TestStack");

  const myLambda = new lambda.Function(testStack, "NativeLambda", {
    runtime: lambda.Runtime.NODEJS_20_X,
    code: lambda.Code.fromInline("handler(){}"),
    handler: "handler.handler",
  });

  const queue = new Queue(testStack, `Queue`);

  const eventSource = new SqsEventSource(queue, {
    maxConcurrency: 21,
  });

  myLambda.addEventSource(eventSource);

  cdk.Aspects.of(app).add(
    new LambdaMaxScalingAspect({ maximumConcurrency: 20 }),
  );

  const annotations = Annotations.fromStack(testStack);

  annotations.hasError(
    "*",
    `Lambdas must have a maximumConcurrency no more than 20`,
  );
});

test("should not set error annotation when maxConcurrency is within threshold", () => {
  const app = new cdk.App();

  const testStack = new cdk.Stack(app, "TestStack");

  const myLambda = new lambda.Function(testStack, "NativeLambda", {
    runtime: lambda.Runtime.NODEJS_20_X,
    code: lambda.Code.fromInline("handler(){}"),
    handler: "handler.handler",
  });

  const queue = new Queue(testStack, `Queue`);

  const eventSource = new SqsEventSource(queue, {
    maxConcurrency: 20,
  });

  myLambda.addEventSource(eventSource);

  cdk.Aspects.of(app).add(
    new LambdaMaxScalingAspect({ maximumConcurrency: 20 }),
  );

  const annotations = Annotations.fromStack(testStack);

  annotations.hasNoError(
    "*",
    `Lambdas must have a maximumConcurrency no more than 20`,
  );
});

test("should set error annotation when maxConcurrency is not set", () => {
  const app = new cdk.App();

  const testStack = new cdk.Stack(app, "TestStack");

  const myLambda = new lambda.Function(testStack, "NativeLambda", {
    runtime: lambda.Runtime.NODEJS_20_X,
    code: lambda.Code.fromInline("handler(){}"),
    handler: "handler.handler",
  });

  const queue = new Queue(testStack, `Queue`);

  const eventSource = new SqsEventSource(queue, {
    maxConcurrency: 20,
  });

  myLambda.addEventSource(eventSource);

  cdk.Aspects.of(app).add(
    new LambdaMaxScalingAspect({ maximumConcurrency: 20 }),
  );

  const annotations = Annotations.fromStack(testStack);

  annotations.hasNoError(
    "*",
    `Lambdas must have a maximumConcurrency no more than 20`,
  );
});
