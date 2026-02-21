import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskChecklistDto {
    @ApiProperty({
        example: 'Create desktop wireframe (1920px)',
    })
    @IsString()
    @IsNotEmpty()
    itemName: string;
}