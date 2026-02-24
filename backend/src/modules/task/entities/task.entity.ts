import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EmployeeProfile } from '../../employee/entities/employee-profile.entity';
import { TaskStatus } from '../../../shared/enum/task/task-status.enum';
import { Project } from '../../projects/entities/project.entity';
import { TaskPriority } from '../../../shared/enum/task/task-priority.enum';
import { TaskType } from '../../task-type/entities/task-type.entity';
@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ type: 'time' })
  endTime: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    enumName: 'task_status_enum',
    default: TaskStatus.IN_PROGRESS,
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    enumName: 'task_priority_enum',
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Column({ name: 'project_id' })
  projectId: string;

  @Column({ name: 'assigned_to_id' })
  assignedToId: string;

  @Column({ name: 'assigned_by_id' })
  assignedById: string;

  @ManyToOne(() => EmployeeProfile, { nullable: false })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: EmployeeProfile;

  @ManyToOne(() => EmployeeProfile, { nullable: false })
  @JoinColumn({ name: 'assigned_by_id' })
  assignedBy: EmployeeProfile;

  @ManyToOne(() => Project, (project) => project.tasks, { nullable: false })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => TaskType, (taskType) => taskType.tasks)
  @JoinColumn({ name: 'task_type_id' })
  taskType: TaskType;

}
