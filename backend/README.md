<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

**CRM Backend** – NestJS API for a CRM with two user types: **Admin** and **Employee**. Employees belong to **departments** and are created only by admins.

- **Roles:** `admin`, `employee`
- **Modules:** Users, Auth, Roles, Admin (profiles), Departments
- **Tech:** NestJS, TypeORM, PostgreSQL, JWT, Swagger

## Quick Start (For New Developers)

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` if needed (database name, port, etc.).

3. **Start PostgreSQL (Docker):**
   ```powershell
   # PowerShell (Windows)
   docker run --name crm-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm -p 5434:5432 -d postgres:latest
   ```
   ```bash
   # Bash/Linux/Mac
   docker run --name crm-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm -p 5434:5432 -d postgres:latest
   ```
   Use the same port and DB name as in your `.env` (e.g. `DB_PORT=5434`, `DB_NAME=crm`).

4. **Run migrations (create tables):**
   ```bash
   pnpm migration:run
   ```

5. **Seed database (initial admin + employee):**
   ```bash
   pnpm seed:all
   ```

6. **Start the development server:**
   ```bash
   pnpm run start:dev
   ```

API base: **http://localhost:8080**  
Swagger docs: **http://localhost:8080/api**

---

## Project setup

```bash
pnpm install
```

## Database setup

### 1. Run PostgreSQL (Docker)

**PowerShell (Windows):**
```powershell
docker run --name crm-db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crm -p 5434:5432 -d postgres:latest
```

**Bash/Linux/Mac:**
```bash
docker run --name crm-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=crm \
  -p 5434:5432 \
  -d postgres:latest
```

Or **docker-compose** (create `docker-compose.yml` in the backend directory):

```yaml
version: '3.8'
services:
  db:
    image: postgres:latest
    container_name: crm-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: crm
    ports:
      - "5434:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then:
```bash
docker-compose up -d
```

### 2. Environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

On Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

Set `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` to match your PostgreSQL setup.

### 3. Run migrations (create tables)

```bash
pnpm migration:run
```

This creates:

- **users** – email, password, role (admin/employee)
- **roles** – admin, employee
- **admin_profiles** – admin display name, bio, etc.
- **departments** – name, code, description

### 4. Seed database (initial data)

```bash
pnpm seed:all
```

Seeds:

- **Users:** `admin@crm.com` and `employee@crm.com` (default password: `password123`)

Run a single seeder:

```bash
pnpm seed:users   # Seed users only
```

---

## Migration commands

```bash
# Run all pending migrations
pnpm migration:run

# Revert the last migration
pnpm migration:revert

# Generate a new migration (after entity changes)
pnpm migration:generate typeOrm/migrations/MigrationName

# Create an empty migration file
pnpm migration:create typeOrm/migrations/MigrationName
```

---

## Run the project

```bash
# development
pnpm run start

# watch mode (recommended for dev)
pnpm run start:dev

# production
pnpm run start:prod
```

---

## Run tests

```bash
# unit tests
pnpm run test

# e2e tests
pnpm run test:e2e

# coverage
pnpm run test:cov
```

---

## API overview (CRM)

| Area        | Description |
|------------|-------------|
| **Auth**   | `POST /auth/login` – JWT login (email + password). |
| **Users**  | User CRUD (admin creates users; no public signup). |
| **Roles**  | `GET /roles` – list roles (admin, employee). |
| **Admin**  | Admin profile CRUD (name, bio, isActive). |
| **Departments** | Full CRUD – name, code, description. |

Swagger UI: **http://localhost:8080/api** (use JWT for protected routes).

---

## Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [TypeORM Migrations](https://typeorm.io/migrations)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
