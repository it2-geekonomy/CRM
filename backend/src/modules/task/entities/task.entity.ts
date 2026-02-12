import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmployeeProfile } from '../../employee/entities/employee-profile.entity';
import { TaskStatus } from '../enums/task-status.enum';


@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'task_name', type: 'varchar', length: 255 })
  taskName: string;

  @Column({ name: 'task_description', type: 'text', nullable: true })
  taskDescription?: string;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({
    name: 'task_status',
    type: 'enum',
    enum: TaskStatus,
    enumName: 'task_status_enum',
    default: TaskStatus.IN_PROGRESS,
  })
  taskStatus: TaskStatus;

  @ManyToOne(() => EmployeeProfile, { nullable: false })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: EmployeeProfile;

  @ManyToOne(() => EmployeeProfile, { nullable: false })
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy: EmployeeProfile;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
