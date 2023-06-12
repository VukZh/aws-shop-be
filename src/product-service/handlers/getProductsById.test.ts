import { handler } from "./getProductsById";
import { getProductsById } from "../../product-service/pg-db/products";

jest.mock("../../product-service/pg-db/products");

const ProductMock = {
    count: 3,
    description: "desc 1",
    id: "2",
    price: 20,
    title: "Title1",
  };
describe("getProductsById", () => {
  it("getProductsById test1", async () => {
    getProductsById.mockReturnValueOnce(Promise.resolve(ProductMock));
    const data = await handler({
      pathParameters: {
        productId: "2",
      },
    });
    expect(data.statusCode).toBe(200);
  });
});
