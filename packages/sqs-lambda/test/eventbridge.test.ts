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
    rules: [
      {
        ruleName: "MyRule1",
        eventBus: EventBus.fromEventBusName(testStack, "EventBus", `mybus`),
        eventPattern: {
          detailType: ["MyEvent"],
          detail: {
            foo: "bar",
          },
        },
      },
    ],
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
    Name: "mytest-TestConstructMyRule1",
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
    Name: "mytest-TestConstructMyRule1",
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
    Name: "mytest-TestConstructMyRule2",
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

test("should throw when no rules are provided", (t) => {
  const app = new cdk.App();

  const testStack = new cdk.Stack(app, "TestStack");

  t.assert.throws(() => {
    new EventBridgeSqsLambda(testStack, "TestConstruct", {
      namesPrefix: "mytest",
      rules: [],
      lambda: {
        entry: path.join(__dirname, "./mock/mock.lambda.js"),
      },
    });
  });
});

test("should append .fifo to queues when fifo:true", () => {
  const app = new cdk.App();

  const testStack = new cdk.Stack(app, "TestStack");

  new EventBridgeSqsLambda(testStack, "TestConstruct", {
    namesPrefix: "mytest",
    rules: [
      {
        ruleName: "MyRule1",
        eventBus: EventBus.fromEventBusName(testStack, "EventBus", `mybus`),
        eventPattern: {
          detailType: ["MyEvent"],
          detail: {
            foo: "bar",
          },
        },
      },
    ],
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

test("should set no prefix to resource names when not provided", () => {
  const app = new cdk.App();

  const testStack = new cdk.Stack(app, "TestStack");

  new EventBridgeSqsLambda(testStack, "TestConstruct", {
    rules: [
      {
        ruleName: "MyRule1",
        eventBus: EventBus.fromEventBusName(testStack, "EventBus", `mybus`),
        eventPattern: {
          detailType: ["MyEvent"],
          detail: {
            foo: "bar",
          },
        },
      },
    ],
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
    FunctionName: "TestConstructLambda",
    Runtime: Match.stringLikeRegexp("nodejs"),
    Timeout: 10,
    Environment: {
      Variables: {
        NODE_OPTIONS: "--enable-source-maps",
      },
    },
  });

  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: "TestConstructDLQueue",
    VisibilityTimeout: 10,
  });

  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: "TestConstructQueue",
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
    Name: "TestConstructMyRule1",
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

test("should apply global defaults to resources when provided", () => {
  const app = new cdk.App();

  const testStack = new cdk.Stack(app, "TestStack");

  const nativeDefaults = EventBridgeSqsLambda.getDefaults();

  EventBridgeSqsLambda.setDefaults({
    lambda: {
      memorySize: 512,
    },
    eventSource: {
      maxConcurrency: 3,
    },
    rules: {
      enabled: false,
    },
    queue: {
      visibilityTimeout: cdk.Duration.seconds(18),
    },
    queueDlq: {
      visibilityTimeout: cdk.Duration.seconds(19),
    },
    namesPrefix: "testDefaults",
  });

  new EventBridgeSqsLambda(testStack, "TestConstruct", {
    rules: [
      {
        ruleName: "TestRule",
        eventBus: EventBus.fromEventBusName(testStack, "EventBus", `mybus`),
        eventPattern: {
          detailType: ["MyEvent"],
          detail: {
            foo: "bar",
          },
        },
      },
    ],
    lambda: {
      entry: path.join(__dirname, "./mock/mock.lambda.js"),
    },
  });

  const template = Template.fromStack(testStack);

  EventBridgeSqsLambda.setDefaults(nativeDefaults);

  template.hasResourceProperties("AWS::Lambda::Function", {
    FunctionName: "testDefaults-TestConstructLambda",
    MemorySize: 512,
  });

  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: "testDefaults-TestConstructDLQueue",
    VisibilityTimeout: 19,
  });

  template.hasResourceProperties("AWS::SQS::Queue", {
    QueueName: "testDefaults-TestConstructQueue",
    VisibilityTimeout: 18,
  });

  template.hasResourceProperties("AWS::Events::Rule", {
    EventBusName: "mybus",
    EventPattern: {
      "detail-type": ["MyEvent"],
      detail: { foo: "bar" },
    },
    Name: "testDefaults-TestConstructTestRule",
    State: "DISABLED",
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
    ScalingConfig: { MaximumConcurrency: 3 },
  });
});
