import { IAspect } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { IConstruct } from "constructs";
import { DatadogLambda } from "datadog-cdk-constructs-v2";

export type DatadogLambdaAspectProps = {
  datadog: DatadogLambda;
};

export class AddDatadogToLambdas implements IAspect {
  public readonly datadog: DatadogLambda;

  constructor(props: DatadogLambdaAspectProps) {
    this.datadog = props.datadog;
  }

  public visit(node: IConstruct): void {
    // See that we're dealing with a CfnBucket
    if (node instanceof lambda.Function) {
      const lambda = node;
      // Check for versioning property, exclude the case where the property
      // can be a token (IResolvable).
      lambda.addEnvironment("DD_EXTENSION_VERSION", "next");

      // If no extension is set, this envs are not set
      if (!this.datadog.props.extensionLayerVersion) {
        lambda.addEnvironment("DD_VERSION", lambda.currentVersion.toString());

        if (this.datadog.props.service) {
          lambda.addEnvironment("DD_SERVICE", this.datadog.props.service);
        }

        if (this.datadog.props.env) {
          lambda.addEnvironment("DD_ENV", this.datadog.props.env);
        }

        if (this.datadog.props.tags) {
          lambda.addEnvironment("DD_TAGS", this.datadog.props.tags);
        }
      }

      this.datadog.addLambdaFunctions([node]);
    }
  }
}
