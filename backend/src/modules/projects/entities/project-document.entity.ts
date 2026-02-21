import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity('project_documents')
export class ProjectDocument {
    @PrimaryGeneratedColumn('uuid')
    documentId: string;

    @Column()
    fileName: string;

    @Column()
    fileUrl: string;

    @Column({ type: 'int' })
    fileSize: number;

    @Column()
    mimeType: string;

    @Column()
    projectId: string;

    @ManyToOne(() => Project, (project) => project.documents, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'projectId' })
    project: Project;

    @CreateDateColumn()
    createdAt: Date;
}