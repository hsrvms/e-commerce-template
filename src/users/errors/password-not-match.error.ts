import { HttpException, HttpStatus } from '@nestjs/common';

export class PasswordNotMatchError extends HttpException {
  constructor() {
    super('errors.PASSWORD_NOT_MATCH', HttpStatus.FORBIDDEN);
  }
}
