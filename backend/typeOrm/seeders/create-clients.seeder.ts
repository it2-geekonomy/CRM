import { DataSource } from 'typeorm';
import { Client } from '../../src/modules/client/entities/client.entity';
// 1. Change import to EmployeeProfile
import { EmployeeProfile } from '../../src/modules/employee/entities/employee-profile.entity';
import { getDatabaseConfig } from '../config';

/**
 * Seeder: Create Clients
 */
async function seedClients() {
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected for Clients');

    const clientRepo = dataSource.getRepository(Client);
    // 2. Change Repo to EmployeeProfile
    const employeeRepo = dataSource.getRepository(EmployeeProfile);

    const count = await clientRepo.count();
    if (count > 0) {
      console.log('⚠️ Clients already exist. Skipping seeder.');
      return;
    }

    // 3. Fetch existing employee profile instead of admin
    const salesManager = await employeeRepo.findOne({
      where: {},
      order: { createdAt: 'ASC' },
    });

    if (!salesManager) {
      throw new Error('❌ No EmployeeProfile found. Seed employees first.');
    }

    const clientsData = [
      {
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        clientCode: 'ACME-001',
        logoUrl: '/uploads/logos/acme.png',
        industry: 'Technology',
        companySize: '51-200',
        website: 'https://acme.com',
        taxId: 'TX-12345',
        streetAddress: '123 Tech Lane',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94105',
        country: 'USA',
        phone: '+1-555-010-999',
        contacts: [
          {
            name: 'John Doe',
            title: 'Procurement',
            email: 'john@acme.com',
            phone: '555-0100',
            role: 'Main',
          },
        ],
        paymentTerms: 'Net 30',
        currency: 'USD - US Dollar',
        paymentMethod: 'Bank Transfer',
        creditLimit: 50000.0,
        billingNotes: 'Invoice monthly',
        clientSince: new Date('2023-01-01'),
        // 4. Update property name to salesManagerId
        salesManagerId: salesManager.id, 
        internalNotes: 'VIP Client',
        status: true,
      },
      {
        name: 'Globex Corp',
        email: 'projects@globex.com',
        clientCode: 'GLOBEX-001',
        industry: 'Manufacturing',
        phone: '+1-555-012-888',
        currency: 'INR - Indian Rupee',
        // 4. Update property name to salesManagerId
        salesManagerId: salesManager.id,
        status: true,
      },
    ];

    const clients = clientRepo.create(clientsData);

    await clientRepo.save(clients);

    console.log(`✅ Created ${clients.length} clients`);
  } catch (error) {
    console.error('❌ Error running clients seeder:', error);
    throw error;
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  seedClients()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { seedClients };