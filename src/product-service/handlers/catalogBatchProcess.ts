import { buildResponse } from "../../product-service/handlers/helpers";

import { handler as createProduct } from "../handlers/createProduct";

import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";
import * as console from "console";

const snsClient = new SNSClient({ region: "eu-west-1" });
export const handler = async (event: { Records: Array<any> }) => {
  console.log("event> ", event.Records.length, event.Records[0].body);

  try {
    const promises = event.Records.map(async (record) => {
      const { body } = record;
      const product = JSON.parse(body);

      if (
        !product.description ||
        !product.price ||
        !product.title ||
        !product.count
      )
        throw "It's not a product data";

      await createProduct(record);
      await snsClient.send(
        new PublishCommand({
          Subject: "Add new items file",
          Message: JSON.stringify(product),
          TopicArn: "arn:aws:sns:eu-west-1:642155392726:catalog-items-topic",
          MessageAttributes: {
            count: {
              DataType: "Number",
              StringValue: product.count,
            },
          },
        })
      );
    });

    await Promise.all(promises);

    return buildResponse(201, "All products have been created successfully");
  } catch (error) {
    console.log("error:", error);
    const codeError = error === "Product data is invalid" || error === "It's not a product data" ? 400 : 500;
    const err = buildResponse(codeError, {
      message: error as string,
    });
    return err;
  }
};
