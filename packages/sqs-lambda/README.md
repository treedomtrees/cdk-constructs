# @treedom/cdk-constructs-sqs-lambda

This package contains useful CDK constructs for integrating Amazon SQS with AWS Lambda.

__Made with ❤️ at&nbsp;&nbsp;[<img src="https://assets.treedom.net/image/upload/manual_uploads/treedom-logo-contrib_gjrzt6.png" height="24" alt="Treedom" border="0" align="top" />](#-join-us-in-making-a-difference-)__, [join us in making a difference](#-join-us-in-making-a-difference-)!

## Installation

To install this package, run the following command:

```bash
npm install @treedom/cdk-constructs-sqs-lambda
```

## API Reference

### EventBridgeSqsLambda

The main construct provided by this package.

#### Constructor

```typescript
new EventBridgeSqsLambda(scope: Construct, id: string, props: EventBridgeSqsLambdaProps)
```
## Usage

This package provides the `EventBridgeSqsLambda` construct, which sets up an integration between EventBridge, SQS, and Lambda.

Here's a basic example of how to use the construct:

```typescript
import { EventBridgeSqsLambda } from '@treedom/cdk-constructs-sqs-lambda';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';

class MyStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new EventBridgeSqsLambda(this, 'MyEventBridgeSqsLambda', {
      envPrefix: 'myapp',
      ruleProps: {
        eventBus: myEventBus,
        eventPattern: {
          // Define your event pattern here
        },
      },
      nodejsFunctionProps: {
        // Define your Lambda function properties here
      },
    });
  }
}
```

#### Properties

- `deadLetterQueue`: The dead-letter queue for the SQS queue.
- `readQueue`: The main SQS queue.
- `eventSource`: The SQS event source for the Lambda function.
- `rules`: An array of EventBridge rules.
- `lambda`: The NodeJS Lambda function.
- `envPrefix`: The environment prefix used for naming resources.

#### Methods

- `addRule(ruleName: string, ruleProps: EventBridgeSqsLambdaRuleProps)`: Adds a new EventBridge rule to the construct.

#### EventBridgeSqsLambdaProps

The `EventBridgeSqsLambdaProps` interface includes the following properties:

- `queue`: (Optional) Properties for the main SQS queue, including an optional `retryAttempts` number.
- `queueDlq`: (Optional) Properties for the dead-letter queue.
- `rules`: (Optional) Array of EventBridge rules configuration.
- `lambda`: (Optional) Properties for the NodeJS Lambda function.
- `eventSource`: (Optional) Properties for the SQS event source.
- `namesPrefix`: (Optional) A string used as a prefix for naming resources.

### LambdaMaxScalingAspect

This class implements the `IAspect` interface and can be used to verify if some lambdas exceed the maximum allowed concurrency. Default maximum concurrency is 10 if not specified. maximum scaling specified. If the limit is exceeded an error Annotation on the lambda will be emitted.

#### Usage

```typescript
import { LambdaMaxScalingAspect } from '@treedom/cdk-constructs-sqs-lambda';

const maxScalingAspect = new LambdaMaxScalingAspect({maximumConcurrency: 50})

Aspects.of(this).add(maxScalingAspect);

```

## Dependencies

This package depends on the following libraries:

- `@treedom/cdk-constructs-datadog`: ^1.0.0
- `aws-cdk-lib`: ^2.165.0
- `constructs`: ^10.4.2

Make sure these dependencies are available in your project when using this package.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you find a bug or have a feature request, please file an issue on the [GitHub repository](https://github.com/treedomtrees/cdk-constructs/issues).

## 🌳 Join Us in Making a Difference! 🌳

We invite all developers who use Treedom's open-source code to support our mission of sustainability by planting a tree with us. By contributing to reforestation efforts, you help create a healthier planet and give back to the environment. Visit our [Treedom Open Source Forest](https://www.treedom.net/en/organization/treedom/event/treedom-open-source) to plant your tree today and join our community of eco-conscious developers.

Additionally, you can integrate the Treedom GitHub badge into your repository to showcase the number of trees in your Treedom forest and encourage others to plant new ones. Check out our [integration guide](https://github.com/treedomtrees/.github/blob/main/TREEDOM_BADGE.md) to get started.

Together, we can make a lasting impact! 🌍💚