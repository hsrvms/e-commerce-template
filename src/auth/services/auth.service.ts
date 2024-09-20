import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccountStates, User, UsersService } from 'src/users';
import { LoginDto, SignupDto } from '../dto';
import { LoginAuditService } from './login-audit.service';
import { AccountWasDeletedError, PasswordIsWeakError } from '../errors';
import * as owasp from 'owasp-password-strength-test';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly loginAuditService: LoginAuditService,
  ) {}

  public async signUp(signupDto: SignupDto): Promise<User> {
    this._verifyPasswordStrength(signupDto.password);
    const result = await this.usersService.create(signupDto);
    return result;
  }

  public async validateUser(loginDto: LoginDto): Promise<User> {
    const user = await this.usersService.findByEmailAndPassword(loginDto);

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

  private _verifyPasswordStrength(password: string) {
    const testResult = owasp.test(password);

    if (testResult.errors.length) {
      console.log('testResults', testResult.errors);
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

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
