# CRM Seeders

Seed scripts populate the database with initial data for development and testing.

**Run after migrations.** Roles (`admin`, `employee`) are created by the migration `CreateRolesAndAlterUsersRoleId`; seeders use those roles.

---

## How to run

| Command | Description |
|--------|-------------|
| `pnpm seed:all` | Run all seeders in order (recommended) |
| `pnpm seed:users` | Run only the users seeder |
| `pnpm seed:departments` | Run only the departments seeder |
| `pnpm seed:admin-profiles` | Run only the admin profiles seeder (3 admins) |
| `pnpm seed:employee-profiles` | Run only the employee profiles seeder |

---

## Seed data overview

### 1. Users (`create-users.seeder.ts`)

Creates users if the `users` table is empty. **Skips** if any users already exist.

| Role       | Emails | Password     | Notes |
|------------|--------|--------------|-------|
| **Admin**  | `arjun@crm.com`, `sanketh@crm.com`, `sumukh@crm.com` | `password123` | 3 admins: Arjun Sindhia, Sanketh M, Sumukh B |
| **Employee** | `employee@crm.com`, `manager@crm.com`, `lead@crm.com`, `roshan@crm.com` | `password123` | 4 employees (e.g. Roshan Gopesh, Demo Employee) |

- All users have `isVerified: true`.
- Roles are read from the `roles` table (must exist from migrations).

**Use these credentials to log in** at `/auth/login` (frontend) or `POST /auth/login` (API).

### 2. Departments (`create-departments.seeder.ts`)

Creates 3 departments if none exist: **Engineering** (ENG), **Product** (PROD), **Operations** (OPS). Required before employee profiles.

### 3. Admin profiles (`create-admin-profiles.seeder.ts`)

Creates **3 admin profiles** for the 3 admin users: **Arjun Sindhia** (arjun@crm.com), **Sanketh M** (sanketh@crm.com), **Sumukh B** (sumukh@crm.com). Skips if any admin profile already exists.

### 4. Employee profiles (`create-employee-profiles.seeder.ts`)

Creates employee profiles for all employee-role users: **Roshan Gopesh**, Demo Employee, Project Manager, Tech Lead. Requires departments to exist. Skips if any employee profile already exists.

---

## Order and dependencies

1. **Migrations** – Create tables and seed roles (`admin`, `employee`).
2. **Users seeder** – Creates 3 admin users (Arjun, Sanketh, Sumukh) and 4 employee users (depends on `roles` table).
3. **Departments seeder** – Creates Engineering, Product, Operations.
4. **Admin profiles seeder** – Creates 3 admin profiles (depends on admin users).
5. **Employee profiles seeder** – Creates employee profiles (depends on employee users and departments).

---

## Production

- **Change default passwords** before using in production.
- Consider skipping or guarding seeders in production (e.g. only run when `NODE_ENV=development` or via a one-off script).
