import { DataSource } from 'typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { AdminProfile } from '../../src/modules/admin/entities/admin-profile.entity';
import { UserRole } from '../../src/shared/enum/user-roles';
import { getDatabaseConfig } from '../config';

/**
 * Seeder: Create 3 Admin Profiles
 *
 * Creates admin profiles for the 3 admin users: Arjun (arjun@crm.com), Sanketh (sanketh@crm.com), Sumukh (sumukh@crm.com).
 * Skips if admin profiles already exist.
 *
 * Run with: pnpm seed:admin-profiles (or as part of seed:all)
 * Order: After users.
 */

const ADMIN_DISPLAY_NAMES: Record<string, string> = {
  'arjun@crm.com': 'Arjun Sindhia',
  'sanketh@crm.com': 'Sanketh M',
  'sumukh@crm.com': 'Sumukh B',
};

async function seedAdminProfiles() {
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const userRepo = dataSource.getRepository(User);
    const adminProfileRepo = dataSource.getRepository(AdminProfile);

    const existingProfiles = await adminProfileRepo.find();
    if (existingProfiles.length > 0) {
      console.log('⚠️  Admin profiles already exist. Skipping seeder.');
      return;
    }

    const adminUsers = await userRepo
      .createQueryBuilder('u')
      .innerJoin('u.role', 'r')
      .where('r.name = :role', { role: UserRole.ADMIN })
      .orderBy('u.email', 'ASC')
      .getMany();

    if (adminUsers.length < 3) {
      console.warn(`⚠️  Found ${adminUsers.length} admin user(s). Run seed:users first to create 3 admins (Arjun, Sanketh, Sumukh).`);
    }

    const profiles = adminUsers.slice(0, 3).map((user, i) =>
      adminProfileRepo.create({
        userId: user.id,
        name: ADMIN_DISPLAY_NAMES[user.email] ?? `Admin ${i + 1}`,
        bio: null,
        isActive: true,
      })
    );

    await adminProfileRepo.save(profiles);
    console.log(`✅ Created ${profiles.length} admin profile(s): Arjun Sindhia, Sanketh M, Sumukh B.`);
  } catch (error) {
    console.error('❌ Error running admin profiles seeder:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

if (require.main === module) {
  seedAdminProfiles()
    .then(() => { console.log('✅ Seeder finished'); process.exit(0); })
    .catch((error) => { console.error('❌ Seeder failed:', error); process.exit(1); });
}

export { seedAdminProfiles };
