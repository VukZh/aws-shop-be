import { handler as getProductsById } from "./getProductsById";
describe("getProductsById", () => {
  it("getProductsById test1", async () => {
    const data = await getProductsById({
      pathParameters: {
        productId: "1",
      },
    });
    expect(data.statusCode).toBe(200);
    expect(JSON.parse(data.body).product).toEqual({
      description: "Short Product Description1",
      id: "1",
      price: 24,
      title: "ProductOne",
    });
  });
  it("getProductsById test2", async () => {
    const data = await getProductsById({
      pathParameters: {
        productId: "10",
      },
    });
    expect(data.statusCode).toBe(404);
    expect(JSON.parse(data.body).message).toEqual("Product not found");
  });
});
