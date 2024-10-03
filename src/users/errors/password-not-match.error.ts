import { HttpException, HttpStatus } from '@nestjs/common';

export class PasswordNotMatchError extends HttpException {
  constructor() {
    super({ message: 'errors.PASSWORD_NOT_MATCH' }, HttpStatus.FORBIDDEN);
  }
}
