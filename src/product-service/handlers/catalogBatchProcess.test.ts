import { handler } from "./catalogBatchProcess";
import { buildResponse } from "../../product-service/handlers/helpers";
describe("catalogBatchProcess test", () => {

  test("should return 400 if data is not a product data", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            title: "Product 1",
            description: "Description 1",
            count: 10,
          }),
        },
      ],
    };

    const response = await handler(event);

    expect(response).toEqual(
      buildResponse(400, {"message": "It's not a product data"})
    );
  });

  test("should return 201 if product data is valid", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            title: "Product 1",
            description: "Description 1",
            price: 10.99,
            count: 10,
          }),
        },
      ],
    };

    const response = await handler(event);

    expect(response).toEqual(
      buildResponse(201, "All products have been created successfully")
    );
  });

  test("should return 400 if body is not a product data", async () => {
    const event = {
      Records: [
        {
          body: JSON.stringify({
            foo: "bar",
          }),
        },
      ],
    };

    const response = await handler(event);

    expect(response).toEqual(
      buildResponse(400, { message: "It's not a product data" })
    );
  });

});