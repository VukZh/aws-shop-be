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

const stack = new cdk.Stack(app, "ProductServiceStack-task4DDB", {
  env: { region: "eu-west-1" },
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
  },
};

const GetProductsListLambdaDDB = new NodejsFunction(
  stack,
  "GetProductsListLambdaDDB",
  {
    ...sharedLambdaProps,
    functionName: "getProductsList-4DDB",
    entry: "src/product-service/handlers/getProductsList.ts",
  }
);

const GetProductsByIdLambdaDDB = new NodejsFunction(
  stack,
  "GetProductsByIdLambdaDDB",
  {
    ...sharedLambdaProps,
    functionName: "getProductsById-4DDB",
    entry: "src/product-service/handlers/getProductsById.ts",
  }
);

const CreateProductLambdaDDB = new NodejsFunction(
  stack,
  "CreateProductLambdaDDB",
  {
    ...sharedLambdaProps,
    functionName: "createProduct-4DDB",
    entry: "src/product-service/handlers/createProduct.ts",
  }
);

const api = new apiGateway.HttpApi(stack, "ProductApi-4DDB", {
  corsPreflight: {
    allowHeaders: ["*"],
    allowOrigins: ["*"],
    allowMethods: [apiGateway.CorsHttpMethod.ANY],
  },
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "GetProductsListIntegration",
    GetProductsListLambdaDDB
  ),
  path: "/products",
  methods: [apiGateway.HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "GetProductsByIdIntegration",
    GetProductsByIdLambdaDDB
  ),
  path: "/products/{productId}",
  methods: [apiGateway.HttpMethod.GET],
});

api.addRoutes({
  integration: new HttpLambdaIntegration(
    "CreateProductIntegration",
    CreateProductLambdaDDB
  ),
  path: "/products",
  methods: [apiGateway.HttpMethod.POST],
});
