import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";

import dotenv from "dotenv";

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, "ProductServiceStack-task3", {
  env: { region: "eu-west-1" },
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
  },
};

const GetProductsListLambda = new NodejsFunction(
  stack,
  "GetProductsListLambda",
  {
    ...sharedLambdaProps,
    functionName: "getProductsList",
    entry: "src/product-service/handlers/getProductsList.ts",
  }
);

const GetProductsByIdLambda = new NodejsFunction(
  stack,
  "GetProductsByIdLambda",
  {
    ...sharedLambdaProps,
    functionName: "getProductsById",
    entry: "src/product-service/handlers/getProductsById.ts",
  }
);

const api = new apiGateway.HttpApi(stack, "ProductApi", {
  corsPreflight: {
    allowHeaders: ["*"],
    allowOrigins: ["*"],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  },
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "GetProductsListIntegration",
    GetProductsListLambda
  ),
  path: "/products",
  methods: [apiGateway.HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "GetProductsByIdIntegration",
    GetProductsByIdLambda
  ),
  path: "/products/{productId}",
  methods: [apiGateway.HttpMethod.GET],
});
