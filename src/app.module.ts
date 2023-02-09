import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElasticClientConfig } from './config/ElasticClientConfig';
import { SearchController } from './controller/search/search.controller';
import { SearchService } from './service/search-service/search.service';
import { ConfigModule } from '@nestjs/config';
import S3Config from './config/S3Config';
import { S3Service } from './service/s3-service/s3.service';
import { ThumbnailServiceService } from './service/thumbnail-service/thumbnail-service.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [AppController, SearchController],
  providers: [
    AppService,
    ElasticClientConfig,
    SearchService,
    S3Config,
    S3Service,
    ThumbnailServiceService,
  ],
})
export class AppModule {}
