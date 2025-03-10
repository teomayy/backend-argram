import { HttpService } from '@nestjs/axios'
import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { lastValueFrom } from 'rxjs'

@Injectable()
export class EskizService implements OnModuleInit {
	private token: string
	private tokenExpiry: number = 0
	private readonly logger = new Logger(EskizService.name)
	private readonly baseUrl = 'https://notify.eskiz.uz/api'

	constructor(
		private readonly httpService: HttpService,
		private readonly configService: ConfigService
	) {}

	async onModuleInit() {
		await this.authenticate()
	}

	private async authenticate() {
		const email = this.configService.get<string>('ESKIZ_EMAIL')
		const password = this.configService.get<string>('ESKIZ_PASSWORD')
		try {
			const response = await lastValueFrom(
				this.httpService.post(`${this.baseUrl}/auth/login`, {
					email,
					password
				})
			)
			this.token = response.data.data.token
			this.tokenExpiry = Date.now() + 86400 * 1000

			this.logger.log('Токен Eskiz успешно получен')
		} catch (error) {
			this.logger.error('Ошибка авторизации в Eskiz', error.message)
			throw new Error('Ошибка авторизации в Eskiz')
		}
	}

	private async refreshToken() {
		if (!this.authenticate()) {
			await this.authenticate()
		}

		try {
			const response = await lastValueFrom(
				this.httpService.patch(`${this.baseUrl}/auth/refresh`, null, {
					headers: {
						Authorization: `Bearer ${this.token}`
					}
				})
			)
			if (response.data.message === 'token_generated') {
				this.token = response.data.data.token
				this.tokenExpiry = Date.now() + 86400 + 1000

				this.logger.log('Eskiz: Токен успешно обновлён')
			} else {
				await this.authenticate()
			}
		} catch (error) {
			this.logger.error(
				'Eskiz: Ошибка обновления токена, выполняем повторную аутентификацию',
				error.message
			)
			await this.authenticate()
		}
	}

	private isTokenValid(): boolean {
		return this.token && Date.now() < this.tokenExpiry
	}

	async sendSms(
		phoneNumber: string,
		message: string,
		callbackUrl?: string
	): Promise<void> {
		if (!this.isTokenValid()) {
			await this.refreshToken()
		}

		const normalizedPhone = phoneNumber.replace(/[^0-9]/g, '')

		try {
			const formData = new URLSearchParams({
				mobile_phone: normalizedPhone,
				message,
				form: '4546'
			})

			if (callbackUrl) {
				formData.append('callback_url', callbackUrl)
			}

			const response = await lastValueFrom(
				this.httpService.post(`${this.baseUrl}/message/sms/send`, formData, {
					headers: {
						Authorization: `Bearer ${this.token}`
					}
				})
			)
			if (response.data.status === 'waiting') {
				this.logger.log(
					`SMS в процессе отправки. Message ID: ${response.data.id}`
				)
			} else if (response.data.status !== 'ok') {
				this.logger.error(
					'Ошибка отправки SMS через Eskiz:',
					response.data.message
				)
				throw new Error(`Ошибка Eskiz: ${response.data.message}`)
			} else {
				this.logger.log('SMS успешно отправлено.')
			}
		} catch (error) {
			this.logger.error('Ошибка отправки SMS:', error.message)
			throw new Error('Ошибка отправки SMS через Eskiz')
		}
	}
}
