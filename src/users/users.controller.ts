import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangeAccountStatusDto } from './dto';
import { User } from './entities';
import { JwtAuthGuard } from 'src/auth';

@Controller('users')
@UsePipes(new ValidationPipe())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // @UseGuards(JwtAuthGuard)
  @Patch(':id/status-update')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('id') id: string,
    @Body() changeAccountStatusDto: ChangeAccountStatusDto,
  ): Promise<User> {
    const result = await this.usersService.changeAccountStatus({
      id,
      ...changeAccountStatusDto,
    });
    return result;
  }

  @Get('profile')
  // @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async profile(@Request() req: any) {
    return req.user;
  }
}
