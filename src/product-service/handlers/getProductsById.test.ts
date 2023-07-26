import { handler as getProductsById } from "../handlers/getProductsById";

jest.mock("../handlers/getProductsById");

const ProductMock = {
  statusCode: 200,
  body: {
    count: 3,
    description: "desc 1",
    id: "2",
    price: 20,
    title: "Title1",
  },
};
describe("getProductsById", () => {
  it("getProductsById test1", async () => {
    getProductsById.mockReturnValueOnce(Promise.resolve(ProductMock));
    const data = await getProductsById({
      pathParameters: {
        productId: "2",
      },
    });
    // @ts-ignore
    expect(data.statusCode).toBe(200);
  });
});
