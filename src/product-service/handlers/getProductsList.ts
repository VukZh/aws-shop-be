import { buildResponse } from "../handlers/helpers";
import {products as PRODUCTS} from "../../product-service/mocks/data";

export const handler = async () => {
  try {
    return buildResponse(200, PRODUCTS);
  } catch (error) {
    return buildResponse(500, {
      message: error as string,
    });
  }
};
