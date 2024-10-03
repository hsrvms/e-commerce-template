import { HttpException, HttpStatus } from '@nestjs/common';

export class TokenIsBlacklistedError extends HttpException {
  constructor() {
    super({ message: 'errors.TOKEN_IS_BLACKLISTED' }, HttpStatus.UNAUTHORIZED);
  }
}
