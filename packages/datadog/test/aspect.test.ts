import test from "node:test";

import { Match, Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { DatadogLambda } from "datadog-cdk-constructs-v2";

import { AddDatadogToLambdas } from "../src/lambda-aspect.js";

test("should set envs and layers to all lambdas in stack", async (t) => {
  await t.test("when extensionLayerVersion is true", () => {
    const app = new cdk.App();

    const testStack = new cdk.Stack(app, "TestStack");

    new lambda.Function(testStack, "NativeLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromInline("handler(){}"),
      handler: "handler.handler",
    });

    const datadog = new DatadogLambda(testStack, `datadog`, {
      site: "datadoghq.eu",
      apiKeySecretArn: "arn:my-arn",
      env: "test",
      nodeLayerVersion: 115,
      extensionLayerVersion: 65,
      captureLambdaPayload: true,
      logLevel: "warn",
      service: "my-service",
      tags: "my-tag1,my-tag2",
      redirectHandler: true,
    });

    cdk.Aspects.of(app).add(new AddDatadogToLambdas("Datadog", { datadog }));

    // Prepare the stack for assertions.
    const template = Template.fromStack(testStack);

    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs20.x",
      Layers: [
        {
          "Fn::Join": [
            "",
            [
              "arn:aws:lambda:",
              { Ref: "AWS::Region" },
              Match.stringLikeRegexp("layer:Datadog-Node"),
            ],
          ],
        },
        {
          "Fn::Join": [
            "",
            [
              "arn:aws:lambda:",
              { Ref: "AWS::Region" },
              Match.stringLikeRegexp("layer:Datadog-Extension"),
            ],
          ],
        },
      ],
      Environment: {
        Variables: {
          DD_EXTENSION_VERSION: "next",
          DD_CAPTURE_LAMBDA_PAYLOAD: "true",
          DD_LOG_LEVEL: "warn",
          DD_ENV: "test",
          DD_SERVICE: "my-service",
          DD_TAGS: Match.stringLikeRegexp("my-tag1,my-tag2"),
        },
      },
    });
  });

  await t.test("should set envs and layers to all lambdas in stack", () => {
    const app = new cdk.App();

    const testStack = new cdk.Stack(app, "TestStack");

    new lambda.Function(testStack, "NativeLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromInline("handler(){}"),
      handler: "handler.handler",
    });

    const datadog = new DatadogLambda(testStack, `datadog`, {
      site: "datadoghq.eu",
      apiKeySecretArn: "arn:my-arn",
      env: "test",
      nodeLayerVersion: 115,
      captureLambdaPayload: true,
      logLevel: "warn",
      service: "my-service",
      tags: "my-tag1,my-tag2",
      redirectHandler: true,
    });

    cdk.Aspects.of(app).add(new AddDatadogToLambdas("Datadog", { datadog }));

    // Prepare the stack for assertions.
    const template = Template.fromStack(testStack);

    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs20.x",
      Layers: [
        {
          "Fn::Join": [
            "",
            [
              "arn:aws:lambda:",
              { Ref: "AWS::Region" },
              Match.stringLikeRegexp("layer:Datadog-Node"),
            ],
          ],
        },
      ],
      Environment: {
        Variables: {
          DD_EXTENSION_VERSION: "next",
          DD_CAPTURE_LAMBDA_PAYLOAD: "true",
          DD_LOG_LEVEL: "warn",
          DD_ENV: "test",
          DD_SERVICE: "my-service",
          DD_TAGS: Match.stringLikeRegexp("my-tag1,my-tag2"),
        },
      },
    });
  });
});
