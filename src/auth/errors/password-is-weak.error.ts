import { HttpException, HttpStatus } from '@nestjs/common';

export class PasswordIsWeakError extends HttpException {
  constructor(warnings?: string[]) {
    super(
      { message: 'errors.PASSWORD_IS_WEAK', warnings },
      HttpStatus.EXPECTATION_FAILED,
    );
  }
}
