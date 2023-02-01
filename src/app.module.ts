import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ElasticClientConfig } from './config/ElasticClientConfig';
import { SearchController } from './controller/search/search.controller';
import { SearchService } from './service/search-service/search.service';

@Module({
  imports: [],
  controllers: [AppController, SearchController],
  providers: [AppService, ElasticClientConfig, SearchService],
})
export class AppModule {}
