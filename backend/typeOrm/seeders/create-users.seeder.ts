import { DataSource } from 'typeorm';
import { hash } from 'bcrypt';
import { User } from '../../src/modules/users/entities/user.entity';
import { Role } from '../../src/modules/roles/entities/role.entity';
import { UserRole } from '../../src/shared/enum/user-roles';
import { getDatabaseConfig } from '../config';

/**
 * Seeder: Create Users for CRM (Admin + Employee)
 *
 * Fetches role IDs from the `roles` table, then creates:
 * - Admin user
 * - Employee user (optional demo)
 *
 * Run with: pnpm seed:users
 * Order: Run after migration:run (roles are seeded inside the migration).
 */

async function seedUsers() {
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const userRepository = dataSource.getRepository(User);
    const roleRepository = dataSource.getRepository(Role);

    // 1. Fetch role IDs from roles table
    const roles = await roleRepository.find();
    const adminRole = roles.find((r) => r.name === UserRole.ADMIN);
    const employeeRole = roles.find((r) => r.name === UserRole.EMPLOYEE);

    if (!adminRole || !employeeRole) {
      throw new Error(
        'Required roles (admin, employee) are missing. Run: pnpm migration:run',
      );
    }

    const defaultPassword = 'password123';
    const hashedPassword = await hash(defaultPassword, 10);

    const seedUsersList = [
      { email: 'arjun@crm.com', roleId: adminRole.id },
      { email: 'sanketh@crm.com', roleId: adminRole.id },
      { email: 'sumukh@crm.com', roleId: adminRole.id },
      { email: 'employee@crm.com', roleId: employeeRole.id },
      { email: 'manager@crm.com', roleId: employeeRole.id },
      { email: 'lead@crm.com', roleId: employeeRole.id },
      { email: 'roshan@crm.com', roleId: employeeRole.id },
    ] as const;

    const existingEmails = new Set(
      (await userRepository.find({ select: { email: true } })).map((u) => u.email)
    );

    const toCreate = seedUsersList.filter((s) => !existingEmails.has(s.email));
    if (toCreate.length === 0) {
      console.log('⚠️  All seed users already exist. Skipping.');
      return;
    }

    const newUsers = toCreate.map((s) =>
      userRepository.create({
        email: s.email,
        passwordHash: hashedPassword,
        roleId: s.roleId,
        isVerified: true,
      })
    );
    await userRepository.save(newUsers);

    console.log(`✅ Created ${newUsers.length} missing user(s).`);
    console.log('\n📋 Seed users (password123):');
    console.log('   👤 Admins: arjun@crm.com, sanketh@crm.com, sumukh@crm.com');
    console.log('   👤 Employees: employee@crm.com, manager@crm.com, lead@crm.com, roshan@crm.com');
    console.log('\n⚠️  Remember to change passwords in production!');
  } catch (error) {
    console.error('❌ Error running seeder:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log('✅ Seeder finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeder failed:', error);
      process.exit(1);
    });
}

export { seedUsers };
