import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToMany
} from 'typeorm';
import { Department } from '../../department/entities/department.entity';
import { Task } from '../../task/entities/task.entity';
import { TaskTypeStatus } from '../../../shared/enum/task/task-type-status.enum';

@Entity('task_types')
export class TaskType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @ManyToOne(() => Department, { nullable: false })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @Column({ type: 'boolean', default: true })
    billable: boolean;

    @Column({ name: 'sla_hours', type: 'int', nullable: true })
    slaHours?: number;

    @Column({
        type: 'enum',
        enum: TaskTypeStatus,
        default: TaskTypeStatus.ACTIVE,
    })
    status: TaskTypeStatus;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Task, (task) => task.taskType)
    tasks: Task[];
}