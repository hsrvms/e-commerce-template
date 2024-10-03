import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @ApiProperty({
    description: 'The username of the user',
    example: 'john_doe',
  })
  readonly username: string;

  @IsString()
  @ApiProperty({
    description: 'The password of the user',
    example: 'StrongPassword_123!',
  })
  readonly password: string;
}
