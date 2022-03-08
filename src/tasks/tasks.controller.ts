import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task, TaskStatus } from './task.model';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  getTasks(@Query() getTasksFilterDto: GetTasksFilterDto): Task[] {
    if (Object.keys(getTasksFilterDto).length) {
      return this.tasksService.getAllTasksWithFilter(getTasksFilterDto);
    } else {
      return this.tasksService.getAllTasks();
    }
  }

  @Get('/:id')
  getTaskById(@Param('id') id: string): Task {
    return this.tasksService.getTaskById(id);
  }

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto): Task {
    return this.tasksService.createTask(createTaskDto);
  }

  @Patch('/:id')
  updateTaskById(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Task {
    return this.tasksService.updateTaskById(id, updateTaskDto);
  }

  @Patch('/:id/status')
  updateTaskStatusById(
    id: string,
    @Body() updateTaskStatusById: UpdateTaskStatusDto,
  ): Task {
    return this.tasksService.updateTaskStatusById(id, updateTaskStatusById);
  }

  @Delete('/:id')
  deleteTask(@Body('id') id: string): void {
    return this.tasksService.deleteTaskById(id);
  }
}
