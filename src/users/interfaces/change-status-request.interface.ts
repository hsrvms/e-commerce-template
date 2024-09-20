import { ChangeAccountStatusDto } from '../dto';

export interface ChangeStatusRequest extends ChangeAccountStatusDto {
  readonly id: string;
}
