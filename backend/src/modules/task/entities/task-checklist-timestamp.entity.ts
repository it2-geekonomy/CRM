import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { TaskChecklist } from './task-checklist.entity';


@Entity('task_checklist_timestamps')
export class TaskChecklistTimestamp {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => TaskChecklist, (checklist) => checklist.timestamps, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'checklist_id' })
    checklist: TaskChecklist;

    @Column({ type: 'date' })
    date: string;

    @Column({ type: 'int' })
    hours: number;

    @Column({ type: 'int' })
    minutes: number;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}