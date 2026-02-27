import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { EmployeeProfile } from '../../employee/entities/employee-profile.entity';
import { TaskType } from '../../task-type/entities/task-type.entity';
import { ProjectType } from '../../project-type/entities/project-type.entity';

@Entity('departments')
@Index(['code'], { unique: true })
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  code: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', name: 'project_type_id', nullable: true })
  projectTypeId: string;

  @ManyToOne(() => ProjectType, (projectType) => projectType.departments)
  @JoinColumn({ name: 'project_type_id' })
  projectType: ProjectType;

  @OneToMany(
    () => EmployeeProfile,
    employee => employee.department,
  )
  employees: EmployeeProfile[];

  @OneToMany(() => TaskType, (taskType) => taskType.department)
  taskTypes: TaskType[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}