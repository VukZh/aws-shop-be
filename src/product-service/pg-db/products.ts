import PGClient from "./index";
import {UUID} from "io-ts-types";
import {ProductTypeWithCount} from "~/product-service/handlers/types";


export const getProductsList = () =>
  PGClient("products")
    .join("stocks", "products.id", "stocks.product_id")
    .select("products.*", "stocks.count");

export const getProductsById = (productId: string) =>
  PGClient("products")
    .join("stocks", "products.id", "stocks.product_id")
    .select("products.*", "stocks.count")
    .where("products.id", productId)
    .first();

export const createProduct = (product: ProductTypeWithCount) =>
  PGClient("products").insert({
    description: product.description,
    id: product.id,
    price: product.price,
    title: product.title,
  }).then(() => {
    PGClient("stocks").insert({
      product_id: product.id,
      count: product.count,
    })
  });
