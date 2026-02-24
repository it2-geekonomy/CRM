import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { EmployeeProfile } from '../../employee/entities/employee-profile.entity';
import { TaskStatus } from '../../../shared/enum/task/task-status.enum';

@Entity('task_activity')
export class TaskActivity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'old_status', type: 'enum', enum: TaskStatus })
  oldStatus: TaskStatus;

  @Column({ name: 'new_status', type: 'enum', enum: TaskStatus })
  newStatus: TaskStatus;

  @ManyToOne(() => EmployeeProfile, { nullable: false })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: EmployeeProfile;

  @Column({ name: 'change_reason', type: 'varchar', nullable: true })
  changeReason: string;

  @CreateDateColumn({ name: 'changed_at', type: 'timestamp' })
  changedAt: Date;
}