import { HttpStatus } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Callback, Context, Handler, S3CreateEvent, S3Event } from 'aws-lambda';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { S3Service } from './service/s3-service/s3.service';
import { ThumbnailServiceService } from './service/thumbnail-service/thumbnail-service.service';

export const handler: Handler = async (
  event: S3Event | S3CreateEvent,
  context: Context,
  callback: Callback,
) => {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const thumbnailService = appContext.get(ThumbnailServiceService);

  const body = await thumbnailService.createThumbnail(event);
  return {
    body: body,
    statusCode: HttpStatus.OK,
  };
};