import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountStates, User, UsersService } from 'src/users';
import { LoginDto, SignupDto } from '../dto';
import { LoginAuditService } from './login-audit.service';
import { AccountWasDeletedError, PasswordIsWeakError } from '../errors';
import * as owasp from 'owasp-password-strength-test';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { verifyPassword } from 'src/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly loginAuditService: LoginAuditService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  public async signup(signupDto: SignupDto): Promise<User> {
    await this._verifyPasswordStrength(signupDto.password);
    const result = await this.usersService.create(signupDto);
    return result;
  }

  public async validateUser(loginDto: LoginDto): Promise<User> {
    const cachedUser: User | undefined = await this.cacheManager.get(
      `user_${loginDto.email}`,
    );
    let user;
    if (cachedUser) {
      await verifyPassword(loginDto.password, cachedUser.password);
      user = cachedUser;
    } else {
      user = await this.usersService.findByEmailAndPassword(loginDto);
      if (user) {
        await this.cacheManager.set(`user_${user.email}`, user);
      }
    }
    return user;
  }

  public async login(user: User): Promise<{ access_token: string }> {
    const canLogin =
      user.accountState === AccountStates.ACTIVE ||
      user.accountState === AccountStates.INACTIVE;
    if (!canLogin) {
      if (user.accountState === AccountStates.DELETED) {
        throw new AccountWasDeletedError();
      }
    }
    return await this._proceedWithLogin(user);
  }

  public async logout(token: string): Promise<void> {
    const decodedToken = await this.jwtService.decode(token);
    const expirationTime = decodedToken?.exp * 1000 - Date.now();

    if (expirationTime > 0) {
      await this.cacheManager.set(`blacklist_${token}`, token, expirationTime);
    }
  }

  public async isTokenBlacklisted(token: string): Promise<boolean> {
    const cachedToken = await this.cacheManager.get(`blacklist_${token}`);
    return !!cachedToken;
  }

  private async _verifyPasswordStrength(password: string) {
    const testResult = owasp.test(password);

    if (testResult.errors.length) {
      throw new PasswordIsWeakError(testResult.errors);
    }
  }

  private async _proceedWithLogin(user: User): Promise<any> {
    await this.loginAuditService.recordLogin(user.id);

    const payload = {
      email: user.email,
      username: user.username,
      sub: user.id,
    };
    const access_token = this.jwtService.sign(payload);
    const expireTokenInMS =
      this.configService.get<number>('jwt.expiresIn') || 60 * 60 * 1000;

    await this.cacheManager.set(
      `token_${user.email}`,
      access_token,
      expireTokenInMS,
    );
    return {
      access_token,
    };
  }
}
