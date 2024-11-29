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
  queue?: QueueProps & { retryAttempts?: number };
  queueDlq?: QueueProps;
  rule?: EventBridgeSqsLambdaRuleProps;
  rules?: Array<
    EventBridgeSqsLambdaRuleProps & Required<Pick<RuleProps, "ruleName">>
  >;
  lambda: NodejsFunctionProps;
  eventSource?: SqsEventSourceProps;
  namesPrefix?: string;
};

export type EventBridgeSqsLambdaDefaults = Partial<
  Omit<EventBridgeSqsLambdaProps, "rules">
>;

export class EventBridgeSqsLambda extends Construct {
  protected static defaults: EventBridgeSqsLambdaDefaults = {
    lambda: {
      architecture: Architecture.ARM_64,
      runtime: Runtime.NODEJS_20_X,

      logRetention: RetentionDays.THREE_MONTHS,

      timeout: Duration.seconds(10),

      bundling: {
        minify: true,
        externalModules: [],
        sourceMap: true,
      },
    },
    eventSource: {
      maxConcurrency: 5,
      reportBatchItemFailures: true,
    },
  };

  public readonly queueDlq: Queue;
  public readonly queue: Queue;
  public readonly lambdaSource: SqsEventSource;
  public readonly rules: Array<Rule> = [];
  public readonly lambda: NodejsFunction;

  public readonly namesPrefix?: string;

  constructor(scope: Construct, id: string, props: EventBridgeSqsLambdaProps) {
    super(scope, id);

    this.namesPrefix = props.namesPrefix;

    // SQS Dead Letter Queue
    this.queueDlq = new Queue(this, `DLQueue`, {
      ...EventBridgeSqsLambda.defaults.queueDlq,
      queueName: this.getDefaultName(
        this.getQueueName(`DLQueue`, props.queue?.fifo),
      ),
      fifo: props.queue?.fifo, // Dead letter queues must be FIFO if the source queue is FIFO
      ...props.queueDlq,
    });

    // SQS Queue
    this.queue = new Queue(this, `Queue`, {
      ...EventBridgeSqsLambda.defaults.queue,
      queueName: this.getDefaultName(
        this.getQueueName(`Queue`, props.queue?.fifo),
      ),
      ...props.queue,
      deadLetterQueue: {
        queue: this.queueDlq,
        maxReceiveCount: props.queue?.retryAttempts ?? 10,
        ...props.queue?.deadLetterQueue,
      },
    });

    // SQS EventSource
    this.lambdaSource = new SqsEventSource(this.queue, {
      ...EventBridgeSqsLambda.defaults.eventSource,
      ...props.eventSource,
    });

    // EventBridge Rule
    if (props.rules) {
      for (const rule of props.rules) {
        const { ruleName, ...ruleProps } = rule;
        this.addRule(ruleName, ruleProps);
      }
    }

    if (props.rule) {
      this.addRule(`Rule`, {
        ruleName: this.getDefaultName(`Rule`),
        ...props.rule,
      });
    }

    if (!this.rules) {
      throw new Error("At least one rule must be specified");
    }

    // Lambda
    this.lambda = new NodejsFunction(this, `Lambda`, {
      ...EventBridgeSqsLambda.defaults.lambda,
      functionName: this.getDefaultName(`Lambda`),
      ...props.lambda,
    });

    this.lambda.addEnvironment("NODE_OPTIONS", "--enable-source-maps");

    this.lambda.addEventSource(this.lambdaSource);
  }

  static setDefaults(defaultProps: EventBridgeSqsLambdaDefaults) {
    EventBridgeSqsLambda.defaults = defaultProps;
  }

  addRule(ruleName: string, ruleProps: EventBridgeSqsLambdaRuleProps) {
    const rule = new Rule(this, `${ruleName}Rule`, {
      ...EventBridgeSqsLambda.defaults.rule,
      ruleName,
      ...ruleProps,
    });
    rule.addTarget(new SqsQueue(this.queue));

    this.rules.push(rule);

    return rule;
  }

  getDefaultName(name: string) {
    const nameSuffix = `${this.node.id}${name}`;

    if (this.namesPrefix) {
      return `${this.namesPrefix}-${nameSuffix}`;
    }

    return nameSuffix;
  }

  getQueueName(name: string, fifo = false) {
    // AWS requires the .fifo suffix for FIFO queues
    return fifo ? `${name}.fifo` : name;
  }
}
