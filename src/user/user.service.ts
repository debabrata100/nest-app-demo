import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { UserResponseDto } from './dto/user-response.dto';
import { Project } from 'src/project/project.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async create(dto: CreateUserDto) {
    try {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const user = this.userRepository.create({
        ...dto,
        password: hashedPassword,
      });
      this.userRepository.save(user);
      return {
        success: true,
        message: 'User created successfully',
      };
    } catch (err) {
      return {
        success: false,
        message: err,
      };
    }
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.userRepository.find();
    return users;
  }

  async findOne(id: number): Promise<UserResponseDto> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByCondition(condition: Record<string, any>) {
    const user = await this.userRepository.findOne({
      where: {
        ...condition,
      },
    });
    return user;
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    const updatedUser = await this.userRepository.save(user);
    return updatedUser;
  }

  async remove(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userRepository.remove(user);
    return {
      success: true,
      message: 'User removed successfully',
    };
  }

  async saveUser(updateUserDto: UpdateUserDto) {
    const updatedUser = await this.userRepository.save(updateUserDto);
    return updatedUser;
  }

  async assignProjectsToUser(
    userId: number,
    projectIds: number[],
  ): Promise<User | any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['projects'],
    });

    if (!user) throw new NotFoundException('User not found');

    const projects = await this.projectRepository.findByIds(projectIds);
    if (projects.length !== projectIds.length) {
      throw new NotFoundException('One or more projects not found');
    }

    for (const project of projects) {
      project.owner = user;
    }

    await this.projectRepository.save(projects);

    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['projects'],
    });
  }
}
