import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Repository } from 'typeorm';
import { User } from './entities';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  UserNotFoundError,
  CannotChangeToSameStateError,
  EmailIsTakenError,
} from './errors';
import { verifyPassword, encrypt } from 'src/common';
import { SignupDto, LoginDto } from 'src/auth';
import { ChangeStatusRequest } from './interfaces';
import { AccountStates } from './enums';

jest.mock('src/common', () => ({
  encrypt: jest.fn(),
  verifyPassword: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const signupDto: SignupDto = {
        email: 'test@user.com',
        username: 'testUser',
        password: 'testPassword',
      };
      const savedUser = {
        id: '1',
        email: 'test@user.com',
        username: 'testUser',
        password: 'hashedPassword',
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(savedUser);
      mockUserRepository.save.mockReturnValue(savedUser);
      (encrypt as jest.Mock).mockResolvedValue('hashedPassword');

      const result = await service.create(signupDto);

      expect(result).toEqual(savedUser);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        email: signupDto.email,
      });
      expect(repository.create).toHaveBeenCalledWith({
        ...signupDto,
        password: 'hashedPassword',
      });
      expect(repository.save).toHaveBeenCalledWith(savedUser);
      expect(encrypt).toHaveBeenCalledWith(signupDto.password);
    });

    it('should throw EmailIsTakenError if email is already taken', async () => {
      const signupDto: SignupDto = {
        email: 'test@user.com',
        username: 'testUser',
        password: 'testPassword',
      };
      const existingUser = {
        id: '1',
        email: 'test@user.com',
        username: 'testUser',
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(existingUser);
      await expect(service.create(signupDto)).rejects.toThrow(
        EmailIsTakenError,
      );
      expect(repository.findOneBy).toHaveBeenCalledWith({
        email: signupDto.email,
      });
    });
  });

  describe('findByEmailAndPassword', () => {
    it('should find user by email and validate password', async () => {
      const loginDto: LoginDto = {
        email: 'test@user.com',
        password: 'testPassword',
      };
      const user = {
        id: '1',
        email: 'test@user.com',
        username: 'testUser',
        password: 'hashedPassword',
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(user);
      (verifyPassword as jest.Mock).mockResolvedValue(true);

      const result = await service.findByEmailAndPassword(loginDto);

      expect(result).toEqual(user);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        email: loginDto.email,
      });
      expect(verifyPassword).toHaveBeenCalledWith(
        loginDto.password,
        user.password,
      );
    });

    it('should throw UserNotFoundError if user is not found', async () => {
      const loginDto: LoginDto = {
        email: 'test@user.com',
        password: 'testPassword',
      };

      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findByEmailAndPassword(loginDto)).rejects.toThrow(
        UserNotFoundError,
      );
      expect(repository.findOneBy).toHaveBeenCalledWith({
        email: loginDto.email,
      });
    });
  });

  describe('getProfile', () => {
    it('should return user profile if user exists', async () => {
      const user = { id: '1', email: 'test@user.com' } as User;

      mockUserRepository.findOneBy.mockResolvedValue(user);
      const result = await service.getProfile('1');

      expect(result).toEqual(user);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });

    it('should throw UserNotFoundError if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(service.getProfile('1')).rejects.toThrow(UserNotFoundError);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });
  });

  describe('changeAccountStatus', () => {
    it('should change account status successfully', async () => {
      const changeStatusRequest: ChangeStatusRequest = {
        id: '1',
        reason: 'testReason',
        state: AccountStates.INACTIVE,
        password: 'testPassword',
      };
      const user = {
        id: '1',
        accountState: AccountStates.ACTIVE,
        password: 'hashedPassword',
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(user);
      (verifyPassword as jest.Mock).mockResolvedValue(true);

      const updatedUser = { ...user, accountState: AccountStates.INACTIVE };
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.changeAccountStatus(changeStatusRequest);

      expect(result).toEqual(updatedUser);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: changeStatusRequest.id,
      });
      expect(verifyPassword).toHaveBeenCalledWith(
        changeStatusRequest.password,
        user.password,
      );
      expect(repository.save).toHaveBeenCalledWith({
        ...user,
        accountState: AccountStates.INACTIVE,
      });
    });

    it('should throw CannotChangeToSameStateError if the same state is provided', async () => {
      const changeStatusRequest: ChangeStatusRequest = {
        id: '1',
        reason: 'testReason',
        state: AccountStates.ACTIVE,
        password: 'testPassword',
      };
      const user = {
        id: '1',
        accountState: AccountStates.ACTIVE,
        password: 'hashedPassword',
      } as User;

      mockUserRepository.findOneBy.mockResolvedValue(user);
      (verifyPassword as jest.Mock).mockResolvedValue(true);

      await expect(
        service.changeAccountStatus(changeStatusRequest),
      ).rejects.toThrow(CannotChangeToSameStateError);
    });

    it('should throw UserNotFoundError if user is not found', async () => {
      const changeStatusRequest: ChangeStatusRequest = {
        id: '999',
        reason: 'testReason',
        state: AccountStates.ACTIVE,
        password: 'testPassword',
      };

      mockUserRepository.findOneBy.mockResolvedValue(null);

      await expect(
        service.changeAccountStatus(changeStatusRequest),
      ).rejects.toThrow(UserNotFoundError);
      expect(repository.findOneBy).toHaveBeenCalledWith({
        id: changeStatusRequest.id,
      });
    });
  });
});
