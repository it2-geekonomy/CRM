# Database Directory

This directory contains all database-related files for the application using TypeORM.

## Structure

```
database/
├── config.ts          # TypeORM database configuration
├── entities/          # TypeORM entity files (database models)
├── migrations/       # Database migration files
└── seeders/          # Database seeding scripts
```

## Entities

Place your TypeORM entity files in the `entities/` directory. Each entity should be a class decorated with `@Entity()`.

Example: `entities/user.entity.ts`, `entities/course.entity.ts`

## Migrations

Migrations run in timestamp order. Revert runs the **last** migration’s `down()` and removes it from the table.

**Order (run):**
1. `CreateUsersTable`
2. `CreateAdminProfilesTable`
3. `CreateTeacherProfilesTable`
4. `CreateRolesAndAlterUsersRoleId` (creates `roles`, seeds them, switches `users.role` → `users.role_id`)

**Commands:**
- Run: `pnpm migration:run`
- Revert last: `pnpm migration:revert`
- Generate: `pnpm migration:generate -d typeOrm/config.ts` (then move file into `typeOrm/migrations/`)

## Seeders

- **Roles** are seeded inside the migration `CreateRolesAndAlterUsersRoleId` (no separate seeder).
- **Users:** `pnpm seed:users` — run after `pnpm migration:run`.
- **Teacher profile:** `pnpm seed:teacher-profile` — run after `seed:users`.
- **All seeders:** `pnpm seed:all` — runs `seed:users` then `seed:teacher-profile`. Add new seeders to the `SEEDERS` array in `seeders/seed-all.seeder.ts`.
