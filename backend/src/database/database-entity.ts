/**
 * Database Entities Aggregator
 * 
 * This file imports all entities from all modules and exports them as an array.
 * This array is used by TypeORM to register all entities.
 * 
 * When creating a new module with entities:
 * 1. Create your entity file in src/modules/[module-name]/entities/[entity-name].entity.ts
 * 2. Import it here
 * 3. Add it to the models array below
 */

// Import all entities from modules
import { User } from '../modules/users/entities/user.entity';
import { Role } from '../modules/roles/entities/role.entity';
import { AdminProfile } from '../modules/admin/entities/admin-profile.entity';
import { Department } from '../modules/department/entities/department.entity';
import { EmployeeProfile } from '../modules/employee/entities/employee-profile.entity';

import { Task } from '../modules/task/entities/task.entity';

import { Project } from '../modules/projects/entities/project.entity';
import { TaskActivity } from '../modules/task/entities/task-activity.entity';
import { TaskChecklist } from '../modules/task/entities/task-checklist.entity';



// Export all entities as an array

export const models = [
  User,
  Role,
  AdminProfile,
  Department,
  EmployeeProfile,
  Project,
  Task,
  TaskActivity,
  TaskChecklist
];