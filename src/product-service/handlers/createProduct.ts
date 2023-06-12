import { buildResponse } from "../handlers/helpers";
import { ProductTypeWithCount } from "../../product-service/handlers/types";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import * as console from "console";

const ddbClient = new DynamoDBClient({ region: "eu-west-1" });
export const handler = async (event: { body: string }) => {
  try {
    const product: ProductTypeWithCount = JSON.parse(event.body);

    const paramsProducts = {
      TableName: "products",
      Item: marshall({
        id: product.id,
        title: product.title,
        description: product.description,
        price: product.price,
      }),
    };

    const paramsStocks = {
      TableName: "stocks",
      Item: marshall({ product_id: product.id, count: product.count }),
    };

    const productCommand = new PutItemCommand(paramsProducts);
    const stockCommand = new PutItemCommand(paramsStocks);

    const productResult = await ddbClient.send(productCommand);
    const stockResult = await ddbClient.send(stockCommand);

    const result = buildResponse(
      201,
      JSON.stringify(
        JSON.stringify(productResult) + JSON.stringify(stockResult)
      )
    );
    console.log("createProduct:", result);
    return buildResponse(201, JSON.stringify(product));
  } catch (error) {
    const err = buildResponse(500, {
      message: error as string,
    });
    console.log("getProductsList error:", err);
    return err;
  }
};
