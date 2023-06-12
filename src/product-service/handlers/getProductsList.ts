import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { buildResponse, findCount } from "../handlers/helpers";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { ProductType, StockType } from "../../product-service/handlers/types";

const ddbClient = new DynamoDBClient({ region: "eu-west-1" });

export const handler = async () => {
  const paramsProducts = {
    TableName: "products",
  };
  const paramsStocks = {
    TableName: "stocks",
  };
  try {
    const products = await ddbClient.send(new ScanCommand(paramsProducts));
    const stocks = await ddbClient.send(new ScanCommand(paramsStocks));
    const clearProducts = products.Items?.map((product) => unmarshall(product));
    const clearStocks = stocks.Items?.map((stock) => unmarshall(stock));
    // @ts-ignore
    const productsWithCount = clearProducts.map((product: ProductType) => ({
      ...product,
      count: findCount(
        product.id as unknown as string,
        clearStocks as unknown as Array<StockType>
      ),
    }));
    const result = buildResponse(200, productsWithCount);
    console.log("getProductsList:", result);
    return result;
  } catch (error) {
    const err = buildResponse(500, {
      message: error as string,
    });
    console.log("getProductsList error:", err);
    return err;
  }
};
