import * as bcrypt from 'bcryptjs'
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm'

@Entity('users')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid') id: string

  @Column('varchar', { length: 255 }) email: string

  @Column('varchar', { length: 255 }) name: string

  @Column('text') password: string

  @Column('boolean', { default: false }) confirmed: boolean

  @Column('boolean', { default: false }) forgotPasswordLocked: boolean

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10)
  }
}
