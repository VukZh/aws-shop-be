import * as sinon from "sinon";
import * as S3RequestPresigner from "@aws-sdk/s3-request-presigner";
import { handler } from "./importProductsCSVFile";

jest.mock("@aws-sdk/s3-request-presigner");

describe("importProductsFile test", () => {

  afterEach(function () {
    sinon.restore();
  });

  it("should return a signed URL", async () => {
    const fileName = "test.csv";
    const signedUrl = "https://signed-url.com";

    sinon.stub(S3RequestPresigner, 'getSignedUrl')
      .callsFake(async () => {
        return signedUrl;
      });

    const event = {
      httpMethod: "GET",
      queryStringParameters: {
        name: fileName,
      },
    } as unknown as AWSLambda.APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({ signedUrl }));
  });

  it("should return error 400 ", async () => {

    const signedUrl = "https://signed-url.com";

    sinon.stub(S3RequestPresigner, 'getSignedUrl')
      .callsFake(async () => {
        return signedUrl;
      });

    const event = {
      httpMethod: "GET",
      queryStringParameters: {
        name: undefined,
      },
    } as unknown as AWSLambda.APIGatewayProxyEvent;

    const result = await handler(event);

    expect(result.statusCode).toBe(400);
    expect(result.body.match(/Missing file name/)).not.toBeNull()
  });
});
