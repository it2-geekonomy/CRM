import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Task } from './task.entity';
import { EmployeeProfile } from '../../employee/entities/employee-profile.entity';

@Entity('task_comments')
export class TaskComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: 'CASCADE' })
  task: Task;

  @Column({ type: 'text' })
  commentText: string;

  @ManyToOne(() => EmployeeProfile, { nullable: false })
  createdBy: EmployeeProfile;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}

