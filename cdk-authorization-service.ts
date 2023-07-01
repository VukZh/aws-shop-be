import dotenv from "dotenv";
import * as cdk from "aws-cdk-lib";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, "AuthServiceStack", {
  env: { region: "eu-west-1" },
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
  },
};

new NodejsFunction(
  stack,
  "basicAuthorizerLambda",
  {
    ...sharedLambdaProps,
    functionName: "basicAuthorizer",
    entry: "src/authorization-service/handlers/basicAuthorizer.ts",
  }
);