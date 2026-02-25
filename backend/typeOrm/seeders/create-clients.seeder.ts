import { DataSource } from 'typeorm';
import { Client } from '../../src/modules/client/entities/client.entity';
import { getDatabaseConfig } from '../config';

/**
 * Seeder: Create Clients
 * Matches Entity: name, email, phone, company, status
 */
async function seedClients() {
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected for Clients');

    const repo = dataSource.getRepository(Client);
    const count = await repo.count();
    
    if (count > 0) {
      console.log('⚠️ Clients already exist. Skipping seeder.');
      return;
    }

    const clients = repo.create([
      {
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        phone: '+1-555-010-999',
        company: 'Acme Industries',
        status: true 
      },
      {
        name: 'Globex Corp',
        email: 'projects@globex.com',
        phone: '+1-555-012-888',
        company: 'Globex Solutions',
        status: true
      },
      {
        name: 'Soylent Corp',
        email: 'contact@soylent.io',
        phone: '+1-555-015-777',
        company: 'Soylent Green Co',
        status: true
      }
    ]);

    await repo.save(clients);
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