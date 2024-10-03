import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './services/auth.service';
import { JwtAuthGuard, LocalAuthGuard } from 'src/guards';
import { SignupDto } from './dto';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/generated/i18n.generated';
import { Reflector } from '@nestjs/core';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let i18n: I18nContext<I18nTranslations>;

  const mockAuthService = {
    signup: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
  };
  const mockI18nContext = {
    t: jest.fn().mockReturnValue('Successfully logged out.'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .overrideGuard(LocalAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    i18n = mockI18nContext as unknown as I18nContext<I18nTranslations>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('signup', () => {
    it('should call authService.signup and the created user', async () => {
      const signupDto: SignupDto = {
        email: 'test@user.com',
        username: 'testUser',
        password: 'testPassword',
      };
      const createdUser = {
        id: '1',
        username: 'testUser',
        email: 'test@user.com',
      };

      mockAuthService.signup.mockResolvedValue(createdUser);
      const result = await controller.signup(signupDto);

      expect(result).toEqual(createdUser);
      expect(authService.signup).toHaveBeenCalledWith(signupDto);
    });
  });

  describe('login', () => {
    it('should call authService.login and return the token', async () => {
      const user = { id: '1', email: 'test@user.com' };
      const token = { access_token: 'jwt-token' };
      mockAuthService.login.mockResolvedValue(token);

      const req = { user };
      const result = await controller.login(req);

      expect(result).toEqual(token);
      expect(authService.login).toHaveBeenCalledWith(req.user);
    });

    it('should apply LocalAuthGuard to login route', () => {
      const guards = Reflect.getMetadata('__guards__', controller.login);

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(1);
      expect(guards[0]).toBe(LocalAuthGuard);
    });
  });

  describe('logout', () => {
    it('should call authService.logout and return success message', async () => {
      const token = 'jwt-token';
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      const result = await controller.logout(req, i18n);
      expect(i18n.t).toHaveBeenCalledWith('info.SUCCESSFULLY_LOGGED_OUT');
      expect(result).toEqual({ message: 'Successfully logged out.' });
      expect(authService.logout).toHaveBeenCalledWith(token);
    });

    it('should apply JwtAuthGuard to logout route', () => {
      const guards = Reflect.getMetadata('__guards__', controller.logout);

      expect(guards).toBeDefined();
      expect(guards).toHaveLength(1);
      expect(guards[0]).toBe(JwtAuthGuard);
    });
  });
});
