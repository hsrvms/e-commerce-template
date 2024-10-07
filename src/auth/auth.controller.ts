import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginDto, SignupDto } from './dto';
import { LocalAuthGuard } from '../guards';
import { AuthService } from './services/auth.service';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { User } from 'src/users';
import { Throttle } from '@nestjs/throttler';
import { Public } from './decorators';

@Controller('auth')
@ApiTags('Auth')
@UsePipes(new ValidationPipe())
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @ApiOperation({ summary: 'Sign up a new user.' })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiBody({ type: SignupDto })
  async signup(@Body() signupDto: SignupDto): Promise<User> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Throttle({
    long: { limit: 5, ttl: 60 * 1000, blockDuration: 5 * 60 * 1000 },
  })
  @ApiOperation({ summary: 'Login a user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully logged in',
    schema: { example: { access_token: 'your jwt token' } },
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiBody({ type: LoginDto, description: 'User login credentials' })
  async login(@Request() req: any): Promise<{ access_token: string }> {
    return this.authService.login(req.user);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logs out the authenticated user by blacklisting their JWT token',
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged out',
    schema: { example: { message: 'Successfuly logged out' } },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Request() req: any,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    const token = req.headers.authorization.split(' ')[1];
    await this.authService.logout(token);
    return { message: i18n.t('info.SUCCESSFULLY_LOGGED_OUT') };
  }
}
