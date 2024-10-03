import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangeAccountStatusDto } from './dto';
import { User } from './entities';
import { JwtAuthGuard } from 'src/guards';

@Controller('users')
@UsePipes(new ValidationPipe())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  async profile(@Request() req: any): Promise<User> {
    const user = req.user;
    const result = await this.usersService.getProfile(user.id);
    return result;
  }
}
