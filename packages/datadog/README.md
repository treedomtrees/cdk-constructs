# @treedom/cdk-constructs-datadog

This package provides a CDK aspect for adding Datadog monitoring to AWS Lambda functions in your CDK stack.

__Made with ❤️ at&nbsp;&nbsp;[<img src="https://assets.treedom.net/image/upload/manual_uploads/treedom-logo-contrib_gjrzt6.png" height="24" alt="Treedom" border="0" align="top" />](#-join-us-in-making-a-difference-)__, [join us in making a difference](#-join-us-in-making-a-difference-)!

## Installation

```bash
npm install @treedom/cdk-constructs-datadog
```

## Usage

This package exports an `AddDatadogToLambdasAspect` aspect that can be used to automatically add Datadog monitoring to Lambda functions in your CDK stack.

```typescript
import { Aspects } from 'aws-cdk-lib';
import { AddDatadogToLambdasAspect } from '@treedom/cdk-constructs-datadog';
import { DatadogLambda } from 'datadog-cdk-constructs-v2';

// Create a DatadogLambda instance
const datadogLambda = new DatadogLambda(this, 'DatadogLambda', {
  // Configure your Datadog Lambda as needed
    site: "datadoghq.eu",
    apiKeySecretArn: "arn:my-arn",
    env: "test",
    nodeLayerVersion: 115,
    extensionLayerVersion: 65,
    captureLambdaPayload: true,
    sourceCodeIntegration: true,
    logLevel: "warn",
    service: "my-service",
    redirectHandler: false,<>
});

// Create the AddDatadogToLambdas aspect
const datadogAspect = new AddDatadogToLambdasAspect({
  datadog: datadogLambda,
  extensionVersion: "next" 
});

// Apply the aspect to your stack
Aspects.of(this).add(datadogAspect);
```

This aspect will automatically add Datadog monitoring to all Lambda functions in your stack.

## License

This project is licensed under the MIT License.

## Dependencies

This package depends on the following libraries:

- aws-cdk-lib: ^2.165.0
- constructs: ^10.4.2
- datadog-cdk-constructs-v2: ^1.18.0

## Issues and Contributions

If you encounter any issues or would like to contribute to this project, please visit our [GitHub repository](https://github.com/treedomtrees/cdk-constructs/issues).

## Repository

[GitHub Repository](https://github.com/treedomtrees/cdk-constructs)

## 🌳 Join Us in Making a Difference! 🌳

We invite all developers who use Treedom's open-source code to support our mission of sustainability by planting a tree with us. By contributing to reforestation efforts, you help create a healthier planet and give back to the environment. Visit our [Treedom Open Source Forest](https://www.treedom.net/en/organization/treedom/event/treedom-open-source) to plant your tree today and join our community of eco-conscious developers.

Additionally, you can integrate the Treedom GitHub badge into your repository to showcase the number of trees in your Treedom forest and encourage others to plant new ones. Check out our [integration guide](https://github.com/treedomtrees/.github/blob/main/TREEDOM_BADGE.md) to get started.

Together, we can make a lasting impact! 🌍💚