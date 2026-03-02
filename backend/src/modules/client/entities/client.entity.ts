import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Exclude } from 'class-transformer';
import { EmployeeProfile } from '../../employee/entities/employee-profile.entity';

@Entity('clients')
export class Client {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'name', type: 'varchar', length: 150 })
    name: string;

    @Column({ name: 'client_code', type: 'varchar', length: 50, unique: true, nullable: true })
    clientCode: string;

    // --- Company Logo Field ---
    @Column({ name: 'logo_url', type: 'varchar', nullable: true })
    logoUrl: string;

    @Column({ name: 'industry', type: 'varchar', length: 100, nullable: true })
    industry: string;

    @Column({ name: 'company_size', type: 'varchar', length: 50, nullable: true })
    companySize: string;

    @Column({ name: 'website', type: 'varchar', length: 255, nullable: true })
    website: string;

    @Column({ name: 'tax_id', type: 'varchar', length: 100, nullable: true })
    taxId: string;

    @Column({ name: 'street_address', type: 'text', nullable: true })
    streetAddress: string;

    @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
    city: string;

    @Column({ name: 'state', type: 'varchar', length: 100, nullable: true })
    state: string;

    @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
    postalCode: string;

    @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
    country: string;

    @Column({ name: 'phone', type: 'varchar', length: 20, nullable: true })
    phone?: string;

    @Column({ name: 'email', type: 'varchar', length: 150, unique: true })
    email: string;

    @Column({ name: 'contacts', type: 'json', nullable: true })
    contacts: {
        name: string;
        title: string;
        email: string;
        phone: string;
        role: string;
    }[];

    @Column({ name: 'payment_terms', type: 'varchar', length: 50, nullable: true })
    paymentTerms: string;

    @Column({ name: 'currency', type: 'varchar', length: 50, default: 'INR - Indian Rupee' })
    currency: string;

    @Column({ name: 'payment_method', type: 'varchar', length: 50, nullable: true })
    paymentMethod: string;

    @Column({ name: 'credit_limit', type: 'decimal', precision: 15, scale: 2, default: 0 })
    creditLimit: number;

    @Column({ name: 'billing_notes', type: 'text', nullable: true })
    billingNotes: string;

    @Column({ name: 'client_since', type: 'date', nullable: true })
    clientSince: Date;

    @Exclude()
    @Column({ name: 'sales_manager_id', type: 'uuid', nullable: true })
    salesManagerId: string;

    @ManyToOne(() => EmployeeProfile, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'sales_manager_id' })
    salesManager: EmployeeProfile;

    @Column({ name: 'internal_notes', type: 'text', nullable: true })
    internalNotes: string;

    @Column({ name: 'status', type: 'boolean', default: true })
    status: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @OneToMany(() => Project, (project) => project.client)
    projects: Project[];
}