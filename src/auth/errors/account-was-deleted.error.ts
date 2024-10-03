import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountWasDeletedError extends HttpException {
  constructor() {
    super({ message: 'errors.ACCOUNT_WAS_DELETED' }, HttpStatus.GONE);
  }
}
