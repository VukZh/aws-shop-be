import dotenv from "dotenv";
import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, "ImportServiceStack", {
  env: { region: "eu-west-1" },
});

const bucket = s3.Bucket.fromBucketName(
  stack,
  "ImportBucket",
  "aws-course-import-products-vuk"
);

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
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

const api = new apiGateway.HttpApi(stack, "ProductApi", {
  corsPreflight: {
    allowHeaders: ["*"],
    allowOrigins: ["*"],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  },
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "importProductsCSVFileIntegration",
    importProductsCSVFileLambda
  ),
  path: "/import",
  methods: [apiGateway.HttpMethod.GET],
});
