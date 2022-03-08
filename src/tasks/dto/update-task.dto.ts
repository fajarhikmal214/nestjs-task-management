/* eslint-disable prettier/prettier */
import { TaskStatus } from '../task.model';
 
export class UpdateTaskDto {
  title: string;
  description: string;
  status: TaskStatus;
}