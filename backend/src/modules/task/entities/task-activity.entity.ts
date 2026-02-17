import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Task } from './task.entity';
import { EmployeeProfile } from '../../employee/entities/employee-profile.entity';
import { TaskStatus } from '../../../shared/enum/task/task-status.enum';

@Entity('task_activity')
export class TaskActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: 'CASCADE' })
  task: Task;

  @Column({ name: 'old_status', type: 'enum', enum: TaskStatus })
  oldStatus: TaskStatus;

  @Column({ name: 'new_status', type: 'enum', enum: TaskStatus })
  newStatus: TaskStatus;

  @ManyToOne(() => EmployeeProfile, { nullable: false })
  changedBy: EmployeeProfile;

  @Column({ name: 'change_reason', nullable: true })
  changeReason: string;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamp' })
  changedAt: Date;
}

