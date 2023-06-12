import { handler as getProductsList } from "../handlers/getProductsList";

jest.mock("../handlers/getProductsList");

const ProductsMock = {
  statusCode: 200,
  body: [
    {
      count: 3,
      description: "desc 1",
      id: "2",
      price: 20,
      title: "Title1",
    },
  ],
};
describe("getProductsList", () => {
  it("getProductsList test", async () => {
    getProductsList.mockReturnValueOnce(Promise.resolve(ProductsMock));
    const data = await getProductsList();
    expect(data.statusCode).toBe(200);
    expect(data.body.length).toBe(1);
  });
});
