import { ThrottlerGuard } from '@nestjs/throttler';
import {
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected throwThrottlingException(context: ExecutionContext): Promise<void> {
    const handler = context.getHandler();
    let message = 'errors.TOO_MANY_REQUESTS';
    if (handler.name === 'login') {
      message = 'errors.TOO_MANY_LOGIN_ATTEMPTS';
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}
