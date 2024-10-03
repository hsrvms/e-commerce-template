import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity<T> {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({
    description: 'The unique identifier of the entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @CreateDateColumn()
  @Exclude()
  @ApiHideProperty()
  created_at: Date;

  @UpdateDateColumn()
  @Exclude()
  @ApiHideProperty()
  updated_at: Date;

  @DeleteDateColumn()
  @Exclude()
  @ApiHideProperty()
  deleted_at: Date;

  constructor(entity: Partial<T>) {
    Object.assign(this, entity);
  }
}
