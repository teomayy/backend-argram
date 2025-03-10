import { IsPhoneNumber, IsString, Length } from 'class-validator'

export class VerifyOtpDto {
	@IsPhoneNumber()
	phone: string

	@IsString()
	@Length(6, 6, { message: 'OTP-код должен быть 6 символов' })
	otp: string
}
