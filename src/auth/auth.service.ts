import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 7
	REFRESH_TOKEN_NAME = 'refreshToken'

	private readonly logger = new Logger(AuthService.name)
}
