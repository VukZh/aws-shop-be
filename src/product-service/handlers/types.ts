export interface BuildResponseReturnType {
  statusCode: number;
  headers: object;
  body: string;
}

export type ProductType = {
  description: string;
  id: string;
  price: number;
  title: string;
};

export type ProductsType = Array<ProductType>;

export type buildResponseBody = {
  products?: ProductsType;
  product?: ProductType;
  message?: string;
};