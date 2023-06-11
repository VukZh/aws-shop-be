import { buildResponse } from "../handlers/helpers";
import { getProductsList } from "../../product-service/pg-db/products";

export const handler = async () => {
  try {
    const products = await getProductsList();
    return buildResponse(200, products);
  } catch (error) {
    return buildResponse(500, {
      message: error as string,
    });
  }
};
