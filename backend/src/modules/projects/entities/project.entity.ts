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
import { ProjectStatus } from '../../../shared/enum/project/project-status.enum';
import { ProjectType } from '../../../shared/enum/project/project-type.enum';
import { AdminProfile } from '../../admin/entities/admin-profile.entity';
import { EmployeeProfile } from '../../employee/entities/employee-profile.entity';
import { Task } from '../../task/entities/task.entity';
import { ProjectDocument } from './project-document.entity';
import { Client } from '../../client/entities/client.entity';

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', type: 'varchar', length: 150 })
    name: string;

    @Column({ name: 'code', type: 'varchar', length: 50, unique: true })
    code: string;

    @Column({ name: 'type', type: 'enum', enum: ProjectType })
    type: ProjectType;

    @Column({ name: 'description', type: 'text', nullable: true })
    description?: string;

    @Column({ name: 'status', type: 'enum', enum: ProjectStatus, default: ProjectStatus.DRAFT })
    status: ProjectStatus;

    @Column({ name: 'start_date', type: 'date' })
    startDate: Date;

    @Column({ name: 'end_date', type: 'date' })
    endDate: Date;

    @Column({ name: 'estimated_hours', type: 'int', nullable: true })
    estimatedHours?: number;

    @Column({ name: 'project_manager_id', type: 'uuid' })
    projectManagerId: string;

    @ManyToOne(() => AdminProfile, (admin) => admin.managedProjects, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'project_manager_id' })
    projectManager: AdminProfile;

    @Column({ name: 'project_lead_id', type: 'uuid' })
    projectLeadId: string;

    @ManyToOne(() => EmployeeProfile, (emp) => emp.ledProjects, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'project_lead_id' })
    projectLead: EmployeeProfile;

    @Column({ name: 'require_time_tracking', type: 'boolean', default: false })
    requireTimeTracking: boolean;

    @Column({ name: 'enable_notifications', type: 'boolean', default: true })
    enableNotifications: boolean;

    @Column({ name: 'enable_client_portal', type: 'boolean', default: false })
    enableClientPortal: boolean;

    @Column({ name: 'created_by', type: 'uuid' })
    createdBy: string;

    @ManyToOne(() => AdminProfile, (admin) => admin.createdProjects, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'created_by' })
    creator: AdminProfile;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => Task, (task) => task.project)
    tasks: Task[];

    @OneToMany(() => ProjectDocument, (doc) => doc.project)
    documents: ProjectDocument[];

    @Column({ name: 'client_id', type: 'uuid', nullable: true })
    clientId: string;

    @ManyToOne(() => Client, (client) => client.projects, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'client_id' })
    client: Client;
}