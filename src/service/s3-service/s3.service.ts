import { Injectable } from '@nestjs/common';
import S3Config from '../../config/S3Config';
import { parseUrl } from '@aws-sdk/url-parser';
import { ConfigService } from '@nestjs/config';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { formatUrl } from '@aws-sdk/util-format-url';

@Injectable()
export class S3Service {
  constructor(private s3Config: S3Config, private config: ConfigService) {}

  public getPresignedUrl(key: string): Promise<string> {
    const bucket = this.config.get<string>('AWS_S3_BUCKET');
    const region = this.config.get<string>('AWS_REGION');
    const s3ObjectUrl = parseUrl(
      `https://${bucket}.s3.${region}.amazonaws.com/${key}`,
    );

    return this.s3Config
      .getS3RequestPresigner()
      .presign(new HttpRequest(s3ObjectUrl))
      .then((value) => formatUrl(value))
      .then((value) => {
        return value;
      });
  }
}
