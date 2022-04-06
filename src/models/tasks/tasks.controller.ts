import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetUser } from '../../authentication/get-user.decorator';
import { User } from '../../authentication/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './task.entity';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  private logger = new Logger('TasksController');
  constructor(private tasksService: TasksService) {}

  @Get()
  @UseGuards(AuthGuard())
  getTasks(
    @Query() getTasksFilterDto: GetTasksFilterDto,
    @GetUser() user: User,
  ): Promise<Task[]> {
    this.logger.verbose(
      `User "${user.username}" retrieving all tasks. Filters: ${JSON.stringify(
        getTasksFilterDto,
      )}`,
    );
    return this.tasksService.getAllTasks(getTasksFilterDto, user);
  }

  @Get('/:id')
  @UseGuards(AuthGuard())
  getTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
    this.logger.verbose(`User "${user.username}" retrieving task "${id}".`);
    return this.tasksService.getTaskById(id, user);
  }

  @Post()
  @UseGuards(AuthGuard())
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${user.username}" creating a new task. Data: ${JSON.stringify(
        createTaskDto,
      )}`,
    );
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard())
  updateTaskById(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${user.username}" updating task "${id}". Data: ${JSON.stringify(
        updateTaskDto,
      )}`,
    );
    return this.tasksService.updateTaskById(id, updateTaskDto, user);
  }

  @Patch('/:id/status')
  @UseGuards(AuthGuard())
  updateTaskStatusById(
    id: string,
    @Body() updateTaskStatusById: UpdateTaskStatusDto,
    @GetUser() user: User,
  ): Promise<Task> {
    this.logger.verbose(
      `User "${
        user.username
      }" updating task status "${id}" to "${JSON.stringify(
        updateTaskStatusById.status,
      )}".`,
    );
    return this.tasksService.updateTaskStatusById(
      id,
      updateTaskStatusById,
      user,
    );
  }

  @Delete('/:id')
  @UseGuards(AuthGuard())
  deleteTask(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
    this.logger.verbose(`User "${user.username}" deleting task "${id}".`);
    return this.tasksService.deleteTaskById(id, user);
  }

  @Patch('/:id/upload-evidence')
  @UseGuards(AuthGuard())
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadEvidence(
    @GetUser() user: User,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Task> {
    return this.tasksService.addEvidence(
      user,
      id,
      file.buffer,
      file.originalname,
    );
  }
}
