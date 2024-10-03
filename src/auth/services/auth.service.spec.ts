import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users';
import { LoginAuditService } from './login-audit.service';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users';
import { AccountStates } from 'src/users';
import { SignupDto, LoginDto } from '../dto';
import * as owasp from 'owasp-password-strength-test';
import { TestResult } from 'owasp-password-strength-test';
import { PasswordIsWeakError, AccountWasDeletedError } from '../errors';
import { verifyPassword } from 'src/common';

jest.mock('src/common', () => ({
  verifyPassword: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let usersService: UsersService;
  let loginAuditService: LoginAuditService;
  let configService: ConfigService;
  let cacheManager: Cache;
  let testResult: TestResult;

  const mockJwtService = {
    sign: jest.fn(),
    decode: jest.fn(),
  };

  const mockUsersService = {
    create: jest.fn(),
    findByEmailAndPassword: jest.fn(),
  };

  const mockLoginAuditService = {
    recordLogin: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockResolvedValue(3600 * 1000),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: LoginAuditService, useValue: mockLoginAuditService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    usersService = module.get<UsersService>(UsersService);
    loginAuditService = module.get<LoginAuditService>(LoginAuditService);
    configService = module.get<ConfigService>(ConfigService);
    cacheManager = module.get<Cache>(CACHE_MANAGER);
    testResult = {
      errors: [],
      failedTests: [],
      passedTests: [],
      requiredTestErrors: [],
      optionalTestErrors: [],
      isPassphrase: true,
      strong: true,
      optionalTestsPassed: 0,
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signup', () => {
    it('should create a new user successfully after verifying strong password', async () => {
      const signupDto: SignupDto = {
        username: 'testUser',
        email: 'test@user.com',
        password: 'testpassword',
      };
      const createdUser = {
        id: '1',
        email: 'test@user.com',
        username: 'testUser',
      } as User;

      jest.spyOn(owasp, 'test').mockReturnValue({ ...testResult, errors: [] });
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await service.signup(signupDto);

      expect(result).toEqual(createdUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(signupDto);
      expect(owasp.test).toHaveBeenCalledWith(signupDto.password);
    });

    it('should throw PasswordIsWeakError if password does not meet strength requirements', async () => {
      const signupDto: SignupDto = {
        username: 'testUser',
        email: 'test@user.com',
        password: 'testpassword',
      };

      jest
        .spyOn(owasp, 'test')
        .mockReturnValue({ ...testResult, errors: ['Password is weak'] });

      await expect(service.signup(signupDto)).rejects.toThrow(
        PasswordIsWeakError,
      );
    });
  });

  describe('validateUser', () => {
    const loginDto: LoginDto = {
      email: 'test@user.com',
      password: 'testPassword',
    };

    it('should return cached user if found in cache and verify password', async () => {
      const cachedUser = {
        id: '1',
        email: 'test@user.com',
        password: 'hashedPassword',
      } as User;

      mockCacheManager.get.mockResolvedValue(cachedUser);
      jest.spyOn(service, 'validateUser');
      (verifyPassword as jest.Mock).mockResolvedValue(true);
      const result = await service.validateUser(loginDto);

      expect(result).toEqual(cachedUser);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        `user_${loginDto.email}`,
      );
      expect(verifyPassword).toHaveBeenCalledWith(
        loginDto.password,
        cachedUser.password,
      );
    });

    it('should find user by email and password if not found in cache', async () => {
      const user = {
        id: '1',
        email: 'test@user.com',
        password: 'hashedPassword',
      } as User;

      mockCacheManager.get.mockResolvedValue(null);
      mockUsersService.findByEmailAndPassword.mockReturnValue(user);

      const result = await service.validateUser(loginDto);

      expect(result).toEqual(user);
      expect(mockUsersService.findByEmailAndPassword).toHaveBeenCalledWith(
        loginDto,
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `user_${user.email}`,
        user,
      );
    });
  });

  describe('login', () => {
    const user = {
      id: '1',
      email: 'test@user.com',
      accountState: AccountStates.ACTIVE,
    } as User;

    it('should return JWT token for active or inactive user', async () => {
      const token = 'jwt-token';

      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(result).toEqual({ access_token: token });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        username: user.username,
        sub: user.id,
      });
    });

    it('should throw AccountWasDeletedError if user is deleted', async () => {
      user.accountState = AccountStates.DELETED;

      await expect(service.login(user)).rejects.toThrow(AccountWasDeletedError);
    });
  });

  describe('logout', () => {
    it('should blacklist the token and cache it with the expiration time', async () => {
      const token = 'jwt-token';
      const decodedToken = { exp: Date.now() / 1000 + 60 * 60 };

      mockJwtService.decode.mockReturnValue(decodedToken);

      await service.logout(token);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        `blacklist_${token}`,
        token,
        60 * 60 * 1000,
      );
    });
  });

  describe('isTokenBlackListed', () => {
    it('should return true if the token is blacklisted', async () => {
      const token = 'jwt-token';

      mockCacheManager.get.mockResolvedValue(token);

      const result = await service.isTokenBlacklisted(token);

      expect(result).toBe(true);
      expect(cacheManager.get).toHaveBeenCalledWith(`blacklist_${token}`);
    });

    it('should return false if the token is not blacklisted', async () => {
      const token = 'jwt-token';

      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.isTokenBlacklisted(token);

      expect(result).toBe(false);
      expect(cacheManager.get).toHaveBeenCalledWith(`blacklist_${token}`);
    });
  });
});
