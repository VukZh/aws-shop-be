import { S3Event } from "aws-lambda";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Readable } from "stream";
import csvParser from "csv-parser";
import * as console from "console";

const s3Client = new S3Client({ region: "eu-west-1" });
export const handler = async (event: S3Event) => {
  console.log("event", JSON.stringify(event));

  try {
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = event.Records[0].s3.object.key;
    if (!objectKey.startsWith('uploaded/')) return;

    const { Body } = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      })
    );

    const s3ReadStream = Body as Readable;

    const parser = s3ReadStream.pipe(
      csvParser({
        mapValues: ({ header, index, value }) =>
          console.log(`row from ${objectKey} > ${value}`),
      })
    );

    parser.on("data", async (data) => {
      console.log("data", data);
    });

    parser.on("end", async () => {
      await s3Client.send(
        new CopyObjectCommand({
          Bucket: bucketName,
          CopySource: `${bucketName}/${objectKey}`,
          Key: `parsed/${objectKey.replace("uploaded/", "")}`,
        })
      );

      console.log(`${objectKey} copied`);

      await s3Client.send(
        new DeleteObjectCommand({ Bucket: bucketName, Key: objectKey })
      );

      console.log(`${objectKey} deleted`);
    });

    parser.on("error", (error) => {
      console.log("error", error);
      throw "CSV parsing error";
    });
  } catch (error) {
    console.error(error);
  }
};
