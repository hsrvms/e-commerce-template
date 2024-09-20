import { HttpException, HttpStatus } from '@nestjs/common';

export class CannotChangeToSameStateError extends HttpException {
  constructor() {
    super('errors.CANNOT_CHANGE_TO_SAME_STATE', HttpStatus.CONFLICT);
  }
}
