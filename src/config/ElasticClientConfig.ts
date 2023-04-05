import { Client } from '@elastic/elasticsearch';
import { Injectable } from '@nestjs/common';
import { BasicAuth } from '@elastic/transport/lib/types';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ElasticClientConfig {

  constructor(private config: ConfigService) {
  }

  public createClient() {
    const auth: BasicAuth = {
      username: this.config.get<string>('ELASTICSEARCH_USERNAME'),
      password: this.config.get<string>('ELASTICSEARCH_PASSWORD'),
    };
    return new Client({
      node: 'http://localhost:9200',
      auth: auth,
    });
  }
}
