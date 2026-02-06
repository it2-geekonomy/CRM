import { PartialType } from '@nestjs/swagger';
import { CreateAdminProfileDto } from './create-admin-profile.dto';

export class UpdateAdminProfileDto extends PartialType(CreateAdminProfileDto) {}
