import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.usersRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      password: hash,
      role: dto.role,
      organization: dto.organization,
    });
    const saved = await this.usersRepository.save(user);
    return this.sanitize(saved);
  }

  async findAll(): Promise<User[]> {
    const users = await this.usersRepository.find({ order: { id: 'ASC' } });
    return users.map((u) => this.sanitize(u));
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findByIdSafe(id: number): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return this.sanitize(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async remove(id: number, currentUserId: number): Promise<{ message: string }> {
    if (id === currentUserId) {
      throw new ForbiddenException('Нельзя удалить собственную учётную запись');
    }
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    await this.usersRepository.delete(id);
    return { message: 'Пользователь удалён' };
  }

  private sanitize(user: User): User {
    const { password, ...rest } = user;
    return rest as User;
  }
}
