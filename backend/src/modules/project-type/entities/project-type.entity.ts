import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Department } from '../../department/entities/department.entity';

@Entity('project_types')
export class ProjectType {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'uuid', name: 'department_id', nullable: true })
    departmentId: string;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    isActive: boolean;

    @ManyToOne(() => Department, (department) => department.projectTypes, { nullable: false })
    @JoinColumn({ name: 'department_id' })
    department: Department;

    @OneToMany(() => Project, (project) => project.projectType)
    projects: Project[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}