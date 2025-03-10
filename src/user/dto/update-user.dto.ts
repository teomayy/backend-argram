import { IsOptional, IsString, IsUrl } from 'class-validator'

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	name?: string

	@IsOptional()
	@IsUrl({}, { message: 'URL аватара должен быть корректным' })
	avatarUrl?: string

	@IsOptional()
	@IsString()
	status?: string
}
