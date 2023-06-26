import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "@aws-cdk/aws-apigatewayv2-alpha";
import { HttpLambdaIntegration } from "@aws-cdk/aws-apigatewayv2-integrations-alpha";
import {
  NodejsFunction,
  NodejsFunctionProps,
} from "aws-cdk-lib/aws-lambda-nodejs";

import dotenv from "dotenv";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sns from "aws-cdk-lib/aws-sns";
import {SqsEventSource} from "aws-cdk-lib/aws-lambda-event-sources";

dotenv.config();

const app = new cdk.App();

const stack = new cdk.Stack(app, "ProductServiceStack-task4DDB", {
  env: { region: "eu-west-1" },
});

const catalogItemsQueue = new sqs.Queue(stack, "catalogItemsQueue", {
  queueName: "catalog-items-queue",
});

const catalogItemsTopic = new sns.Topic(stack, "catalogItemsTopic", {
  topicName: "catalog-items-topic",
});

const sharedLambdaProps: Partial<NodejsFunctionProps> = {
  runtime: lambda.Runtime.NODEJS_18_X,
  environment: {
    PRODUCT_AWS_REGION: process.env.PRODUCT_AWS_REGION!,
    CATALOG_ITEMS_QUEUE_ARN: catalogItemsQueue.queueArn,
    CATALOG_ITEMS_TOPIC_ARN: catalogItemsTopic.topicArn,
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

const CatalogBatchProcessLambda = new NodejsFunction(
  stack,
  "CatalogBatchProcessLambda",
  {
    ...sharedLambdaProps,
    functionName: "catalogBatchProcess-task6",
    entry: "src/product-service/handlers/catalogBatchProcess.ts",
  }
);

catalogItemsQueue.grantSendMessages(CatalogBatchProcessLambda);
CatalogBatchProcessLambda.addEventSource(new SqsEventSource(catalogItemsQueue, {batchSize: 5}));

new sns.Subscription(stack, "catalogSubscription", {
  endpoint: process.env.EMAIL!,
  protocol: sns.SubscriptionProtocol.EMAIL,
  topic: catalogItemsTopic
});

new sns.Subscription(stack, "MoreThan100ItemsCatalogSubscription", {
  endpoint: process.env.EMAIL_BIG_COUNT!,
  protocol: sns.SubscriptionProtocol.EMAIL,
  topic: catalogItemsTopic,
  filterPolicy: {
    count: sns.SubscriptionFilter.numericFilter({
      greaterThanOrEqualTo: 100
    })
  }
})


catalogItemsTopic.grantPublish(CatalogBatchProcessLambda);