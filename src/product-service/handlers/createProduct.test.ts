import { handler as createProduct } from "../handlers/createProduct";

jest.mock("../handlers/createProduct");

const ProductsMock = {
  statusCode: 201,
  body: {
    count: 3,
    description: "desc 1",
    id: "2",
    price: 20,
    title: "Title1",
  },
};
describe("createProduct", () => {
  it("createProduct test", async () => {
    createProduct.mockReturnValueOnce(Promise.resolve(ProductsMock));
    const data = await createProduct({ body: JSON.stringify(ProductsMock) });
    expect(data.statusCode).toBe(201);
  });
});
