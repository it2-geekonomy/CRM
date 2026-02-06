# CRM Seeders

Seed scripts populate the database with initial data for development and testing.

**Run after migrations.** Roles (`admin`, `employee`) are created by the migration `CreateRolesAndAlterUsersRoleId`; seeders use those roles.

---

## How to run

| Command | Description |
|--------|-------------|
| `pnpm seed:all` | Run all seeders in order (recommended) |
| `pnpm seed:users` | Run only the users seeder |

---

## Seed data overview

### 1. Users (`create-users.seeder.ts`)

Creates two users if the `users` table is empty. **Skips** if any users already exist.

| Role     | Email            | Password   | Notes                    |
|----------|------------------|------------|---------------------------|
| **Admin**   | `admin@crm.com`    | `password123` | Full access; manage departments & employees |
| **Employee** | `employee@crm.com`  | `password123` | Demo employee for testing |

- Both users have `isVerified: true`.
- Roles are read from the `roles` table (must exist from migrations).

**Use these credentials to log in** at `/auth/login` (frontend) or `POST /auth/login` (API).

---

## Order and dependencies

1. **Migrations** – Create tables and seed roles (`admin`, `employee`).
2. **Users seeder** – Creates admin and employee users (depends on `roles` table).

Additional seeders (e.g. admin profile, departments, sample employees) can be added to `seed-all.seeder.ts` when needed.

---

## Production

- **Change default passwords** before using in production.
- Consider skipping or guarding seeders in production (e.g. only run when `NODE_ENV=development` or via a one-off script).
