import { PartialType } from '@nestjs/swagger';
import { CreateTaskTypeDto } from './create-task-type.dto';

export class UpdateTaskTypeDto extends PartialType(CreateTaskTypeDto) {}