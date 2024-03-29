import { Injectable } from '@nestjs/common';
import S3Config from '../../config/S3Config';
import { GetObjectCommand, GetObjectCommandOutput, S3, S3Client } from '@aws-sdk/client-s3';
import { S3Event } from 'aws-lambda';
import sharp from 'sharp';



@Injectable()
export class ThumbnailServiceService {
  private s3Client: S3Client;
  private s3: S3;

  constructor(private s3Config: S3Config) {
    this.s3Client = this.s3Config.s3Client();
    this.s3 = this.s3Config.s3();
  }

  async createThumbnail(s3Event: S3Event): Promise<void> {
    const bucket = s3Event.Records[0].s3.bucket.name;
    const key = s3Event.Records[0].s3.object.key;

    const srcKey = decodeURIComponent(key.replace(/\+/g, ' '));
    const srcBucket = decodeURIComponent(bucket.replace(/\+/g, ' '));

    const destinationBucket = srcBucket;
    const destinationKey = 'thumbnail/' + srcKey;

    // Infer the image type from the file suffix.
    // const typeMatch = srcKey.match(/\.([^.]*)$/);
    // if (!typeMatch) {
    //   console.log('Could not determine the image type.');
    //   return;
    // }

    // Check that the image type is supported
    // const imageType = typeMatch[1].toLowerCase();
    // if (imageType != 'jpg' && imageType != 'png') {
    //   console.log(`Unsupported image type: ${imageType}`);
    //   return;
    // }

    let origimage: GetObjectCommandOutput;
    try {
      const params: GetObjectCommand = new GetObjectCommand({
        Bucket: srcBucket,
        Key: srcKey,
      });
      origimage = await this.s3Client.send(params);
    } catch (err) {
      console.log('get obj error ', err);
      return;
    }
    // set thumbnail width. Resize will set the height automatically to maintain aspect ratio.
    const width = 100;

    // Use the sharp module to resize the image and save in a buffer.
    let buffer;
    try {
      const byteArray = await origimage.Body.transformToByteArray();
      buffer = await sharp(byteArray).resize(width).toBuffer();
    } catch (error) {
      console.log('error while creating thumbnail', error);
      return;
    }

    // Upload the thumbnail image to the destination bucket
    try {
      const destparams = {
        Bucket: destinationBucket,
        Key: destinationKey,
        Body: buffer,
        ContentType: 'image',
      };

      this.s3.putObject(destparams).then((data) => {
        console.log(
          'Successfully resized ' +
            srcBucket +
            '/' +
            srcKey +
            ' and uploaded to ' +
            destinationBucket +
            '/' +
            destinationKey,
        );
      });
    } catch (error) {
      console.log(error);
      return;
    }
  }
}
