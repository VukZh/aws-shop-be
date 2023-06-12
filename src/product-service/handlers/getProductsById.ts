import { buildResponse } from "../handlers/helpers";
import {
  marshall,
  NativeAttributeValue,
  unmarshall,
} from "@aws-sdk/util-dynamodb";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: "eu-west-1" });
export const handler = async (event: {
  pathParameters: { productId: string };
}) => {
  try {
    const pathParameters = event.pathParameters || {};
    if (event?.pathParameters?.productId) {
      const id = event.pathParameters.productId.toString();
      const paramsProducts = {
        TableName: "products",
        Key: marshall({ id: id }),
      };
      const paramsStocks = {
        TableName: "stocks",
        Key: marshall({ product_id: id }),
      };

      const product = await ddbClient.send(new GetItemCommand(paramsProducts));
      const stock = await ddbClient.send(new GetItemCommand(paramsStocks));

      if (!product.Item) throw "Product not found";

      // @ts-ignore
      const clearProduct: Record<string, NativeAttributeValue> = unmarshall(
        product.Item
      );

      // @ts-ignore
      const clearStock: Record<string, NativeAttributeValue> = unmarshall(
        stock.Item
      );

      if (clearProduct) {
        const result = buildResponse(200, {
          ...clearProduct,
          count: clearStock.count,
        });
        console.log("getProductsById:", id, result);
        return result;
      }
    }
  } catch (error) {
    const code = error == "Product not found" ? 404 : 500;
    const err = buildResponse(code, {
      message: error as string,
    });
    console.log("getProductsById error:", err);
    return err;
  }
};
