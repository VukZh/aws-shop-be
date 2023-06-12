import {
  BuildResponseReturnType,
  ProductTypeWithCount,
  StockType,
} from "../handlers/types";
import { v4 as uuidv4 } from "uuid";
export const buildResponse = (
  statusCode: number,
  body: any
): BuildResponseReturnType => ({
  statusCode: statusCode,
  headers: {
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "*",
  },
  body: JSON.stringify(body),
});

export const findCount = (id: string, stock: Array<StockType>) => {
  const findStock = stock.find((stock) => stock.product_id === id);
  return findStock?.count;
};

export const checkNewProduct = (product: ProductTypeWithCount): string => {
  console.log("___________________ ", product)
  const id = product.id === "" ? uuidv4() : product.id;
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (
    !uuidRegex.test(id) ||
    product.title === "" ||
    typeof product.description !== "string" ||
    typeof product.price !== "number" ||
    typeof product.count !== "number" ||
    product.count === 0
  )
    return "";
  return id;
};
