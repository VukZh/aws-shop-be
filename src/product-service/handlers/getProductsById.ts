import { buildResponse } from "../handlers/helpers";
import { getProductsById } from "../../product-service/pg-db/products";
import {UUID} from "io-ts-types";

export const handler = async (event: {
  pathParameters: { productId: string };
}) => {
  try {
    const pathParameters = event.pathParameters || {};
    if (event?.pathParameters?.productId) {
      const product = await getProductsById(pathParameters.productId);
      if (product) {
        return buildResponse(200, product);
      }
    }
    throw "Product not found";
  } catch (error) {
    const code = error == "Product not found" ? 404 : 500;
    return buildResponse(code, {
      message: error as string,
    });
  }
};
