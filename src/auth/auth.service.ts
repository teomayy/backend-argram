import {
	BadRequestException,
	Injectable,
	Logger,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { verify } from 'argon2'
import { EskizService } from 'src/eskiz/eskiz.service'
import { UserService } from 'src/user/user.service'
import { CreateAuthDto } from './dto/create-auth.dto'
import { RedisService } from './redis.service'

@Injectable()
export class AuthService {
	constructor(
		private jwt: JwtService,
		private userService: UserService,
		private redisService: RedisService,
		private eskizService: EskizService
	) {}

	EXPIRE_DAY_REFRESH_TOKEN = 7
	REFRESH_TOKEN_NAME = 'refreshToken'

	private readonly logger = new Logger(AuthService.name)

	async login(dto: CreateAuthDto) {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.validateUser(dto)
		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	async register(dto: CreateAuthDto) {
		const oldUser = await this.userService.getByPhone(dto.phone)

		if (oldUser)
			throw new BadRequestException('Пользователь уже зарегистрирован')

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { password, ...user } = await this.userService.createByPhone(
			dto.phone
		)

		const tokens = this.issueTokens(user.id)

		return {
			user,
			...tokens
		}
	}

	private issueTokens(userId: string) {
		const data = { id: userId }

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		})

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
		})

		return { accessToken, refreshToken }
	}

	private async validateUser(dto: CreateAuthDto) {
		const user = await this.userService.getByPhone(dto.phone)

		if (!user) throw new NotFoundException('Пользователь не найден')

		const isValid = await verify(user.password, dto.password)

		if (!isValid) throw new UnauthorizedException('Пароль не валиден')

		return user
	}

	async sendOtp(phone: string) {
		const otp = Math.floor(100000 + Math.random() * 900000).toString()

		await this.redisService.setOtp(phone, otp)
		await this.eskizService.sendSms(
			phone,
			`Код подтверждения для регистрации на сайте mses-chat.uz : ${otp}`
		)
	}

	async verifyOtp(phone: string, otp: string) {
		const storedOtp = await this.redisService.getOtp(phone)
		if (!storedOtp || storedOtp !== otp) {
			throw new UnauthorizedException('Неверный OTP-код')
		}

		await this.redisService.deleteOtp(phone)

		let user = await this.userService.getByPhone(phone)
		if (!user) {
			user = await this.userService.createByPhone(phone)
		}

		const tokens = this.issueTokens(user.id)

		return { user, ...tokens }
	}
}
