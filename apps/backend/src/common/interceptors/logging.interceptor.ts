import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const started = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const ms = Date.now() - started;
          this.logger.log(
            JSON.stringify({
              level: 'info',
              method,
              url,
              durationMs: ms,
              status: context.switchToHttp().getResponse()?.statusCode,
            }),
          );
        },
        error: (error: Error) => {
          const ms = Date.now() - started;
          this.logger.error(
            JSON.stringify({
              level: 'error',
              method,
              url,
              durationMs: ms,
              error: error.message,
            }),
          );
        },
      }),
    );
  }
}
