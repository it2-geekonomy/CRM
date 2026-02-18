import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Department } from '../../department/entities/department.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity('employee_profiles')
export class EmployeeProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User, (user) => user.employeeProfile, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Department, (department) => department.employees, {
        nullable: false,
    })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string | null;

    @Column({ name: 'alternate_phone', type: 'varchar', length: 20, nullable: true })
    alternatePhone: string | null;

    @Column({ type: 'varchar', length: 100 })
    designation: string;

    @Column({
        name: 'employment_type',
        type: 'enum',
        enum: ['FULL_TIME', 'INTERN', 'CONTRACT'],
        default: 'FULL_TIME',
    })
    employmentType: string;

    @Column({
        name: 'employment_status',
        type: 'enum',
        enum: ['ACTIVE', 'INACTIVE', 'ON_NOTICE', 'EXITED'],
        default: 'ACTIVE',
    })
    employmentStatus: string;

    @Column({ name: 'date_of_joining', type: 'date' })
    dateOfJoining: Date;

    @Column({ name: 'date_of_exit', type: 'date', nullable: true })
    dateOfExit: Date | null;

    @Column({ type: 'varchar', length: 100 })
    location: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Project, (project) => project.projectLead)
    ledProjects: Project[];
}
