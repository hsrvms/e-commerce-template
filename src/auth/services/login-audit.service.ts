import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginRecord } from '../entities';
import { Repository } from 'typeorm';
import * as moment from 'moment';

@Injectable()
export class LoginAuditService {
  constructor(
    @InjectRepository(LoginRecord)
    private readonly loginRecordsRepository: Repository<LoginRecord>,
  ) {}

  public async recordLogin(userId: string) {
    const timestamp = moment().valueOf().toString();
    const loginEvent = this.loginRecordsRepository.create({
      userId,
      timestamp,
    });

    await this.loginRecordsRepository.save(loginEvent);
  }
}
