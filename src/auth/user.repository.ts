import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { User } from './user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<User> {
    const { username, password } = authCredentialsDto;

    const user = this.create({
      username,
      password,
    });

    try {
      await this.save(user);
      return user;
    } catch (error) {
      // Duplicate Username
      if (error.code === '23505') {
        throw new ConflictException('Username already taken');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
