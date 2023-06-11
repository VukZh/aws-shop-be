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

const stack = new cdk.Stack(app, "ProductServiceStack-task4", {
  env: { region: "eu-west-1" },
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PG_HOST: process.env.PG_HOST!,
    PG_PORT: process.env.PG_PORT!,
    PG_DATABASE: process.env.PG_DATABASE!,
    PG_USERNAME: process.env.PG_USERNAME!,
    PG_PASSWORD: process.env.PG_PASSWORD!,
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
  },
  bundling: {
    externalModules: [
      'pg-native',
      'sqlite3',
      'pg-query-stream',
      'oracledb',
      'better-sqlite3',
      'tedious',
      'mysql',
      'mysql2',
    ],
  },
};

const GetProductsListLambda = new NodejsFunction(
  stack,
  "GetProductsListLambda",
  {
    ...sharedLambdaProps,
    functionName: "getProductsList-4",
    entry: "src/product-service/handlers/getProductsList.ts",
  }
);

const GetProductsByIdLambda = new NodejsFunction(
  stack,
  "GetProductsByIdLambda",
  {
    ...sharedLambdaProps,
    functionName: "getProductsById-4",
    entry: "src/product-service/handlers/getProductsById.ts",
  }
);

const CreateProductLambda = new NodejsFunction(
  stack,
  "CreateProductLambda",
  {
    ...sharedLambdaProps,
    functionName: "createProduct-4",
    entry: "src/product-service/handlers/createProduct.ts",
  }
);

const api = new apiGateway.HttpApi(stack, "ProductApi-4", {
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

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "CreateProductIntegration",
    CreateProductLambda
  ),
  path: "/products",
  methods: [apiGateway.HttpMethod.POST],
});
