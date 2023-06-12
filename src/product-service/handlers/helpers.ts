import {BuildResponseReturnType, StockType} from "../handlers/types";

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