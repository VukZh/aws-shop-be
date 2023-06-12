import { handler } from "./createProduct";
import { createProduct } from "../../product-service/pg-db/products";

jest.mock("../../product-service/pg-db/products");

const ProductsMock = {
    count: 3,
    description: "desc 1",
    id: "2",
    price: 20,
    title: "Title1",
  };
describe("createProduct", () => {
  it("createProduct test", async () => {
    createProduct.mockReturnValueOnce(Promise.resolve(ProductsMock));
    const data = await handler({body: JSON.stringify(ProductsMock)});
    expect(data.statusCode).toBe(201);
  });
});
