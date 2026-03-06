import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('task_checklist')
export class TaskChecklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @Column({ name: 'item_name' })
  itemName: string;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @Column({ type: 'date', nullable: true }) 
  date?: string;

  @Column({ name: 'duration_hours', type: 'int', default: 0, nullable: true })
  durationHours?: number;

  @Column({ name: 'duration_minutes', type: 'int', default: 0, nullable: true })
  durationMinutes?: number;

  @Column({ type: 'text', nullable: true }) 
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}

