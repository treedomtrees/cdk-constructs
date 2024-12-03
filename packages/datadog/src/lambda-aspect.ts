import { IAspect } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { IConstruct } from "constructs";
import { DatadogLambda } from "datadog-cdk-constructs-v2";

export type DatadogLambdaAspectProps = {
  datadog: DatadogLambda;
  extensionVersion?: "next";
};

export class AddDatadogToLambdasAspect implements IAspect {
  public readonly datadog: DatadogLambda;
  public readonly extensionVersion: DatadogLambdaAspectProps["extensionVersion"];

  constructor(props: DatadogLambdaAspectProps) {
    this.datadog = props.datadog;
    this.extensionVersion = props.extensionVersion;
  }

  public visit(node: IConstruct): void {
    // See that we're dealing with a CfnBucket
    if (node instanceof lambda.Function) {
      const lambda = node;

      if (this.extensionVersion) {
        lambda.addEnvironment("DD_EXTENSION_VERSION", this.extensionVersion);
      }

      // If no extension is set, this envs are not automatically set by Datadog Construct
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
