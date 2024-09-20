import { HttpException, HttpStatus } from '@nestjs/common';

export class PasswordIsWeakError extends HttpException {
  constructor(reasons: string[]) {
    super(
      { message: 'errors.PASSWORD_IS_WEAK', reasons },
      HttpStatus.EXPECTATION_FAILED,
    );
  }
}
