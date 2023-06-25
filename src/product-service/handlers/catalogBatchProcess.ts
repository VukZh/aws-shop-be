import {
  buildResponse,
  checkNewProduct,
} from "~/product-service/handlers/helpers";
import { marshall } from "@aws-sdk/util-dynamodb";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const ddbClient = new DynamoDBClient({ region: "eu-west-1" });

const snsClient = new SNSClient({ region: "eu-west-1" });
export const handler = async (event: { Records: Array<any> }) => {
  console.log("event> ", event.Records.length, event.Records[0].body);

  try {
    const promises = event.Records.map(async (record) => {
      const { body } = record;
      const product = JSON.parse(body);

      if (
        !product.description ||
        !product.price ||
        !product.title ||
        !product.count
      )
        throw "It's not a product data";
      const uuid = checkNewProduct(product);
      if (uuid === "") throw "Product data is invalid";
      const paramsProducts = {
        TableName: "products",
        Item: marshall({
          id: uuid,
          title: product.title,
          description: product.description,
          price: product.price,
        }),
      };
      const paramsStocks = {
        TableName: "stocks",
        Item: marshall({ product_id: uuid, count: product.count }),
      };
      console.log("params ", paramsProducts, paramsStocks);
      const productCommand = new PutItemCommand(paramsProducts);
      const stockCommand = new PutItemCommand(paramsStocks);

      await ddbClient.send(productCommand);
      await ddbClient.send(stockCommand);

      await snsClient.send(
        new PublishCommand({
          Subject: "Add new items file",
          Message: JSON.stringify(product),
          TopicArn: "arn:aws:sns:eu-west-1:642155392726:catalog-items-topic",
          MessageAttributes: {
            count: {
              DataType: "Number",
              StringValue: product.count,
            },
          },
        })
      );

      return buildResponse(201, JSON.stringify(product));
    });

    await Promise.all(promises);

    return buildResponse(201, "All products have been created successfully");
  } catch (error) {
    const codeError =
      error == ("Product data is invalid" || "It's not a product data")
        ? 400
        : 500;
    const err = buildResponse(codeError, {
      message: error as string,
    });
    console.log("createProduct error:", err, error);
    return err;
  }
};
