import { Injectable, OnModuleInit } from '@nestjs/common';
import * as client from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  public httpRequests!: client.Counter<string>;

  onModuleInit() {
    // collect default metrics (CPU, memory, etc.)
    client.collectDefaultMetrics();

    this.httpRequests = new client.Counter({
      name: 'http_requests_total',
      help: 'Total number of requests',
      labelNames: ['method', 'route', 'status'],
    });
  }

  getMetrics() {
    return client.register.metrics();
  }

  getContentType() {
    return client.register.contentType;
  }
}