import { Annotations, IAspect } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { IConstruct } from "constructs";

export type DatadogLambdaAspectProps = {
  maximumConcurrency: number;
};

export class LambdaMaxScalingAspect implements IAspect {
  public readonly maximumConcurrency: number = 10;

  constructor(props: DatadogLambdaAspectProps) {
    this.maximumConcurrency = props.maximumConcurrency;
  }

  public visit(node: IConstruct): void {
    if (node instanceof lambda.EventSourceMapping) {
      const cfn = node.node.defaultChild as lambda.CfnEventSourceMapping;

      const { scalingConfig = {} } = cfn;

      if (
        !("maximumConcurrency" in scalingConfig) ||
        !scalingConfig.maximumConcurrency ||
        scalingConfig.maximumConcurrency > this.maximumConcurrency
      ) {
        Annotations.of(node).addError(
          `Lambdas must have a maximumConcurrency no more than ${this.maximumConcurrency}`,
        );
      }
    }
  }
}
