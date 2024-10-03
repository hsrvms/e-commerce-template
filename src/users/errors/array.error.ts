import { HttpException, HttpStatus } from '@nestjs/common';

export class ArrayError extends HttpException {
  constructor(warnings?: string[]) {
    super({ message: 'errors.TEST_MESSAGE', warnings }, HttpStatus.CONFLICT);
  }
}
