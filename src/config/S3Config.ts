import { ConfigService } from '@nestjs/config';
import { S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { Hash } from '@aws-sdk/hash-node';
import { Injectable } from '@nestjs/common';
import { S3, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export default class S3Config {
  constructor(private config: ConfigService) {}

  public getS3RequestPresigner(): S3RequestPresigner {
    return new S3RequestPresigner({
      region: this.config.get<string>('AWS_REGION'),
      credentials: {
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
      },
      sha256: Hash.bind(null, 'sha256'),
    });
  }

  public s3(): S3 {
    return new S3({
      region: this.config.get<string>('AWS_REGION'),
      credentials: {
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
      },
    });
  }

  public s3Client(): S3Client {
    return new S3Client({
      region: this.config.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get<string>('AWS_SECRET_ACCESS_KEY'),
      }
    })
  }
}
