import dotenv from "dotenv";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import {
  HttpLambdaAuthorizer,
  HttpLambdaResponseType,
} from "@aws-cdk/aws-apigatewayv2-authorizers-alpha";

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, "ImportServiceStack", {
  env: { region: "eu-west-1" },
});

const bucket = s3.Bucket.fromBucketName(
  stack,
  "ImportBucket",
  process.env.S3_IMPORT_BUCKET!
);

const queue = sqs.Queue.fromQueueArn(
  stack,
  "catalog-items-queue",
  "arn:aws:sqs:eu-west-1:642155392726:catalog-items-queue"
);

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
    IMPORT_BUCKET_NAME: bucket.bucketName,
    IMPORT_SQS_URL: queue.queueUrl,
  },
};

const importProductsCSVFileLambda = new NodejsFunction(
  stack,
  "importProductsCSVFileLambda",
  {
    ...sharedLambdaProps,
    functionName: "importProductsCSVFile",
    entry: "src/import-service/handlers/importProductsCSVFile.ts",
  }
);

bucket.grantReadWrite(importProductsCSVFileLambda);

const importCSVFileParserLambda = new NodejsFunction(
  stack,
  "importCSVFileParserLambda",
  {
    ...sharedLambdaProps,
    functionName: "importCSVFileParser",
    entry: "src/import-service/handlers/importCSVFileParser.ts",
  }
);

bucket.grantReadWrite(importCSVFileParserLambda);
bucket.grantDelete(importCSVFileParserLambda);

const api = new apiGateway.HttpApi(stack, "ProductApi", {
  corsPreflight: {
    allowHeaders: ["*"],
    allowOrigins: ["*"],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  },
});

const existingAuthLambda = lambda.Function.fromFunctionArn(
  stack,
  "basicAuthorizer",
  process.env.ARN_AUTH_LMB!
);

const importAuthorizer = new HttpLambdaAuthorizer('basicAuthorizer', existingAuthLambda, {
  responseTypes: [HttpLambdaResponseType.IAM],
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "importProductsCSVFileIntegration",
    importProductsCSVFileLambda
  ),
  path: "/import",
  methods: [apiGateway.HttpMethod.GET],
  authorizer: importAuthorizer,
});

bucket.addEventNotification(
  s3.EventType.OBJECT_CREATED,
  new LambdaDestination(importCSVFileParserLambda),
  { prefix: "uploaded/" }
);

queue.grantSendMessages(importCSVFileParserLambda);
