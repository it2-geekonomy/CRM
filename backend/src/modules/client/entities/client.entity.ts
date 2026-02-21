// src/modules/client/entities/client.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    OneToMany,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';

@Entity('clients')
export class Client {
    @PrimaryGeneratedColumn('uuid', { name: 'client_id' })
    clientId: string;

    @Column({ name: 'name', type: 'varchar', length: 150 })
    name: string;

    @Column({ name: 'email', type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
    phone?: string;

    @Column({ name: 'company', type: 'varchar', length: 150, nullable: true })
    company?: string;

    @Column({ name: 'status', type: 'boolean', default: true })
    status: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => Project, (project) => project.client)
    projects: Project[];
}