export interface BuildResponseReturnType {
  statusCode: number;
  headers: object;
  body: string;
}

export type ProductType = {
  description: string;
  id?: string;
  price: number;
  title: string;
};

export interface ProductTypeWithCount extends ProductType {
  count: number;
}

export type ProductsType = Array<ProductType>;

export type buildResponseBody = {
  products?: ProductsType;
  product?: ProductType;
  message?: string;
};

export type StockType = {
  product_id: string;
  count: number;
}