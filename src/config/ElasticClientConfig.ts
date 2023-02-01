import { Client } from '@elastic/elasticsearch';
import { Injectable } from '@nestjs/common';
import { BasicAuth } from '@elastic/transport/lib/types';

@Injectable()
export class ElasticClientConfig {
  public createClient() {
    const auth: BasicAuth = {
      username: 'elastic',
      password: 'changeme',
    };
    return new Client({
      node: 'http://localhost:9200',
      auth: auth,
    });
  }
}
