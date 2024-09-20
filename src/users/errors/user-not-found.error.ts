import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundError extends HttpException {
  constructor() {
    super('errors.USER_NOT_FOUND', HttpStatus.NOT_FOUND);
  }
}
