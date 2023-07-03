import { S3Event } from "aws-lambda";
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {SendMessageCommand, SQSClient} from "@aws-sdk/client-sqs";
import { Readable } from "stream";
import csvParser from "csv-parser";
import * as console from "console";

const s3Client = new S3Client({ region: "eu-west-1" });
const sqsClient = new SQSClient({ region: "eu-west-1" });
export const handler = async (event: S3Event) => {

  const result: Array<any> = []

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
      csvParser({strict: true})
    );

    for await (const record of parser) {
        result.push(record)
        console.log(`${objectKey} data No ${result.length + 1}`, record);
        try {
          const messageResult = await sqsClient.send(new SendMessageCommand({
            QueueUrl: 'https://sqs.eu-west-1.amazonaws.com/642155392726/catalog-items-queue',
            MessageBody: JSON.stringify(record),
          }));
        } catch (error) {
          console.error(`Error sending message to SQS: ${error}`);
        }
    }

    parser.on("end", async () => {

      console.log("result ", result);

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
