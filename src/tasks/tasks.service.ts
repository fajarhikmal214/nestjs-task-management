import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from './task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository)
    private taskRepository: TaskRepository,
  ) {}

  async getAllTasks(getTasksFilterDto: GetTasksFilterDto): Promise<Task[]> {
    return this.taskRepository.getAllTasks(getTasksFilterDto);
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne(id);

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return task;
  }

  createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    return this.taskRepository.createTask(createTaskDto);
  }

  async updateTaskById(
    id: string,
    updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    const { title, description, status } = updateTaskDto;

    const task = await this.getTaskById(id);
    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.status = status ?? task.status;

    await this.taskRepository.save(task);
    return task;
  }

  async updateTaskStatusById(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<Task> {
    const { status } = updateTaskStatusDto;
    const task = await this.getTaskById(id);

    task.status = status;
    await this.taskRepository.save(task);

    return task;
  }

  async deleteTaskById(id: string): Promise<void> {
    const taskDeleted = await this.taskRepository.delete(id);

    if (taskDeleted.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }
}
