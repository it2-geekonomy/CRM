import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Task } from './task.entity';

@Entity('task_checklist')
export class TaskChecklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Task, { nullable: false, onDelete: 'CASCADE' })
  task: Task;

  @Column({ name: 'item_name' })
  itemName: string;

  @Column({ name: 'is_completed', default: false })
  isCompleted: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}

