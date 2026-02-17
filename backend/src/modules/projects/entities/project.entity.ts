import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { ProjectStatus } from '../../../shared/enum/project/project-status.enum';
import { ProjectType } from '../../../shared/enum/project/project-type.enum';
import { AdminProfile } from '../../admin/entities/admin-profile.entity';
import { EmployeeProfile } from '../../employee/entities/employee-profile.entity';
import { Task } from '../../task/entities/task.entity';

@Entity('projects')
export class Project {
    @PrimaryGeneratedColumn('uuid', { name: 'project_id' })
    projectId: string;

    @Column({ name: 'project_name', type: 'varchar', length: 150 })
    projectName: string;

    @Column({ name: 'project_code', type: 'varchar', length: 50, unique: true })
    projectCode: string;

    // @Column({ name: 'client_id', type: 'uuid' })
    // clientId: string;

    @Column({ name: 'project_type', type: 'enum', enum: ProjectType })
    projectType: ProjectType;

    @Column({ name: 'project_description', type: 'text', nullable: true })
    projectDescription?: string;

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

    // Changed from EmployeeProfile to Employee
    @ManyToOne(() => EmployeeProfile, (emp) => emp.ledProjects, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'project_lead_id' })
    projectLead: EmployeeProfile;

    @Column({ name: 'require_time_tracking', type: 'boolean', default: false })
    requireTimeTracking: boolean;

    @Column({ name: 'enable_notifications', type: 'boolean', default: true })
    enableNotifications: boolean;

    @Column({ name: 'enable_client_portal', type: 'boolean', default: false })
    enableClientPortal: boolean;

    @Column({ name: 'is_archived', type: 'boolean', default: false })
    isArchived: boolean;

    @Column({ name: 'created_by', type: 'uuid' })
    createdBy: string;

    @ManyToOne(() => AdminProfile, (admin) => admin.createdProjects, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'created_by' })
    creator: AdminProfile;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt?: Date;

    @OneToMany(() => Task, (task) => task.project)
    tasks: Task[];
}
