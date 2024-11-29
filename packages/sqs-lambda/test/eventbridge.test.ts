import test from "node:test";
import path from "node:path";

import { Match, Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib";
import { EventBus } from "aws-cdk-lib/aws-events";

import { EventBridgeSqsLambda } from "../src/eventbridge.js";

test("should set all required resources", () => {
  const app = new cdk.App();

  const testStack = new cdk.Stack(app, "TestStack");

  new EventBridgeSqsLambda(testStack, "TestConstruct", {
    namesPrefix: "mytest",
    rule: {
      eventBus: EventBus.fromEventBusName(testStack, "EventBus", `mybus`),
      eventPattern: {
        detailType: ["MyEvent"],
        detail: {
          foo: "bar",
        },
      },
    },
    queue: {
      retryAttempts: 17,
    },
    queueDlq: {
      visibilityTimeout: cdk.Duration.seconds(10),
    },
    lambda: {
      entry: path.join(__dirname, "./mock/mock.lambda.js"),
    },
    eventSource: {
      batchSize: 5,
    },
  });

  const template = Template.fromStack(testStack);

  template.hasResourceProperties("AWS::Lambda::Function", {
    FunctionName: "mytest-TestConstructLambda",
    Runtime: Match.stringLikeRegexp("nodejs"),
    Timeout: 10,
    Environment: {
      Variables: {
        NODE_OPTIONS: "--enable-source-maps",
      },
    },
  });

  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: "mytest-TestConstructDLQueue",
    VisibilityTimeout: 10,
  });

  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: "mytest-TestConstructQueue",
    RedrivePolicy: {
      deadLetterTargetArn: Match.anyValue(),
      maxReceiveCount: 17,
    },
  });

  template.hasResourceProperties("AWS::Events::Rule", {
    EventBusName: "mybus",
    EventPattern: {
      "detail-type": ["MyEvent"],
      detail: { foo: "bar" },
    },
    Name: "mytest-TestConstructRule",
    State: "ENABLED",
    Targets: [
      {
        Arn: {
          "Fn::GetAtt": ["TestConstructQueue447D1F58", "Arn"],
        },
      },
    ],
  });

  template.hasResourceProperties("AWS::Lambda::EventSourceMapping", {
    EventSourceArn: {
      "Fn::GetAtt": ["TestConstructQueue447D1F58", "Arn"],
    },
    FunctionName: { Ref: "TestConstructLambda95D80924" },
    FunctionResponseTypes: ["ReportBatchItemFailures"],
    ScalingConfig: { MaximumConcurrency: 5 },
    BatchSize: 5,
  });
});

test("should set multiple rules when ruleProps is an array", () => {
  const app = new cdk.App();

  const testStack = new cdk.Stack(app, "TestStack");

  const eventBus = EventBus.fromEventBusName(testStack, "EventBus", `mybus`);

  new EventBridgeSqsLambda(testStack, "TestConstruct", {
    namesPrefix: "mytest",
    rules: [
      {
        ruleName: "MyRule1",
        eventBus,
        eventPattern: {
          detailType: ["MyEvent"],
          detail: {
            foo: "bar",
          },
        },
      },
      {
        ruleName: "MyRule2",
        eventBus,
        eventPattern: {
          detailType: ["MyEvent2"],
          detail: {
            foo: "bar2",
          },
        },
      },
    ],
    lambda: {
      entry: path.join(__dirname, "./mock/mock.lambda.js"),
    },
  });

  const template = Template.fromStack(testStack);

  template.hasResourceProperties("AWS::Events::Rule", {
    EventBusName: "mybus",
    EventPattern: {
      "detail-type": ["MyEvent"],
      detail: { foo: "bar" },
    },
    Name: "MyRule1",
    State: "ENABLED",
    Targets: [
      {
        Arn: {
          "Fn::GetAtt": ["TestConstructQueue447D1F58", "Arn"],
        },
      },
    ],
  });

  template.hasResourceProperties("AWS::Events::Rule", {
    EventBusName: "mybus",
    EventPattern: {
      "detail-type": ["MyEvent2"],
      detail: { foo: "bar2" },
    },
    Name: "MyRule2",
    State: "ENABLED",
    Targets: [
      {
        Arn: {
          "Fn::GetAtt": ["TestConstructQueue447D1F58", "Arn"],
        },
      },
    ],
  });
});

test("should append .fifo to queues when fifo:true", () => {
  const app = new cdk.App();

  const testStack = new cdk.Stack(app, "TestStack");

  new EventBridgeSqsLambda(testStack, "TestConstruct", {
    namesPrefix: "mytest",
    rule: {
      eventBus: EventBus.fromEventBusName(testStack, "EventBus", `mybus`),
      eventPattern: {
        detailType: ["MyEvent"],
        detail: {
          foo: "bar",
        },
      },
    },
    lambda: {
      entry: path.join(__dirname, "./mock/mock.lambda.js"),
    },
    queueDlq: {
      fifo: true,
    },
    queue: {
      fifo: true,
    },
  });

  const template = Template.fromStack(testStack);

  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: "mytest-TestConstructDLQueue.fifo",
  });

  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: "mytest-TestConstructQueue.fifo",
  });
});
