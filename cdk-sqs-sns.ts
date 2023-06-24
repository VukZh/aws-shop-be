import * as cdk from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import dotenv from "dotenv";

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, "SQS-SNS-stack", {
  env: { region: "eu-west-1" },
});

const catalogItemsQueue = new sqs.Queue(stack, "catalogItemsQueue", {
  queueName: "catalog-items-queue",
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
  },
};

const CatalogBatchProcessLambda = new NodejsFunction(
  stack,
  "CatalogBatchProcessLambda",
  {
    ...sharedLambdaProps,
    functionName: "catalogBatchProcess-task6",
    entry: "src/product-service/handlers/catalogBatchProcess.ts",
  }
);

catalogItemsQueue.grantConsumeMessages(CatalogBatchProcessLambda);

CatalogBatchProcessLambda.addEventSourceMapping(
  "CatalogBatchProcessEventSourceMapping",
  {
    batchSize: 5,
    eventSourceArn: process.env.SQS_ARN,
  }
);
