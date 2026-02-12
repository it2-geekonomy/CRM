import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Task } from './task.entity';
import { EmployeeProfile } from '../../employee/entities/employee-profile.entity';

@Entity('task_files')
export class TaskFile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: 'CASCADE' })
  task: Task;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'file_type', nullable: true })
  fileType: string;

  @ManyToOne(() => EmployeeProfile, { nullable: false })
  uploadedBy: EmployeeProfile;

  @CreateDateColumn({ name: 'uploaded_at', type: 'timestamp' })
  uploadedAt: Date;
}

