import { buildResponse } from "~/product-service/handlers/helpers";
import { productsLambdaTest as PRODUCTS } from "~/product-service/mocks/data";
import { ProductsType } from "~/product-service/handlers/types";

export const handler = async () => {
  try {
    return buildResponse(200, {
      products: PRODUCTS as ProductsType,
    });
  } catch (error) {
    return buildResponse(500, {
      message: error as string,
    });
  }
};
