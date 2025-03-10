import { IsPhoneNumber, IsString, MinLength } from 'class-validator'

export class CreateAuthDto {
	@IsPhoneNumber()
	phone: string

	@MinLength(6, { message: 'Пароль должен быть не менее 6 символов' })
	@IsString()
	password: string
}
