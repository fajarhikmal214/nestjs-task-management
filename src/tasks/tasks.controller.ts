import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @UseGuards(AuthGuard())
  getTasks(@Query() getTasksFilterDto: GetTasksFilterDto): Promise<Task[]> {
    return this.tasksService.getAllTasks(getTasksFilterDto);
  }

  @Get('/:id')
  @UseGuards(AuthGuard())
  getTaskById(@Param('id') id: string): Promise<Task> {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  createTask(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.createTask(createTaskDto);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard())
  updateTaskById(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.updateTaskById(id, updateTaskDto);
  }

  @Patch('/:id/status')
  @UseGuards(AuthGuard())
  updateTaskStatusById(
    id: string,
    @Body() updateTaskStatusById: UpdateTaskStatusDto,
  ): Promise<Task> {
    return this.tasksService.updateTaskStatusById(id, updateTaskStatusById);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard())
  deleteTask(@Param('id') id: string): Promise<void> {
    return this.tasksService.deleteTaskById(id);
  }
}
