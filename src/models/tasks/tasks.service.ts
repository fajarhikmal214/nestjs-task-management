import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';
import { User } from '../../authentication/user.entity';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
    private readonly configService: ConfigService,
  ) {}

  async getAllTasks(
    getTasksFilterDto: GetTasksFilterDto,
    user: User,
  ): Promise<Task[]> {
    return this.taskRepository.getAllTasks(getTasksFilterDto, user);
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({ id, user });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto, user);
  }

  async updateTaskById(
    id: string,
    updateTaskDto: UpdateTaskDto,
    user: User,
  ): Promise<Task> {
    const { title, description, status } = updateTaskDto;

    const task = await this.getTaskById(id, user);
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;

    await this.taskRepository.save(task);
    return task;
  }

  async updateTaskStatusById(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
    user: User,
  ): Promise<Task> {
    const { status } = updateTaskStatusDto;
    const task = await this.getTaskById(id, user);

    task.status = status;
    await this.taskRepository.save(task);

    return task;
  }

  async deleteTaskById(id: string, user: User): Promise<Task> {
    try {
      const task = await this.getTaskById(id, user);
      const taskDeleted = await this.taskRepository.delete(task);

      if (taskDeleted.affected === 0) {
        throw new NotFoundException(`Task with ID "${id}" not found`);
      }

      return task;
    } catch (error) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async addEvidence(
    user: User,
    id: string,
    buffer: Buffer,
    filename: string,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    try {
      const s3 = new S3();

      if (task.filePath) {
        await s3
          .deleteObject({
            Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
            Key: task.filePath,
          })
          .promise();
      }

      const uploadResult = await s3
        .upload({
          Bucket: this.configService.get('AWS_PUBLIC_BUCKET_NAME'),
          Body: buffer,
          Key: `${Date.now()}-${filename}`,
        })
        .promise();

      (task.filePath = uploadResult.Key),
        (task.fileUrl = uploadResult.Location);
      await this.taskRepository.save(task);

      return task;
    } catch (error) {
      throw new Error('Upload Evidence Failed');
    }
  }
}
