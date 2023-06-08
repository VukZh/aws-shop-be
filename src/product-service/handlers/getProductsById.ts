import { buildResponse } from "~/product-service/handlers/helpers";
import { productsLambdaTest as PRODUCT } from "~/product-service/mocks/data";
import { ProductType } from "~/product-service/handlers/types";
import { APIGatewayProxyEventPathParameters } from "aws-lambda";

const getProduct = (pathParameters: APIGatewayProxyEventPathParameters) => {
  return PRODUCT.find((product) => product.id == pathParameters.productId);
};
export const handler = async (event: {
  pathParameters: { productId: string };
}) => {
  try {
    const pathParameters = event.pathParameters || {};
    const product = getProduct(pathParameters);
    if (product) {
      return buildResponse(200, {
        product: product as ProductType,
      });
    }
    throw "Product not found";
  } catch (error) {
    const code = error == "Product not found" ? 404 : 500;
    return buildResponse(code, {
      message: error as string,
    });
  }
};
