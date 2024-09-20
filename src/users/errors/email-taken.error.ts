import { HttpException, HttpStatus } from '@nestjs/common';

export class EmailIsTakenError extends HttpException {
  constructor() {
    super('errors.EMAIL_IS_TAKEN', HttpStatus.CONFLICT);
  }
}
