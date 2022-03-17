import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';

const mockTasksRepository = () => ({
  getAllTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

const mockUser = {
  id: 'someId',
  username: 'someUsername',
  password: 'somePassword',
  hashPassword: jest.fn(),
  tasks: [],
};

const mockTask = {
  id: 'someId',
  title: 'someTitle',
  description: 'someDescription',
  status: TaskStatus.OPEN,
};

describe('TaskService', () => {
  let tasksService: TasksService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTasksRepository },
      ],
    }).compile();

    tasksService = await module.get(TasksService);
    taskRepository = await module.get(TaskRepository);
  });

  describe('getAllTasks', () => {
    it('should get all tasks', async () => {
      taskRepository.getAllTasks.mockResolvedValue('someValue');

      const result = await tasksService.getAllTasks(null, mockUser);
      expect(result).toEqual('someValue');
    });

    it('should get all tasks with filters', async () => {
      taskRepository.getAllTasks.mockResolvedValue([
        mockTask,
        mockTask,
        mockTask,
      ]);

      const filters = { status: TaskStatus.OPEN, search: 'someSearch' };

      const result = await tasksService.getAllTasks(filters, mockUser);

      expect(taskRepository.getAllTasks).toHaveBeenCalledWith(
        filters,
        mockUser,
      );
      expect(result).toEqual([mockTask, mockTask, mockTask]);
      expect(result.length).toEqual(3);
    });
  });

  describe('getTaskById', () => {
    it('should get task by id', async () => {
      await taskRepository.findOne.mockResolvedValue(mockTask);

      const result = await tasksService.getTaskById('someId', mockUser);
      expect(result).toEqual(mockTask);
    });

    it('should throw an error if task is not found', async () => {
      await taskRepository.findOne.mockResolvedValue(null);

      const id = 'someId';
      expect(tasksService.getTaskById(id, mockUser)).rejects.toThrow(
        new NotFoundException(`Task with ID "${id}" not found`),
      );
    });
  });

  describe('createTask', () => {
    it('should create a task', async () => {
      await taskRepository.createTask.mockResolvedValue(mockTask);

      const result = await tasksService.createTask(
        {
          title: 'someTitle',
          description: 'someDescription',
        },
        mockUser,
      );

      expect(result).toEqual(mockTask);
    });
  });

  describe('updateTaskById', () => {
    it('should update a task', async () => {
      await taskRepository.findOne.mockResolvedValue(mockTask);
      await taskRepository.save.mockResolvedValue(mockTask);

      const result = await tasksService.updateTaskById(
        'someId',
        {
          title: 'someTitle',
          description: 'someDescription',
          status: TaskStatus.OPEN,
        },
        mockUser,
      );

      expect(result).toEqual(mockTask);
    });

    it('should throw an error if task is not found', async () => {
      await taskRepository.findOne.mockResolvedValue(null);

      const id = 'someId';
      expect(
        tasksService.updateTaskById(
          id,
          {
            title: 'someTitle',
            description: 'someDescription',
            status: TaskStatus.OPEN,
          },
          mockUser,
        ),
      ).rejects.toThrow(
        new NotFoundException(`Task with ID "${id}" not found`),
      );
    });
  });

  describe('updateTaskStatusById', () => {
    it('should update task status', async () => {
      await taskRepository.findOne.mockResolvedValue(mockTask);
      await taskRepository.save.mockResolvedValue(mockTask);

      const result = await tasksService.updateTaskStatusById(
        'someId',
        { status: TaskStatus.OPEN },
        mockUser,
      );

      expect(result).toEqual(mockTask);
    });

    it('should throw an error if task is not found', async () => {
      await taskRepository.findOne.mockResolvedValue(null);

      const id = 'someId';
      expect(
        tasksService.updateTaskStatusById(
          id,
          { status: TaskStatus.OPEN },
          mockUser,
        ),
      ).rejects.toThrow(
        new NotFoundException(`Task with ID "${id}" not found`),
      );
    });
  });

  describe('deleteTaskById', () => {
    it('should delete a task', async () => {
      await taskRepository.delete.mockResolvedValue({
        affected: 1,
      });

      const result = await tasksService.deleteTaskById('someId', mockUser);
      expect(result).toBeUndefined();
    });

    it('should throw an error if task is not found', async () => {
      await taskRepository.delete.mockResolvedValue({
        affected: 0,
      });

      const id = 'someId';
      expect(tasksService.deleteTaskById(id, mockUser)).rejects.toThrow(
        new NotFoundException(`Task with ID "${id}" not found`),
      );
    });
  });
});
