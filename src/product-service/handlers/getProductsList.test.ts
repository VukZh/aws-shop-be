import { handler } from "./getProductsList";
import { getProductsList } from "../../product-service/pg-db/products";

jest.mock("../../product-service/pg-db/products");

const ProductsMock = [
  {
    count: 3,
    description: "desc 1",
    id: "2",
    price: 20,
    title: "Title1",
  },
];
describe("getProductsList", () => {
  it("getProductsList test", async () => {
    getProductsList.mockReturnValueOnce(Promise.resolve(ProductsMock));
    const data = await handler();
    expect(data.statusCode).toBe(200);
    expect(data.body).toStrictEqual(JSON.stringify(ProductsMock));
    expect(JSON.parse(data.body).length).toBe(1);
  });
});
