import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./s3.js";

export const deleteFromS3 = async (fileUrl) => {
  try {
    // extract key from URL
    const url = new URL(fileUrl);
    
    const key = decodeURIComponent(
      url.pathname.replace(/^\/+/, "")
    );

    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    await s3.send(command);

  } catch (err) {
    console.error("S3 delete error:", err);
  }
};