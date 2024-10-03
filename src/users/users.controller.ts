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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('users')
@ApiTags('User')
@UsePipes(new ValidationPipe())
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/status-update')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Update user account status' })
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    description: 'The ID of the user whose status is being updated.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: ChangeAccountStatusDto,
    description: 'DTO for updating account status',
  })
  @ApiResponse({
    status: 200,
    description: 'The user account status has been updated',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiOperation({ summary: 'Get user profile' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'The user profile has been retrieved',
    type: User,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async profile(@Request() req: any): Promise<User> {
    const user = req.user;
    const result = await this.usersService.getProfile(user.id);
    return result;
  }
}
