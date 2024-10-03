import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from 'src/guards';
import { ChangeAccountStatusDto } from './dto';
import { User } from './entities';
import { AccountStates } from './enums';
import { UserNotFoundError } from './errors';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const mockUsersService = {
      changeAccountStatus: jest.fn(),
      getProfile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: jest
          .fn()
          .mockImplementation((context: ExecutionContext) => {
            // Simulate the user being authenticated
            const req = context.switchToHttp().getRequest();
            req.user = { id: '1', email: 'test@user.com' };
            return true;
          }),
      })
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('update status', () => {
    it('should update user status successfully', async () => {
      const mockUser = { id: '1', accountState: AccountStates.ACTIVE } as User;
      const changeAccountStatusDto: ChangeAccountStatusDto = {
        state: AccountStates.INACTIVE,
        reason: 'test reason',
        password: 'test.passworD5',
      };

      jest
        .spyOn(usersService, 'changeAccountStatus')
        .mockResolvedValue(mockUser);

      const result = await controller.updateStatus('1', changeAccountStatusDto);

      expect(result).toEqual(mockUser);
      expect(usersService.changeAccountStatus).toHaveBeenCalledWith({
        id: '1',
        ...changeAccountStatusDto,
      });
    });
  });

  describe('profile', () => {
    it('should return user profile successfully', async () => {
      const mockUser = { id: '1', email: 'test@user.com' } as User;

      jest.spyOn(usersService, 'getProfile').mockResolvedValue(mockUser);

      const req = { user: { id: '1', email: 'test@user.com' } };
      const result = await controller.profile(req);

      expect(result).toEqual(mockUser);
      expect(usersService.getProfile).toHaveBeenCalledWith('1');
    });

    it('should throw UnauthorizedException when no user is found in the request', async () => {
      jest.spyOn(usersService, 'getProfile').mockImplementation(() => {
        throw new UserNotFoundError();
      });

      const req = { user: { id: '999' } };
      // const result = await controller.profile(req);

      await expect(controller.profile(req)).rejects.toThrow(UserNotFoundError);

      // expect(result).rejects.toThrow(UserNotFoundError);
      expect(usersService.getProfile).toHaveBeenCalledWith('999');
    });
  });
});
