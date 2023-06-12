import { buildResponse } from "../handlers/helpers";
import { createProduct } from "../../product-service/pg-db/products";
import { ProductTypeWithCount } from "../../product-service/handlers/types";

export const handler = async (event: { body: string }) => {
  try {
    const product: ProductTypeWithCount = JSON.parse(event.body);
    await createProduct(product);
    return buildResponse(201, JSON.stringify(product));
  } catch (error) {
    return buildResponse(500, {
      message: error as string,
    });
  }
};
