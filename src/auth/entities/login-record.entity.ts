import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LoginRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  timestamp: string;
}
