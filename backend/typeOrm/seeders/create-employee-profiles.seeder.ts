import { DataSource } from 'typeorm';
import { User } from '../../src/modules/users/entities/user.entity';
import { Department } from '../../src/modules/department/entities/department.entity';
import { EmployeeProfile } from '../../src/modules/employee/entities/employee-profile.entity';
import { UserRole } from '../../src/shared/enum/user-roles';
import { getDatabaseConfig } from '../config';

/**
 * Seeder: Create Employee Profiles
 *
 * Creates employee profiles for all employee-role users (Roshan Gopesh and demo users).
 * Arjun, Sanketh, Sumukh are admins and are not seeded here. Requires departments to exist.
 *
 * Run with: pnpm seed:employee-profiles (or as part of seed:all)
 * Order: After users and departments.
 */

const EMPLOYEE_DISPLAY_NAMES: Record<string, string> = {
  'employee@crm.com': 'Demo Employee',
  'manager@crm.com': 'Project Manager',
  'lead@crm.com': 'Tech Lead',
  'roshan@crm.com': 'Roshan Gopesh',
};

const DEFAULT_JOINING_DATE = '2024-01-15';
const DEFAULT_DESIGNATION = 'Software Engineer';
const DEFAULT_LOCATION = 'Bangalore';

async function seedEmployeeProfiles() {
  const dataSource = new DataSource({
    ...getDatabaseConfig(),
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    const userRepo = dataSource.getRepository(User);
    const deptRepo = dataSource.getRepository(Department);
    const profileRepo = dataSource.getRepository(EmployeeProfile);

    const departments = await deptRepo.find();
    if (departments.length === 0) {
      throw new Error('No departments found. Run seed:departments first.');
    }

    const engineeringDept = departments.find((d) => d.code === 'ENG') ?? departments[0];

    const employeeUsers = await userRepo
      .createQueryBuilder('u')
      .innerJoin('u.role', 'r')
      .where('r.name = :role', { role: UserRole.EMPLOYEE })
      .orderBy('u.email', 'ASC')
      .getMany();

    if (employeeUsers.length === 0) {
      console.log('⚠️  No employee users found. Run seed:users first.');
      return;
    }

    const existingProfiles = await profileRepo.find({ relations: ['user'] });
    const existingUserIds = new Set(existingProfiles.map((p) => p.user.id));

    const usersWithoutProfile = employeeUsers.filter((u) => !existingUserIds.has(u.id));
    if (usersWithoutProfile.length === 0) {
      console.log('⚠️  All employee users already have profiles. Skipping.');
      return;
    }

    const profiles = usersWithoutProfile.map((user, index) => {
      const name = EMPLOYEE_DISPLAY_NAMES[user.email] ?? `Employee ${index + 1}`;
      return profileRepo.create({
        user,
        department: engineeringDept,
        name,
        phone: null,
        alternatePhone: null,
        designation: DEFAULT_DESIGNATION,
        employmentType: 'FULL_TIME',
        employmentStatus: 'ACTIVE',
        dateOfJoining: new Date(DEFAULT_JOINING_DATE),
        dateOfExit: null,
        location: DEFAULT_LOCATION,
        isActive: true,
      });
    });

    await profileRepo.save(profiles);
    console.log(`✅ Created ${profiles.length} missing employee profile(s). Total employees: ${existingProfiles.length + profiles.length}.`);
  } catch (error) {
    console.error('❌ Error running employee profiles seeder:', error);
    throw error;
  } finally {
    await dataSource.destroy();
    console.log('✅ Database connection closed');
  }
}

if (require.main === module) {
  seedEmployeeProfiles()
    .then(() => { console.log('✅ Seeder finished'); process.exit(0); })
    .catch((error) => { console.error('❌ Seeder failed:', error); process.exit(1); });
}

export { seedEmployeeProfiles };
