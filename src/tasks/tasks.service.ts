import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
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

  async deleteTaskById(id: string, user: User): Promise<void> {
    const taskDeleted = await this.taskRepository.delete({
      id,
      user,
    });

    if (taskDeleted.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }
}
