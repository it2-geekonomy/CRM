import { seedUsers } from './create-users.seeder';
import { seedDepartments } from './create-departments.seeder';
import { seedAdminProfiles } from './create-admin-profiles.seeder';
import { seedEmployeeProfiles } from './create-employee-profiles.seeder';

/**
 * Run all seeders in order.
 * Add new seeders here when you create them (e.g. admin profile, departments, employees).
 *
 * pnpm seed:all
 */

const SEEDERS = [
  { name: 'Users (3 admins: Arjun, Sanketh, Sumukh + 4 employees)', run: seedUsers },
  { name: 'Departments', run: seedDepartments },
  { name: 'Admin profiles (3)', run: seedAdminProfiles },
  { name: 'Employee profiles', run: seedEmployeeProfiles },
] as const;

async function seedAll() {
  console.log('🌱 Running all seeders...\n');

  for (const { name, run } of SEEDERS) {
    console.log(`>> ${name}`);
    await run();
    console.log('');
  }

  console.log('✅ All seeders finished.');
}

if (require.main === module) {
  seedAll()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('\n❌ Seed failed:', err);
      process.exit(1);
    });
}

export { seedAll };
