# TypeORM vs Sequelize: Query Execution

## Quick Comparison

### TypeORM:
```sql
SELECT "User"."id" AS "User_id", 
       "User"."email" AS "User_email"
FROM "users" "User" 
WHERE "User"."email" = $1
-- PARAMETERS: ["admin@courseportal.com"]
```

### Sequelize:
```sql
SELECT "id", "email"
FROM "users" AS "User"
WHERE "User"."email" = 'admin@courseportal.com'
```

---

## Key Differences

| Feature | TypeORM | Sequelize |
|---------|---------|-----------|
| **Column Aliases** | `AS "User_id"` | No aliases |
| **Table Alias** | `FROM "users" "User"` | `FROM "users" AS "User"` |
| **Parameters** | `$1`, `$2` | `?` or inline |
| **SQL Style** | Verbose | Concise |

---

## Why TypeORM Uses Aliases

1. **Entity Mapping:** `"User_id"` → `user.id` in TypeScript
2. **Join Safety:** Prevents conflicts with same column names
3. **Debugging:** Clear column names

**Example:**
```sql
SELECT "User"."id" AS "User_id",
       "Course"."id" AS "Course_id"  -- Clear which "id" is which
FROM "users" "User"
JOIN "courses" "Course" ON ...
```

---

## How It Works

**TypeORM Flow:**
1. Write: `userRepository.findOne({ where: { email: '...' } })`
2. Generate: SQL with aliases
3. Execute: Database returns aliased columns
4. Map: `"User_id"` → `user.id`

**Sequelize Flow:**
1. Write: `User.findOne({ where: { email: '...' } })`
2. Generate: SQL without aliases
3. Execute: Database returns original column names
4. Map: `"id"` → `user.id` (direct mapping)

---

## Summary

- **TypeORM:** Verbose SQL with aliases, explicit mapping
- **Sequelize:** Concise SQL, direct mapping
- **Both:** Valid SQL, prevent injection, map to objects

**TypeORM:** Better for TypeScript, NestJS, explicit mapping
**Sequelize:** Better for simpler SQL, JavaScript, mature ecosystem
