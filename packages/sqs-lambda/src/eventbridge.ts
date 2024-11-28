import { Construct } from "constructs";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Queue, QueueProps } from "aws-cdk-lib/aws-sqs";
import { Rule, RuleProps } from "aws-cdk-lib/aws-events";
import { SqsQueue } from "aws-cdk-lib/aws-events-targets";
import {
  SqsEventSource,
  SqsEventSourceProps,
} from "aws-cdk-lib/aws-lambda-event-sources";
import { Duration } from "aws-cdk-lib";

export type EventBridgeSqsLambdaRuleProps = Required<
  Pick<RuleProps, "eventBus" | "eventPattern">
> &
  RuleProps;

export type EventBridgeSqsLambdaProps = {
  envPrefix: string;
  deadLetterQueueProps?: QueueProps;
  readQueueProps?: QueueProps & {
    retryAttempts?: number;
  };
  ruleProps:
    | EventBridgeSqsLambdaRuleProps
    | Array<
        EventBridgeSqsLambdaRuleProps & Required<Pick<RuleProps, "ruleName">>
      >;
  nodejsFunctionProps?: NodejsFunctionProps;
  eventSourceProps?: SqsEventSourceProps;
};

export class EventBridgeSqsLambda extends Construct {
  public readonly deadLetterQueue: Queue;
  public readonly readQueue: Queue;
  public readonly eventSource: SqsEventSource;
  public readonly rules: Array<Rule> = [];
  public readonly lambda: NodejsFunction;

  public readonly envPrefix: string;

  constructor(scope: Construct, id: string, props: EventBridgeSqsLambdaProps) {
    super(scope, id);

    this.envPrefix = props.envPrefix;

    // SQS Dead Letter Queue
    this.deadLetterQueue = new Queue(this, `${id}DLQueue`, {
      fifo: props.deadLetterQueueProps?.fifo, // Dead letter queues must be FIFO if the source queue is FIFO
      queueName: `${props.envPrefix}-${id}DLQueue${
        props.readQueueProps?.fifo ? ".fifo" : ""
      }`, // AWS requires the .fifo suffix for FIFO queues
      ...props.deadLetterQueueProps,
    });

    // SQS Queue
    this.readQueue = new Queue(this, `${id}Queue`, {
      queueName: `${props.envPrefix}-${id}Queue${
        props.readQueueProps?.fifo ? ".fifo" : ""
      }`, // AWS requires the .fifo suffix for FIFO queues
      deadLetterQueue: {
        queue: this.deadLetterQueue,
        maxReceiveCount: props.readQueueProps?.retryAttempts ?? 10,
        ...props.readQueueProps?.deadLetterQueue,
      },
      ...props.readQueueProps,
    });

    // SQS EventSource
    this.eventSource = new SqsEventSource(this.readQueue, {
      reportBatchItemFailures: true,
      maxConcurrency: 5,
      batchSize: 10,
      ...props.eventSourceProps,
    });

    // EventBridge Rule
    if (Array.isArray(props.ruleProps)) {
      for (const rule of props.ruleProps) {
        const { ruleName, ...ruleProps } = rule;
        this.addRule(ruleName, ruleProps);
      }
    } else {
      this.addRule(`${id}Rule`, {
        ruleName: `${props.envPrefix}-${id}Rule`,
        ...props.ruleProps,
      });
    }

    // Lambda
    this.lambda = new NodejsFunction(this, `${id}Lambda`, {
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,

      functionName: `${props.envPrefix}-${id}Lambda`,
      logRetention: RetentionDays.THREE_MONTHS,
      memorySize: 256,

      timeout: Duration.seconds(10),

      bundling: {
        minify: true,
        externalModules: [],
        sourceMap: true,
      },

      ...props.nodejsFunctionProps,
    });

    this.lambda.addEnvironment("NODE_OPTIONS", "--enable-source-maps");

    this.lambda.addEventSource(this.eventSource);
  }

  addRule(ruleName: string, ruleProps: EventBridgeSqsLambdaRuleProps) {
    const rule = new Rule(this, `${ruleName}Rule`, {
      ruleName,
      ...ruleProps,
    });
    rule.addTarget(new SqsQueue(this.readQueue));

    this.rules.push(rule);

    return rule;
  }
}
