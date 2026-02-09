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

    // 2. Skip if users already exist
    const existingUsers = await userRepository.find();
    if (existingUsers.length > 0) {
      console.log('⚠️  Users already exist. Skipping seeder.');
      return;
    }

    const defaultPassword = 'password123';
    const hashedPassword = await hash(defaultPassword, 10);

    // 3. Create admin and one demo employee user
    const adminUser = userRepository.create({
      email: 'admin@crm.com',
      passwordHash: hashedPassword,
      roleId: adminRole.id,
      isVerified: true,
    });

    const employeeUser = userRepository.create({
      email: 'employee@crm.com',
      passwordHash: hashedPassword,
      roleId: employeeRole.id,
      isVerified: true,
    });

    const projectManagerUser = userRepository.create({
      email: 'manager@crm.com',
      passwordHash: hashedPassword,
      roleId: employeeRole.id,
      isVerified: true,
    });

    const projectLeadUser = userRepository.create({
      email: 'lead@crm.com',
      passwordHash: hashedPassword,
      roleId: employeeRole.id,
      isVerified: true,
    });

    await userRepository.save([
      adminUser,
      employeeUser,
      projectManagerUser,
      projectLeadUser,
    ]);

    console.log('✅ Seeder completed successfully!');
    console.log('\n📋 Created users:');
    console.log('   👤 Admin:    admin@crm.com / password123');
    console.log('   👤 Employee: employee@crm.com / password123');
    console.log('👤 Manager:  manager@crm.com / password123');
    console.log('👤 Lead:     lead@crm.com / password123');
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
