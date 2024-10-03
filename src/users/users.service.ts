import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDto, SignupDto } from 'src/auth/dto';
import { Repository } from 'typeorm';
import { User } from './entities';
import {
  CannotChangeToSameStateError,
  EmailIsTakenError,
  PasswordNotMatchError,
  UserNotFoundError,
} from './errors';
import { encrypt, matchPassword } from './helpers';
import { ChangeStatusRequest } from './interfaces';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(signupDto: SignupDto): Promise<User> {
    const existingUser = await this.usersRepository.findOneBy({
      email: signupDto.email,
    });

    if (existingUser) {
      throw new EmailIsTakenError();
    }
    const newUser = this.usersRepository.create({
      ...signupDto,
      password: await encrypt(signupDto.password),
    });
    const result = await this.usersRepository.save(newUser);

    return result;
  }

  async findByEmailAndPassword(loginDto: LoginDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({
      email: loginDto.email,
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    await this._verifyPassword(loginDto.password, user.password);
    return user;
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  async changeAccountStatus(
    changeStatusRequest: ChangeStatusRequest,
  ): Promise<User> {
    const user = await this.usersRepository.findOneBy({
      id: changeStatusRequest.id,
    });

    if (!user) {
      throw new UserNotFoundError();
    }

    await this._verifyPassword(changeStatusRequest.password, user.password);

    if (user.accountState === changeStatusRequest.state) {
      throw new CannotChangeToSameStateError();
    }

    user.accountState = changeStatusRequest.state;
    const result = this.usersRepository.save(user);
    return result;
  }

  private async _verifyPassword(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<void> {
    const passwordMatch = await matchPassword(
      plainTextPassword,
      hashedPassword,
    );

    if (!passwordMatch) {
      throw new PasswordNotMatchError();
    }
  }
}
