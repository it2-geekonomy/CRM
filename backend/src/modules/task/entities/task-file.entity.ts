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

@Entity('task_files')
export class TaskFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type?: string;

  @ManyToOne(() => EmployeeProfile, { nullable: false })
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: EmployeeProfile;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamp' })
  uploadedAt: Date;
}