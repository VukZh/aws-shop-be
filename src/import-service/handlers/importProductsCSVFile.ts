import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { APIGatewayProxyEvent } from "aws-lambda";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { buildResponse } from "~/product-service/handlers/helpers";

const s3Client = new S3Client({ region: "eu-west-1" });
export const handler = async (
  event: APIGatewayProxyEvent,
) => {
  try {
    const fileName = event.queryStringParameters?.name;
    if (!fileName) {
      return buildResponse(
        400,
        JSON.stringify({ message: "Missing file name" })
      );
    }

    const command = new PutObjectCommand({
      Bucket: "aws-course-import-products-vuk",
      Key: `uploaded/${fileName}`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 15 * 60,
    });

    return buildResponse(200, { signedUrl });

  } catch (error) {
    console.error(error);
    return buildResponse(500, "Create signed URL error");
  }
};