import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

export class PermissionException {
  constructor(public message: string) {}
}

@Catch(PermissionException)
export class PermissionExceptionFilter implements ExceptionFilter {
  catch(exception: PermissionException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(402).json({
      statusCode: 402,
      timestamp: new Date().toISOString(),
      message: exception.message,
    });
  }
}
