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
import { Project } from '../../../projects/entities/project.entity';
@Entity('employee_profiles')
export class EmployeeProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => User)
    @JoinColumn()
    user: User;

    @ManyToOne(() => Department, department => department.employees, {
        nullable: false,
    })
    department: Department;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    alternatePhone: string | null;

    @Column({ type: 'varchar', length: 100 })
    designation: string;

    @Column({
        type: 'enum',
        enum: ['FULL_TIME', 'INTERN', 'CONTRACT'],
        default: 'FULL_TIME',
    })
    employmentType: string;

    @Column({
        type: 'enum',
        enum: ['ACTIVE', 'INACTIVE', 'ON_NOTICE', 'EXITED'],
        default: 'ACTIVE',
    })
    employmentStatus: string;

    @Column({ type: 'date' })
    dateOfJoining: Date;

    @Column({ type: 'date', nullable: true })
    dateOfExit: Date | null;

    @Column({ type: 'varchar', length: 100 })
    location: string;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @OneToMany(() => Project, (project) => project.projectLead)
    ledProjects: Project[];
}
